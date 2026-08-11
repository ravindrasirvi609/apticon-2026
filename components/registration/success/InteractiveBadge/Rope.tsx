"use client";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { extend, useFrame, useThree, type ThreeElement } from "@react-three/fiber";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import type { RapierRigidBody } from "@react-three/rapier";
import { ROPE_COLOR, ROPE_WIDTH } from "./constants";

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

interface Props {
  bodyRefs: RefObject<RapierRigidBody | null>[];
}

/**
 * Reads the live position of every joint body (anchor -> rope segments -> card) each frame and
 * feeds a smoothed Catmull-Rom curve into a meshline tube, so the lanyard visibly reacts to the
 * simulation instead of being a static asset.
 */
export default function Rope({ bodyRefs }: Props) {
  const geometryRef = useRef<MeshLineGeometry>(null);
  const { size } = useThree();
  const points = useMemo(() => bodyRefs.map(() => new THREE.Vector3()), [bodyRefs]);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const resolution = useMemo(() => new THREE.Vector2(size.width, size.height), [size]);

  useFrame(() => {
    let ready = true;
    bodyRefs.forEach((ref, i) => {
      const body = ref.current;
      if (!body) {
        ready = false;
        return;
      }
      const t = body.translation();
      points[i].set(t.x, t.y, t.z);
    });
    if (!ready || !geometryRef.current) return;
    geometryRef.current.setPoints(curve.getPoints(32));
  });

  return (
    <mesh>
      <meshLineGeometry ref={geometryRef} />
      <meshLineMaterial args={[{ resolution }]} lineWidth={ROPE_WIDTH} color={ROPE_COLOR} sizeAttenuation={1} />
    </mesh>
  );
}
