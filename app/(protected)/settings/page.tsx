import { Card, PageHeader } from "@/components/layout/PageHeader";
import { SyncControls } from "@/components/settings/SyncControls";
import { getLatestAuditLogs } from "@/lib/audit";
import { getBackendStatus } from "@/lib/rangerqData";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const status = getBackendStatus();
  const auditLogs = await getLatestAuditLogs();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Backend and credential status for the protected RangerQ app."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Data backend" value={status.backend} detail={status.message} />
        <Card title="Apps Script API" value={status.configured ? "Configured" : "Missing"} detail={status.apiUrl || "Set GOOGLE_SHEETS_API_URL"} />
        <Card title="Auth mode" value="Demo admin" detail="Credentials are read from .env.local." />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <Card title="NASA FIRMS" value={process.env.FIRMS_MAP_KEY ? "Configured" : "Missing"} detail={process.env.FIRMS_MAP_KEY ? "Real hotspot sync enabled" : "Falls back to demo hotspot mode"} />
        <Card title="qBraid API" value={process.env.QBRAID_API_KEY ? "Configured" : "Missing"} detail={process.env.QBRAID_API_KEY ? "Remote credential present" : "Local worker fallback available"} />
        <Card title="qBraid endpoint" value={process.env.QBRAID_API_URL ? "Configured" : "Missing"} detail={process.env.QBRAID_API_URL ? "REST submission path enabled" : "External worker command shown"} />
        <Card title="SMART Connect" value={process.env.SMART_CONNECT_URL ? "Configured" : "Disabled"} detail="CSV/GeoJSON import remains active" />
      </div>
      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold text-zinc-950">Google Apps Script database</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-zinc-700">Script editor</dt>
            <dd className="mt-1 break-all text-zinc-600">{status.editorUrl}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-700">Web app endpoint</dt>
            <dd className="mt-1 break-all text-zinc-600">{status.apiUrl || "Not set"}</dd>
          </div>
        </dl>
      </div>
      <SyncControls />
      <div className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="font-semibold text-zinc-950">Audit log</h2>
          <p className="mt-1 text-sm text-zinc-600">Latest imports, syncs, risk runs, optimization runs, and qBraid actions.</p>
        </div>
        <div className="divide-y divide-zinc-100">
          {auditLogs.length ? auditLogs.map((log) => (
            <div key={log.id} className="grid gap-2 px-5 py-4 md:grid-cols-[180px_180px_minmax(0,1fr)]">
              <p className="text-sm font-medium text-zinc-950">{log.action}</p>
              <p className="text-sm text-zinc-600">{log.entity}{log.entityId ? `:${log.entityId}` : ""}</p>
              <div>
                <p className="text-sm text-zinc-600">{log.createdAt || "No timestamp"}</p>
                {log.metadata ? <p className="mt-1 break-all text-xs text-zinc-500">{log.metadata}</p> : null}
              </div>
            </div>
          )) : (
            <div className="px-5 py-4 text-sm text-zinc-600">No audit log records are available yet.</div>
          )}
        </div>
      </div>
    </>
  );
}
