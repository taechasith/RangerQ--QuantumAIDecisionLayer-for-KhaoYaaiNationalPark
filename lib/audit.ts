import "server-only";

import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";

export type AuditLogRow = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: string;
  createdAt: string;
};

function toText(value: unknown) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function normalizeAudit(row: Record<string, unknown>): AuditLogRow {
  return {
    id: String(row.id || ""),
    action: String(row.action || ""),
    entity: String(row.entity || ""),
    entityId: String(row.entityId || ""),
    metadata: toText(row.metadata),
    createdAt: String(row.createdAt || ""),
  };
}

export async function getLatestAuditLogs(limit = 12) {
  try {
    const rows = await new GoogleSheetsStore().list<Record<string, unknown>>("AuditLog");
    return rows
      .map(normalizeAudit)
      .filter((row) => row.id)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, limit);
  } catch {
    return [];
  }
}

