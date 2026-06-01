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
    <div className="grid gap-4 lg:grid-cols-2">
      {uploadCards.map((card) => {
        const state = states[card.endpoint] || { status: "idle", message: "" };
        return (
          <form
            key={card.endpoint}
            className="rounded-lg border border-zinc-200 bg-white p-5"
            onSubmit={(event) => {
              event.preventDefault();
              const file = new FormData(event.currentTarget).get("file");
              void upload(card.endpoint, file instanceof File ? file : undefined);
            }}
          >
            <h2 className="font-semibold text-zinc-950">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{card.description}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                name="file"
                type="file"
                aria-label={card.fileLabel}
                accept=".csv,text/csv"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
              <button className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white" type="submit">
                Upload
              </button>
            </div>
            <a className="mt-3 inline-block text-sm font-medium text-emerald-700" href={card.sample}>
              Download sample CSV
            </a>
            {state.message ? (
              <p className={`mt-3 text-sm ${state.status === "error" ? "text-red-700" : "text-zinc-600"}`}>{state.message}</p>
            ) : null}
          </form>
        );
      })}

      <form
        className="rounded-lg border border-zinc-200 bg-white p-5"
        action={(formData) => {
          void submitNote(formData);
        }}
      >
        <h2 className="font-semibold text-zinc-950">Manual ranger note</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">Create an operational field note directly in the Google Sheet backend.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="zoneCode" placeholder="Zone code, e.g. KY-BND-02" className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
          <input name="category" placeholder="Category, e.g. fire" className="rounded-md border border-zinc-300 px-3 py-2 text-sm" required />
          <input name="severity" type="number" min="1" max="5" defaultValue="3" className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
          <input name="author" placeholder="Author" className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
          <textarea name="note" placeholder="Note" className="min-h-24 rounded-md border border-zinc-300 px-3 py-2 text-sm sm:col-span-2" required />
        </div>
        <button className="mt-4 rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white" type="submit">
          Save note
        </button>
        {noteState.message ? (
          <p className={`mt-3 text-sm ${noteState.status === "error" ? "text-red-700" : "text-zinc-600"}`}>{noteState.message}</p>
        ) : null}
      </form>
    </div>
  );
}
