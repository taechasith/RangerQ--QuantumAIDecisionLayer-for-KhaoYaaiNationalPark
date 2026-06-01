import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { createManualNote } from "@/lib/adapters/manualNotes";
import { importId } from "@/lib/imports/csv";
import { jsonError, requireApiSession } from "@/lib/imports/routeHelpers";
import { createZoneLookup } from "@/lib/imports/zoneLookup";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauthorized = await requireApiSession();
  if (unauthorized) return unauthorized;

  try {
    const store = new GoogleSheetsStore();
    const body = await request.json() as Record<string, unknown>;
    const lookup = await createZoneLookup(store);
    const row = createManualNote(body, (zoneCode) => lookup.byCode(zoneCode));

    await store.append("ManualNote", row);
    await store.append("AuditLog", {
      id: importId("audit-note"),
      userId: "",
      action: "CREATE_MANUAL_NOTE",
      entity: "ManualNote",
      entityId: row.id,
      metadata: { category: row.category, severity: row.severity },
      createdAt: new Date().toISOString(),
    });

    return Response.json({ ok: true, manualNoteId: row.id, recordCount: 1 });
  } catch (error) {
    return jsonError(error);
  }
}
