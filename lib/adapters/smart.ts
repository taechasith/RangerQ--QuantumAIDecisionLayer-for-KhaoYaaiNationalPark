import { importId, isoDate, numberField, optionalNumberField, parseCsvRows, required } from "@/lib/imports/csv";

export type SmartObservation = {
  id: string;
  importBatchId: string;
  zoneId: string;
  externalId: string;
  timestamp: string;
  lat: number;
  lng: number;
  eventType: string;
  species: string;
  threatType: string;
  patrolTeam: string;
  confidence: number | "";
  notes: string;
  raw: Record<string, unknown>;
  createdAt: string;
};

function normalizeEventType(value: string) {
  const normalized = value.trim().toUpperCase();
  if (["THREAT", "WILDLIFE", "PATROL", "INCIDENT", "RESOURCE"].includes(normalized)) return normalized;
  return "OTHER";
}

export function parseSmartCsv(text: string, importBatchId: string, resolveZoneId: () => string): SmartObservation[] {
  const now = new Date().toISOString();
  return parseCsvRows(text).map((row, index) => ({
    id: importId(`smart-${index + 1}`),
    importBatchId,
    zoneId: resolveZoneId(),
    externalId: String(row.external_id || row.externalId || ""),
    timestamp: isoDate(row.timestamp, "timestamp"),
    lat: numberField(row.lat, "lat"),
    lng: numberField(row.lng, "lng"),
    eventType: normalizeEventType(required(row.event_type || row.eventType, "event_type")),
    species: String(row.species || ""),
    threatType: String(row.threat_type || row.threatType || ""),
    patrolTeam: String(row.patrol_team || row.patrolTeam || ""),
    confidence: optionalNumberField(row.confidence),
    notes: String(row.notes || ""),
    raw: row,
    createdAt: now,
  }));
}
