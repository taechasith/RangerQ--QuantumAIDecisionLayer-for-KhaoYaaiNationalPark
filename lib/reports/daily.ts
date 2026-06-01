import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { getOperationsSnapshot, type DataSourceRow, type RiskScoreRow, type ZoneRow } from "@/lib/rangerqData";

type RawRow = Record<string, unknown>;

export type DailyReportPlan = {
  teamName: string;
  route: string[];
  objective: string;
  why: string;
  estimatedHours: number;
  safetyNote: string;
  fallback: string;
};

export type DailyReportZone = {
  rank: number;
  code: string;
  name: string;
  fireRisk: number;
  wildlifeRisk: number;
  combinedPriority: number;
  reason: string;
  estimatedHours: number;
};

export type DailyReport = {
  generatedAt: string;
  timezone: "Asia/Bangkok";
  optimizationRunId: string;
  riskRunId: string;
  method: string;
  qbraidStatus: string;
  dataSources: DataSourceRow[];
  topZones: DailyReportZone[];
  actionPlan: DailyReportPlan[];
  fireWarnings: string[];
  wildlifeWarnings: string[];
  missingData: string[];
  demoWarning: string;
};

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function toText(value: unknown) {
  return String(value || "");
}

function parseArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
}

function latestByDate(rows: RawRow[], dateField: string) {
  return [...rows].sort((a, b) => Date.parse(toText(b[dateField])) - Date.parse(toText(a[dateField])))[0] || null;
}

function fallbackPlan(zones: ZoneRow[], riskScores: RiskScoreRow[]): { topZones: DailyReportZone[]; actionPlan: DailyReportPlan[] } {
  const scoreByZone = new Map(riskScores.map((score) => [score.zoneId, score]));
  const topZones = [...zones]
    .sort((a, b) => {
      const aScore = scoreByZone.get(a.id)?.combinedPriority ?? (a.baseFireRisk + a.baseWildlifeRisk) / 2;
      const bScore = scoreByZone.get(b.id)?.combinedPriority ?? (b.baseFireRisk + b.baseWildlifeRisk) / 2;
      return bScore - aScore;
    })
    .slice(0, 5)
    .map((zone, index) => {
      const score = scoreByZone.get(zone.id);
      return {
        rank: index + 1,
        code: zone.code,
        name: zone.name,
        fireRisk: score?.fireRisk ?? zone.baseFireRisk,
        wildlifeRisk: score?.wildlifeRisk ?? zone.baseWildlifeRisk,
        combinedPriority: score?.combinedPriority ?? Math.round((zone.baseFireRisk + zone.baseWildlifeRisk) / 2),
        reason: score?.recommendedAction || `Base risk fallback for ${zone.code}.`,
        estimatedHours: Number((1.2 + zone.rangerStationDistanceKm * 0.18 + zone.accessDifficulty * 0.018).toFixed(1)),
      };
    });

  return {
    topZones,
    actionPlan: topZones.slice(0, 2).map((zone, index) => ({
      teamName: `Team ${String.fromCharCode(65 + index)}`,
      route: [zone.code],
      objective: zone.fireRisk >= zone.wildlifeRisk ? "Early fire-risk inspection near boundary corridor." : "Wildlife-boundary monitoring and road crossing checks.",
      why: `${zone.code}: fire ${zone.fireRisk}, wildlife ${zone.wildlifeRisk}, combined ${zone.combinedPriority}.`,
      estimatedHours: zone.estimatedHours,
      safetyNote: zone.fireRisk >= 80 ? "Avoid uphill approach if smoke or heat is visible." : "Use slow approach near wildlife crossing points.",
      fallback: `If access is blocked, switch to perimeter observation near ${zone.code}.`,
    })),
  };
}

