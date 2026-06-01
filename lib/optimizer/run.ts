import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { importId } from "@/lib/imports/csv";
import { buildActionPlan } from "@/lib/optimizer/actionPlan";
import { runGreedyOptimizer } from "@/lib/optimizer/greedy";
import { improveWithLocalSearch } from "@/lib/optimizer/localSearch";
import { buildQuboPayload } from "@/lib/optimizer/qubo";
import { candidateFromZone, type OptimizeInput, type OptimizeResult } from "@/lib/optimizer/types";
import { getOperationsSnapshot } from "@/lib/rangerqData";

function clampInput(input: Partial<OptimizeInput>): OptimizeInput {
  return {
    maxZones: Math.max(1, Math.min(10, Number(input.maxZones) || 5)),
    maxPatrolHours: Math.max(1, Math.min(24, Number(input.maxPatrolHours) || 6)),
    rangerTeams: Math.max(1, Math.min(8, Number(input.rangerTeams) || 2)),
    requireFireCoverage: input.requireFireCoverage !== false,
    requireWildlifeCoverage: input.requireWildlifeCoverage !== false,
    method: input.method || "HYBRID",
  };
}

export async function runOptimizer(store: GoogleSheetsStore, rawInput: Partial<OptimizeInput>): Promise<OptimizeResult> {
  const input = clampInput(rawInput);
  const snapshot = await getOperationsSnapshot();
  const latestRiskRunId = snapshot.riskRun?.id || "";
  const scoreByZoneId = new Map(snapshot.riskScores.map((score) => [score.zoneId, score]));
  const candidates = snapshot.zones
    .map((zone) => candidateFromZone(zone, scoreByZoneId.get(zone.id)))
    .sort((a, b) => b.score - a.score);

  if (!candidates.length) throw new Error("No candidate zones available for optimization");

  const greedy = runGreedyOptimizer(candidates, input);
  const selection = input.method === "GREEDY"
    ? greedy
    : improveWithLocalSearch(candidates, greedy, input);
  const quboPayload = buildQuboPayload(candidates.slice(0, Math.max(input.maxZones * 2, 8)), input, {
    riskRunId: latestRiskRunId || "base-risk-fallback",
  });
  const actionPlan = buildActionPlan(selection.selected, input.rangerTeams);
  const now = new Date().toISOString();
  const optimizationRunId = importId("optimization-run");
  const fallbackReason = process.env.QBRAID_API_KEY
    ? "qBraid submission is implemented in Phase 9; classical/local-search plan is operational now."
    : "QBRAID_API_KEY missing; using deterministic classical/local-search result.";

  await store.append("OptimizationRun", {
    id: optimizationRunId,
    riskRunId: latestRiskRunId,
    method: input.method,
    status: "SUCCESS",
    maxZones: input.maxZones,
    maxPatrolHours: input.maxPatrolHours,
    rangerTeams: input.rangerTeams,
    requireFireCoverage: input.requireFireCoverage,
    requireWildlifeCoverage: input.requireWildlifeCoverage,
    coverageScore: selection.coverageScore,
    travelPenalty: selection.travelPenalty,
    estimatedPatrolHours: selection.estimatedPatrolHours,
    quboPayload,
    qbraidJobId: "",
    qbraidStatus: "QBRAID_PENDING_PHASE_9",
    qbraidResult: {},
    fallbackReason,
    createdAt: now,
    completedAt: now,
  });

  await Promise.all(selection.selected.map((zone, index) => store.append("SelectedZone", {
    id: importId(`selected-${zone.code}`),
    optimizationRunId,
    zoneId: zone.zoneId,
    rank: index + 1,
    reason: zone.reason,
    estimatedHours: zone.estimatedHours,
    scoreContribution: zone.score,
    createdAt: now,
  })));

  await Promise.all(actionPlan.map((plan) => store.append("PatrolPlan", {
    id: importId(`plan-${plan.teamName}`),
    optimizationRunId,
    teamName: plan.teamName,
    route: plan.route,
    objective: plan.objective,
    why: plan.why,
    estimatedHours: plan.estimatedHours,
    safetyNote: plan.safetyNote,
    fallback: plan.fallback,
    createdAt: now,
  })));

  await store.append("AuditLog", {
    id: importId("audit-optimization"),
    userId: "",
    action: "RUN_OPTIMIZER",
    entity: "OptimizationRun",
    entityId: optimizationRunId,
    metadata: { selected: selection.selected.length, method: input.method },
    createdAt: now,
  });

  return {
    optimizationRunId,
    riskRunId: latestRiskRunId,
    method: input.method,
    ...selection,
    qbraidStatus: "QBRAID_PENDING_PHASE_9",
    qbraidJobId: "",
    fallbackReason,
    quboPayload,
    actionPlan,
  };
}

