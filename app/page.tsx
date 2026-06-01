"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trees, ArrowRight, Shield, Cpu, Activity, Map, ShieldAlert } from "lucide-react";
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
  const [loadingText, setLoadingText] = useState(loadingSteps[0]);

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

  // Update loading text based on progress
  useEffect(() => {
    const stepIndex = Math.min(
      Math.floor((progress / 100) * loadingSteps.length),
      loadingSteps.length - 1
    );
    setLoadingText(loadingSteps[stepIndex]);
  }, [progress]);

  return (
    <>
      {/* 🚀 First-Time Entry Loader */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-6 selection:bg-transparent">
          {/* Ambient Loader Glow */}
          <div className="absolute w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
          
          <div className="relative text-center space-y-6 max-w-sm w-full">
            {/* Pulsing Core */}
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl shadow-emerald-950/20 mx-auto animate-pulse p-2.5">
              <img src="/RengerQ_logo.png" alt="RangerQ Logo" className="h-12 w-auto object-contain animate-bounce [animation-duration:2.5s]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-black tracking-wider uppercase text-white">RangerQ Engine</h2>
              <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-[0.15em] h-4">
                {loadingText}
              </p>
            </div>

            {/* Progress bar container */}
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-75 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] font-mono text-emerald-400/80 font-bold">
              {Math.round(progress)}%
            </p>
          </div>
        </div>
      )}

      {/* 🏠 Main Landing Page */}
      <div className={`relative min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-black overflow-hidden font-sans ${loading ? "opacity-0" : "opacity-100 transition-opacity duration-500"}`}>
        {/* Decorative Forest Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full bg-emerald-950/30 blur-[80px] pointer-events-none" />

        {/* 🌌 Dynamic Three.js Quantum Particle Background */}
        <ThreeBackground />

        {/* Header */}
        <header className="relative z-10 border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md animate-fade-in">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <img src="/RengerQ_logo.png" alt="RangerQ Logo" className="h-9 w-auto object-contain" />
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white leading-none">RangerQ</span>
                <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">Khao Yai</span>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 px-5 text-xs font-bold text-zinc-200 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-24 sm:pt-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            {/* Left Column: Text & CTAs */}
            <div className="space-y-6 text-center lg:text-left animate-slide-up delay-75">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/50 bg-emerald-950/30 px-3 py-1 text-xs font-medium text-emerald-400 mx-auto lg:mx-0">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Q-Forest Digital Twin
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-tight">
                Quantum-Assisted <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Decision Layer
                </span>
              </h1>

              <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Protecting Thailand's biodiversity through a real-time Spatiotemporal Digital Twin. 
                Formulating ranger patrol optimization as a QUBO model solved on the qBraid platform.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                <Link
                  href="/dashboard"
                  className="group inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 text-sm font-bold text-white shadow-lg shadow-emerald-950/50 hover:from-emerald-500 hover:to-teal-400 transition-all duration-300 cursor-pointer"
                >
                  Open RangerQ
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="https://github.com/taechasith/RangerQ--QuantumAIDecisionLayer-for-KhaoYaaiNationalPark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 px-6 text-sm font-bold text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all duration-300"
                >
                  GitHub Code
                </a>
              </div>
            </div>

            {/* Right Column: Interactive Scrollable 3D Decision Cube */}
            <div className="flex justify-center items-center animate-fade-in delay-150 relative">
              {/* Background circular radar layout behind cube */}
              <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(16,185,129,0.03)_0%,transparent_60%] pointer-events-none" />
              <DecisionCube />
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up delay-200">
            {/* Card 1 */}
            <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-emerald-500/30 hover:bg-zinc-900/40 transition-all duration-350 hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-900/30 group-hover:bg-emerald-900 group-hover:text-emerald-200 transition-colors">
                <Map className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">3D Digital Twin</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Interactive spatiotemporal MapLibre mapping of trails, forest boundaries, water sources, and ranger stations.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-teal-500/30 hover:bg-zinc-900/40 transition-all duration-350 hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-950/50 text-teal-400 border border-teal-900/30 group-hover:bg-teal-900 group-hover:text-teal-200 transition-colors">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Multi-Source Sync</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Continuous live sync with NASA FIRMS active fire hotspots and Open-Meteo hyper-local weather parameters.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-indigo-500/30 hover:bg-zinc-900/40 transition-all duration-350 hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950/50 text-indigo-400 border border-indigo-900/30 group-hover:bg-indigo-900 group-hover:text-indigo-200 transition-colors">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">QUBO Optimization</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Formulated routing constraints solved via classical heuristics or quantum solvers on the qBraid network.
              </p>
            </div>

            {/* Card 4 */}
            <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-emerald-500/30 hover:bg-zinc-900/40 transition-all duration-350 hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-900/30 group-hover:bg-emerald-900 group-hover:text-emerald-200 transition-colors">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Threat Assessment</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Consolidated fire risk and wildlife priority scoring, mapping urgent ecological actions in real-time.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950 py-10 mt-12 animate-fade-in">
          <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>RangerQ Protected Area Planner — Khao Yai National Park</span>
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
