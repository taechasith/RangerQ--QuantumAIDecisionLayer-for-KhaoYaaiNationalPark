import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { syncOpenMeteoWeather } from "@/lib/adapters/weather";
import { jsonError, requireApiSession } from "@/lib/imports/routeHelpers";

export const dynamic = "force-dynamic";

export async function POST() {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;

  try {
    const store = new GoogleSheetsStore();
    const result = await syncOpenMeteoWeather(store);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return jsonError(error, 502);
  }
}
