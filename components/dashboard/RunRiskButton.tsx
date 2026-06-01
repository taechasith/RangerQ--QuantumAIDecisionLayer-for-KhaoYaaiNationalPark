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
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Risk run failed");
      setStatus("success");
      setMessage(`Risk scoring complete for ${payload.zonesScored || 0} zones. Refreshing dashboard...`);
      window.setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Risk run failed");
    }
  }

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 backdrop-blur-md p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-emerald-400">Risk Engine</h2>
          <p className="mt-1 text-sm text-zinc-400">Compute explainable fire, wildlife risk levels and combined priority scoring across Khao Yai.</p>
        </div>
        <button
          type="button"
          onClick={runRisk}
          disabled={status === "running"}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-950/50 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-800 disabled:opacity-50 transition-all duration-200 cursor-pointer"
        >
          {status === "running" ? "Running Scoring..." : "Run Risk Scoring"}
        </button>
      </div>
      {message ? (
        <p className={`mt-3 text-sm font-medium ${status === "error" ? "text-red-400" : "text-emerald-400"}`}>{message}</p>
      ) : null}
    </div>
  );
}
