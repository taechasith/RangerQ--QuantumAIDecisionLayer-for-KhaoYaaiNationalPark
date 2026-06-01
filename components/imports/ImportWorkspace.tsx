"use client";

import { useState } from "react";

type UploadState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

const uploadCards = [
  {
    title: "SMART export",
    description: "CSV patrol observations from SMART-style exports.",
    endpoint: "/api/imports/smart",
    sample: "/demo/smart_patrol_sample.csv",
    fileLabel: "SMART export CSV",
  },
  {
    title: "Camera detections",
    description: "Camera/AI species detections with location and confidence.",
    endpoint: "/api/imports/camera",
    sample: "/demo/camera_detections_sample.csv",
    fileLabel: "Camera detections CSV",
  },
  {
    title: "Visitor pressure",
    description: "Daily visitor and vehicle counts by zone.",
    endpoint: "/api/imports/visitors",
    sample: "/demo/visitors_sample.csv",
    fileLabel: "Visitor pressure CSV",
  },
];

export function ImportWorkspace() {
  const [states, setStates] = useState<Record<string, UploadState>>({});
  const [noteState, setNoteState] = useState<UploadState>({ status: "idle", message: "" });

  async function upload(endpoint: string, file: File | undefined) {
    if (!file) {
      setStates((current) => ({ ...current, [endpoint]: { status: "error", message: "Choose a CSV file first." } }));
      return;
    }

    setStates((current) => ({ ...current, [endpoint]: { status: "loading", message: "Uploading..." } }));
    const formData = new FormData();
    formData.set("file", file);

    const response = await fetch(endpoint, { method: "POST", body: formData });
    const payload = await response.json() as { ok: boolean; recordCount?: number; error?: string };
    setStates((current) => ({
      ...current,
      [endpoint]: payload.ok
        ? { status: "success", message: `Imported ${payload.recordCount || 0} records.` }
        : { status: "error", message: payload.error || "Import failed." },
    }));
  }

  async function submitNote(formData: FormData) {
    setNoteState({ status: "loading", message: "Saving note..." });
    const response = await fetch("/api/imports/manual-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const payload = await response.json() as { ok: boolean; manualNoteId?: string; error?: string };
    setNoteState(payload.ok
      ? { status: "success", message: `Saved note ${payload.manualNoteId}.` }
      : { status: "error", message: payload.error || "Note failed." });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 animate-fade-in">
      {uploadCards.map((card, index) => {
        const state = states[card.endpoint] || { status: "idle", message: "" };
        const delayClass = index === 0 ? "delay-75" : index === 1 ? "delay-100" : "delay-150";
        return (
          <form
            key={card.endpoint}
            className={`rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-5 flex flex-col justify-between animate-slide-up ${delayClass}`}
            onSubmit={(event) => {
              event.preventDefault();
              const file = new FormData(event.currentTarget).get("file");
              void upload(card.endpoint, file instanceof File ? file : undefined);
            }}
          >
            <div>
              <h2 className="text-base font-bold text-white">{card.title}</h2>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{card.description}</p>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  name="file"
                  type="file"
                  aria-label={card.fileLabel}
                  accept=".csv,text/csv"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300 focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-zinc-900 file:text-zinc-200 file:cursor-pointer hover:file:bg-zinc-800"
                />
                <button 
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-white px-5 border border-zinc-800 cursor-pointer transition-colors" 
                  type="submit"
                >
                  Upload
                </button>
              </div>
              <div className="flex items-center justify-between pt-1">
                <a className="text-xs font-bold text-emerald-400 hover:text-emerald-350 transition-colors" href={card.sample}>
                  Download sample CSV
                </a>
                {state.message ? (
                  <p className={`text-xs font-semibold ${state.status === "error" ? "text-red-400" : "text-emerald-400"}`}>{state.message}</p>
                ) : null}
              </div>
            </div>
          </form>
        );
      })}

      <form
        className="rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-5 animate-slide-up delay-200"
        action={(formData) => {
          void submitNote(formData);
        }}
      >
        <h2 className="text-base font-bold text-white">Manual Ranger Note</h2>
        <p className="mt-1 text-xs text-zinc-400 leading-relaxed">Log field anomalies or threat sightings directly to Khao Yai operations backend.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="zoneCode" placeholder="Zone Code (e.g. KY-BND-02)" className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-zinc-700" />
          <input name="category" placeholder="Category (e.g. fire, threat)" className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-zinc-700" required />
          <input name="severity" type="number" min="1" max="5" defaultValue="3" className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-zinc-700" />
          <input name="author" placeholder="Ranger Name" className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-zinc-700" />
          <textarea name="note" placeholder="Write operational note..." className="min-h-24 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-zinc-700 sm:col-span-2" required />
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <button className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white px-6 shadow-lg shadow-emerald-950/20 cursor-pointer transition-colors" type="submit">
            Save Note
          </button>
          {noteState.message ? (
            <p className={`text-xs font-semibold ${noteState.status === "error" ? "text-red-400" : "text-emerald-400"}`}>{noteState.message}</p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
