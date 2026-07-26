"use client";
import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only on pointer-fine (mouse) devices
    if (!window.matchMedia("(pointer: fine)").matches) return;

    setActive(true);

    // Inject cursor: none on all elements
    const style = document.createElement("style");
    style.id = "custom-cursor-style";
    style.textContent = "*, *::before, *::after { cursor: none !important; }";
    document.head.appendChild(style);

    let rafId: number;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const el = e.target as Element | null;
      setHovered(!!el?.closest("a, button, [role='button'], input, select, textarea, label"));
    };

    const tick = () => {
      // Dot snaps immediately
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
      }
      // Ring lerps behind
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      document.getElementById("custom-cursor-style")?.remove();
    };
  }, []);

  if (!active) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        aria-hidden
        className={`pointer-events-none fixed top-0 left-0 z-[9999] will-change-transform rounded-full transition-all duration-150 ${
          hovered
            ? "w-3 h-3 bg-[var(--gold-400)] -mt-0.5 -ml-0.5"
            : "w-2 h-2 bg-[var(--crimson-800)]"
        }`}
      />
      {/* Trailing ring */}
      <div
        ref={ringRef}
        aria-hidden
        className={`pointer-events-none fixed top-0 left-0 z-[9998] will-change-transform rounded-full border-2 transition-all duration-300 ${
          hovered
            ? "w-12 h-12 border-[var(--crimson-800)] opacity-40 scale-110"
            : "w-10 h-10 border-[var(--gold-500)] opacity-50"
        }`}
      />
    </>
  );
}
