import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { jsonError, requireApiSession } from "@/lib/imports/routeHelpers";
import { buildDailyReport, dailyReportCsv } from "@/lib/reports/daily";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;

  try {
    const report = await buildDailyReport(new GoogleSheetsStore());
    const url = new URL(request.url);
    if (url.searchParams.get("format") === "csv") {
      return new Response(dailyReportCsv(report), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="rangerq-daily-report-${report.generatedAt.slice(0, 10)}.csv"`,
        },
      });
    }
    return Response.json({ ok: true, report });
  } catch (error) {
    return jsonError(error, 502);
  }
}

