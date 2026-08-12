"use client";
import { Canvas } from "@react-three/fiber";
import PhysicsLanyard from "./PhysicsLanyard";
import type { BadgeData } from "../types";

interface Props {
  badge: BadgeData;
  onDragStart?: () => void;
}

/**
 * The Canvas boundary. `touch-none` on the wrapper (not the page) is what stops mobile drags on
 * the badge from also scrolling the page underneath it.
 */
export default function BadgeScene({ badge, onDragStart }: Props) {
  return (
    <div
      className="mx-auto h-[420px] w-[280px] touch-none sm:h-[480px] sm:w-[320px] md:h-[540px] md:w-[360px]"
      style={{ touchAction: "none" }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 1, 5.5], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 4, 4]} intensity={1.1} />
        <directionalLight position={[-3, 2, 2]} intensity={0.4} />
        <pointLight position={[0, 1, 3]} intensity={0.5} distance={8} />
        <PhysicsLanyard badge={badge} onDragStart={onDragStart} />
      </Canvas>
    </div>
  );
}
