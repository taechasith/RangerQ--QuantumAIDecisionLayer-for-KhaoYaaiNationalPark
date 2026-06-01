"use client";

export function ReportActions() {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <a
        href="/api/reports/daily?format=csv"
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
      >
        Export CSV
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
      >
        Print report
      </button>
    </div>
  );
}

