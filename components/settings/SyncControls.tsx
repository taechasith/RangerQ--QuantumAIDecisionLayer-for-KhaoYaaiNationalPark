"use client";

import { useState } from "react";

type SyncState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

function useSyncAction(endpoint: string) {
  const [state, setState] = useState<SyncState>({ status: "idle", message: "" });

  async function run() {
    setState({ status: "loading", message: "Syncing..." });
    const response = await fetch(endpoint, { method: "POST" });
    const payload = await response.json() as { ok: boolean; records?: number; message?: string; error?: string };
    setState(payload.ok
      ? { status: "success", message: payload.message || `Synced ${payload.records || 0} records.` }
      : { status: "error", message: payload.error || "Sync failed." });
  }

  return [state, run] as const;
}

export function SyncControls() {
  const [weatherState, runWeather] = useSyncAction("/api/sync/weather");
  const [firmsState, runFirms] = useSyncAction("/api/sync/firms");

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2 animate-slide-up delay-200">
      <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Open-Meteo Weather Sync</h2>
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
            Fetches hyper-local meteorological and soil metrics for all Khao Yai zone centroids.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => void runWeather()}
            className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-white px-5 border border-zinc-800 cursor-pointer transition-colors"
          >
            Run Weather Sync
          </button>
          {weatherState.message ? (
            <p className={`mt-3 text-xs font-semibold ${weatherState.status === "error" ? "text-red-400" : "text-emerald-400"}`}>
              {weatherState.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-base font-bold text-white">NASA FIRMS Sync</h2>
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
            Retrieves near-real-time active thermal hotspots using Khao Yai's geographic bounding box.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => void runFirms()}
            className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-white px-5 border border-zinc-800 cursor-pointer transition-colors"
          >
            Run FIRMS Sync
          </button>
          {firmsState.message ? (
            <p className={`mt-3 text-xs font-semibold ${firmsState.status === "error" ? "text-red-400" : "text-emerald-400"}`}>
              {firmsState.message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
