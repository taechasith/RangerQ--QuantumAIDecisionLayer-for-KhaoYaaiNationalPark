export const RISK_ENGINE_VERSION = "risk-v1.0.0";

export const fireRiskWeights = {
  humanAccessRisk: 0.25,
  drynessScore: 0.2,
  windScore: 0.15,
  recentHotspotScore: 0.15,
  slopeOrAccessDifficultyScore: 0.1,
  patrolGapScore: 0.1,
  manualRangerNoteScore: 0.05,
} as const;

export const wildlifeRiskWeights = {
  boundaryProximityScore: 0.25,
  recentCameraDetectionScore: 0.2,
  waterOrFoodPressureScore: 0.15,
  visitorPressureScore: 0.15,
  historicalIncidentScore: 0.1,
  manualRangerNoteScore: 0.1,
  seasonalityScore: 0.05,
} as const;

export const combinedRiskWeights = {
  fireRisk: 0.45,
  wildlifeRisk: 0.4,
  operationalFeasibility: 0.15,
} as const;

export function allRiskWeights() {
  return {
    fire: fireRiskWeights,
    wildlife: wildlifeRiskWeights,
    combined: combinedRiskWeights,
  };
}

