import { Card, PageHeader } from "@/components/layout/PageHeader";
import { RunRiskButton } from "@/components/dashboard/RunRiskButton";
import { RiskChart } from "@/components/dashboard/RiskChart";
import { getOperationsSnapshot } from "@/lib/rangerqData";
import { AlertTriangle, ArrowUpRight, CheckCircle, Compass } from "lucide-react";

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
  const highestZone = topZones[0];
  const visibleSources = sources.slice(0, 4);

  return (
    <>
      <PageHeader
        title="Ranger Command Center"
        description="Khao Yai National Park real-time tracking dashboard. View safety alerts, weather updates, and manage daily ranger deployments."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-slide-up delay-75">
        <Card title="Total Zones" value={String(zones.length)} detail={usingFallback ? "Preview locations active" : "Connected to live database"} tone="emerald" />
        <Card title="Fire Threat" value={String(severeFire)} detail={hasRiskScores ? "Current fire danger >= 80" : "Baseline fire danger >= 80"} tone="amber" />
        <Card title="Wildlife Conflict" value={String(severeWildlife)} detail={hasRiskScores ? "Current wildlife risk >= 80" : "Baseline wildlife risk >= 80"} tone="rose" />
        <Card title="Last Sync" value={riskRun?.completedAt ? new Date(riskRun.completedAt).toLocaleTimeString("en-US", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit" }) : "Pending"} detail={riskRun?.version || "Recalculate danger levels to update planners"} tone="cyan" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] animate-slide-up delay-100">
        <div className="console-panel rounded-xl p-5">
          <div className="relative mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-mono text-base font-bold text-white">Fire & Wildlife Danger Comparison</h2>
              <p className="mt-1 text-xs text-slate-500">Top 10 zones sorted by current combined priority index.</p>
            </div>
            <span className="telemetry-label rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
              {hasRiskScores ? "Live risk run" : "Baseline mode"}
            </span>
          </div>
          <RiskChart zones={zones} riskScores={riskScores} />
        </div>

        <aside className="console-panel rounded-xl p-5">
          <div className="relative flex items-center justify-between gap-3">
            <h2 className="telemetry-label flex items-center gap-2 text-[11px] font-black text-slate-400">
              <AlertTriangle className="h-4 w-4 text-amber-400 animate-pulse" />
              Field Security Alerts
            </h2>
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
              {topZones.length} active
            </span>
          </div>

          <div className="relative mt-4 space-y-3">
            {topZones.slice(0, 4).map((zone) => {
              const code = "zoneCode" in zone ? zone.zoneCode : zone.code;
              const name = "zoneName" in zone ? zone.zoneName : zone.name;
              const priority = "combinedPriority" in zone ? zone.combinedPriority : Math.round((zone.baseFireRisk + zone.baseWildlifeRisk) / 2);
              const action = "recommendedAction" in zone ? zone.recommendedAction : "Prioritize sector reconnaissance and update field notes.";
              const tone = priority >= 85 ? "text-rose-300 border-rose-500/20 bg-rose-500/10" : priority >= 65 ? "text-amber-300 border-amber-500/20 bg-amber-500/10" : "text-emerald-300 border-emerald-500/20 bg-emerald-500/10";

              return (
                <div key={code} className="rounded-xl border border-white/[0.04] bg-[#0c1218]/70 p-3 transition-colors hover:border-emerald-500/20">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-xs font-black text-white">{code}</p>
                    <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold ${tone}`}>{priority}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-400">{name}</p>
                  <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{action}</p>
                </div>
              );
            })}
          </div>

          <div className="relative mt-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06] p-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <div>
                <p className="font-mono text-xs font-bold text-emerald-300">System Integrity Verified</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  {status.message}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6 animate-slide-up delay-150">
        <RunRiskButton />
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-2 animate-slide-up delay-200">
        <div className="console-panel rounded-xl">
          <div className="relative border-b border-white/[0.04] px-5 py-4">
            <h2 className="font-mono text-base font-bold text-white">Highest Priority Zones</h2>
          </div>
          <div className="relative divide-y divide-white/[0.04]">
            {topZones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/[0.025] transition-colors">
                <div>
                  <p className="font-mono text-sm font-bold text-white">{"zoneCode" in zone ? zone.zoneCode : zone.code}</p>
                  <p className="text-sm text-slate-400">{"zoneName" in zone ? zone.zoneName : zone.name}</p>
                  {"recommendedAction" in zone ? (
                    <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">{zone.recommendedAction}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-extrabold text-white">
                    {"combinedPriority" in zone ? zone.combinedPriority : Math.round((zone.baseFireRisk + zone.baseWildlifeRisk) / 2)}
                  </p>
                  {"label" in zone ? <p className="telemetry-label mt-1 text-[10px] font-extrabold text-emerald-400">{zone.label}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="console-panel rounded-xl">
          <div className="relative border-b border-white/[0.04] px-5 py-4">
            <h2 className="font-mono text-base font-bold text-white">Live Data Sources</h2>
          </div>
          <div className="relative divide-y divide-white/[0.04]">
            {visibleSources.map((source) => (
              <div key={source.id} className="px-5 py-4 hover:bg-white/[0.025] transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{source.name}</p>
                  <span className="rounded-full bg-slate-950/80 border border-white/[0.06] px-2.5 py-0.5 text-xs font-bold text-slate-400">{source.status}</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">{source.freshnessWarning || source.lastSyncedAt || "Ready"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="console-panel mt-6 rounded-xl p-4 animate-slide-up delay-300">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
              <Compass className="h-5 w-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-white">Quantum Solver Model Integration</h2>
              <p className="mt-1 text-xs text-slate-400">
                {highestZone ? `Next planning focus: ${"zoneCode" in highestZone ? highestZone.zoneCode : highestZone.code}.` : "Run a danger update to stage patrol planning."}
              </p>
            </div>
          </div>
          <a
            href="/optimizer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-xs font-black uppercase tracking-wider text-slate-950 transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            Configure Solver
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </>
  );
}
