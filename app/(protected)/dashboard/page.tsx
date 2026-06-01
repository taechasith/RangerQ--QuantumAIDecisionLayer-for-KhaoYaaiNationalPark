import { Card, PageHeader } from "@/components/layout/PageHeader";
import { RunRiskButton } from "@/components/dashboard/RunRiskButton";
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Total zones" value={String(zones.length)} detail={usingFallback ? "Fallback demo snapshot" : "Loaded from Apps Script"} />
        <Card title="Severe fire zones" value={String(severeFire)} detail={hasRiskScores ? "Latest fire risk >= 80" : "Base fire risk >= 80"} />
        <Card title="Severe wildlife zones" value={String(severeWildlife)} detail={hasRiskScores ? "Latest wildlife risk >= 80" : "Base wildlife risk >= 80"} />
        <Card title="Latest risk run" value={riskRun?.completedAt ? new Date(riskRun.completedAt).toLocaleString("en-US", { timeZone: "Asia/Bangkok" }) : "Not run"} detail={riskRun?.version || "Run risk scoring to create explainable scores"} />
      </div>

      <div className="mt-6">
        <RunRiskButton />
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="font-semibold text-zinc-950">Top action zones</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {topZones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-medium text-zinc-950">{"zoneCode" in zone ? zone.zoneCode : zone.code}</p>
                  <p className="text-sm text-zinc-600">{"zoneName" in zone ? zone.zoneName : zone.name}</p>
                  {"recommendedAction" in zone ? (
                    <p className="mt-1 max-w-xl text-sm text-zinc-500">{zone.recommendedAction}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-950">
                    {"combinedPriority" in zone ? zone.combinedPriority : Math.round((zone.baseFireRisk + zone.baseWildlifeRisk) / 2)}
                  </p>
                  {"label" in zone ? <p className="mt-1 text-xs font-semibold uppercase text-emerald-700">{zone.label}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="font-semibold text-zinc-950">Data source freshness</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {sources.map((source) => (
              <div key={source.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-zinc-950">{source.name}</p>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">{source.status}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-600">{source.freshnessWarning || source.lastSyncedAt || "Ready"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold text-zinc-950">Backend</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{status.message}</p>
      </div>
    </>
  );
}
