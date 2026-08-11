"use client";
import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Physics, RigidBody, useRopeJoint, useSphericalJoint, type RapierRigidBody } from "@react-three/rapier";
import Card3D from "./Card3D";
import Rope from "./Rope";
import { ANCHOR_POSITION, CARD_HEIGHT, SEGMENT_LENGTH } from "./constants";
import type { BadgeData } from "../types";

interface Props {
  badge: BadgeData;
  onDragStart?: () => void;
}

const [ax, ay, az] = ANCHOR_POSITION;
const half = SEGMENT_LENGTH / 2;
const cardHalf = CARD_HEIGHT / 2;

/**
 * Idle "hanging in still air" motion: a tiny, never-quite-settling breeze on the card.
 * Reads `draggingRef` live inside the frame loop (not as a snapshotted prop) since LanyardRig
 * itself never re-renders while dragging — only the ref value changes.
 */
function IdleBreeze({
  cardRef,
  draggingRef,
}: {
  cardRef: RefObject<RapierRigidBody | null>;
  draggingRef: RefObject<boolean>;
}) {
  useFrame((state) => {
    if (draggingRef.current) return;
    const body = cardRef.current;
    if (!body) return;
    const t = state.clock.elapsedTime;
    body.addForce({ x: Math.sin(t * 0.4) * 0.012, y: 0, z: Math.cos(t * 0.27) * 0.01 }, true);
  });
  return null;
}

/**
 * The anchor/rope/card rig. This has to be a *child* of <Physics> (not a sibling that merely
 * renders one) — useRopeJoint/useSphericalJoint read the Physics world via context, which only
 * exists for components mounted inside the provider, not for the component that renders it.
 */
function LanyardRig({ badge, onDragStart }: Props) {
  const anchor = useRef<RapierRigidBody>(null);
  const j0 = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);
  const draggingRef = useRef(false);

  // Rapier's joint hooks type their refs as non-nullable, but refs necessarily start out null
  // before the first render commits — this cast is the standard workaround for that mismatch.
  useRopeJoint(anchor as RefObject<RapierRigidBody>, j0 as RefObject<RapierRigidBody>, [[0, 0, 0], [0, half, 0], SEGMENT_LENGTH]);
  useRopeJoint(j0 as RefObject<RapierRigidBody>, j1 as RefObject<RapierRigidBody>, [[0, -half, 0], [0, half, 0], SEGMENT_LENGTH]);
  useRopeJoint(j1 as RefObject<RapierRigidBody>, j2 as RefObject<RapierRigidBody>, [[0, -half, 0], [0, half, 0], SEGMENT_LENGTH]);
  useRopeJoint(j2 as RefObject<RapierRigidBody>, j3 as RefObject<RapierRigidBody>, [[0, -half, 0], [0, half, 0], SEGMENT_LENGTH]);
  useSphericalJoint(j3 as RefObject<RapierRigidBody>, card as RefObject<RapierRigidBody>, [[0, -half, 0], [0, cardHalf, 0]]);

  const handleDragChange = (dragging: boolean) => {
    const wasDragging = draggingRef.current;
    draggingRef.current = dragging;
    if (dragging && !wasDragging) onDragStart?.();
  };

  return (
    <>
      <RigidBody ref={anchor} type="fixed" position={ANCHOR_POSITION} colliders={false} />
      <RigidBody
        ref={j0}
        type="dynamic"
        position={[ax, ay - SEGMENT_LENGTH, az]}
        colliders={false}
        linearDamping={2.5}
        angularDamping={2}
        canSleep={false}
      />
      <RigidBody
        ref={j1}
        type="dynamic"
        position={[ax, ay - SEGMENT_LENGTH * 2, az]}
        colliders={false}
        linearDamping={2.5}
        angularDamping={2}
        canSleep={false}
      />
      <RigidBody
        ref={j2}
        type="dynamic"
        position={[ax, ay - SEGMENT_LENGTH * 3, az]}
        colliders={false}
        linearDamping={2.5}
        angularDamping={2}
        canSleep={false}
      />
      <RigidBody
        ref={j3}
        type="dynamic"
        position={[ax, ay - SEGMENT_LENGTH * 4, az]}
        colliders={false}
        linearDamping={2.5}
        angularDamping={2}
        canSleep={false}
      />
      <RigidBody
        ref={card}
        type="dynamic"
        position={[ax, ay - SEGMENT_LENGTH * 4 - cardHalf, az]}
        colliders="cuboid"
        mass={0.35}
        linearDamping={1.1}
        angularDamping={0.9}
        canSleep={false}
      >
        <Card3D badge={badge} cardRef={card} onDragChange={handleDragChange} />
      </RigidBody>
      <Rope bodyRefs={[anchor, j0, j1, j2, j3, card]} />
      <IdleBreeze cardRef={card} draggingRef={draggingRef} />
    </>
  );
}

export default function PhysicsLanyard({ badge, onDragStart }: Props) {
  return (
    <Physics gravity={[0, -22, 0]} interpolate>
      <LanyardRig badge={badge} onDragStart={onDragStart} />
    </Physics>
  );
}
