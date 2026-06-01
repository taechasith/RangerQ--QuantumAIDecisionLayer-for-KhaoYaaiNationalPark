import { PageHeader } from "@/components/layout/PageHeader";
import { ReportActions } from "@/components/reports/ReportActions";
import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { buildDailyReport } from "@/lib/reports/daily";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const report = await buildDailyReport(new GoogleSheetsStore());

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Reports"
        description="Daily ranger action plan, data freshness, warnings, and CSV/print export for field operations."
      />

      <div className="flex flex-col gap-4 rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-5 sm:flex-row sm:items-center sm:justify-between animate-slide-up delay-75">
        <div>
          <h2 className="text-base font-bold text-white">Daily Patrol Report</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Generated: {new Date(report.generatedAt).toLocaleString("en-US", { timeZone: report.timezone })} (Bangkok Time)
          </p>
        </div>
        <ReportActions />
      </div>

      <section className="grid gap-4 md:grid-cols-4 animate-slide-up delay-100">
        <Metric title="Top zones" value={String(report.topZones.length)} detail="Selected or fallback patrol priorities" />
        <Metric title="Teams" value={String(report.actionPlan.length)} detail="Generated assignments" />
        <Metric title="Optimizer" value={report.method || "Fallback"} detail={report.optimizationRunId ? report.optimizationRunId.slice(0, 16) + "..." : "No saved run"} />
        <Metric title="qBraid" value={report.qbraidStatus || "Not submitted"} detail="Classical action plan is operational" />
      </section>

      <section className="rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md overflow-hidden animate-slide-up delay-150">
        <div className="border-b border-zinc-900 px-5 py-4">
          <h2 className="text-base font-bold text-white">Ranger Action Plan</h2>
        </div>
        <div className="grid gap-4 p-5 lg:grid-cols-2">
          {report.actionPlan.map((plan) => (
            <div key={plan.teamName} className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-white text-sm">{plan.teamName}</p>
                <span className="rounded-full bg-emerald-950/30 border border-emerald-900/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">{plan.estimatedHours} Hours</span>
              </div>
              <p className="text-xs text-zinc-300"><strong className="text-zinc-400">Route:</strong> {plan.route.join(" ➔ ")}</p>
              <p className="text-xs text-zinc-300"><strong className="text-zinc-400">Objective:</strong> {plan.objective}</p>
              <p className="text-xs leading-relaxed text-zinc-400"><strong className="text-zinc-500">Rationale:</strong> {plan.why}</p>
              <div className="grid gap-2 pt-2 border-t border-zinc-900 text-xs">
                <p className="text-zinc-400"><strong className="text-zinc-500">Safety Note:</strong> {plan.safetyNote}</p>
                <p className="text-zinc-400"><strong className="text-zinc-500">Fallback Plan:</strong> {plan.fallback}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md overflow-hidden animate-slide-up delay-200">
        <div className="border-b border-zinc-900 px-5 py-4">
          <h2 className="text-base font-bold text-white">Top 5 Patrol Zones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-900 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Rank</th>
                <th className="px-5 py-3.5">Zone</th>
                <th className="px-5 py-3.5">Fire</th>
                <th className="px-5 py-3.5">Wildlife</th>
                <th className="px-5 py-3.5">Combined</th>
                <th className="px-5 py-3.5 text-left">Why Selected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {report.topZones.map((zone) => (
                <tr key={`${zone.rank}-${zone.code}`} className="hover:bg-zinc-900/10 transition-colors">
                  <td className="px-5 py-4 font-bold text-white">{zone.rank}</td>
                  <td className="px-5 py-4 text-zinc-300 font-semibold">{zone.code} — {zone.name}</td>
                  <td className="px-5 py-4 text-zinc-300">{zone.fireRisk}</td>
                  <td className="px-5 py-4 text-zinc-300">{zone.wildlifeRisk}</td>
                  <td className="px-5 py-4 font-bold text-emerald-400">{zone.combinedPriority}</td>
                  <td className="min-w-[320px] px-5 py-4 text-zinc-400 leading-relaxed">{zone.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3 animate-slide-up delay-300">
        <WarningList title="Fire-risk Warnings" items={report.fireWarnings} empty="No severe fire warnings in selected zones." />
        <WarningList title="Wildlife-boundary Warnings" items={report.wildlifeWarnings} empty="No severe wildlife-boundary warnings in selected zones." />
        <WarningList title="Missing or Demo Data" items={report.missingData} empty="No missing data warnings reported." />
      </section>

      <section className="rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md overflow-hidden animate-slide-up delay-300">
        <div className="border-b border-zinc-900 px-5 py-4">
          <h2 className="text-base font-bold text-white">Data Freshness</h2>
        </div>
        <div className="divide-y divide-zinc-900">
          {report.dataSources.map((source) => (
            <div key={source.id} className="px-5 py-4 hover:bg-zinc-900/10 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{source.name}</p>
                <span className="rounded-full bg-zinc-900/80 border border-zinc-800 px-2.5 py-0.5 text-xs font-bold text-zinc-400">{source.status}</span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-500">{source.freshnessWarning || source.lastSyncedAt || "Ready"}</p>
            </div>
          ))}
        </div>
      </section>

      {report.demoWarning ? (
        <p className="rounded-xl border border-amber-500/20 bg-amber-950/10 px-5 py-4 text-xs font-medium text-amber-400 leading-relaxed">{report.demoWarning}</p>
      ) : null}
    </div>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="group rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-5 hover:border-emerald-500/30 hover:bg-zinc-900/40 transition-all duration-300">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300 transition-colors">{title}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-white break-words">
        {value}
      </p>
      <p className="mt-2 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}

function WarningList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  const isWarning = items.length > 0 && items[0] !== empty;
  return (
    <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-base font-bold text-white">{title}</h2>
        <div className="mt-4 space-y-3">
          {(items.length ? items : [empty]).map((item) => (
            <p key={item} className={`text-xs leading-relaxed ${isWarning ? "text-amber-400 font-medium" : "text-zinc-400"}`}>
              {isWarning ? "⚠️ " : ""}{item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
