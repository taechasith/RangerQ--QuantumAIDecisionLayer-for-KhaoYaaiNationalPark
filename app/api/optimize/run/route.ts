import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { jsonError, requireApiSession } from "@/lib/imports/routeHelpers";
import { runOptimizer } from "@/lib/optimizer/run";
import type { OptimizeInput } from "@/lib/optimizer/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;

  try {
    const input = await request.json() as Partial<OptimizeInput>;
    const result = await runOptimizer(new GoogleSheetsStore(), input);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return jsonError(error, 502);
  }
}

