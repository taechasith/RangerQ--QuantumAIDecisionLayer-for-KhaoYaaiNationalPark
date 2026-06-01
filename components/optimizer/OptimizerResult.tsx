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
    <div className="space-y-6 animate-fade-in">
      {/* Configuration Panel */}
      <section className="rounded-xl border border-zinc-900/90 bg-zinc-900/35 p-4 shadow-lg shadow-black/10 backdrop-blur-md animate-slide-up delay-75 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6 xl:items-end">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Max zones
            <input
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              type="number"
              min="1"
              max="10"
              value={input.maxZones}
              onChange={(event) => updateInput("maxZones", Number(event.target.value))}
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Patrol hours
            <input
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              type="number"
              min="1"
              max="24"
              value={input.maxPatrolHours}
              onChange={(event) => updateInput("maxPatrolHours", Number(event.target.value))}
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Ranger teams
            <input
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              type="number"
              min="1"
              max="8"
              value={input.rangerTeams}
              onChange={(event) => updateInput("rangerTeams", Number(event.target.value))}
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Method
            <select
              className="mt-2.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              value={input.method}
              onChange={(event) => updateInput("method", event.target.value as OptimizeInput["method"])}
            >
              <option value="HYBRID">Hybrid</option>
              <option value="LOCAL_SEARCH">Local search</option>
              <option value="GREEDY">Greedy</option>
              <option value="QBRAID_QUBO">qBraid QUBO</option>
            </select>
          </label>
          <div className="flex flex-col gap-2.5 py-1 text-xs font-semibold text-zinc-400">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-emerald-500 h-4 w-4"
                checked={input.requireFireCoverage}
                onChange={(event) => updateInput("requireFireCoverage", event.target.checked)}
              />
              <span>Fire coverage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-emerald-500 h-4 w-4"
                checked={input.requireWildlifeCoverage}
                onChange={(event) => updateInput("requireWildlifeCoverage", event.target.checked)}
              />
              <span>Wildlife coverage</span>
            </label>
          </div>
          <button
            type="button"
            onClick={run}
            disabled={status === "running"}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-lg shadow-emerald-950/30 transition-all duration-200 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800 disabled:opacity-50 cursor-pointer xl:w-auto"
          >
            {status === "running" ? "Running..." : "Run Optimization"}
          </button>
        </div>
        {message ? (
          <p className={`mt-4 text-xs font-medium ${status === "error" ? "text-red-400" : "text-emerald-400"}`}>{message}</p>
        ) : null}
      </section>

      {result ? (
        <>
          {/* Results Summary Metrics */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-slide-up delay-100">
            <Metric title="Selected zones" value={String(result.selected.length)} detail={`${result.rejected.length} rejected`} />
            <Metric title="Patrol hours" value={String(result.estimatedPatrolHours)} detail={`Limit: ${input.maxPatrolHours} hrs`} />
            <Metric title="Coverage score" value={String(result.coverageScore)} detail={`Penalty: ${result.travelPenalty}`} />
            <Metric title="qBraid status" value={result.qbraidStatus} detail={result.fallbackReason || "Active status"} />
          </section>

          {/* Quantum Backend Control */}
          <section className="rounded-xl border border-zinc-900/90 bg-zinc-900/35 p-4 shadow-lg shadow-black/10 backdrop-blur-md animate-slide-up delay-150 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Quantum Backend Status</h2>
                <p className="mt-1 text-xs text-zinc-400">Submit or log the generated QUBO payload to the qBraid solver.</p>
              </div>
              <button
                type="button"
                onClick={submitQbraid}
                disabled={qbraidStatus === "running"}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 text-xs font-bold text-zinc-300 transition-all hover:bg-zinc-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:text-zinc-600 cursor-pointer sm:w-auto"
              >
                {qbraidStatus === "running" ? "Submitting to qBraid..." : "Submit/Log qBraid"}
              </button>
            </div>
            {qbraidMessage ? (
              <p className={`mt-3.5 text-xs font-medium leading-relaxed ${qbraidStatus === "error" ? "text-red-400" : "text-zinc-400"}`}>{qbraidMessage}</p>
            ) : null}
          </section>

          {/* Selected Zones List */}
          <section className="rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md overflow-hidden animate-slide-up delay-200">
            <div className="border-b border-zinc-900 px-5 py-4">
              <h2 className="text-base font-bold text-white">Selected Patrol Zones</h2>
            </div>
            <div className="divide-y divide-zinc-900">
              {result.selected.map((zone, index) => (
                <div key={zone.zoneId} className="grid gap-3 px-4 py-4 transition-colors hover:bg-zinc-900/25 sm:px-5 md:grid-cols-[100px_minmax(0,1fr)_120px] md:items-center">
                  <p className="text-xs font-bold text-zinc-500">Rank {index + 1}</p>
                  <div>
                    <p className="font-bold text-white text-sm">{zone.code} - {zone.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">{zone.reason}</p>
                  </div>
                  <p className="text-xs font-extrabold text-white text-right md:text-left">{zone.estimatedHours} hrs</p>
                </div>
              ))}
            </div>
          </section>

          {/* Action Plan */}
          <section className="rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md overflow-hidden animate-slide-up delay-300">
            <div className="border-b border-zinc-900 px-5 py-4">
              <h2 className="text-base font-bold text-white">Ranger Action Plan</h2>
            </div>
            <div className="grid gap-4 p-5 lg:grid-cols-2">
              {result.actionPlan.map((plan) => (
                <div key={plan.teamName} className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-white text-sm">{plan.teamName}</p>
                    <span className="rounded-full bg-emerald-950/30 border border-emerald-900/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">{plan.estimatedHours} Hours</span>
                  </div>
                  <p className="text-xs text-zinc-300"><strong className="text-zinc-400">Route:</strong> {plan.route.join(" -> ")}</p>
                  <p className="text-xs text-zinc-300"><strong className="text-zinc-400">Objective:</strong> {plan.objective}</p>
                  <p className="text-xs leading-relaxed text-zinc-400"><strong className="text-zinc-500">Rationale:</strong> {plan.why}</p>
                  <div className="grid gap-2 pt-2 border-t border-zinc-900 text-xs">
                    <p className="text-zinc-400"><strong className="text-zinc-500">Safety Note:</strong> {plan.safetyNote}</p>
                    <p className="text-zinc-400"><strong className="text-zinc-500">Fallback Plan:</strong> {plan.fallback}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* QUBO Payload JSON */}
          <section className="rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-5">
            <h2 className="text-base font-bold text-white">QUBO Payload</h2>
            <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-zinc-900 bg-zinc-950 p-4 text-[11px] leading-5 text-zinc-400 font-mono">
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
    <div className="group rounded-xl border border-zinc-900/90 bg-zinc-900/35 p-4 shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/30 hover:bg-zinc-900/55 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300 transition-colors">{title}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-white break-words">
        {value}
      </p>
      <p className="mt-2 break-words text-xs text-zinc-500 [overflow-wrap:anywhere]">{detail}</p>
    </div>
  );
}
