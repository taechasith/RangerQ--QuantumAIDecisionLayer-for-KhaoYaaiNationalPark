import { Card, PageHeader } from "@/components/layout/PageHeader";
import { RunRiskButton } from "@/components/dashboard/RunRiskButton";
import { RiskChart } from "@/components/dashboard/RiskChart";
import { getOperationsSnapshot } from "@/lib/rangerqData";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { zones, sources, status, riskRun, riskScores, usingFallback } = await getOperationsSnapshot();
  const hasRiskScores = riskScores.length > 0;
  const severeFire = hasRiskScores
    ? riskScores.filter((score) => score.fireRisk >= 80).length
    : zones.filter((zone) => zone.baseFireRisk >= 80).length;
  const severeWildlife = hasRiskScores
    ? riskScores.filter((score) => score.wildlifeRisk >= 80).length
    : zones.filter((zone) => zone.baseWildlifeRisk >= 80).length;
  const topZones = hasRiskScores
    ? riskScores.slice(0, 5)
    : [...zones]
      .sort((a, b) => b.baseFireRisk + b.baseWildlifeRisk - (a.baseFireRisk + a.baseWildlifeRisk))
      .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Ranger Command Center"
        description="Khao Yai National Park real-time tracking dashboard. View safety alerts, weather updates, and manage daily ranger deployments."
      />
      <div className="grid gap-4 md:grid-cols-4 animate-slide-up delay-75">
        <Card title="Total Patrol Areas" value={String(zones.length)} detail={usingFallback ? "Using preview zones" : "Connected to Live Database"} />
        <Card title="High Fire Threat" value={String(severeFire)} detail={hasRiskScores ? "Current fire danger >= 80" : "Baseline fire danger >= 80"} />
        <Card title="High Wildlife Conflict" value={String(severeWildlife)} detail={hasRiskScores ? "Current wildlife risk >= 80" : "Baseline wildlife risk >= 80"} />
        <Card title="Last Danger Update" value={riskRun?.completedAt ? new Date(riskRun.completedAt).toLocaleString("en-US", { timeZone: "Asia/Bangkok" }) : "Not recalculated yet"} detail={riskRun?.version || "Recalculate danger levels to update maps and planners"} />
      </div>

      <div className="mt-6 rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-5 animate-slide-up delay-100">
        <h2 className="text-base font-bold text-white mb-4">Fire & Wildlife Danger Comparison (Top 10 High-Risk Zones)</h2>
        <RiskChart zones={zones} riskScores={riskScores} />
      </div>

      <div className="mt-6 animate-slide-up delay-150">
        <RunRiskButton />
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-2 animate-slide-up delay-200">
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md">
          <div className="border-b border-zinc-900 px-5 py-4">
            <h2 className="text-base font-bold text-white">Highest Priority Zones</h2>
          </div>
          <div className="divide-y divide-zinc-900">
            {topZones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-900/10 transition-colors">
                <div>
                  <p className="font-bold text-white">{"zoneCode" in zone ? zone.zoneCode : zone.code}</p>
                  <p className="text-sm text-zinc-400">{"zoneName" in zone ? zone.zoneName : zone.name}</p>
                  {"recommendedAction" in zone ? (
                    <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">{zone.recommendedAction}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-white">
                    {"combinedPriority" in zone ? zone.combinedPriority : Math.round((zone.baseFireRisk + zone.baseWildlifeRisk) / 2)}
                  </p>
                  {"label" in zone ? <p className="mt-1 text-[10px] tracking-wider font-extrabold uppercase text-emerald-400">{zone.label}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md">
          <div className="border-b border-zinc-900 px-5 py-4">
            <h2 className="text-base font-bold text-white">Live Data Sources</h2>
          </div>
          <div className="divide-y divide-zinc-900">
            {sources.map((source) => (
              <div key={source.id} className="px-5 py-4 hover:bg-zinc-900/10 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{source.name}</p>
                  <span className="rounded-full bg-zinc-900/80 border border-zinc-800 px-2.5 py-0.5 text-xs font-bold text-zinc-400">{source.status}</span>
                </div>
                <p className="mt-1.5 text-xs text-zinc-500">{source.freshnessWarning || source.lastSyncedAt || "Ready"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-6 rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-5 animate-slide-up delay-300">
        <h2 className="text-base font-bold text-white">System Connection Status</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{status.message}</p>
      </div>
    </>
  );
}
