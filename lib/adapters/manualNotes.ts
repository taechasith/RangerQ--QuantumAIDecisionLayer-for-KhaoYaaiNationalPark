import { importId, isoDate, optionalNumberField, required } from "@/lib/imports/csv";

export type ManualNoteImport = {
  id: string;
  zoneId: string;
  author: string;
  timestamp: string;
  category: string;
  severity: number;
  lat: number | "";
  lng: number | "";
  note: string;
  createdAt: string;
};

export function createManualNote(input: Record<string, unknown>, resolveZoneId: (zoneCode: string) => string): ManualNoteImport {
  const zoneCode = String(input.zoneCode || "");
  return {
    id: importId("note"),
    zoneId: zoneCode ? resolveZoneId(zoneCode) : "",
    author: String(input.author || "RangerQ operator"),
    timestamp: input.timestamp ? isoDate(input.timestamp, "timestamp") : new Date().toISOString(),
    category: required(input.category, "category"),
    severity: Number(input.severity || 1),
    lat: optionalNumberField(input.lat),
    lng: optionalNumberField(input.lng),
    note: required(input.note, "note"),
    createdAt: new Date().toISOString(),
  };
}
