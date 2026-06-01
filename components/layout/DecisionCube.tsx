"use client";

import { useEffect, useRef, useState } from "react";
import { Trees, Zap, Map, ShieldAlert, Cpu, Activity, MousePointer2 } from "lucide-react";

export function DecisionCube() {
  const cubeRef = useRef<HTMLDivElement | null>(null);
  const [rotation, setRotation] = useState({ x: -20, y: 35 });
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Rotate on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setRotation(() => ({
        x: -20 - scrollY * 0.1,
        y: 35 + scrollY * 0.15,
      }));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    setRotation((prev) => ({
      x: prev.x - deltaY * 0.5,
      y: prev.y + deltaX * 0.5,
    }));

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Touch handlers for Mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    const touch = e.touches[0];
    previousMousePosition.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - previousMousePosition.current.x;
    const deltaY = touch.clientY - previousMousePosition.current.y;

    setRotation((prev) => ({
      x: prev.x - deltaY * 0.5,
      y: prev.y + deltaX * 0.5,
    }));

    previousMousePosition.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      {/* 3D Scene viewport */}
      <div 
        className="perspective-1000 flex h-[260px] w-[260px] touch-pan-y items-center justify-center cursor-grab select-none active:cursor-grabbing sm:h-[320px] sm:w-[320px] md:h-[340px] md:w-[340px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Cube container */}
        <div
          ref={cubeRef}
          className="preserve-3d relative h-44 w-44 transition-transform duration-100 ease-out [--cube-half:88px] sm:h-52 sm:w-52 sm:[--cube-half:104px] md:h-56 md:w-56 md:[--cube-half:112px]"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          }}
        >
          {/* Pulsing Quantum Core */}
          <div className="absolute inset-12 bg-emerald-500/10 rounded-full blur-2xl animate-pulse pointer-events-none" />
          <div className="absolute inset-16 bg-emerald-500/30 rounded-full border border-emerald-400/50 flex items-center justify-center animate-pulse preserve-3d">
            <Cpu className="h-6 w-6 text-emerald-400 animate-spin [animation-duration:12s]" />
          </div>

          {/* FRONT face: Digital Twin Map */}
          <div className="absolute inset-0 bg-zinc-950/90 border-2 border-emerald-500/30 text-white rounded-2xl flex flex-col justify-between p-5 backdrop-blur-md backface-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)] face-front">
            <div className="flex justify-between items-start">
              <Map className="h-5 w-5 text-emerald-400" />
              <span className="text-[9px] uppercase font-black text-emerald-400 tracking-wider">KY-Twin</span>
            </div>
            <div>
              <p className="text-xs font-black tracking-tight text-white leading-none">3D Visuals</p>
              <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed">MapLibre GL visualization engine & spatiotemporal boundaries.</p>
            </div>
          </div>

          {/* BACK face: qBraid Solver */}
          <div className="absolute inset-0 bg-zinc-950/90 border-2 border-indigo-500/30 text-white rounded-2xl flex flex-col justify-between p-5 backdrop-blur-md backface-hidden shadow-[0_0_20px_rgba(99,102,241,0.1)] face-back">
            <div className="flex justify-between items-start">
              <Zap className="h-5 w-5 text-indigo-400" />
              <span className="text-[9px] uppercase font-black text-indigo-400 tracking-wider">qBraid</span>
            </div>
            <div>
              <p className="text-xs font-black tracking-tight text-white leading-none">QUBO Core</p>
              <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed">Quantum D-Wave execution & classical local search solvers.</p>
            </div>
          </div>

          {/* RIGHT face: NASA FIRMS */}
          <div className="absolute inset-0 bg-zinc-950/90 border-2 border-red-500/30 text-white rounded-2xl flex flex-col justify-between p-5 backdrop-blur-md backface-hidden shadow-[0_0_20px_rgba(239,68,68,0.1)] face-right">
            <div className="flex justify-between items-start">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              <span className="text-[9px] uppercase font-black text-red-400 tracking-wider">FIRMS Sync</span>
            </div>
            <div>
              <p className="text-xs font-black tracking-tight text-white leading-none">Sat Fire Sync</p>
              <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed">NASA thermal sensor ingestion for near-real-time fire tracking.</p>
            </div>
          </div>

          {/* LEFT face: Wildlife Tracking */}
          <div className="absolute inset-0 bg-zinc-950/90 border-2 border-cyan-500/30 text-white rounded-2xl flex flex-col justify-between p-5 backdrop-blur-md backface-hidden shadow-[0_0_20px_rgba(6,182,212,0.1)] face-left">
            <div className="flex justify-between items-start">
              <Trees className="h-5 w-5 text-cyan-400" />
              <span className="text-[9px] uppercase font-black text-cyan-400 tracking-wider">Camera AI</span>
            </div>
            <div>
              <p className="text-xs font-black tracking-tight text-white leading-none">Fauna Grid</p>
              <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed">Camera trap records, animal corridors mapping & tracking.</p>
            </div>
          </div>

          {/* TOP face: Weather parameters */}
          <div className="absolute inset-0 bg-zinc-950/90 border-2 border-teal-500/30 text-white rounded-2xl flex flex-col justify-between p-5 backdrop-blur-md backface-hidden shadow-[0_0_20px_rgba(20,184,166,0.1)] face-top">
            <div className="flex justify-between items-start">
              <Activity className="h-5 w-5 text-teal-400" />
              <span className="text-[9px] uppercase font-black text-teal-400 tracking-wider">Meteo Ingest</span>
            </div>
            <div>
              <p className="text-xs font-black tracking-tight text-white leading-none">Atmosphere</p>
              <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed">Open-Meteo wind forecasts, air temperatures, and soil moisture.</p>
            </div>
          </div>

          {/* BOTTOM face: Patrol routing */}
          <div className="absolute inset-0 bg-zinc-950/90 border-2 border-amber-500/30 text-white rounded-2xl flex flex-col justify-between p-5 backdrop-blur-md backface-hidden shadow-[0_0_20px_rgba(245,158,11,0.1)] face-bottom">
            <div className="flex justify-between items-start">
              <Trees className="h-5 w-5 text-amber-400" />
              <span className="text-[9px] uppercase font-black text-amber-400 tracking-wider">Patrols</span>
            </div>
            <div>
              <p className="text-xs font-black tracking-tight text-white leading-none">Optimal Path</p>
              <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed">Optimal spatiotemporal path recommendations for rangers.</p>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500 select-none pointer-events-none">
        <MousePointer2 className="h-3 w-3" />
        <span>Drag to rotate / scroll page to spin</span>
      </p>
    </div>
  );
}
