import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { logoutAction } from "@/app/actions";
import { getSession } from "@/lib/auth";
import { SidebarNav, MobileNav } from "./SidebarNav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_34%),#020617] text-zinc-100 selection:bg-emerald-500 selection:text-black font-sans">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-900/80 bg-zinc-950/95 px-4 py-6 shadow-2xl shadow-black/30 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-zinc-900/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 transition-colors">
          <Image src="/RengerQ_logo.png" alt="RangerQ Logo" width={36} height={36} className="h-8 w-auto object-contain" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">RangerQ</p>
            <p className="text-sm font-bold text-white leading-none mt-0.5">Q-Forest Twin</p>
          </div>
        </Link>
        <div className="mt-8">
          <SidebarNav />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-zinc-900/80 bg-zinc-950/88 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-white">Khao Yai Operations</p>
              <p className="mt-0.5 max-w-[46vw] truncate text-xs font-medium text-zinc-500 sm:max-w-none">{session.email}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/dashboard"
                className="hidden rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs font-bold text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 transition-all sm:inline-flex"
              >
                Open Dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-bold text-white hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 transition-colors cursor-pointer border border-zinc-800 sm:px-4"
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
