import { Card, PageHeader } from "@/components/layout/PageHeader";
import { SyncControls } from "@/components/settings/SyncControls";
import { getLatestAuditLogs } from "@/lib/audit";
import { getBackendStatus } from "@/lib/rangerqData";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const status = getBackendStatus();
  const auditLogs = await getLatestAuditLogs();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Settings"
        description="Backend and credential status for the protected RangerQ app."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-slide-up delay-75">
        <Card title="Data backend" value={status.backend} detail={status.message} />
        <Card title="Apps Script API" value={status.configured ? "Configured" : "Missing"} detail={status.apiUrl || "Set GOOGLE_SHEETS_API_URL"} />
        <Card title="Auth mode" value="Demo admin" detail="Credentials are read from .env.local." />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-slide-up delay-100">
        <Card title="NASA FIRMS" value={process.env.FIRMS_MAP_KEY ? "Configured" : "Missing"} detail={process.env.FIRMS_MAP_KEY ? "Real hotspot sync enabled" : "Falls back to demo hotspot mode"} />
        <Card title="qBraid API" value={process.env.QBRAID_API_KEY ? "Configured" : "Missing"} detail={process.env.QBRAID_API_KEY ? "Remote credential present" : "Local worker fallback available"} />
        <Card title="qBraid endpoint" value={process.env.QBRAID_API_URL ? "Configured" : "Missing"} detail={process.env.QBRAID_API_URL ? "REST submission path enabled" : "External worker command shown"} />
        <Card title="SMART Import" value="Active" detail="Supports CSV and GeoJSON upload formats" />
      </div>
      <div className="mt-6 rounded-xl border border-zinc-900/90 bg-zinc-900/35 p-4 shadow-lg shadow-black/10 backdrop-blur-md animate-slide-up delay-150 sm:p-5">
        <h2 className="text-base font-bold text-white">Google Apps Script Database</h2>
        <dl className="mt-4 space-y-4 text-xs">
          <div>
            <dt className="font-bold text-zinc-400 uppercase tracking-wider">Script Editor URL</dt>
            <dd className="mt-1.5 break-all text-zinc-300 font-semibold">{status.editorUrl}</dd>
          </div>
          <div>
            <dt className="font-bold text-zinc-400 uppercase tracking-wider">Web App Endpoint</dt>
            <dd className="mt-1.5 break-all text-zinc-300 font-semibold">{status.apiUrl || "Not Configured"}</dd>
          </div>
        </dl>
      </div>

      <SyncControls />

      <div className="mt-6 rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md overflow-hidden animate-slide-up delay-300">
        <div className="border-b border-zinc-900 px-5 py-4">
          <h2 className="text-base font-bold text-white">Audit Log</h2>
          <p className="mt-1 text-xs text-zinc-400">Latest imports, syncs, risk runs, optimization runs, and qBraid actions.</p>
        </div>
        <div className="divide-y divide-zinc-900">
          {auditLogs.length ? auditLogs.map((log) => (
            <div key={log.id} className="grid gap-2 px-4 py-4 transition-colors hover:bg-zinc-900/25 sm:px-5 md:grid-cols-[180px_180px_minmax(0,1fr)]">
              <p className="text-xs font-bold text-white">{log.action}</p>
              <p className="text-xs text-zinc-300">{log.entity}{log.entityId ? `:${log.entityId}` : ""}</p>
              <div>
                <p className="text-xs text-zinc-400">{log.createdAt || "No timestamp"}</p>
                {log.metadata ? <p className="mt-1.5 break-all text-[10px] text-zinc-500 font-mono">{log.metadata}</p> : null}
              </div>
            </div>
          )) : (
            <div className="px-5 py-4 text-xs text-zinc-400">No audit log records are available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
