type SheetAction = "list" | "get" | "append" | "upsert";

type SheetResponse<T> = {
  ok: boolean;
  row?: T;
  rows?: T[];
  error?: string;
};

// Helper to convert Prisma objects to raw objects
function toRaw(row: Record<string, unknown>): Record<string, unknown> {
  if (!row) return row;
  const result = { ...row };
  for (const [key, value] of Object.entries(result)) {
    if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (value && typeof value === "object") {
      result[key] = value;
    }
  }
  return result;
}

// Helper to convert raw input to Prisma input schema
function toPrismaData(table: string, row: Record<string, unknown>): Record<string, unknown> {
  const data = { ...row };
  
  // Clean internal properties not present in database schema
  delete data.isSynthetic;

  // Set default park ID if required
  if (table === "Zone" || table === "DataSource") {
    data.parkId = data.parkId || "khao-yai-national-park";
  }

  // Parse Date fields
  const dateFields = ["lastSyncedAt", "startedAt", "completedAt", "createdAt", "updatedAt", "timestamp", "date"];
  for (const field of dateFields) {
    if (data[field]) {
      data[field] = new Date(String(data[field]));
    }
  }

  // Parse JSON fields
  const jsonFields = [
    "geometryGeojson",
    "boundaryGeojson",
    "config",
    "weights",
    "topFactors",
    "quboPayload",
    "qbraidResult",
    "route",
    "raw",
    "metadata"
  ];
  for (const field of jsonFields) {
    if (field in data) {
      if (typeof data[field] === "string" && data[field].trim()) {
        try {
          data[field] = JSON.parse(data[field]);
        } catch {
          // Keep as is or ignore
        }
      }
    }
  }

  // Parse numeric fields
  const floatFields = [
    "centroidLat",
    "centroidLng",
    "areaHectares",
    "baseFireRisk",
    "baseWildlifeRisk",
    "accessDifficulty",
    "rangerStationDistanceKm",
    "fireRisk",
    "wildlifeRisk",
    "combinedPriority",
    "operationalFeasibility",
    "maxPatrolHours",
    "coverageScore",
    "travelPenalty",
    "estimatedPatrolHours",
    "estimatedHours",
    "scoreContribution",
    "lat",
    "lng",
    "brightness",
    "frp",
    "confidence",
    "temperature2m",
    "relativeHumidity2m",
    "windSpeed10m",
    "windDirection10m",
    "windGusts10m",
    "precipitation",
    "soilMoisture0To1cm",
    "soilMoisture1To3cm"
  ];
  for (const field of floatFields) {
    if (field in data && data[field] !== undefined && data[field] !== null) {
      data[field] = Number(data[field]);
    }
  }

  const intFields = ["maxZones", "rangerTeams", "rank", "count", "visitorCount", "vehicleCount", "busCount", "severity"];
  for (const field of intFields) {
    if (field in data && data[field] !== undefined && data[field] !== null) {
      data[field] = Math.round(Number(data[field]));
    }
  }

  // Parse boolean fields
  const boolFields = ["isSynthetic", "requireFireCoverage", "requireWildlifeCoverage"];
  for (const field of boolFields) {
    if (field in data && data[field] !== undefined && data[field] !== null) {
      data[field] = data[field] === true || data[field] === "true";
    }
  }

  // Handle specific Enum fields mapping
  if (table === "Zone" && data.zoneType) {
    data.zoneType = String(data.zoneType).toUpperCase();
  }
  if (table === "DataSource" && data.type) {
    data.type = String(data.type).toUpperCase();
  }
  if (table === "RiskRun" && data.status) {
    data.status = String(data.status).toUpperCase();
  }
  if (table === "ZoneRiskScore" && data.label) {
    data.label = String(data.label).toUpperCase();
  }
  if (table === "OptimizationRun" && data.method) {
    data.method = String(data.method).toUpperCase();
  }

  return data;
}

type PrismaModelDelegate = {
  findMany: () => Promise<Record<string, unknown>[]>;
  findUnique: (args: { where: { id: string } }) => Promise<Record<string, unknown> | null>;
  create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
  upsert: (args: {
    where: { id: string };
    update: Record<string, unknown>;
    create: Record<string, unknown>;
  }) => Promise<Record<string, unknown>>;
};

