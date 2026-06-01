import type { OptimizerCandidate, PatrolPlanItem } from "@/lib/optimizer/types";

export function buildActionPlan(selected: OptimizerCandidate[], rangerTeams: number): PatrolPlanItem[] {
  const teams = Array.from({ length: Math.max(1, rangerTeams) }, (_, index) => ({
    teamName: `Team ${String.fromCharCode(65 + index)}`,
    zones: [] as OptimizerCandidate[],
  }));

  selected.forEach((zone, index) => {
    teams[index % teams.length].zones.push(zone);
  });

  return teams
    .filter((team) => team.zones.length)
    .map((team) => {
      const route = team.zones.map((zone) => zone.code);
      const firePeak = Math.max(...team.zones.map((zone) => zone.fireRisk));
      const wildlifePeak = Math.max(...team.zones.map((zone) => zone.wildlifeRisk));
      const objective = firePeak >= wildlifePeak
        ? "Early fire-risk inspection near boundary and access corridors."
        : "Wildlife-boundary conflict monitoring and road crossing checks.";

      return {
        teamName: team.teamName,
        route,
        objective,
        why: team.zones.map((zone) => `${zone.code}: fire ${zone.fireRisk}, wildlife ${zone.wildlifeRisk}`).join("; "),
        estimatedHours: Number(team.zones.reduce((sum, zone) => sum + zone.estimatedHours, 0).toFixed(1)),
        safetyNote: firePeak >= 80
          ? "Avoid uphill approach if smoke or heat is visible; check wind before entering."
          : "Use vehicle lights and slow approach near wildlife crossing points.",
        fallback: `If access is blocked, switch to ${team.zones[team.zones.length - 1]?.code || route[0]} perimeter observation.`,
      };
    });
}

