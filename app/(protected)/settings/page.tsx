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
        title="System Settings"
        description="View the configuration of data APIs, quantum servers, and backend database integrations."
      />
      <div className="grid gap-4 md:grid-cols-3 animate-slide-up delay-75">
        <Card title="Active Database Backend" value={status.backend} detail={status.message} />
        <Card title="Google Sheets Integration" value={status.configured ? "Configured" : "Missing"} detail={status.apiUrl || "Set GOOGLE_SHEETS_API_URL"} />
        <Card title="Authentication Type" value="Demo admin" detail="Credentials are read from secure server configuration." />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4 animate-slide-up delay-100">
        <Card title="Satellite Fire Alerts" value={process.env.FIRMS_MAP_KEY ? "Active" : "Missing"} detail={process.env.FIRMS_MAP_KEY ? "Real-time thermal alerts enabled" : "Using baseline historical data"} />
        <Card title="Quantum Solver" value={process.env.QBRAID_API_KEY ? "Configured" : "Missing"} detail={process.env.QBRAID_API_KEY ? "Quantum simulator linked" : "Standard deterministic planner active"} />
        <Card title="Quantum Server URL" value={process.env.QBRAID_API_URL ? "Configured" : "Missing"} detail={process.env.QBRAID_API_URL ? "Connection endpoint enabled" : "Using local planning solver"} />
        <Card title="SMART File Import" value="Active" detail="Supports CSV and GeoJSON layout formats" />
      </div>
      <div className="mt-6 rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-5 animate-slide-up delay-150">
        <h2 className="text-base font-bold text-white">Google Sheets Sync Details</h2>
        <dl className="mt-4 space-y-4 text-xs">
          <div>
            <dt className="font-bold text-zinc-400 uppercase tracking-wider">Script Editor Link</dt>
            <dd className="mt-1.5 break-all text-zinc-300 font-semibold">{status.editorUrl}</dd>
          </div>
          <div>
            <dt className="font-bold text-zinc-400 uppercase tracking-wider">Web App Connection URL</dt>
            <dd className="mt-1.5 break-all text-zinc-300 font-semibold">{status.apiUrl || "Not Configured"}</dd>
          </div>
        </dl>
      </div>

      <SyncControls />

      <div className="mt-6 rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md overflow-hidden animate-slide-up delay-300">
        <div className="border-b border-zinc-900 px-5 py-4">
          <h2 className="text-base font-bold text-white">System Activity Log</h2>
          <p className="mt-1 text-xs text-zinc-400">Log of recent imports, syncs, danger score updates, and planning tasks.</p>
        </div>
        <div className="divide-y divide-zinc-900">
          {auditLogs.length ? auditLogs.map((log) => (
            <div key={log.id} className="grid gap-2 px-5 py-4 md:grid-cols-[180px_180px_minmax(0,1fr)] hover:bg-zinc-900/10 transition-colors">
              <p className="text-xs font-bold text-white">{log.action}</p>
              <p className="text-xs text-zinc-300">{log.entity}{log.entityId ? `:${log.entityId}` : ""}</p>
              <div>
                <p className="text-xs text-zinc-400">{log.createdAt || "No timestamp"}</p>
                {log.metadata ? <p className="mt-1.5 break-all text-[10px] text-zinc-500 font-mono">{log.metadata}</p> : null}
              </div>
            </div>
          )) : (
            <div className="px-5 py-4 text-xs text-zinc-400">No system activity records are available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
