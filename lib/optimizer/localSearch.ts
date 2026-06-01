import { summarizeSelection } from "@/lib/optimizer/greedy";
import type { OptimizeInput, OptimizerCandidate, OptimizerSelection } from "@/lib/optimizer/types";

function objective(selection: OptimizerSelection) {
  return selection.coverageScore - selection.travelPenalty - selection.estimatedPatrolHours * 2
    + selection.fireCoverageCount * 12 + selection.wildlifeCoverageCount * 12;
}

function valid(selected: OptimizerCandidate[], input: OptimizeInput) {
  const hours = selected.reduce((sum, zone) => sum + zone.estimatedHours, 0);
  if (selected.length > input.maxZones || hours > input.maxPatrolHours) return false;
  if (input.requireFireCoverage && !selected.some((zone) => zone.fireRisk >= 80)) return false;
  if (input.requireWildlifeCoverage && !selected.some((zone) => zone.wildlifeRisk >= 80)) return false;
  return true;
}

function buildSelection(selected: OptimizerCandidate[], candidates: OptimizerCandidate[]): OptimizerSelection {
  const rejected = candidates
    .filter((candidate) => !selected.some((zone) => zone.zoneId === candidate.zoneId))
    .map((candidate) => ({
      zoneId: candidate.zoneId,
      code: candidate.code,
      name: candidate.name,
      reason: "not selected after local-search improvement",
      score: candidate.score,
    }));

  return summarizeSelection(selected, rejected);
}

export function improveWithLocalSearch(
  candidates: OptimizerCandidate[],
  initial: OptimizerSelection,
  input: OptimizeInput,
): OptimizerSelection {
  let best = initial;
  let bestScore = objective(best);
  const selected = initial.selected;
  const unselected = candidates.filter((candidate) => !selected.some((zone) => zone.zoneId === candidate.zoneId));

  for (const current of selected) {
    for (const replacement of unselected) {
      const trialSelected = selected.map((zone) => zone.zoneId === current.zoneId ? replacement : zone);
      if (!valid(trialSelected, input)) continue;
      const trial = buildSelection(trialSelected, candidates);
      const trialScore = objective(trial);
      if (trialScore > bestScore) {
        best = trial;
        bestScore = trialScore;
      }
    }
  }

  return best;
}

