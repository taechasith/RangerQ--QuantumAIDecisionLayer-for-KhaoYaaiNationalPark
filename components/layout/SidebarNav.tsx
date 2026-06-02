"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map, 
  Zap, 
  Upload, 
  FileText, 
  Settings,
  ChevronRight
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Interactive Map", icon: Map },
  { href: "/optimizer", label: "Patrol Planner", icon: Zap },
  { href: "/imports", label: "Import Data", icon: Upload },
  { href: "/reports", label: "Patrol Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="Primary navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-bold uppercase tracking-wide transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 cursor-pointer ${
              isActive
                ? "border-teal-500/30 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-teal-300 shadow shadow-teal-500/5"
                : "border-transparent text-slate-500 hover:bg-white/[0.025] hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`h-4 w-4 transition-colors ${
                isActive ? "text-teal-300" : "text-slate-600 group-hover:text-slate-300"
              }`} />
              <span>{item.label}</span>
            </div>
            <ChevronRight className={`h-3 w-3 opacity-0 -translate-x-1 transition-all ${
              isActive ? "opacity-100 translate-x-0 text-teal-300/70" : "group-hover:opacity-100 group-hover:translate-x-0 text-slate-600"
            }`} />
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 pt-1 lg:hidden" aria-label="Mobile primary navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 cursor-pointer sm:px-4 ${
              isActive
                ? "bg-teal-500/10 text-teal-300 border-teal-500/30"
                : "bg-white/[0.025] text-slate-500 border-white/[0.05] hover:bg-white/[0.04] hover:text-slate-200"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
