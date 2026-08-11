"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { RigidBodyType } from "@dimforge/rapier3d-compat";

/** Mutable scratch objects for the drag gesture — a ref, not memoized state, since these are
 *  written from pointer handlers/effects (outside render), never read for render output. */
function createScratch() {
  return {
    raycaster: new THREE.Raycaster(),
    pointerNdc: new THREE.Vector2(),
    plane: new THREE.Plane(),
    planeNormal: new THREE.Vector3(),
    dragPoint: new THREE.Vector3(),
    grabOffset: new THREE.Vector3(),
    targetPoint: new THREE.Vector3(),
    prevPoint: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    lastMoveTime: 0,
  };
}

/**
 * Drives the card's grab/drag/release lifecycle directly against its Rapier rigid body:
 * pointer-down flips it to a kinematic body the pointer can push around; pointer-move raycasts
 * onto a plane at the card's current depth so it tracks the cursor/finger in 3D; pointer-up hands
 * the last frame's velocity back to the (now dynamic-again) body so the release keeps momentum —
 * gravity, the rope joints, and their damping take it from there.
 *
 * Window-level listeners (not R3F's per-mesh pointer props) are used for move/up so the drag keeps
 * tracking even once the pointer moves off the card's small hit area mid-swing.
 */
export default function useBadgeDrag(
  cardRef: RefObject<RapierRigidBody | null>,
  onDragStart?: () => void
) {
  const { camera, gl } = useThree();
  const [dragging, setDragging] = useState(false);
  const scratch = useRef(createScratch());

  const updatePointerNdc = useCallback(
    (clientX: number, clientY: number) => {
      const s = scratch.current;
      const rect = gl.domElement.getBoundingClientRect();
      s.pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      s.pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    },
    [gl]
  );

  const raycastToPlane = useCallback(() => {
    const s = scratch.current;
    s.raycaster.setFromCamera(s.pointerNdc, camera);
    s.raycaster.ray.intersectPlane(s.plane, s.dragPoint);
  }, [camera]);

  const onPointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const body = cardRef.current;
      if (!body) return;
      event.stopPropagation();
      const s = scratch.current;

      const t = body.translation();
      camera.getWorldDirection(s.planeNormal);
      s.plane.setFromNormalAndCoplanarPoint(s.planeNormal, new THREE.Vector3(t.x, t.y, t.z));

      updatePointerNdc(event.nativeEvent.clientX, event.nativeEvent.clientY);
      raycastToPlane();
      s.grabOffset.set(t.x - s.dragPoint.x, t.y - s.dragPoint.y, t.z - s.dragPoint.z);
      s.prevPoint.set(t.x, t.y, t.z);
      s.velocity.set(0, 0, 0);
      s.lastMoveTime = performance.now();

      body.setBodyType(RigidBodyType.KinematicPositionBased, true);
      setDragging(true);
      onDragStart?.();
    },
    [cardRef, camera, updatePointerNdc, raycastToPlane, onDragStart]
  );

  useEffect(() => {
    if (!dragging) return;
    const s = scratch.current;

    const handleMove = (event: PointerEvent) => {
      const body = cardRef.current;
      if (!body) return;

      const now = performance.now();
      const dt = Math.max((now - s.lastMoveTime) / 1000, 1 / 120);
      s.lastMoveTime = now;

      updatePointerNdc(event.clientX, event.clientY);
      raycastToPlane();
      s.targetPoint.copy(s.dragPoint).add(s.grabOffset);

      s.velocity
        .set(s.targetPoint.x - s.prevPoint.x, s.targetPoint.y - s.prevPoint.y, s.targetPoint.z - s.prevPoint.z)
        .divideScalar(dt);
      s.prevPoint.copy(s.targetPoint);

      body.setNextKinematicTranslation({ x: s.targetPoint.x, y: s.targetPoint.y, z: s.targetPoint.z });
    };

    const handleUp = () => {
      const body = cardRef.current;
      if (body) {
        body.setBodyType(RigidBodyType.Dynamic, true);
        // Cap release speed so a fast flick can't fling the card off-screen.
        const maxSpeed = 6;
        const speed = s.velocity.length();
        if (speed > maxSpeed) s.velocity.multiplyScalar(maxSpeed / speed);
        body.setLinvel({ x: s.velocity.x, y: s.velocity.y, z: s.velocity.z }, true);
      }
      setDragging(false);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [dragging, cardRef, updatePointerNdc, raycastToPlane]);

  return { dragging, onPointerDown };
}
