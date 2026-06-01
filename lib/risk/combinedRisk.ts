import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { importId } from "@/lib/imports/csv";
import { calculateFireRisk, type HotspotForRisk, type NoteForRisk, type RiskFactor, type RiskZone, type WeatherForRisk } from "@/lib/risk/fireRisk";
import { calculateWildlifeRisk, type CameraForRisk, type VisitorForRisk } from "@/lib/risk/wildlifeRisk";
import { allRiskWeights, combinedRiskWeights, RISK_ENGINE_VERSION } from "@/lib/risk/weights";

type ZoneRow = RiskZone & {
  rangerStationDistanceKm?: string | number;
};

type RawRecord = Record<string, unknown>;

export type RiskLabel = "low" | "medium" | "high" | "severe";

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function toText(value: unknown) {
  return String(value || "");
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeZone(row: RawRecord): RiskZone {
  return {
    id: toText(row.id),
    code: toText(row.code),
    name: toText(row.name),
    zoneType: toText(row.zoneType),
    baseFireRisk: toNumber(row.baseFireRisk),
    baseWildlifeRisk: toNumber(row.baseWildlifeRisk),
    accessDifficulty: toNumber(row.accessDifficulty),
    rangerStationDistanceKm: toNumber(row.rangerStationDistanceKm),
  };
}

function latestByZone<T extends { zoneId: string; timestamp?: string }>(rows: T[]) {
  const result = new Map<string, T>();
  for (const row of rows) {
    const current = result.get(row.zoneId);
    if (!current || Date.parse(row.timestamp || "") > Date.parse(current.timestamp || "")) {
      result.set(row.zoneId, row);
    }
  }
  return result;
}

function byZone<T extends { zoneId: string }>(rows: T[]) {
  const result = new Map<string, T[]>();
  for (const row of rows) {
    if (!result.has(row.zoneId)) result.set(row.zoneId, []);
    result.get(row.zoneId)?.push(row);
  }
  return result;
}

function riskLabel(score: number): RiskLabel {
  if (score >= 80) return "severe";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function operationalFeasibility(zone: RiskZone) {
  return clampScore(100 - zone.accessDifficulty * 0.65 - (zone.rangerStationDistanceKm || 0) * 2);
}

function topFactors(factors: RiskFactor[]) {
  return [...factors].sort((a, b) => b.score - a.score).slice(0, 4);
}

function recommendedAction(label: RiskLabel, fireRisk: number, wildlifeRisk: number, zone: RiskZone) {
  if (label === "severe" && fireRisk >= wildlifeRisk) return `Dispatch early fire inspection to ${zone.code}; check smoke, access routes, and firebreak condition.`;
  if (label === "severe") return `Prioritize wildlife-boundary patrol at ${zone.code}; warn nearby communities and check road crossings.`;
  if (label === "high" && fireRisk >= wildlifeRisk) return `Schedule same-day fire prevention patrol and ranger note follow-up for ${zone.code}.`;
  if (label === "high") return `Schedule same-day wildlife conflict monitoring for ${zone.code}.`;
  if (label === "medium") return `Keep ${zone.code} on watch list and validate missing data during routine patrol.`;
  return `Monitor ${zone.code}; no immediate escalation unless new field reports arrive.`;
}

function freshnessWarnings(inputs: { hasWeather: boolean; hasHotspots: boolean; hasCamera: boolean; hasVisitors: boolean; hasNotes: boolean }) {
  const warnings = [];
  if (!inputs.hasWeather) warnings.push("weather data missing for zone");
  if (!inputs.hasHotspots) warnings.push("no recent FIRMS hotspot linked to zone");
  if (!inputs.hasCamera) warnings.push("camera data missing for zone");
  if (!inputs.hasVisitors) warnings.push("visitor pressure missing for zone");
  if (!inputs.hasNotes) warnings.push("manual ranger notes missing for zone");
  return warnings;
}

function normalizeWeather(row: RawRecord): WeatherForRisk {
  return {
    zoneId: toText(row.zoneId),
    timestamp: toText(row.timestamp),
    relativeHumidity2m: toNumber(row.relativeHumidity2m),
    windSpeed10m: toNumber(row.windSpeed10m),
    windGusts10m: toNumber(row.windGusts10m),
    precipitation: toNumber(row.precipitation),
    soilMoisture0To1cm: toNumber(row.soilMoisture0To1cm),
  };
}

function normalizeHotspot(row: RawRecord): HotspotForRisk {
  return {
    zoneId: toText(row.zoneId),
    timestamp: toText(row.timestamp),
    lat: toNumber(row.lat),
    lng: toNumber(row.lng),
    confidence: toText(row.confidence),
    frp: toNumber(row.frp),
  };
}

function normalizeCamera(row: RawRecord): CameraForRisk {
  return {
    zoneId: toText(row.zoneId),
    species: toText(row.species),
    count: toNumber(row.count) || 1,
    confidence: toNumber(row.confidence) || 0.5,
    timestamp: toText(row.timestamp),
  };
}

function normalizeVisitor(row: RawRecord): VisitorForRisk {
  return {
    zoneId: toText(row.zoneId),
    visitorCount: toNumber(row.visitorCount),
    vehicleCount: toNumber(row.vehicleCount),
    busCount: toNumber(row.busCount),
  };
}

function normalizeNote(row: RawRecord): NoteForRisk {
  return {
    zoneId: toText(row.zoneId),
    category: toText(row.category),
    severity: toNumber(row.severity) || 1,
    timestamp: toText(row.timestamp),
  };
}

export async function runRiskEngine(store: GoogleSheetsStore) {
  const now = new Date().toISOString();
  const runId = importId("risk-run");

  await store.append("RiskRun", {
    id: runId,
    status: "RUNNING",
    weights: allRiskWeights(),
    version: RISK_ENGINE_VERSION,
    startedAt: now,
    completedAt: "",
    errorMessage: "",
    createdAt: now,
  });

  try {
    const [zoneRows, weatherRows, hotspotRows, cameraRows, visitorRows, noteRows] = await Promise.all([
      store.list<ZoneRow>("Zone"),
      store.list<RawRecord>("WeatherSnapshot"),
      store.list<RawRecord>("FireHotspot"),
      store.list<RawRecord>("CameraDetection"),
      store.list<RawRecord>("VisitorPressure"),
      store.list<RawRecord>("ManualNote"),
    ]);

    const zones = zoneRows.map(normalizeZone).filter((zone) => zone.id && zone.code);
    const weatherByZone = latestByZone(weatherRows.map(normalizeWeather).filter((row) => row.zoneId));
    const hotspotsByZone = byZone(hotspotRows.map(normalizeHotspot).filter((row) => row.zoneId));
    const cameraByZone = byZone(cameraRows.map(normalizeCamera).filter((row) => row.zoneId));
    const visitorsByZone = latestByZone(visitorRows.map(normalizeVisitor).filter((row) => row.zoneId));
    const notesByZone = byZone(noteRows.map(normalizeNote).filter((row) => row.zoneId));

    const scores = [];
    for (const zone of zones) {
      const weather = weatherByZone.get(zone.id);
      const hotspots = hotspotsByZone.get(zone.id) || [];
      const cameraDetections = cameraByZone.get(zone.id) || [];
      const visitorPressure = visitorsByZone.get(zone.id);
      const notes = notesByZone.get(zone.id) || [];
      const warnings = freshnessWarnings({
        hasWeather: Boolean(weather),
        hasHotspots: hotspots.length > 0,
        hasCamera: cameraDetections.length > 0,
        hasVisitors: Boolean(visitorPressure),
        hasNotes: notes.length > 0,
      });

      const fire = calculateFireRisk(zone, {
        weather,
        hotspotCount: hotspots.length,
        notes,
        sourceWarnings: warnings,
      });
      const wildlife = calculateWildlifeRisk(zone, { cameraDetections, visitorPressure, notes });
      const feasibility = operationalFeasibility(zone);
      const combinedPriority = clampScore(
        fire.score * combinedRiskWeights.fireRisk
          + wildlife.score * combinedRiskWeights.wildlifeRisk
          + feasibility * combinedRiskWeights.operationalFeasibility,
      );
      const label = riskLabel(combinedPriority);
      const factors = topFactors([...fire.factors, ...wildlife.factors]);

      scores.push({
        id: importId(`risk-score-${zone.code}`),
        riskRunId: runId,
        zoneId: zone.id,
        fireRisk: fire.score,
        wildlifeRisk: wildlife.score,
        combinedPriority,
        operationalFeasibility: feasibility,
        label,
        topFactors: factors,
        recommendedAction: recommendedAction(label, fire.score, wildlife.score, zone),
        freshnessWarning: warnings.join("; "),
        createdAt: now,
      });
    }

    await Promise.all(scores.map((score) => store.append("ZoneRiskScore", score)));

    await store.upsert("RiskRun", {
      id: runId,
      status: "SUCCESS",
      weights: allRiskWeights(),
      version: RISK_ENGINE_VERSION,
      startedAt: now,
      completedAt: new Date().toISOString(),
      errorMessage: "",
      createdAt: now,
    });

    await store.append("AuditLog", {
      id: importId("audit-risk-run"),
      userId: "",
      action: "RUN_RISK_ENGINE",
      entity: "RiskRun",
      entityId: runId,
      metadata: { zones: zones.length, version: RISK_ENGINE_VERSION },
      createdAt: new Date().toISOString(),
    });

    return {
      riskRunId: runId,
      version: RISK_ENGINE_VERSION,
      zonesScored: scores.length,
      severeFireZones: scores.filter((score) => score.fireRisk >= 80).length,
      severeWildlifeZones: scores.filter((score) => score.wildlifeRisk >= 80).length,
      severePriorityZones: scores.filter((score) => score.label === "severe").length,
      topZones: scores
        .slice()
        .sort((a, b) => b.combinedPriority - a.combinedPriority)
        .slice(0, 5),
    };
  } catch (error) {
    await store.upsert("RiskRun", {
      id: runId,
      status: "FAILED",
      weights: allRiskWeights(),
      version: RISK_ENGINE_VERSION,
      startedAt: now,
      completedAt: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : "Unknown risk engine error",
      createdAt: now,
    });
    throw error;
  }
}
