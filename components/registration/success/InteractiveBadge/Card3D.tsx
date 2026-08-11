"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { RoundedBox, Text, useTexture } from "@react-three/drei";
import type { RapierRigidBody } from "@react-three/rapier";
import usePhotoTexture from "./usePhotoTexture";
import useBadgeDrag from "./useBadgeDrag";
import { CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH } from "./constants";
import type { BadgeData } from "../types";

interface Props {
  badge: BadgeData;
  cardRef: RefObject<RapierRigidBody | null>;
  onDragChange?: (dragging: boolean) => void;
}

const TEXT_COLOR = "#1A1A2E";
const MUTED_COLOR = "#5D4037";
const CRIMSON = "#8B1A1A";
const GOLD = "#D4AF37";

export default function Card3D({ badge, cardRef, onDragChange }: Props) {
  const { fullName, designation, institution, registrationCode, photoUrl, confirmed } = badge;
  const photoTexture = usePhotoTexture(photoUrl, fullName);
  const logoTexture = useTexture("/logo/APTICON_LOGO.png");
  const { dragging, onPointerDown } = useBadgeDrag(cardRef, () => onDragChange?.(true));
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!dragging) onDragChange?.(false);
  }, [dragging, onDragChange]);

  return (
    <group
      ref={groupRef}
      scale={hovered ? 1.03 : 1}
      onPointerDown={onPointerDown}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "grab";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Attachment hole + clip, purely decorative */}
      <mesh position={[0, CARD_HEIGHT / 2 + 0.05, 0]}>
        <boxGeometry args={[0.22, 0.1, 0.05]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, CARD_HEIGHT / 2 - 0.08, CARD_DEPTH / 2 + 0.001]}>
        <ringGeometry args={[0.05, 0.08, 24]} />
        <meshStandardMaterial color="#2a2a2a" side={THREE.DoubleSide} />
      </mesh>

      {/* Card body */}
      <RoundedBox args={[CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH]} radius={0.07} smoothness={4}>
        <meshPhysicalMaterial
          color="#FFFDF5"
          roughness={0.28}
          clearcoat={1}
          clearcoatRoughness={0.15}
          reflectivity={0.5}
          metalness={0.02}
        />
      </RoundedBox>

      {/* Header band */}
      <mesh position={[0, CARD_HEIGHT / 2 - 0.22, CARD_DEPTH / 2 + 0.002]}>
        <planeGeometry args={[CARD_WIDTH * 0.94, 0.34]} />
        <meshBasicMaterial color={CRIMSON} />
      </mesh>
      <mesh position={[0, CARD_HEIGHT / 2 - 0.22, CARD_DEPTH / 2 + 0.003]}>
        <planeGeometry args={[0.62, 0.2]} />
        <meshBasicMaterial map={logoTexture} transparent />
      </mesh>

      {/* Photo */}
      <mesh position={[0, CARD_HEIGHT / 2 - 0.62, CARD_DEPTH / 2 + 0.002]}>
        <ringGeometry args={[0.24, 0.27, 32]} />
        <meshBasicMaterial color={GOLD} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, CARD_HEIGHT / 2 - 0.62, CARD_DEPTH / 2 + 0.003]}>
        <circleGeometry args={[0.24, 32]} />
        <meshBasicMaterial map={photoTexture} />
      </mesh>

      <Text
        position={[0, -0.1, CARD_DEPTH / 2 + 0.003]}
        fontSize={0.11}
        maxWidth={CARD_WIDTH * 0.85}
        textAlign="center"
        color={CRIMSON}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {fullName}
      </Text>
      <Text
        position={[0, -0.24, CARD_DEPTH / 2 + 0.003]}
        fontSize={0.065}
        maxWidth={CARD_WIDTH * 0.85}
        textAlign="center"
        color={MUTED_COLOR}
        anchorX="center"
        anchorY="middle"
      >
        {designation}
      </Text>
      <Text
        position={[0, -0.36, CARD_DEPTH / 2 + 0.003]}
        fontSize={0.055}
        maxWidth={CARD_WIDTH * 0.88}
        textAlign="center"
        color={MUTED_COLOR}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {institution}
      </Text>

      <mesh position={[0, -0.5, CARD_DEPTH / 2 + 0.002]}>
        <planeGeometry args={[CARD_WIDTH * 0.78, 0.005]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.5} />
      </mesh>

      <Text
        position={[0, -0.6, CARD_DEPTH / 2 + 0.003]}
        fontSize={0.075}
        color={TEXT_COLOR}
        anchorX="center"
        anchorY="middle"
      >
        {registrationCode}
      </Text>

      <mesh position={[0, -0.735, CARD_DEPTH / 2 + 0.002]}>
        <planeGeometry args={[CARD_WIDTH * 0.72, 0.15]} />
        <meshBasicMaterial color={confirmed ? "#a7f3d0" : "#fde68a"} />
      </mesh>
      <Text
        position={[0, -0.735, CARD_DEPTH / 2 + 0.003]}
        fontSize={0.05}
        color={confirmed ? "#065f46" : "#92400e"}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {confirmed ? "REGISTRATION CONFIRMED" : "PAYMENT PROCESSING"}
      </Text>
    </group>
  );
}
