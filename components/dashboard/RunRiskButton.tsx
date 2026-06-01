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
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-emerald-950">Risk engine</h2>
          <p className="mt-1 text-sm text-emerald-800">Run explainable fire, wildlife, and combined priority scoring.</p>
        </div>
        <button
          type="button"
          onClick={runRisk}
          disabled={status === "running"}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-emerald-400"
        >
          {status === "running" ? "Running..." : "Run risk scoring"}
        </button>
      </div>
      {message ? (
        <p className={`mt-3 text-sm ${status === "error" ? "text-red-700" : "text-emerald-800"}`}>{message}</p>
      ) : null}
    </div>
  );
}
