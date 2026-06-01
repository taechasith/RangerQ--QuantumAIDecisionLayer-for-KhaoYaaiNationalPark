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
  { href: "/map", label: "Risk Map", icon: Map },
  { href: "/optimizer", label: "Optimizer", icon: Zap },
  { href: "/imports", label: "Imports", icon: Upload },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`h-4 w-4 transition-colors ${
                isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"
              }`} />
              <span>{item.label}</span>
            </div>
            <ChevronRight className={`h-3 w-3 opacity-0 -translate-x-1 transition-all ${
              isActive ? "opacity-100 translate-x-0 text-emerald-400/70" : "group-hover:opacity-100 group-hover:translate-x-0 text-zinc-600"
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
    <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden py-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all border cursor-pointer ${
              isActive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-zinc-900/40 text-zinc-400 border-zinc-900 hover:bg-zinc-900 hover:text-zinc-200"
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
