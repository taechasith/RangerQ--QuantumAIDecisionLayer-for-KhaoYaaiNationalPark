import { PageHeader } from "@/components/layout/PageHeader";
import { ReportActions } from "@/components/reports/ReportActions";
import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { buildDailyReport } from "@/lib/reports/daily";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const report = await buildDailyReport(new GoogleSheetsStore());

  return (
    <>
      <PageHeader
        title="Reports"
        description="Daily ranger action plan, data freshness, warnings, and CSV/print export for field operations."
      />

      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-zinc-950">Daily patrol report</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Generated {new Date(report.generatedAt).toLocaleString("en-US", { timeZone: report.timezone })} Bangkok time
          </p>
        </div>
        <ReportActions />
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric title="Top zones" value={String(report.topZones.length)} detail="Selected or fallback patrol priorities" />
        <Metric title="Teams" value={String(report.actionPlan.length)} detail="Generated assignments" />
        <Metric title="Optimizer" value={report.method || "Fallback"} detail={report.optimizationRunId || "No saved run"} />
        <Metric title="qBraid" value={report.qbraidStatus || "Not submitted"} detail="Classical action plan remains usable" />
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="font-semibold text-zinc-950">Ranger action plan</h2>
        </div>
        <div className="grid gap-4 p-5 lg:grid-cols-2">
          {report.actionPlan.map((plan) => (
            <div key={plan.teamName} className="rounded-md border border-zinc-200 p-4">
              <p className="font-semibold text-zinc-950">{plan.teamName}</p>
              <p className="mt-2 text-sm text-zinc-700">Route: {plan.route.join(" -> ")}</p>
              <p className="mt-2 text-sm text-zinc-700">Objective: {plan.objective}</p>
              <p className="mt-2 text-sm text-zinc-600">Why: {plan.why}</p>
              <p className="mt-2 text-sm text-zinc-600">Estimated time: {plan.estimatedHours} hours.</p>
              <p className="mt-2 text-sm text-zinc-600">Safety note: {plan.safetyNote}</p>
              <p className="mt-2 text-sm text-zinc-600">Fallback: {plan.fallback}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="font-semibold text-zinc-950">Top 5 patrol zones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Zone</th>
                <th className="px-5 py-3">Fire</th>
                <th className="px-5 py-3">Wildlife</th>
                <th className="px-5 py-3">Combined</th>
                <th className="px-5 py-3">Why selected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {report.topZones.map((zone) => (
                <tr key={`${zone.rank}-${zone.code}`}>
                  <td className="px-5 py-3 font-medium text-zinc-950">{zone.rank}</td>
                  <td className="px-5 py-3 text-zinc-700">{zone.code} - {zone.name}</td>
                  <td className="px-5 py-3 text-zinc-700">{zone.fireRisk}</td>
                  <td className="px-5 py-3 text-zinc-700">{zone.wildlifeRisk}</td>
                  <td className="px-5 py-3 font-semibold text-zinc-950">{zone.combinedPriority}</td>
                  <td className="min-w-[320px] px-5 py-3 text-zinc-700">{zone.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <WarningList title="Fire-risk warnings" items={report.fireWarnings} empty="No severe fire warnings in selected zones." />
        <WarningList title="Wildlife-boundary warnings" items={report.wildlifeWarnings} empty="No severe wildlife-boundary warnings in selected zones." />
        <WarningList title="Missing or demo data" items={report.missingData} empty="No missing data warnings reported." />
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="font-semibold text-zinc-950">Data freshness</h2>
        </div>
        <div className="divide-y divide-zinc-100">
          {report.dataSources.map((source) => (
            <div key={source.id} className="px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-zinc-950">{source.name}</p>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">{source.status}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-600">{source.freshnessWarning || source.lastSyncedAt || "Ready"}</p>
            </div>
          ))}
        </div>
      </section>

      {report.demoWarning ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{report.demoWarning}</p>
      ) : null}
    </>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <p className="mt-2 break-words text-2xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{detail}</p>
    </div>
  );
}

function WarningList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <h2 className="font-semibold text-zinc-950">{title}</h2>
      <div className="mt-4 space-y-3">
        {(items.length ? items : [empty]).map((item) => (
          <p key={item} className="text-sm leading-6 text-zinc-600">{item}</p>
        ))}
      </div>
    </div>
  );
}
