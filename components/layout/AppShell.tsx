import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/actions";
import { getSession } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/map", label: "Risk Map" },
  { href: "/optimizer", label: "Optimizer" },
  { href: "/imports", label: "Imports" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white px-4 py-5 lg:block">
        <Link href="/dashboard" className="block rounded-lg px-3 py-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">RangerQ</p>
          <p className="mt-1 text-lg font-semibold">Q-Forest Twin</p>
        </Link>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-950">Khao Yai Operations</p>
              <p className="text-xs text-zinc-500">{session.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="hidden rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 sm:inline-flex"
              >
                Open dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
