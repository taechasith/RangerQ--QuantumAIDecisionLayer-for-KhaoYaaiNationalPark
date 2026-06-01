"use client";

export function ReportActions() {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <a
        href="/api/reports/daily?format=csv"
        className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white px-5 shadow-lg shadow-emerald-950/20 cursor-pointer transition-colors"
      >
        Export CSV
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white text-xs font-bold text-zinc-300 px-5 cursor-pointer transition-all"
      >
        Print Report
      </button>
    </div>
  );
}

