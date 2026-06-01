import type { RiskScoreRow, ZoneRow } from "@/lib/rangerqData";

export type OptimizeMethod = "GREEDY" | "LOCAL_SEARCH" | "HYBRID" | "QBRAID_QUBO";

export type OptimizeInput = {
  maxZones: number;
  maxPatrolHours: number;
  rangerTeams: number;
  requireFireCoverage: boolean;
  requireWildlifeCoverage: boolean;
  method: OptimizeMethod;
};

export type OptimizerCandidate = {
  zoneId: string;
  code: string;
  name: string;
  zoneType: string;
  fireRisk: number;
  wildlifeRisk: number;
  combinedPriority: number;
  accessDifficulty: number;
  rangerStationDistanceKm: number;
  estimatedHours: number;
  feasibility: number;
  mustCoverFire: boolean;
  mustCoverWildlife: boolean;
  score: number;
  reason: string;
};

export type RejectedZone = {
  zoneId: string;
  code: string;
  name: string;
  reason: string;
  score: number;
};

export type OptimizerSelection = {
  selected: OptimizerCandidate[];
  rejected: RejectedZone[];
  coverageScore: number;
  travelPenalty: number;
  estimatedPatrolHours: number;
  fireCoverageCount: number;
  wildlifeCoverageCount: number;
};

export type QuboPayload = {
  problem_type: "patrol_zone_selection";
  variables: string[];
  linear: Record<string, number>;
  quadratic: Record<string, number>;
  constraints: {
    max_zones: number;
    max_patrol_hours: number;
    require_fire_coverage: boolean;
    require_wildlife_coverage: boolean;
  };
  metadata: {
    park: string;
    risk_run_id: string;
    generated_at: string;
  };
};

export type PatrolPlanItem = {
  teamName: string;
  route: string[];
  objective: string;
  why: string;
  estimatedHours: number;
  safetyNote: string;
  fallback: string;
};

export type OptimizeResult = OptimizerSelection & {
  optimizationRunId: string;
  riskRunId: string;
  method: OptimizeMethod;
  qbraidStatus: string;
  qbraidJobId: string;
  fallbackReason: string;
  quboPayload: QuboPayload;
  actionPlan: PatrolPlanItem[];
};

export function candidateFromZone(zone: ZoneRow, score?: RiskScoreRow): OptimizerCandidate {
  const fireRisk = score?.fireRisk ?? zone.baseFireRisk;
  const wildlifeRisk = score?.wildlifeRisk ?? zone.baseWildlifeRisk;
  const combinedPriority = score?.combinedPriority ?? Math.round((fireRisk + wildlifeRisk) / 2);
  const feasibility = Math.max(0, Math.min(100, 100 - zone.accessDifficulty * 0.65 - zone.rangerStationDistanceKm * 2));
  const estimatedHours = Number((1.15 + zone.rangerStationDistanceKm * 0.18 + zone.accessDifficulty * 0.018).toFixed(1));
  const travelPenalty = zone.rangerStationDistanceKm * 1.5 + zone.accessDifficulty * 0.25;

  return {
    zoneId: zone.id,
    code: zone.code,
    name: zone.name,
    zoneType: zone.zoneType,
    fireRisk,
    wildlifeRisk,
    combinedPriority,
    accessDifficulty: zone.accessDifficulty,
    rangerStationDistanceKm: zone.rangerStationDistanceKm,
    estimatedHours,
    feasibility: Math.round(feasibility),
    mustCoverFire: fireRisk >= 80,
    mustCoverWildlife: wildlifeRisk >= 80,
    score: Math.round(combinedPriority * 1.4 + feasibility * 0.35 - travelPenalty),
    reason: score?.recommendedAction || `Priority from base fire ${fireRisk} and wildlife ${wildlifeRisk} risk.`,
  };
}

