import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { importId, parseCsvRows } from "@/lib/imports/csv";

const KHAO_YAI_BBOX = "101.20,14.05,101.65,14.65";
const FIRMS_SOURCES = ["VIIRS_SNPP_NRT", "MODIS_NRT"];

type FirmsCsvRow = {
  latitude?: string;
  longitude?: string;
  bright_ti4?: string;
  brightness?: string;
  confidence?: string;
  frp?: string;
  acq_date?: string;
  acq_time?: string;
  satellite?: string;
};

function numberOrBlank(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : "";
}

function timestampFromFirms(row: FirmsCsvRow) {
  const date = row.acq_date || new Date().toISOString().slice(0, 10);
  const rawTime = String(row.acq_time || "0000").padStart(4, "0");
  return new Date(`${date}T${rawTime.slice(0, 2)}:${rawTime.slice(2)}:00Z`).toISOString();
}

function normalizeHotspot(row: FirmsCsvRow, source: string) {
  return {
    id: importId(`firms-${source}`),
    zoneId: "",
    source: "NASA_FIRMS",
    satellite: row.satellite || source,
    timestamp: timestampFromFirms(row),
    lat: numberOrBlank(row.latitude),
    lng: numberOrBlank(row.longitude),
    brightness: numberOrBlank(row.bright_ti4 || row.brightness),
    confidence: String(row.confidence || ""),
    frp: numberOrBlank(row.frp),
    raw: row,
    createdAt: new Date().toISOString(),
  };
}

function demoHotspots() {
  const now = new Date().toISOString();
  return [
    {
      id: importId("firms-demo"),
      zoneId: "",
      source: "NASA_FIRMS_DEMO",
      satellite: "DEMO",
      timestamp: now,
      lat: 14.38,
      lng: 101.27,
      brightness: 331.2,
      confidence: "nominal",
      frp: 8.4,
      raw: { demo: true, reason: "FIRMS_MAP_KEY missing; using demo data only" },
      createdAt: now,
    },
  ];
}

async function fetchFirmsCsv(mapKey: string, source: string) {
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/${source}/${KHAO_YAI_BBOX}/2`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`NASA FIRMS ${source} request failed: ${response.status}`);
  return response.text();
}

export async function syncFirmsHotspots(store: GoogleSheetsStore) {
  const mapKey = process.env.FIRMS_MAP_KEY || "";
  const now = new Date().toISOString();

  if (!mapKey) {
    const rows = demoHotspots();
    for (const row of rows) await store.append("FireHotspot", row);
    await store.upsert("DataSource", {
      id: "source-firms",
      parkId: "khao-yai-national-park",
      type: "NASA_FIRMS",
      name: "NASA FIRMS fire hotspots",
      status: "demo",
      lastSyncedAt: now,
      freshnessWarning: "FIRMS_MAP_KEY missing; using demo data only",
      config: { bbox: KHAO_YAI_BBOX },
      updatedAt: now,
    });
    await store.append("AuditLog", {
      id: importId("audit-firms-demo"),
      userId: "",
      action: "SYNC_FIRMS_DEMO",
      entity: "FireHotspot",
      entityId: "",
      metadata: { records: rows.length, warning: "FIRMS_MAP_KEY missing; using demo data only" },
      createdAt: now,
    });
    return { records: rows.length, demo: true, message: "FIRMS_MAP_KEY missing; using demo data only" };
  }

  let lastError: Error | null = null;
  for (const source of FIRMS_SOURCES) {
    try {
      const csv = await fetchFirmsCsv(mapKey, source);
      const rows = parseCsvRows(csv).map((row) => normalizeHotspot(row, source));
      for (const row of rows) await store.append("FireHotspot", row);
      await store.upsert("DataSource", {
        id: "source-firms",
        parkId: "khao-yai-national-park",
        type: "NASA_FIRMS",
        name: "NASA FIRMS fire hotspots",
        status: "configured",
        lastSyncedAt: now,
        freshnessWarning: "",
        config: { bbox: KHAO_YAI_BBOX, source },
        updatedAt: now,
      });
      await store.append("AuditLog", {
        id: importId("audit-firms"),
        userId: "",
        action: "SYNC_FIRMS",
        entity: "FireHotspot",
        entityId: "",
        metadata: { records: rows.length, source },
        createdAt: now,
      });
      return { records: rows.length, demo: false, source };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("NASA FIRMS request failed");
    }
  }

  throw lastError || new Error("NASA FIRMS sync failed");
}
