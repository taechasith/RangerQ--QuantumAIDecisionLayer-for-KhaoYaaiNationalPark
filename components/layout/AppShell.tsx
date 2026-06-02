import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { HeartPulse, LogOut, RadioTower, ShieldCheck } from "lucide-react";

import { logoutAction } from "@/app/actions";
import { getSession } from "@/lib/auth";
import { SidebarNav, MobileNav } from "./SidebarNav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#060a0d] text-slate-100 selection:bg-emerald-500 selection:text-black font-sans">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/[0.04] bg-[#070b0e]/96 px-4 py-5 shadow-2xl shadow-black/40 lg:flex lg:flex-col lg:justify-between">
        <div>
        <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 transition-colors">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-500/25 bg-gradient-to-tr from-emerald-500/15 to-cyan-500/10 shadow-lg shadow-emerald-950/20">
            <Image src="/RengerQ_logo.png" alt="RangerQ Logo" width={34} height={34} className="h-7 w-auto object-contain" />
          </span>
          <div>
            <p className="telemetry-label text-[11px] font-black text-slate-100">Ranger<span className="text-emerald-400">Q</span></p>
            <p className="telemetry-label mt-0.5 rounded bg-white/[0.03] px-1 text-[9px] font-bold text-slate-500">Q-Forest Twin</p>
          </div>
        </Link>
        <div className="my-5 h-px bg-white/[0.04]" />
        <div>
          <SidebarNav />
        </div>
        </div>

        <div className="space-y-3 border-t border-white/[0.04] pt-4">
          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] p-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="telemetry-label text-[10px] font-bold">Live Link</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              Khao Yai telemetry, FIRMS, weather, and ranger logs are staged for command review.
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-colors hover:border-rose-500/30 hover:bg-rose-950/20 hover:text-rose-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Exit Twin
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-white/[0.04] bg-[#070b0e]/88 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.85)] animate-pulse" />
                <p className="telemetry-label text-[10px] font-bold text-slate-500">Twin Connection Status: Live Link</p>
              </div>
              <p className="mt-1 text-sm font-extrabold text-white">Khao Yai Operations</p>
              <p className="mt-0.5 max-w-[46vw] truncate text-xs font-medium text-slate-500 sm:max-w-none">{session.email}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-2 text-[10px] font-bold text-emerald-400 md:flex">
                <HeartPulse className="h-3.5 w-3.5 animate-pulse" />
                Sensors Active
              </div>
              <div className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.02] text-slate-400 md:flex">
                <RadioTower className="h-4 w-4" />
              </div>
              <Link
                href="/dashboard"
                className="hidden rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs font-bold text-slate-300 hover:border-emerald-500/25 hover:bg-emerald-500/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 transition-all sm:inline-flex"
              >
                Open Dashboard
              </Link>
              <form action={logoutAction} className="lg:hidden">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:border-slate-700 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 transition-colors cursor-pointer border border-white/[0.06] sm:px-4"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sm:hidden">Out</span>
                </button>
              </form>
            </div>
          </div>
          <MobileNav />
        </header>

        {/* Page Content */}
        <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
