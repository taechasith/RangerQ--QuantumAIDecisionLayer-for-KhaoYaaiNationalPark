"use client";

import { useState } from "react";

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
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/15 p-4 shadow-lg shadow-black/10 backdrop-blur-md sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-emerald-400">Recalculate Danger Levels</h2>
          <p className="mt-1 text-sm text-zinc-400">Analyze satellite hot spots, weather data, and ranger logs to update danger levels across all zones.</p>
        </div>
        <button
          type="button"
          onClick={runRisk}
          disabled={status === "running"}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-950/50 transition-all duration-200 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800 disabled:opacity-50 cursor-pointer sm:w-auto"
        >
          {status === "running" ? "Analyzing Data..." : "Update Danger Levels"}
        </button>
      </div>
      {message ? (
        <p className={`mt-3 text-sm font-medium ${status === "error" ? "text-red-400" : "text-emerald-400"}`}>{message}</p>
      ) : null}
    </div>
  );
}
