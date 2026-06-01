import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { submitQbraidForOptimization } from "@/lib/adapters/qbraid";
import { jsonError, requireApiSession } from "@/lib/imports/routeHelpers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json() as { optimizationRunId?: string };
    if (!body.optimizationRunId) throw new Error("optimizationRunId is required");
    const result = await submitQbraidForOptimization(new GoogleSheetsStore(), body.optimizationRunId);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return jsonError(error, 502);
  }
}

