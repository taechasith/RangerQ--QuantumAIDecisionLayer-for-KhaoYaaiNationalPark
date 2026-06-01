import Link from "next/link";
import { redirect } from "next/navigation";
import { Trees, LogOut } from "lucide-react";

import { logoutAction } from "@/app/actions";
import { getSession } from "@/lib/auth";
import { SidebarNav, MobileNav } from "./SidebarNav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-black font-sans">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-900 bg-zinc-950 px-4 py-6 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-zinc-900/50 transition-colors">
          <img src="/RengerQ_logo.png" alt="RangerQ Logo" className="h-8 w-auto object-contain" />
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
        <header className="sticky top-0 z-10 border-b border-zinc-900 bg-zinc-950/80 px-4 py-3.5 backdrop-blur-md sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold text-white">Khao Yai Operations</p>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">{session.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="hidden rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all sm:inline-flex"
              >
                Open Dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
          <MobileNav />
        </header>

        {/* Page Content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
