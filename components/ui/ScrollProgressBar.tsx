"use client";
import { useEffect, useRef } from "react";

export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      if (barRef.current) barRef.current.style.width = `${pct}%`;
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[150] h-[3px] bg-transparent pointer-events-none"
    >
      <div
        ref={barRef}
        style={{ width: "0%" }}
        className="h-full will-change-[width] transition-[width] duration-75 bg-gradient-to-r from-[var(--primary-800)] via-[var(--accent-500)] to-[var(--accent-300)]"
      />
    </div>
  );
}
