import Link from "next/link";
import { Trees, Map, Zap, ShieldAlert, ArrowRight, Shield, Cpu, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-black overflow-hidden font-sans">
      {/* Decorative Forest Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full bg-emerald-950/30 blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-lg shadow-emerald-900/30">
              <Trees className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">RangerQ</span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">Khao Yai</span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-zinc-200 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-24 sm:pt-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/50 bg-emerald-950/30 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Q Forest Twin
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
            Quantum-Assisted <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Decision Layer
            </span>
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Protecting Thailand's biodiversity through a real-time Spatiotemporal Digital Twin. 
            Formulating ranger patrol optimization as a QUBO model solved on the qBraid platform.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-500 hover:to-teal-400 hover:shadow-emerald-800/40 transition-all duration-300"
            >
              Open RangerQ
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 px-8 text-sm font-semibold text-zinc-350 hover:bg-zinc-900 hover:border-zinc-700 hover:text-white transition-all duration-300"
            >
              Deploy Now
            </a>
            <a
              href="https://github.com/taechasith/RangerQ--QuantumAIDecisionLayer-for-KhaoYaaiNationalPark"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-zinc-850 bg-zinc-950 px-6 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-all"
            >
              GitHub Code
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-emerald-800/40 hover:bg-zinc-900/40 transition-all duration-300">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-900/30 group-hover:bg-emerald-900 group-hover:text-emerald-200 transition-colors">
              <Map className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3D Digital Twin</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Interactive spatiotemporal MapLibre mapping of trails, forest boundaries, water sources, and ranger stations.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-teal-800/40 hover:bg-zinc-900/40 transition-all duration-300">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-950/50 text-teal-400 border border-teal-900/30 group-hover:bg-teal-900 group-hover:text-teal-200 transition-colors">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Source Sync</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Continuous live sync with NASA FIRMS active fire hotspots and Open-Meteo hyper-local weather parameters.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-cyan-800/40 hover:bg-zinc-900/40 transition-all duration-300">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950/50 text-cyan-400 border border-cyan-900/30 group-hover:bg-cyan-900 group-hover:text-cyan-200 transition-colors">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">QUBO Optimization</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Formulated routing constraints solved via classical heuristics or quantum solvers on the qBraid network.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-emerald-800/40 hover:bg-zinc-900/40 transition-all duration-300">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-900/30 group-hover:bg-emerald-900 group-hover:text-emerald-200 transition-colors">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Threat Assessment</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Consolidated fire risk and wildlife priority scoring, mapping urgent ecological actions in real-time.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950 py-10 mt-12">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
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
  );
}
