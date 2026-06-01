import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { getBackendStatus } from "@/lib/rangerqData";

export const dynamic = "force-dynamic";

export async function GET() {
  const backend = getBackendStatus();
  const checks = {
    googleSheets: {
      configured: backend.configured,
      status: "unknown",
      message: backend.message,
    },
    apiKeys: {
      firms: Boolean(process.env.FIRMS_MAP_KEY),
      qbraid: Boolean(process.env.QBRAID_API_KEY),
      qbraidEndpoint: Boolean(process.env.QBRAID_API_URL),
    },
    freshness: [] as Array<{ type: string; name: string; status: string; lastSyncedAt: string; freshnessWarning: string }>,
  };

  let statusCode = backend.configured ? 200 : 503;

  if (backend.configured) {
    try {
      const sources = await new GoogleSheetsStore().list<Record<string, unknown>>("DataSource");
      checks.googleSheets.status = "ok";
      checks.freshness = sources.map((source) => ({
        type: String(source.type || ""),
        name: String(source.name || source.type || ""),
        status: String(source.status || "unknown"),
        lastSyncedAt: String(source.lastSyncedAt || ""),
        freshnessWarning: String(source.freshnessWarning || ""),
      }));
    } catch (error) {
      checks.googleSheets.status = "error";
      checks.googleSheets.message = error instanceof Error ? error.message : "Google Sheets backend is not reachable.";
      statusCode = 503;
    }
  }

  return Response.json({
    ok: statusCode < 500,
    service: "RangerQ / Q-Forest Twin",
    generatedAt: new Date().toISOString(),
    backend,
    checks,
  }, { status: statusCode });
}

