"use client";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: string;
  duration: string;
  delay: string;
  size: string;
}

export default function FloatingParticles({ count = 8 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left:     `${10 + (i / count) * 82}%`,
        duration: `${8 + (i % 5) * 2}s`,
        delay:    `${(i * 1.3) % 10}s`,
        size:     `${20 + (i % 3) * 10}px`,
      }))
    );
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <img
          key={p.id}
          src="/cultural/lotus.svg"
          alt=""
          className="lotus-particle absolute opacity-40"
          style={{
            left:             p.left,
            bottom:           "-10%",
            width:            p.size,
            height:           p.size,
            animationDuration: p.duration,
            animationDelay:   p.delay,
          }}
        />
      ))}
    </div>
  );
}
