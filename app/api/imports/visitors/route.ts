import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { parseVisitorsCsv } from "@/lib/adapters/visitors";
import { importId } from "@/lib/imports/csv";
import { createZoneLookup } from "@/lib/imports/zoneLookup";
import { importBatchRow, jsonError, readUploadedText, requireApiSession } from "@/lib/imports/routeHelpers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;

  try {
    const store = new GoogleSheetsStore();
    const { text, filename } = await readUploadedText(request);
    const lookup = await createZoneLookup(store);
    const batchId = importId("batch-visitors");
    const rows = parseVisitorsCsv(text, batchId, (zoneCode) => lookup.byCode(zoneCode));

    await store.append("ImportBatch", importBatchRow({
      id: batchId,
      dataSourceId: "source-visitors",
      sourceType: "VISITOR_CSV",
      filename,
      recordCount: rows.length,
    }));
    for (const row of rows) await store.append("VisitorPressure", row);
    await store.append("AuditLog", {
      id: importId("audit-visitors"),
      userId: "",
      action: "IMPORT_VISITOR_PRESSURE",
      entity: "ImportBatch",
      entityId: batchId,
      metadata: { filename, records: rows.length },
      createdAt: new Date().toISOString(),
    });

    return Response.json({ ok: true, importBatchId: batchId, recordCount: rows.length });
  } catch (error) {
    return jsonError(error);
  }
}
