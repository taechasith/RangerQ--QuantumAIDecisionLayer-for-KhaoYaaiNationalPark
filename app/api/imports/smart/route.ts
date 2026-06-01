import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { parseSmartCsv } from "@/lib/adapters/smart";
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
    const batchId = importId("batch-smart");
    const rows = parseSmartCsv(text, batchId, () => lookup.nearestFallback());

    await store.append("ImportBatch", importBatchRow({
      id: batchId,
      dataSourceId: "source-smart",
      sourceType: "SMART_EXPORT",
      filename,
      recordCount: rows.length,
    }));
    for (const row of rows) await store.append("Observation", row);
    await store.append("AuditLog", {
      id: importId("audit-smart"),
      userId: "",
      action: "IMPORT_SMART_EXPORT",
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
