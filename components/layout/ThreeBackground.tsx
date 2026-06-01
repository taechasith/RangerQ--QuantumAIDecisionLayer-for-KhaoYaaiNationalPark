"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x09090b, 0.007);

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.set(0, 75, 200);
    camera.lookAt(0, 0, 0);

    // 2. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Create Circular Particle Texture
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    // 4. Geometry Generation (3D Wave Grid)
    const cols = 80;
    const rows = 80;
    const spacing = 7;
    const count = cols * rows;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const color1 = new THREE.Color(0x10b981); // Emerald green
    const color2 = new THREE.Color(0x6366f1); // Indigo
    const color3 = new THREE.Color(0x06b6d4); // Cyan

    let index = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        // Center the grid around origin
        const x = (i - cols / 2) * spacing;
        const z = (j - rows / 2) * spacing;
        const y = 0;

        positions[index * 3] = x;
        positions[index * 3 + 1] = y;
        positions[index * 3 + 2] = z;

        // Colors blending based on distance from center
        const dist = Math.sqrt(x * x + z * z);
        const maxDist = (cols / 2) * spacing;
        const ratio = dist / maxDist;

        let mixColor;
        if (ratio < 0.4) {
          mixColor = color1.clone().lerp(color3, ratio * 2.5);
        } else {
          mixColor = color3.clone().lerp(color2, (ratio - 0.4) * 1.6);
        }

        colors[index * 3] = mixColor.r;
        colors[index * 3 + 1] = mixColor.g;
        colors[index * 3 + 2] = mixColor.b;

        index++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // 5. Materials & Points Mesh
    const material = new THREE.PointsMaterial({
      size: 3.5,
      map: particleTexture,
      transparent: true,
      depthWrite: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.55,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 6. Interaction Listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    // 7. Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime() * 0.45;
      const positionAttr = geometry.getAttribute("position") as THREE.BufferAttribute;

      // Deform Y heights using complex sin/cos waves (spatiotemporal wave terrain)
      let idx = 0;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = positionAttr.getX(idx);
          const z = positionAttr.getZ(idx);

          // Combination waves representing fluid decisions terrain
          const y =
            Math.sin(x * 0.015 + time) * Math.cos(z * 0.015 + time) * 16 +
            Math.sin(x * 0.03 - time * 0.5) * 8 +
            Math.cos((x + z) * 0.01 + time) * 6;

          positionAttr.setY(idx, y);
          idx++;
        }
      }
      positionAttr.needsUpdate = true;

      // Parallax camera movement following mouse coordinates
      target.current.x += (mouse.current.x - target.current.x) * 0.05;
      target.current.y += (mouse.current.y - target.current.y) * 0.05;

      camera.position.x = target.current.x * 60;
      camera.position.y = 75 + (target.current.y * 25);
      camera.lookAt(0, 0, 0);

      // Rotate grid slowly
      particles.rotation.y = time * 0.06;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Component Unmount Disposal
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 mix-blend-screen"
      style={{ minHeight: "100vh" }}
    />
  );
}
