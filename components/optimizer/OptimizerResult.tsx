"use client";

import { useState } from "react";

import type { OptimizeInput, OptimizeResult } from "@/lib/optimizer/types";

type ApiResult = OptimizeResult & { ok?: boolean; error?: string };
type QbraidApiResult = {
  ok?: boolean;
  error?: string;
  status?: string;
  jobId?: string;
  message?: string;
  workerCommand?: string;
};

const defaultInput: OptimizeInput = {
  maxZones: 5,
  maxPatrolHours: 6,
  rangerTeams: 2,
  requireFireCoverage: true,
  requireWildlifeCoverage: true,
  method: "HYBRID",
};

export function OptimizerResult() {
  const [input, setInput] = useState<OptimizeInput>(defaultInput);
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [qbraidStatus, setQbraidStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [qbraidMessage, setQbraidMessage] = useState("");
  const [result, setResult] = useState<OptimizeResult | null>(null);

  function updateInput<K extends keyof OptimizeInput>(key: K, value: OptimizeInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  async function run() {
    setStatus("running");
    setMessage("");

    try {
      const response = await fetch("/api/optimize/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await response.json() as ApiResult;
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Optimization failed");
      setResult(payload);
      setQbraidStatus("idle");
      setQbraidMessage("");
      setStatus("success");
      setMessage(`Optimization selected ${payload.selected.length} zones.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Optimization failed");
    }
  }

  async function submitQbraid() {
    if (!result) return;
    setQbraidStatus("running");
    setQbraidMessage("");

    try {
      const response = await fetch("/api/optimize/qbraid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optimizationRunId: result.optimizationRunId }),
      });
      const payload = await response.json() as QbraidApiResult;
      if (!response.ok || !payload.ok) throw new Error(payload.error || "qBraid submission failed");
      setResult((current) => current ? {
        ...current,
        qbraidStatus: payload.status || current.qbraidStatus,
        qbraidJobId: payload.jobId || current.qbraidJobId,
        fallbackReason: payload.message || current.fallbackReason,
      } : current);
      setQbraidStatus("success");
      setQbraidMessage(`${payload.message || "qBraid status updated."}${payload.workerCommand ? ` Command: ${payload.workerCommand}` : ""}`);
    } catch (error) {
      setQbraidStatus("error");
      setQbraidMessage(error instanceof Error ? error.message : "qBraid submission failed");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-6 lg:items-end">
          <label className="text-sm font-medium text-zinc-700">
            Max zones
            <input
              className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2"
              type="number"
              min="1"
              max="10"
              value={input.maxZones}
              onChange={(event) => updateInput("maxZones", Number(event.target.value))}
            />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Patrol hours
            <input
              className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2"
              type="number"
              min="1"
              max="24"
              value={input.maxPatrolHours}
              onChange={(event) => updateInput("maxPatrolHours", Number(event.target.value))}
            />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Ranger teams
            <input
              className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2"
              type="number"
              min="1"
              max="8"
              value={input.rangerTeams}
              onChange={(event) => updateInput("rangerTeams", Number(event.target.value))}
            />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Method
            <select
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2"
              value={input.method}
              onChange={(event) => updateInput("method", event.target.value as OptimizeInput["method"])}
            >
              <option value="HYBRID">Hybrid</option>
              <option value="LOCAL_SEARCH">Local search</option>
              <option value="GREEDY">Greedy</option>
              <option value="QBRAID_QUBO">qBraid QUBO</option>
            </select>
          </label>
          <div className="space-y-2 text-sm text-zinc-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={input.requireFireCoverage}
                onChange={(event) => updateInput("requireFireCoverage", event.target.checked)}
              />
              Fire coverage
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={input.requireWildlifeCoverage}
                onChange={(event) => updateInput("requireWildlifeCoverage", event.target.checked)}
              />
              Wildlife coverage
            </label>
          </div>
          <button
            type="button"
            onClick={run}
            disabled={status === "running"}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {status === "running" ? "Running..." : "Run optimization"}
          </button>
        </div>
        {message ? (
          <p className={`mt-4 text-sm ${status === "error" ? "text-red-700" : "text-emerald-700"}`}>{message}</p>
        ) : null}
      </section>

      {result ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <Metric title="Selected zones" value={String(result.selected.length)} detail={`${result.rejected.length} rejected`} />
            <Metric title="Patrol hours" value={String(result.estimatedPatrolHours)} detail={`Limit ${input.maxPatrolHours}`} />
            <Metric title="Coverage score" value={String(result.coverageScore)} detail={`Penalty ${result.travelPenalty}`} />
            <Metric title="qBraid status" value={result.qbraidStatus} detail={result.fallbackReason} />
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-zinc-950">Quantum backend status</h2>
                <p className="mt-1 text-sm text-zinc-600">Submit or log the QUBO path without blocking the classical action plan.</p>
              </div>
              <button
                type="button"
                onClick={submitQbraid}
                disabled={qbraidStatus === "running"}
                className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
              >
                {qbraidStatus === "running" ? "Checking qBraid..." : "Submit/log qBraid"}
              </button>
            </div>
            {qbraidMessage ? (
              <p className={`mt-3 text-sm leading-6 ${qbraidStatus === "error" ? "text-red-700" : "text-zinc-700"}`}>{qbraidMessage}</p>
            ) : null}
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-5 py-4">
              <h2 className="font-semibold text-zinc-950">Selected patrol zones</h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {result.selected.map((zone, index) => (
                <div key={zone.zoneId} className="grid gap-3 px-5 py-4 md:grid-cols-[80px_minmax(0,1fr)_120px] md:items-center">
                  <p className="text-sm font-semibold text-zinc-500">Rank {index + 1}</p>
                  <div>
                    <p className="font-medium text-zinc-950">{zone.code} - {zone.name}</p>
                    <p className="mt-1 text-sm text-zinc-600">{zone.reason}</p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-950">{zone.estimatedHours} hrs</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-5 py-4">
              <h2 className="font-semibold text-zinc-950">Ranger action plan</h2>
            </div>
            <div className="grid gap-4 p-5 lg:grid-cols-2">
              {result.actionPlan.map((plan) => (
                <div key={plan.teamName} className="rounded-md border border-zinc-200 p-4">
                  <p className="font-semibold text-zinc-950">{plan.teamName}</p>
                  <p className="mt-2 text-sm text-zinc-700">Route: {plan.route.join(" -> ")}</p>
                  <p className="mt-2 text-sm text-zinc-700">Objective: {plan.objective}</p>
                  <p className="mt-2 text-sm text-zinc-600">Why: {plan.why}</p>
                  <p className="mt-2 text-sm text-zinc-600">Estimated time: {plan.estimatedHours} hours.</p>
                  <p className="mt-2 text-sm text-zinc-600">Safety note: {plan.safetyNote}</p>
                  <p className="mt-2 text-sm text-zinc-600">Fallback: {plan.fallback}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold text-zinc-950">QUBO payload</h2>
            <pre className="mt-4 max-h-96 overflow-auto rounded-md bg-zinc-950 p-4 text-xs leading-5 text-zinc-50">
              {JSON.stringify(result.quboPayload, null, 2)}
            </pre>
          </section>
        </>
      ) : null}
    </div>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <p className="mt-2 break-words text-2xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{detail}</p>
    </div>
  );
}
