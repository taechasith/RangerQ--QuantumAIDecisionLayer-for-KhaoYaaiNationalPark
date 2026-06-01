type SheetAction = "list" | "get" | "append" | "upsert";

type SheetResponse<T> = {
  ok: boolean;
  row?: T;
  rows?: T[];
  error?: string;
};

export class GoogleSheetsStore {
  private readonly apiUrl: string;
  private readonly token: string;

  constructor(options?: { apiUrl?: string; token?: string }) {
    this.apiUrl = options?.apiUrl || process.env.GOOGLE_SHEETS_API_URL || "";
    this.token = options?.token || process.env.GOOGLE_SHEETS_API_TOKEN || "";

    if (!this.apiUrl) {
      throw new Error("GOOGLE_SHEETS_API_URL is required for the Google Sheets data backend");
    }

    if (!this.token) {
      throw new Error("GOOGLE_SHEETS_API_TOKEN is required for the Google Sheets data backend");
    }
  }

  async list<T extends Record<string, unknown>>(table: string): Promise<T[]> {
    const result = await this.request<T>(table, "list");
    return result.rows || [];
  }

  async get<T extends Record<string, unknown>>(table: string, id: string): Promise<T | null> {
    const result = await this.request<T>(table, "get", undefined, { id });
    return result.row || null;
  }

  async append<T extends Record<string, unknown>>(table: string, row: T): Promise<T> {
    const result = await this.request<T>(table, "append", row);
    if (!result.row) throw new Error(`Google Sheets append returned no row for ${table}`);
    return result.row;
  }

  async upsert<T extends Record<string, unknown>>(table: string, row: T): Promise<T> {
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
