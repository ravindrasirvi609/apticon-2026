"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { RigidBodyType } from "@dimforge/rapier3d-compat";

/**
 * How much of the raw pointer-on-plane movement actually carries over to the card. Raycasting the
 * literal cursor position onto the drag plane is "correct" but, at the scale this scene is
 * framed, makes the badge cross the whole rig for a small mouse move — a heavier, damped badge
 * reads as more physical (and more like something on the end of a lanyard) than one that snaps
 * exactly to the cursor.
 */
const DRAG_GAIN = 0.45;

/** Mutable scratch objects for the drag gesture — a ref, not memoized state, since these are
 *  written from pointer handlers/effects (outside render), never read for render output. */
function createScratch() {
  return {
    raycaster: new THREE.Raycaster(),
    pointerNdc: new THREE.Vector2(),
    plane: new THREE.Plane(),
    planeNormal: new THREE.Vector3(),
    dragPoint: new THREE.Vector3(),
    dragStartHit: new THREE.Vector3(),
    dragStartWorld: new THREE.Vector3(),
    delta: new THREE.Vector3(),
    targetPoint: new THREE.Vector3(),
    prevPoint: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    lastMoveTime: 0,
  };
}

/**
 * Drives the card's grab/drag/release lifecycle directly against its Rapier rigid body:
 * pointer-down flips it to a kinematic body the pointer can push around; pointer-move raycasts
 * onto a plane at the card's current depth and moves the card by a damped fraction of that
 * movement (see DRAG_GAIN); pointer-up hands the last frame's velocity back to the (now
 * dynamic-again) body so the release keeps momentum — gravity, the rope joints, and their damping
 * take it from there.
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
      s.dragStartWorld.set(t.x, t.y, t.z);
      camera.getWorldDirection(s.planeNormal);
      s.plane.setFromNormalAndCoplanarPoint(s.planeNormal, s.dragStartWorld);

      updatePointerNdc(event.nativeEvent.clientX, event.nativeEvent.clientY);
      raycastToPlane();
      s.dragStartHit.copy(s.dragPoint);
      s.prevPoint.copy(s.dragStartWorld);
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
      s.delta.subVectors(s.dragPoint, s.dragStartHit).multiplyScalar(DRAG_GAIN);
      s.targetPoint.copy(s.dragStartWorld).add(s.delta);

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
