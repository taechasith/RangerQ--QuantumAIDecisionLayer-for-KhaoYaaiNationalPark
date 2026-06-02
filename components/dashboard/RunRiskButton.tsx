"use client";

import { useState } from "react";
import { RefreshCw, Satellite, Zap } from "lucide-react";

export function RunRiskButton() {
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function runRisk() {
    setStatus("running");
    setMessage("");

    try {
      const response = await fetch("/api/risk/run", { method: "POST" });
      const payload = await response.json() as { ok?: boolean; error?: string; zonesScored?: number };
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Failed to update danger levels");
      setStatus("success");
      setMessage(`Danger levels successfully updated for ${payload.zonesScored || 0} zones. Updating dashboard...`);
      window.setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to update danger levels");
    }
  }

  return (
    <div className="console-panel rounded-xl p-4 sm:p-5">
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
            <Satellite className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-mono text-base font-bold text-emerald-300">Recalculate Danger Levels</h2>
            <p className="mt-1 text-sm text-slate-400">Analyze satellite hot spots, weather data, and ranger logs to update danger levels across all zones.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={runRisk}
          disabled={status === "running"}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-950/40 transition-all duration-200 hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800 disabled:text-emerald-100 disabled:opacity-60 cursor-pointer sm:w-auto"
        >
          {status === "running" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {status === "running" ? "Analyzing Data" : "Update Danger"}
        </button>
      </div>
      {message ? (
        <p className={`relative mt-3 text-sm font-medium ${status === "error" ? "text-red-400" : "text-emerald-400"}`}>{message}</p>
      ) : null}
    </div>
  );
}
