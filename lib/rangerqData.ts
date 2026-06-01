import "server-only";

import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";

export type ZoneRow = {
  id: string;
  code: string;
  name: string;
  zoneType: string;
  geometryGeojson?: unknown;
  centroidLat: number;
  centroidLng: number;
  areaHectares: number;
  baseFireRisk: number;
  baseWildlifeRisk: number;
  accessDifficulty: number;
  rangerStationDistanceKm: number;
  isSynthetic?: boolean;
};

export type DataSourceRow = {
  id: string;
  type: string;
  name: string;
  status: string;
  lastSyncedAt?: string;
  freshnessWarning?: string;
};

export type RiskScoreRow = {
  id: string;
  riskRunId: string;
  zoneId: string;
  zoneCode: string;
  zoneName: string;
  fireRisk: number;
  wildlifeRisk: number;
  combinedPriority: number;
  operationalFeasibility: number;
  label: string;
  topFactors: Array<{ name: string; score: number; detail: string }>;
  recommendedAction: string;
  freshnessWarning: string;
  createdAt: string;
};

export type RiskRunRow = {
  id: string;
  status: string;
  version: string;
  startedAt: string;
  completedAt: string;
  errorMessage: string;
};

export type BackendStatus = {
  backend: string;
  configured: boolean;
  apiUrl: string;
  editorUrl: string;
  message: string;
};

const fallbackZones: ZoneRow[] = [
  { id: "zone-ky-bnd-01", code: "KY-BND-01", name: "Northwest Boundary Corridor", zoneType: "BOUNDARY", centroidLat: 14.52, centroidLng: 101.32, areaHectares: 420, baseFireRisk: 72, baseWildlifeRisk: 58, accessDifficulty: 46, rangerStationDistanceKm: 7.4, isSynthetic: true },
  { id: "zone-ky-bnd-02", code: "KY-BND-02", name: "Pak Chong Village Edge", zoneType: "VILLAGE_EDGE", centroidLat: 14.48, centroidLng: 101.37, areaHectares: 310, baseFireRisk: 84, baseWildlifeRisk: 76, accessDifficulty: 34, rangerStationDistanceKm: 4.2, isSynthetic: true },
  { id: "zone-ky-for-03", code: "KY-FOR-03", name: "Dry Dipterocarp Ridge", zoneType: "FOREST", centroidLat: 14.44, centroidLng: 101.35, areaHectares: 680, baseFireRisk: 79, baseWildlifeRisk: 45, accessDifficulty: 68, rangerStationDistanceKm: 9.1, isSynthetic: true },
  { id: "zone-ky-rd-06", code: "KY-RD-06", name: "Thanarat Road Wildlife Crossing", zoneType: "ROAD", centroidLat: 14.41, centroidLng: 101.39, areaHectares: 190, baseFireRisk: 48, baseWildlifeRisk: 82, accessDifficulty: 28, rangerStationDistanceKm: 3.5, isSynthetic: true },
  { id: "zone-ky-bnd-16", code: "KY-BND-16", name: "Western Smoke Report Zone", zoneType: "BOUNDARY", centroidLat: 14.38, centroidLng: 101.27, areaHectares: 500, baseFireRisk: 91, baseWildlifeRisk: 49, accessDifficulty: 62, rangerStationDistanceKm: 10.2, isSynthetic: true },
];

const fallbackSources: DataSourceRow[] = [
  { id: "source-smart", type: "SMART_EXPORT", name: "SMART patrol export", status: "demo", freshnessWarning: "Demo data source until official data is imported." },
  { id: "source-camera", type: "CAMERA_AI", name: "Camera and AI detections", status: "demo", freshnessWarning: "Demo data source until official data is imported." },
  { id: "source-visitors", type: "VISITOR_CSV", name: "Visitor pressure CSV", status: "demo", freshnessWarning: "Demo data source until official data is imported." },
  { id: "source-firms", type: "NASA_FIRMS", name: "NASA FIRMS fire hotspots", status: "demo", freshnessWarning: "FIRMS_MAP_KEY missing; using demo data only" },
  { id: "source-weather", type: "OPEN_METEO", name: "Open-Meteo weather", status: "configured" },
];

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeZone(row: Record<string, unknown>): ZoneRow {
  return {
    id: String(row.id || row.code || ""),
    code: String(row.code || ""),
    name: String(row.name || ""),
    zoneType: String(row.zoneType || ""),
    geometryGeojson: row.geometryGeojson,
    centroidLat: toNumber(row.centroidLat),
    centroidLng: toNumber(row.centroidLng),
    areaHectares: toNumber(row.areaHectares),
    baseFireRisk: toNumber(row.baseFireRisk),
    baseWildlifeRisk: toNumber(row.baseWildlifeRisk),
    accessDifficulty: toNumber(row.accessDifficulty),
    rangerStationDistanceKm: toNumber(row.rangerStationDistanceKm),
    isSynthetic: row.isSynthetic === true || row.isSynthetic === "true",
  };
}

