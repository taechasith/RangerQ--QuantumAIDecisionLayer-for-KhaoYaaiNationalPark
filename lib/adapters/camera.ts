import { importId, isoDate, numberField, optionalNumberField, parseCsvRows, required } from "@/lib/imports/csv";

export type CameraDetectionImport = {
  id: string;
  importBatchId: string;
  zoneId: string;
  cameraId: string;
  timestamp: string;
  lat: number;
  lng: number;
  species: string;
  count: number;
  confidence: number | "";
  imageUrl: string;
  notes: string;
  raw: Record<string, unknown>;
  createdAt: string;
};

export function parseCameraCsv(text: string, importBatchId: string, resolveZoneId: () => string): CameraDetectionImport[] {
  const now = new Date().toISOString();
  return parseCsvRows(text).map((row, index) => ({
    id: importId(`camera-${index + 1}`),
    importBatchId,
    zoneId: resolveZoneId(),
    cameraId: required(row.camera_id || row.cameraId, "camera_id"),
    timestamp: isoDate(row.timestamp, "timestamp"),
    lat: numberField(row.lat, "lat"),
    lng: numberField(row.lng, "lng"),
    species: required(row.species, "species"),
    count: row.count ? numberField(row.count, "count") : 1,
    confidence: optionalNumberField(row.confidence),
    imageUrl: String(row.image_url || row.imageUrl || ""),
    notes: String(row.notes || ""),
    raw: row,
    createdAt: now,
  }));
}
