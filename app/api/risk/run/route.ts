import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { jsonError, requireApiSession } from "@/lib/imports/routeHelpers";
import { runRiskEngine } from "@/lib/risk/combinedRisk";

export const dynamic = "force-dynamic";

export async function POST() {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;

  try {
    const store = new GoogleSheetsStore();
    const result = await runRiskEngine(store);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return jsonError(error, 502);
  }
}

