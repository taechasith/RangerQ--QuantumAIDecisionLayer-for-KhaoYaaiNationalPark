"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Activity,
  ArrowUpRight,
  Cpu,
  Flame,
  Map,
  RadioTower,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { DecisionCube } from "@/components/layout/DecisionCube";
import { ThreeBackground } from "@/components/layout/ThreeBackground";

const loadingSteps = [
  "Initializing RangerQ Digital Twin...",
  "Establishing secure satellite uplink...",
  "Syncing NASA FIRMS fire anomaly indicators...",
  "Loading Khao Yai wildlife corridor sensors...",
  "Connecting qBraid quantum solvers...",
  "System fully operational."
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Loading simulation
  useEffect(() => {
    if (!loading) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1.25;
        if (next >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setLoading(false), 300);
          return 100;
        }
        return next;
      });
    }, 20);

    return () => clearInterval(progressInterval);
  }, [loading]);

  const loadingText = loadingSteps[
    Math.min(Math.floor((progress / 100) * loadingSteps.length), loadingSteps.length - 1)
  ];

  return (
    <>
      {/* First-time entry loader */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060a0d] p-6 selection:bg-transparent">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
          <div className="absolute h-[320px] w-[320px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
          
          <div className="relative text-center space-y-6 max-w-sm w-full">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-500/20 bg-[#081014] p-2.5 shadow-xl shadow-emerald-950/20 animate-pulse">
              <Image src="/RengerQ_logo.png" alt="RangerQ Logo" width={48} height={48} className="h-12 w-auto object-contain animate-bounce [animation-duration:2.5s]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-mono text-lg font-black tracking-wider uppercase text-white">RangerQ Engine</h2>
              <p className="telemetry-label h-4 text-[10px] font-bold text-slate-500">
                {loadingText}
              </p>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full border border-white/[0.06] bg-slate-950">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-75 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] font-mono text-emerald-400/80 font-bold">
              {Math.round(progress)}%
            </p>
          </div>
        </div>
      )}

      {/* Main landing page */}
      <div className={`relative min-h-screen overflow-hidden bg-[#060a0d] text-slate-100 selection:bg-emerald-500 selection:text-black font-sans ${loading ? "opacity-0" : "opacity-100 transition-opacity duration-500"}`}>
        <ThreeBackground />

        {/* Header */}
        <header className="relative z-10 border-b border-white/[0.04] bg-[#060a0d]/72 backdrop-blur-xl animate-fade-in">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-500/25 bg-gradient-to-tr from-emerald-500/15 to-cyan-500/10 shadow-lg shadow-emerald-950/20">
                <Image src="/RengerQ_logo.png" alt="RangerQ Logo" width={36} height={36} className="h-8 w-auto object-contain" />
              </span>
              <div>
                <span className="font-mono text-sm font-black tracking-wider text-white leading-none">Ranger<span className="text-emerald-400">Q</span></span>
                <span className="ml-2 rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-emerald-300">Khao Yai</span>
                <span className="telemetry-label block text-[9px] font-bold text-slate-500">Q-Forest Twin</span>
              </div>
            </div>
            <nav className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-2 text-[10px] font-bold text-emerald-400 sm:flex">
                <RadioTower className="h-3.5 w-3.5" />
                Live Demo
              </div>
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 text-xs font-bold text-slate-200 transition-all hover:border-emerald-500/25 hover:bg-emerald-500/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 cursor-pointer"
              >
                Open Twin
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6 sm:pt-14 lg:pb-20">
          <div className="grid min-h-[calc(100vh-88px)] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            {/* Left Column: Text & CTAs */}
            <div className="space-y-6 text-center lg:text-left animate-slide-up delay-75">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 lg:mx-0">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Version 2.4 - Quantum Solver Enabled
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[0.98]">
                RangerQ <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Forest Command Twin
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base lg:mx-0">
                Real-time ecological risk intelligence for fire prevention, wildlife conflict monitoring, and ranger patrol route optimization across Khao Yai National Park.
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatusChip icon={Flame} label="NASA FIRMS" value="Hotspots" tone="amber" />
                <StatusChip icon={Activity} label="Open-Meteo" value="Weather" tone="cyan" />
                <StatusChip icon={Cpu} label="qBraid" value="Solver" tone="emerald" />
              </div>

              <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row lg:justify-start">
                <Link
                  href="/dashboard"
                  className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 text-sm font-black uppercase tracking-wide text-slate-950 shadow-lg shadow-emerald-950/50 transition-all duration-300 hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 cursor-pointer sm:w-auto"
                >
                  Open RangerQ Platform
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftaechasith%2FRangerQ--QuantumAIDecisionLayer-for-KhaoYaaiNationalPark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-6 text-sm font-bold text-slate-300 transition-all duration-300 hover:border-cyan-500/25 hover:bg-cyan-500/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 sm:w-auto"
                >
                  Deploy Now
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Right Column: Interactive Scrollable 3D Decision Cube */}
            <div className="relative animate-fade-in delay-150">
              <div className="console-panel rounded-2xl p-4 sm:p-5">
                <div className="relative flex items-center justify-between border-b border-white/[0.04] pb-3">
                  <div>
                    <p className="telemetry-label text-[10px] font-bold text-slate-500">Command Model</p>
                    <h2 className="mt-1 font-mono text-base font-bold text-white">Quantum Decision Core</h2>
                  </div>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">Live Link</span>
                </div>
                <div className="relative flex min-h-[300px] items-center justify-center sm:min-h-[390px]">
                  <div className="absolute inset-6 rounded-full border border-emerald-500/10" />
                  <div className="absolute inset-14 rounded-full border border-cyan-500/10" />
                  <DecisionCube />
                </div>
                <div className="relative grid gap-2 border-t border-white/[0.04] pt-3 sm:grid-cols-3">
                  <MiniMetric label="Zones" value="20" />
                  <MiniMetric label="Risk Runs" value="Live" />
                  <MiniMetric label="Mode" value="Hybrid" />
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up delay-200">
            <FeatureCard icon={Map} title="Risk Map" badge="MapLibre" detail="Interactive park sectors, trails, boundaries, water sources, and ranger station overlays." tone="emerald" />
            <FeatureCard icon={Flame} title="Fire Intelligence" badge="FIRMS" detail="Satellite hotspot context folded into field-ready fire risk scoring." tone="amber" />
            <FeatureCard icon={ShieldAlert} title="Wildlife Conflict" badge="Camera AI" detail="Camera trap and corridor signals translated into patrol priorities." tone="rose" />
            <FeatureCard icon={Cpu} title="Patrol Optimization" badge="qBraid" detail="Hybrid routing constraints for ranger team allocation and sector coverage." tone="cyan" />
          </div>
        </main>

        <section className="relative z-10 border-y border-white/[0.04] bg-[#04070a]/82 px-4 py-8 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="telemetry-label text-[10px] font-bold text-slate-500">Live Data Stack</p>
              <h2 className="mt-1 font-mono text-lg font-bold text-white">Satellite, weather, biodiversity, and quantum backends in one workflow.</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Partner label="NASA FIRMS" tone="rose" />
              <Partner label="Open-Meteo" tone="cyan" />
              <Partner label="GBIF" tone="emerald" />
              <Partner label="qBraid" tone="cyan" />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 bg-[#060a0d] py-8 animate-fade-in">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center text-xs text-slate-500 sm:px-6 md:flex-row md:text-left">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>RangerQ Protected Area Planner - Khao Yai National Park</span>
            </div>
            <div>
              &copy; {new Date().getFullYear()} Q-Forest-Twin. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

type IconComponent = ComponentType<{ className?: string }>;

function StatusChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: IconComponent;
  label: string;
  value: string;
  tone: "emerald" | "amber" | "cyan";
}) {
  const tones = {
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  };

  return (
    <div className={`rounded-xl border p-3 text-left ${tones[tone]}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="telemetry-label text-[9px] font-bold text-current">{label}</span>
      </div>
      <p className="mt-2 font-mono text-sm font-black text-white">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.025] px-3 py-2">
      <p className="telemetry-label text-[9px] font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-sm font-black text-white">{value}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  badge,
  detail,
  tone,
}: {
  icon: IconComponent;
  title: string;
  badge: string;
  detail: string;
  tone: "emerald" | "amber" | "rose" | "cyan";
}) {
  const tones = {
    emerald: "text-emerald-300 border-emerald-500/20 bg-emerald-500/10",
    amber: "text-amber-300 border-amber-500/20 bg-amber-500/10",
    rose: "text-rose-300 border-rose-500/20 bg-rose-500/10",
    cyan: "text-cyan-300 border-cyan-500/20 bg-cyan-500/10",
  };

  return (
    <div className="console-panel group rounded-xl p-5 transition-all duration-300 hover:border-emerald-500/25">
      <div className="relative flex items-start justify-between gap-3">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className={`rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${tones[tone]}`}>{badge}</span>
      </div>
      <h3 className="relative mt-4 font-mono text-base font-bold text-white">{title}</h3>
      <p className="relative mt-2 text-xs leading-relaxed text-slate-400">{detail}</p>
    </div>
  );
}

function Partner({ label, tone }: { label: string; tone: "emerald" | "rose" | "cyan" }) {
  const tones = {
    emerald: "bg-emerald-400",
    rose: "bg-rose-400",
    cyan: "bg-cyan-400",
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.025] px-3 py-2">
      <span className={`h-2 w-2 rounded-full ${tones[tone]}`} />
      <span className="font-mono text-xs font-bold text-slate-300">{label}</span>
    </div>
  );
}
