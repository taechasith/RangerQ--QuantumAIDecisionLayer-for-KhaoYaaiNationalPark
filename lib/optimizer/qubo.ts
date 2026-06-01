import type { OptimizeInput, OptimizerCandidate, QuboPayload } from "@/lib/optimizer/types";

function variableName(code: string) {
  return `x_${code.replaceAll("-", "_")}`;
}

export function buildQuboPayload(
  candidates: OptimizerCandidate[],
  input: OptimizeInput,
  metadata: { riskRunId: string },
): QuboPayload {
  const variables = candidates.map((candidate) => variableName(candidate.code));
  const linear: Record<string, number> = {};
  const quadratic: Record<string, number> = {};

  candidates.forEach((candidate) => {
    const variable = variableName(candidate.code);
    linear[variable] = Number((-candidate.score).toFixed(2));
  });

  for (let i = 0; i < candidates.length; i += 1) {
    for (let j = i + 1; j < candidates.length; j += 1) {
      const a = candidates[i];
      const b = candidates[j];
      const pair = `${variableName(a.code)},${variableName(b.code)}`;
      const distancePenalty = Math.max(0, 6 - Math.abs(a.rangerStationDistanceKm - b.rangerStationDistanceKm)) * 1.5;
      const hourPenalty = Math.max(0, a.estimatedHours + b.estimatedHours - input.maxPatrolHours) * 8;
      quadratic[pair] = Number((distancePenalty + hourPenalty).toFixed(2));
    }
  }

  return {
    problem_type: "patrol_zone_selection",
    variables,
    linear,
    quadratic,
    constraints: {
      max_zones: input.maxZones,
      max_patrol_hours: input.maxPatrolHours,
      require_fire_coverage: input.requireFireCoverage,
      require_wildlife_coverage: input.requireWildlifeCoverage,
    },
    metadata: {
      park: "Khao Yai National Park",
      risk_run_id: metadata.riskRunId,
      generated_at: new Date().toISOString(),
    },
  };
}

