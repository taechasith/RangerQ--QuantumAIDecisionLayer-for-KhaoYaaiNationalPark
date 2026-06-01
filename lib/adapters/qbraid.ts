import { mkdir, writeFile } from "fs/promises";
import { dirname } from "path";

import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { importId } from "@/lib/imports/csv";
import type { QuboPayload } from "@/lib/optimizer/types";

export type QbraidSubmission = {
  status: "QBRAID_SUBMITTED" | "QBRAID_PENDING_EXTERNAL_WORKER" | "QBRAID_FAILED";
  jobId: string;
  message: string;
  workerCommand: string;
  payloadPath: string;
  resultPath: string;
  error?: string;
};

type OptimizationRunRow = {
  id?: string;
  quboPayload?: QuboPayload | string;
};

const payloadPath = ".rangerq/latest_qubo.json";
const resultPath = ".rangerq/latest_qbraid_result.json";

function workerCommand(inputPath = payloadPath, outputPath = resultPath) {
  return `python scripts/qbraid/qbraid_submit.py --input ${inputPath} --output ${outputPath}`;
}

function parseQuboPayload(value: unknown): QuboPayload {
  if (!value) throw new Error("Optimization run does not contain a QUBO payload");
  if (typeof value === "string") return JSON.parse(value) as QuboPayload;
  return value as QuboPayload;
}

async function writeLocalPayload(payload: QuboPayload) {
  await mkdir(dirname(payloadPath), { recursive: true });
  await writeFile(payloadPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
}

async function submitRest(payload: QuboPayload) {
  const endpoint = process.env.QBRAID_API_URL || "";
  const apiKey = process.env.QBRAID_API_KEY || "";
  const deviceId = process.env.QBRAID_DEVICE_ID || "qbraid_qir_simulator";

  if (!apiKey || !endpoint) {
    return null;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      device_id: deviceId,
      problem_type: payload.problem_type,
      qubo: payload,
      metadata: payload.metadata,
    }),
    cache: "no-store",
  });

  const body = await response.json().catch(() => ({})) as { id?: string; job_id?: string; message?: string; error?: string };
  if (!response.ok) {
    throw new Error(body.error || body.message || `qBraid REST submission failed: ${response.status}`);
  }

  return body.job_id || body.id || "";
}

export async function submitQbraidForOptimization(store: GoogleSheetsStore, optimizationRunId: string): Promise<QbraidSubmission> {
  const run = await store.get<OptimizationRunRow>("OptimizationRun", optimizationRunId);
  if (!run?.id) throw new Error(`OptimizationRun not found: ${optimizationRunId}`);

  const quboPayload = parseQuboPayload(run.quboPayload);
  const command = workerCommand();
  const now = new Date().toISOString();
  await writeLocalPayload(quboPayload);

  try {
    const jobId = await submitRest(quboPayload);
    if (jobId) {
      await store.upsert("OptimizationRun", {
        ...run,
        id: optimizationRunId,
        qbraidJobId: jobId,
        qbraidStatus: "QBRAID_SUBMITTED",
        fallbackReason: "qBraid REST submission accepted; classical result remains available.",
        completedAt: now,
      });

      await store.append("AuditLog", {
        id: importId("audit-qbraid-submit"),
        userId: "",
        action: "SUBMIT_QBRAID",
        entity: "OptimizationRun",
        entityId: optimizationRunId,
        metadata: { jobId },
        createdAt: now,
      });

      return {
        status: "QBRAID_SUBMITTED",
        jobId,
        message: "qBraid job submitted through configured REST endpoint.",
        workerCommand: command,
        payloadPath,
        resultPath,
      };
    }

    await store.upsert("OptimizationRun", {
      ...run,
      id: optimizationRunId,
      qbraidJobId: "",
      qbraidStatus: "QBRAID_PENDING_EXTERNAL_WORKER",
      fallbackReason: "QBRAID_API_KEY or QBRAID_API_URL missing; run the local worker command.",
      completedAt: now,
    });

    return {
      status: "QBRAID_PENDING_EXTERNAL_WORKER",
      jobId: "",
      message: "qBraid REST endpoint is not fully configured. Export the QUBO payload and run the local worker.",
      workerCommand: command,
      payloadPath,
      resultPath,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown qBraid submission error";
    await store.upsert("OptimizationRun", {
      ...run,
      id: optimizationRunId,
      qbraidJobId: "",
      qbraidStatus: "QBRAID_FAILED",
      fallbackReason: message,
      completedAt: now,
    });

    return {
      status: "QBRAID_FAILED",
      jobId: "",
      message: "qBraid submission failed; classical optimizer result remains usable.",
      workerCommand: command,
      payloadPath,
      resultPath,
      error: message,
    };
  }
}
