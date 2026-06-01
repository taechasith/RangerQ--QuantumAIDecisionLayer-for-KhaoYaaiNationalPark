"use client";

export function ReportActions() {
  return (
    <div className="grid grid-cols-2 gap-2 print:hidden sm:flex sm:flex-wrap">
      <a
        href="/api/reports/daily?format=csv"
        className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-lg shadow-emerald-950/20 transition-colors hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 cursor-pointer"
      >
        Export CSV
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 text-xs font-bold text-zinc-300 transition-all hover:bg-zinc-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 cursor-pointer"
      >
        Print Report
      </button>
    </div>
  );
}