async function getPrismaModel(table: string): Promise<PrismaModelDelegate> {
  const { prisma } = await import("@/lib/db");
  const modelMapping: Record<string, PrismaModelDelegate> = {
    Zone: prisma.zone as unknown as PrismaModelDelegate,
    DataSource: prisma.dataSource as unknown as PrismaModelDelegate,
    RiskRun: prisma.riskRun as unknown as PrismaModelDelegate,
    ZoneRiskScore: prisma.zoneRiskScore as unknown as PrismaModelDelegate,
    OptimizationRun: prisma.optimizationRun as unknown as PrismaModelDelegate,
    SelectedZone: prisma.selectedZone as unknown as PrismaModelDelegate,
    PatrolPlan: prisma.patrolPlan as unknown as PrismaModelDelegate,
    AuditLog: prisma.auditLog as unknown as PrismaModelDelegate,
    WeatherSnapshot: prisma.weatherSnapshot as unknown as PrismaModelDelegate,
    FireHotspot: prisma.fireHotspot as unknown as PrismaModelDelegate,
    CameraDetection: prisma.cameraDetection as unknown as PrismaModelDelegate,
    VisitorPressure: prisma.visitorPressure as unknown as PrismaModelDelegate,
    ManualNote: prisma.manualNote as unknown as PrismaModelDelegate,
  };

  const model = modelMapping[table];
  if (!model) throw new Error(`Unknown database model for table: ${table}`);
  return model;
}

export class GoogleSheetsStore {
  private readonly apiUrl: string;
  private readonly token: string;
  private readonly isDatabase: boolean;

  constructor(options?: { apiUrl?: string; token?: string }) {
    const backend = process.env.DATA_BACKEND || "google_sheets";
    this.isDatabase = backend === "database";

    this.apiUrl = options?.apiUrl || process.env.GOOGLE_SHEETS_API_URL || "";
    this.token = options?.token || process.env.GOOGLE_SHEETS_API_TOKEN || "";

    if (!this.isDatabase) {
      if (!this.apiUrl) {
        throw new Error("GOOGLE_SHEETS_API_URL is required for the Google Sheets data backend");
      }
      if (!this.token) {
        throw new Error("GOOGLE_SHEETS_API_TOKEN is required for the Google Sheets data backend");
      }
    }
  }

  async list<T extends Record<string, unknown>>(table: string): Promise<T[]> {
    if (this.isDatabase) {
      const model = await getPrismaModel(table);
      const rows = await model.findMany();
      return rows.map(toRaw) as T[];
    }

    const result = await this.request<T>(table, "list");
    return result.rows || [];
  }

  async get<T extends Record<string, unknown>>(table: string, id: string): Promise<T | null> {
    if (this.isDatabase) {
      const model = await getPrismaModel(table);
      const row = await model.findUnique({ where: { id } });
      return (row ? toRaw(row) : null) as T | null;
    }

    const result = await this.request<T>(table, "get", undefined, { id });
    return result.row || null;
  }

  async append<T extends Record<string, unknown>>(table: string, row: T): Promise<T> {
    if (this.isDatabase) {
      const model = await getPrismaModel(table);
      const data = toPrismaData(table, row);
      const created = await model.create({ data });
      return toRaw(created) as T;
    }

    const result = await this.request<T>(table, "append", row);
    if (!result.row) throw new Error(`Google Sheets append returned no row for ${table}`);
    return result.row;
  }

  async upsert<T extends Record<string, unknown>>(table: string, row: T): Promise<T> {
    if (this.isDatabase) {
      const model = await getPrismaModel(table);
      const data = toPrismaData(table, row);
      const id = String(data.id || "");
      const upserted = await model.upsert({
        where: { id },
        update: data,
        create: data,
      });
      return toRaw(upserted) as T;
    }

    const result = await this.request<T>(table, "upsert", row);
    if (!result.row) throw new Error(`Google Sheets upsert returned no row for ${table}`);
    return result.row;
  }

  private async request<T extends Record<string, unknown>>(
    table: string,
    action: SheetAction,
    body?: Record<string, unknown>,
    params?: Record<string, string>,
  ): Promise<SheetResponse<T>> {
    const url = new URL(this.apiUrl);
    url.searchParams.set("token", this.token);
    url.searchParams.set("table", table);
    url.searchParams.set("action", action);

    for (const [key, value] of Object.entries(params || {})) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    const payload = (await response.json()) as SheetResponse<T>;
    if (!payload.ok) {
      throw new Error(payload.error || `Google Sheets ${action} failed for ${table}`);
    }
    return payload;
  }
}

export function getGoogleSheetsStore() {
  return new GoogleSheetsStore();
}
