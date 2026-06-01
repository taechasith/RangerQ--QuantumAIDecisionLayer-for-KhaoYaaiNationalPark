import type { OptimizeInput, OptimizerCandidate, OptimizerSelection, RejectedZone } from "@/lib/optimizer/types";

function summarizeSelection(selected: OptimizerCandidate[], rejected: RejectedZone[]): OptimizerSelection {
  return {
    selected,
    rejected,
    coverageScore: Math.round(selected.reduce((sum, zone) => sum + zone.combinedPriority, 0)),
    travelPenalty: Math.round(selected.reduce((sum, zone) => sum + zone.rangerStationDistanceKm * 1.5 + zone.accessDifficulty * 0.25, 0)),
    estimatedPatrolHours: Number(selected.reduce((sum, zone) => sum + zone.estimatedHours, 0).toFixed(1)),
    fireCoverageCount: selected.filter((zone) => zone.fireRisk >= 80).length,
    wildlifeCoverageCount: selected.filter((zone) => zone.wildlifeRisk >= 80).length,
  };
}

function rejection(candidate: OptimizerCandidate, reason: string): RejectedZone {
  return {
    zoneId: candidate.zoneId,
    code: candidate.code,
    name: candidate.name,
    reason,
    score: candidate.score,
  };
}

export function runGreedyOptimizer(candidates: OptimizerCandidate[], input: OptimizeInput): OptimizerSelection {
  const ordered = [...candidates].sort((a, b) => b.score - a.score);
  const selected: OptimizerCandidate[] = [];
  const rejected: RejectedZone[] = [];
  let hours = 0;

  const choose = (candidate: OptimizerCandidate) => {
    if (selected.some((zone) => zone.zoneId === candidate.zoneId)) return false;
    if (selected.length >= input.maxZones) {
      rejected.push(rejection(candidate, "max zone count reached"));
      return false;
    }
    if (hours + candidate.estimatedHours > input.maxPatrolHours) {
      rejected.push(rejection(candidate, "max patrol hours reached"));
      return false;
    }
    selected.push(candidate);
    hours += candidate.estimatedHours;
    return true;
  };

  if (input.requireFireCoverage) {
    const fire = ordered.find((candidate) => candidate.fireRisk >= 80);
    if (fire) choose(fire);
  }

  if (input.requireWildlifeCoverage) {
    const wildlife = ordered.find((candidate) => candidate.wildlifeRisk >= 80 && !selected.some((zone) => zone.zoneId === candidate.zoneId));
    if (wildlife) choose(wildlife);
  }

  for (const candidate of ordered) {
    choose(candidate);
  }

  for (const candidate of ordered) {
    if (!selected.some((zone) => zone.zoneId === candidate.zoneId) && !rejected.some((zone) => zone.zoneId === candidate.zoneId)) {
      rejected.push(rejection(candidate, "lower marginal coverage than selected zones"));
    }
  }

  return summarizeSelection(selected, rejected);
}

export { summarizeSelection };

