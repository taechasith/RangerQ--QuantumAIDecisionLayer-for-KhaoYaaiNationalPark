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
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold text-zinc-950">Open-Meteo weather sync</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Fetches current forecast variables for every seeded zone centroid.
        </p>
        <button
          type="button"
          onClick={() => void runWeather()}
          className="mt-4 rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white"
        >
          Run weather sync
        </button>
        {weatherState.message ? (
          <p className={`mt-3 text-sm ${weatherState.status === "error" ? "text-red-700" : "text-zinc-600"}`}>
            {weatherState.message}
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold text-zinc-950">NASA FIRMS sync</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Uses Khao Yai bounding box. If `FIRMS_MAP_KEY` is missing, stores a demo hotspot with a clear warning.
        </p>
        <button
          type="button"
          onClick={() => void runFirms()}
          className="mt-4 rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white"
        >
          Run FIRMS sync
        </button>
        {firmsState.message ? (
          <p className={`mt-3 text-sm ${firmsState.status === "error" ? "text-red-700" : "text-zinc-600"}`}>
            {firmsState.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