function normalizeSource(row: Record<string, unknown>): DataSourceRow {
  return {
    id: String(row.id || row.type || ""),
    type: String(row.type || ""),
    name: String(row.name || row.type || ""),
    status: String(row.status || "unknown"),
    lastSyncedAt: String(row.lastSyncedAt || ""),
    freshnessWarning: String(row.freshnessWarning || ""),
  };
}

function parseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

function normalizeRiskRun(row: Record<string, unknown>): RiskRunRow {
  return {
    id: String(row.id || ""),
    status: String(row.status || ""),
    version: String(row.version || ""),
    startedAt: String(row.startedAt || ""),
    completedAt: String(row.completedAt || ""),
    errorMessage: String(row.errorMessage || ""),
  };
}

function normalizeRiskScore(row: Record<string, unknown>, zoneById: Map<string, ZoneRow>): RiskScoreRow {
  const zoneId = String(row.zoneId || "");
  const zone = zoneById.get(zoneId);
  return {
    id: String(row.id || ""),
    riskRunId: String(row.riskRunId || ""),
    zoneId,
    zoneCode: zone?.code || zoneId,
    zoneName: zone?.name || "Unknown zone",
    fireRisk: toNumber(row.fireRisk),
    wildlifeRisk: toNumber(row.wildlifeRisk),
    combinedPriority: toNumber(row.combinedPriority),
    operationalFeasibility: toNumber(row.operationalFeasibility),
    label: String(row.label || "low"),
    topFactors: parseJsonArray<{ name: string; score: number; detail: string }>(row.topFactors),
    recommendedAction: String(row.recommendedAction || ""),
    freshnessWarning: String(row.freshnessWarning || ""),
    createdAt: String(row.createdAt || ""),
  };
}

export function getBackendStatus(): BackendStatus {
  const apiUrl = process.env.GOOGLE_SHEETS_API_URL || "";
  const editorUrl = process.env.GOOGLE_APPS_SCRIPT_EDITOR_URL || "https://script.google.com/d/1G7wB__c1rYPjSSNJ2UArsHHttJb2VpsW7LnFnhGDl1lrEXbU3pDb6uea/edit?usp=sharing";
  const configured = Boolean(apiUrl && process.env.GOOGLE_SHEETS_API_TOKEN);
  const isWebApp = apiUrl.includes("/macros/s/") && apiUrl.endsWith("/exec");

  return {
    backend: process.env.DATA_BACKEND || "google_sheets",
    configured,
    apiUrl,
    editorUrl,
    message: configured && isWebApp
      ? "Google Apps Script web app is configured as the database backend."
      : "Deploy the Apps Script as a Web App and set GOOGLE_SHEETS_API_URL to the /exec URL.",
  };
}

export async function getOperationsSnapshot() {
  const status = getBackendStatus();

  if (!status.configured) {
    return { status, zones: fallbackZones, sources: fallbackSources, riskRun: null, riskScores: [], usingFallback: true };
  }

  try {
    const store = new GoogleSheetsStore();
    const [zoneRows, sourceRows, riskRunRows, riskScoreRows] = await Promise.all([
      store.list<Record<string, unknown>>("Zone"),
      store.list<Record<string, unknown>>("DataSource"),
      store.list<Record<string, unknown>>("RiskRun"),
      store.list<Record<string, unknown>>("ZoneRiskScore"),
    ]);

    const zones = zoneRows.map(normalizeZone).filter((zone) => zone.code);
    const sources = sourceRows.map(normalizeSource).filter((source) => source.type);
    const zoneById = new Map(zones.map((zone) => [zone.id, zone]));
    const riskRuns = riskRunRows
      .map(normalizeRiskRun)
      .filter((run) => run.status === "SUCCESS")
      .sort((a, b) => Date.parse(b.completedAt || b.startedAt) - Date.parse(a.completedAt || a.startedAt));
    const riskRun = riskRuns[0] || null;
    const riskScores = riskRun
      ? riskScoreRows
        .map((row) => normalizeRiskScore(row, zoneById))
        .filter((score) => score.riskRunId === riskRun.id)
        .sort((a, b) => b.combinedPriority - a.combinedPriority)
      : [];

    return {
      status,
      zones: zones.length ? zones : fallbackZones,
      sources: sources.length ? sources : fallbackSources,
      riskRun,
      riskScores,
      usingFallback: !zones.length,
    };
  } catch (error) {
    return {
      status: {
        ...status,
        message: error instanceof Error ? error.message : "Google Sheets backend is not reachable.",
      },
      zones: fallbackZones,
      sources: fallbackSources,
      riskRun: null,
      riskScores: [],
      usingFallback: true,
    };
  }
}