export async function buildDailyReport(store: GoogleSheetsStore): Promise<DailyReport> {
  const snapshot = await getOperationsSnapshot();
  const [optimizationRows, selectedRows, planRows] = await Promise.all([
    store.list<RawRow>("OptimizationRun"),
    store.list<RawRow>("SelectedZone"),
    store.list<RawRow>("PatrolPlan"),
  ]);
  const latestOptimization = latestByDate(optimizationRows, "completedAt") || latestByDate(optimizationRows, "createdAt");
  const zoneById = new Map(snapshot.zones.map((zone) => [zone.id, zone]));
  const scoreByZoneId = new Map(snapshot.riskScores.map((score) => [score.zoneId, score]));

  let topZones: DailyReportZone[] = [];
  let actionPlan: DailyReportPlan[] = [];

  if (latestOptimization?.id) {
    const optimizationRunId = toText(latestOptimization.id);
    topZones = selectedRows
      .filter((row) => toText(row.optimizationRunId) === optimizationRunId)
      .sort((a, b) => toNumber(a.rank) - toNumber(b.rank))
      .map((row) => {
        const zone = zoneById.get(toText(row.zoneId));
        const score = scoreByZoneId.get(toText(row.zoneId));
        return {
          rank: toNumber(row.rank),
          code: zone?.code || toText(row.zoneId),
          name: zone?.name || "Unknown zone",
          fireRisk: score?.fireRisk ?? zone?.baseFireRisk ?? 0,
          wildlifeRisk: score?.wildlifeRisk ?? zone?.baseWildlifeRisk ?? 0,
          combinedPriority: score?.combinedPriority ?? Math.round(((zone?.baseFireRisk || 0) + (zone?.baseWildlifeRisk || 0)) / 2),
          reason: toText(row.reason),
          estimatedHours: toNumber(row.estimatedHours),
        };
      });
    actionPlan = planRows
      .filter((row) => toText(row.optimizationRunId) === optimizationRunId)
      .sort((a, b) => toText(a.teamName).localeCompare(toText(b.teamName)))
      .map((row) => ({
        teamName: toText(row.teamName),
        route: parseArray(row.route),
        objective: toText(row.objective),
        why: toText(row.why),
        estimatedHours: toNumber(row.estimatedHours),
        safetyNote: toText(row.safetyNote),
        fallback: toText(row.fallback),
      }));
  }

  if (!topZones.length || !actionPlan.length) {
    const fallback = fallbackPlan(snapshot.zones, snapshot.riskScores);
    topZones = topZones.length ? topZones : fallback.topZones;
    actionPlan = actionPlan.length ? actionPlan : fallback.actionPlan;
  }

  const fireWarnings = topZones
    .filter((zone) => zone.fireRisk >= 80)
    .map((zone) => `${zone.code}: severe fire risk ${zone.fireRisk}`);
  const wildlifeWarnings = topZones
    .filter((zone) => zone.wildlifeRisk >= 80)
    .map((zone) => `${zone.code}: severe wildlife-boundary risk ${zone.wildlifeRisk}`);
  const missingData = snapshot.sources
    .filter((source) => source.status === "demo" || source.freshnessWarning)
    .map((source) => `${source.name}: ${source.freshnessWarning || source.status}`);

  return {
    generatedAt: new Date().toISOString(),
    timezone: "Asia/Bangkok",
    optimizationRunId: toText(latestOptimization?.id),
    riskRunId: toText(latestOptimization?.riskRunId || snapshot.riskRun?.id),
    method: toText(latestOptimization?.method || "FALLBACK"),
    qbraidStatus: toText(latestOptimization?.qbraidStatus || "NOT_SUBMITTED"),
    dataSources: snapshot.sources,
    topZones,
    actionPlan,
    fireWarnings,
    wildlifeWarnings,
    missingData,
    demoWarning: snapshot.zones.some((zone) => zone.isSynthetic)
      ? "Demo zones are synthetic. Replace with official park GIS data before operational use."
      : "",
  };
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll("\"", "\"\"")}"`;
}

export function dailyReportCsv(report: DailyReport) {
  const rows = [
    ["team", "route", "objective", "why", "estimated_hours", "safety_note", "fallback"],
    ...report.actionPlan.map((plan) => [
      plan.teamName,
      plan.route.join(" -> "),
      plan.objective,
      plan.why,
      plan.estimatedHours,
      plan.safetyNote,
      plan.fallback,
    ]),
    [],
    ["rank", "zone_code", "zone_name", "fire_risk", "wildlife_risk", "combined_priority", "reason"],
    ...report.topZones.map((zone) => [
      zone.rank,
      zone.code,
      zone.name,
      zone.fireRisk,
      zone.wildlifeRisk,
      zone.combinedPriority,
      zone.reason,
    ]),
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

