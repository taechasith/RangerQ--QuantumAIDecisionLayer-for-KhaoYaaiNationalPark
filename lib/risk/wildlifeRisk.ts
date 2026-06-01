import type { NoteForRisk, RiskFactor, RiskZone } from "@/lib/risk/fireRisk";
import { wildlifeRiskWeights } from "@/lib/risk/weights";

export type CameraForRisk = {
  zoneId: string;
  species: string;
  count: number;
  confidence: number;
  timestamp?: string;
};

export type VisitorForRisk = {
  zoneId: string;
  visitorCount: number;
  vehicleCount: number;
  busCount: number;
};

export type WildlifeRiskContext = {
  cameraDetections: CameraForRisk[];
  visitorPressure?: VisitorForRisk;
  notes: NoteForRisk[];
};

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function boundaryScore(zoneType: string) {
  if (zoneType === "VILLAGE_EDGE") return 100;
  if (zoneType === "BOUNDARY") return 88;
  if (zoneType === "ROAD") return 70;
  if (zoneType === "WATER_SOURCE") return 52;
  return 35;
}

function waterOrFoodScore(zoneType: string, baseWildlifeRisk: number) {
  if (zoneType === "WATER_SOURCE") return 90;
  if (zoneType === "VISITOR_AREA") return 70;
  return clampScore(baseWildlifeRisk * 0.7);
}

function manualWildlifeScore(notes: NoteForRisk[]) {
  const relevant = notes.filter((note) => ["wildlife", "elephant", "gaur", "conflict", "crop"].some((term) => note.category.toLowerCase().includes(term)));
  return clampScore(Math.max(0, ...relevant.map((note) => note.severity * 20)));
}

export function calculateWildlifeRisk(zone: RiskZone, context: WildlifeRiskContext) {
  const boundaryProximityScore = boundaryScore(zone.zoneType);
  const recentCameraDetectionScore = clampScore(
    context.cameraDetections.reduce((sum, detection) => sum + detection.count * detection.confidence * 28, 0),
  );
  const waterOrFoodPressureScore = waterOrFoodScore(zone.zoneType, zone.baseWildlifeRisk);
  const visitor = context.visitorPressure;
  const visitorPressureScore = visitor ? clampScore(visitor.visitorCount / 18 + visitor.vehicleCount / 8 + visitor.busCount * 2) : 35;
  const historicalIncidentScore = clampScore(zone.baseWildlifeRisk);
  const manualRangerNoteScore = manualWildlifeScore(context.notes);
  const seasonalityScore = 55;

  const score = clampScore(
    boundaryProximityScore * wildlifeRiskWeights.boundaryProximityScore
      + recentCameraDetectionScore * wildlifeRiskWeights.recentCameraDetectionScore
      + waterOrFoodPressureScore * wildlifeRiskWeights.waterOrFoodPressureScore
      + visitorPressureScore * wildlifeRiskWeights.visitorPressureScore
      + historicalIncidentScore * wildlifeRiskWeights.historicalIncidentScore
      + manualRangerNoteScore * wildlifeRiskWeights.manualRangerNoteScore
      + seasonalityScore * wildlifeRiskWeights.seasonalityScore,
  );

  const factors: RiskFactor[] = [
    { name: "boundary proximity", score: boundaryProximityScore, detail: `${zone.zoneType.toLowerCase()} conflict exposure` },
    { name: "camera detections", score: recentCameraDetectionScore, detail: `${context.cameraDetections.length} recent camera records` },
    { name: "water/food pressure", score: waterOrFoodPressureScore, detail: "water source, visitor area, and base wildlife risk" },
    { name: "visitor pressure", score: visitorPressureScore, detail: visitor ? "visitor, vehicle, and bus counts" : "visitor pressure missing fallback" },
    { name: "history", score: historicalIncidentScore, detail: "base wildlife conflict risk" },
    { name: "manual notes", score: manualRangerNoteScore, detail: "recent ranger wildlife/conflict notes" },
    { name: "seasonality", score: seasonalityScore, detail: "static dry-season operational prior" },
  ];

  return { score, factors };
}

