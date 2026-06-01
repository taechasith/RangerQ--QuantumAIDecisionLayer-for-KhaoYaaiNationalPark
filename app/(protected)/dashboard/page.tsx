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
        title="Operations Dashboard"
        description="Protected command view backed by Google Apps Script / Sheets, with fallback demo data if the web app endpoint is not reachable."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-slide-up delay-75">
        <Card title="Total zones" value={String(zones.length)} detail={usingFallback ? "Fallback demo snapshot" : "Loaded from Apps Script"} />
        <Card title="Severe fire zones" value={String(severeFire)} detail={hasRiskScores ? "Latest fire risk >= 80" : "Base fire risk >= 80"} />
        <Card title="Severe wildlife zones" value={String(severeWildlife)} detail={hasRiskScores ? "Latest wildlife risk >= 80" : "Base wildlife risk >= 80"} />
        <Card title="Latest risk run" value={riskRun?.completedAt ? new Date(riskRun.completedAt).toLocaleString("en-US", { timeZone: "Asia/Bangkok" }) : "Not run"} detail={riskRun?.version || "Run risk scoring to create explainable scores"} />
      </div>

      <div className="mt-6 rounded-xl border border-zinc-900/90 bg-zinc-900/35 p-4 shadow-lg shadow-black/10 backdrop-blur-md animate-slide-up delay-100 sm:p-5">
        <h2 className="mb-4 text-base font-bold text-white">Spatiotemporal Risk Analytics (Top 10 Zones)</h2>
        <RiskChart zones={zones} riskScores={riskScores} />
      </div>

      <div className="mt-6 animate-slide-up delay-150">
        <RunRiskButton />
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-2 animate-slide-up delay-200">
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md">
          <div className="border-b border-zinc-900 px-5 py-4">
            <h2 className="text-base font-bold text-white">Top Action Zones</h2>
          </div>
          <div className="divide-y divide-zinc-900">
            {topZones.map((zone) => (
              <div key={zone.id} className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-zinc-900/25 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="min-w-0">
                  <p className="font-bold text-white">{"zoneCode" in zone ? zone.zoneCode : zone.code}</p>
                  <p className="text-sm text-zinc-400">{"zoneName" in zone ? zone.zoneName : zone.name}</p>
                  {"recommendedAction" in zone ? (
                    <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">{zone.recommendedAction}</p>
                  ) : null}
                </div>
                <div className="shrink-0 text-left sm:text-right">
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
            <h2 className="text-base font-bold text-white">Data Source Freshness</h2>
          </div>
          <div className="divide-y divide-zinc-900">
            {sources.map((source) => (
              <div key={source.id} className="px-5 py-4 hover:bg-zinc-900/10 transition-colors">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
        <h2 className="text-base font-bold text-white">Backend Status</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{status.message}</p>
      </div>
    </>
  );
}
