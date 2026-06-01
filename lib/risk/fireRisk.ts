import { fireRiskWeights } from "@/lib/risk/weights";

export type RiskZone = {
  id: string;
  code: string;
  name: string;
  zoneType: string;
  baseFireRisk: number;
  baseWildlifeRisk: number;
  accessDifficulty: number;
  rangerStationDistanceKm?: number;
};

export type WeatherForRisk = {
  zoneId: string;
  relativeHumidity2m: number;
  windSpeed10m: number;
  windGusts10m: number;
  precipitation: number;
  soilMoisture0To1cm: number;
  timestamp?: string;
};

export type HotspotForRisk = {
  zoneId: string;
  lat?: number;
  lng?: number;
  timestamp?: string;
  confidence?: string;
  frp?: number;
};

export type NoteForRisk = {
  zoneId: string;
  category: string;
  severity: number;
  timestamp?: string;
};

export type FireRiskContext = {
  weather?: WeatherForRisk;
  hotspotCount: number;
  notes: NoteForRisk[];
  sourceWarnings: string[];
};

export type RiskFactor = {
  name: string;
  score: number;
  detail: string;
};

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function riskByZoneType(zoneType: string) {
  if (["BOUNDARY", "VILLAGE_EDGE", "ROAD", "VISITOR_AREA", "TRAIL"].includes(zoneType)) return 85;
  if (zoneType === "RANGER_STATION") return 30;
  return 55;
}

function manualFireScore(notes: NoteForRisk[]) {
  const relevant = notes.filter((note) => ["fire", "smoke", "threat", "patrol"].some((term) => note.category.toLowerCase().includes(term)));
  return clampScore(Math.max(0, ...relevant.map((note) => note.severity * 20)));
}

export function calculateFireRisk(zone: RiskZone, context: FireRiskContext) {
  const weather = context.weather;
  const humanAccessRisk = clampScore((zone.baseFireRisk * 0.55) + (riskByZoneType(zone.zoneType) * 0.45));
  const drynessScore = weather
    ? clampScore((100 - weather.relativeHumidity2m) * 0.75 + (100 - weather.soilMoisture0To1cm * 100) * 0.25 - weather.precipitation * 8)
    : clampScore(zone.baseFireRisk * 0.8);
  const windScore = weather ? clampScore(weather.windSpeed10m * 4 + weather.windGusts10m * 2) : 45;
  const recentHotspotScore = clampScore(context.hotspotCount * 45);
  const slopeOrAccessDifficultyScore = clampScore(zone.accessDifficulty);
  const patrolGapScore = clampScore((zone.rangerStationDistanceKm || 0) * 7);
  const manualRangerNoteScore = manualFireScore(context.notes);

  const score = clampScore(
    humanAccessRisk * fireRiskWeights.humanAccessRisk
      + drynessScore * fireRiskWeights.drynessScore
      + windScore * fireRiskWeights.windScore
      + recentHotspotScore * fireRiskWeights.recentHotspotScore
      + slopeOrAccessDifficultyScore * fireRiskWeights.slopeOrAccessDifficultyScore
      + patrolGapScore * fireRiskWeights.patrolGapScore
      + manualRangerNoteScore * fireRiskWeights.manualRangerNoteScore,
  );

  const factors: RiskFactor[] = [
    { name: "human access", score: humanAccessRisk, detail: `${zone.zoneType.toLowerCase()} exposure and base fire risk` },
    { name: "dryness", score: drynessScore, detail: weather ? "humidity, soil moisture, and precipitation" : "fallback from base fire risk" },
    { name: "wind", score: windScore, detail: weather ? "Open-Meteo wind speed and gusts" : "weather missing fallback" },
    { name: "recent hotspots", score: recentHotspotScore, detail: `${context.hotspotCount} recent FIRMS hotspot records` },
    { name: "access difficulty", score: slopeOrAccessDifficultyScore, detail: "zone access difficulty as slope/access proxy" },
    { name: "patrol gap", score: patrolGapScore, detail: `${zone.rangerStationDistanceKm || 0} km from ranger station` },
    { name: "manual notes", score: manualRangerNoteScore, detail: "recent ranger fire/smoke notes" },
  ];

  return { score, factors };
}

