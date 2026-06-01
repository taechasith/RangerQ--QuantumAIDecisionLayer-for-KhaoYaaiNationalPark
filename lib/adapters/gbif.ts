import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { distanceKm } from "@/lib/geo/distance";
import { importId } from "@/lib/imports/csv";

const KHAO_YAI_BBOX = {
  minLng: 101.2,
  minLat: 14.05,
  maxLng: 101.65,
  maxLat: 14.65,
};

type ZoneForLookup = {
  id?: string;
  code?: string;
  centroidLat?: string | number;
  centroidLng?: string | number;
};

type GbifOccurrence = {
  key?: number;
  gbifID?: string;
  eventDate?: string;
  year?: number;
  month?: number;
  day?: number;
  decimalLatitude?: number;
  decimalLongitude?: number;
  scientificName?: string;
  species?: string;
  genericName?: string;
  vernacularName?: string;
  basisOfRecord?: string;
  occurrenceStatus?: string;
  institutionCode?: string;
  datasetName?: string;
  license?: string;
  references?: string;
  coordinateUncertaintyInMeters?: number;
};

type GbifSearchResponse = {
  count?: number;
  endOfRecords?: boolean;
  results?: GbifOccurrence[];
};

function numeric(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function observationTimestamp(occurrence: GbifOccurrence) {
  if (occurrence.eventDate) {
    const parsed = new Date(occurrence.eventDate);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  if (occurrence.year) {
    const month = String(occurrence.month || 1).padStart(2, "0");
    const day = String(occurrence.day || 1).padStart(2, "0");
    return new Date(`${occurrence.year}-${month}-${day}T00:00:00Z`).toISOString();
  }

  return new Date().toISOString();
}

function speciesName(occurrence: GbifOccurrence) {
  return occurrence.species
    || occurrence.scientificName
    || occurrence.genericName
    || occurrence.vernacularName
    || "Unknown species";
}

function nearestZoneId(zones: ZoneForLookup[], lat: number, lng: number) {
  let bestZoneId = "";
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const zone of zones) {
    const zoneLat = numeric(zone.centroidLat);
    const zoneLng = numeric(zone.centroidLng);
    if (!zone.id || zoneLat === null || zoneLng === null) continue;

    const distance = distanceKm({ lat, lng }, { lat: zoneLat, lng: zoneLng });
    if (distance < bestDistance) {
      bestDistance = distance;
      bestZoneId = String(zone.id);
    }
  }

  return bestDistance <= 20 ? bestZoneId : "";
}

async function fetchGbifPage(limit: number) {
  const url = new URL("https://api.gbif.org/v1/occurrence/search");
  url.searchParams.set("country", "TH");
  url.searchParams.set("hasCoordinate", "true");
  url.searchParams.set("occurrenceStatus", "PRESENT");
  url.searchParams.set("decimalLongitude", `${KHAO_YAI_BBOX.minLng},${KHAO_YAI_BBOX.maxLng}`);
  url.searchParams.set("decimalLatitude", `${KHAO_YAI_BBOX.minLat},${KHAO_YAI_BBOX.maxLat}`);
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`GBIF occurrence request failed: ${response.status}`);
  return response.json() as Promise<GbifSearchResponse>;
}

export async function syncGbifOccurrences(store: GoogleSheetsStore, options?: { limit?: number }) {
  const limit = Math.max(1, Math.min(options?.limit || Number(process.env.GBIF_SYNC_LIMIT || 75), 300));
  const zones = await store.list<ZoneForLookup>("Zone");
  const payload = await fetchGbifPage(limit);
  const rows = [];

  for (const occurrence of payload.results || []) {
    const lat = numeric(occurrence.decimalLatitude);
    const lng = numeric(occurrence.decimalLongitude);
    if (lat === null || lng === null) continue;

    const externalId = String(occurrence.gbifID || occurrence.key || "");
    rows.push({
      id: externalId
        ? `gbif-${externalId}`
        : `gbif-${lat.toFixed(5)}-${lng.toFixed(5)}-${observationTimestamp(occurrence).slice(0, 10)}`,
      importBatchId: "",
      zoneId: nearestZoneId(zones, lat, lng),
      externalId,
      timestamp: observationTimestamp(occurrence),
      lat,
      lng,
      eventType: "WILDLIFE",
      species: speciesName(occurrence),
      threatType: "",
      patrolTeam: "",
      confidence: occurrence.coordinateUncertaintyInMeters
        ? Math.max(0.2, Math.min(1, 1 - occurrence.coordinateUncertaintyInMeters / 10000))
        : "",
      notes: `Open biodiversity occurrence from GBIF (${occurrence.basisOfRecord || "record"}).`,
      raw: occurrence,
      createdAt: new Date().toISOString(),
    });
  }

  for (const row of rows) {
    await store.upsert("Observation", row);
  }

  const now = new Date().toISOString();
  await store.upsert("DataSource", {
    id: "source-gbif",
    parkId: "khao-yai-national-park",
    type: "GBIF_OCCURRENCE",
    name: "GBIF species occurrences",
    status: "configured",
    lastSyncedAt: now,
    freshnessWarning: rows.length ? "" : "GBIF returned no matching records for the Khao Yai bounding box.",
    config: {
      bbox: KHAO_YAI_BBOX,
      limit,
      source: "https://api.gbif.org/v1/occurrence/search",
      licenseNote: "Each occurrence keeps its source license in raw. Verify before external redistribution.",
    },
    updatedAt: now,
  });

  await store.append("AuditLog", {
    id: importId("audit-gbif"),
    userId: "",
    action: "SYNC_GBIF_OCCURRENCES",
    entity: "Observation",
    entityId: "",
    metadata: { records: rows.length, gbifCount: payload.count || 0, bbox: KHAO_YAI_BBOX },
    createdAt: now,
  });

  return { records: rows.length, gbifCount: payload.count || 0 };
}
