import { importId, isoDate, numberField, parseCsvRows, required } from "@/lib/imports/csv";

export type VisitorPressureImport = {
  id: string;
  importBatchId: string;
  zoneId: string;
  date: string;
  zoneCode: string;
  visitorCount: number;
  vehicleCount: number;
  busCount: number;
  source: string;
  notes: string;
  raw: Record<string, unknown>;
  createdAt: string;
};

export function parseVisitorsCsv(text: string, importBatchId: string, resolveZoneId: (zoneCode: string) => string): VisitorPressureImport[] {
  const now = new Date().toISOString();
  return parseCsvRows(text).map((row, index) => {
    const zoneCode = required(row.zone_code || row.zoneCode, "zone_code");
    return {
      id: importId(`visitors-${index + 1}`),
      importBatchId,
      zoneId: resolveZoneId(zoneCode),
      date: isoDate(row.date, "date"),
      zoneCode,
      visitorCount: row.visitor_count || row.visitorCount ? numberField(row.visitor_count || row.visitorCount, "visitor_count") : 0,
      vehicleCount: row.vehicle_count || row.vehicleCount ? numberField(row.vehicle_count || row.vehicleCount, "vehicle_count") : 0,
      busCount: row.bus_count || row.busCount ? numberField(row.bus_count || row.busCount, "bus_count") : 0,
      source: required(row.source, "source"),
      notes: String(row.notes || ""),
      raw: row,
      createdAt: now,
    };
  });
}
