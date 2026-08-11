"use client";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

const INITIALS_BG = ["#8B1A1A", "#6B0F0F"];

function drawInitialsCanvas(name: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 256, 256);
  gradient.addColorStop(0, INITIALS_BG[0]);
  gradient.addColorStop(1, INITIALS_BG[1]);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(128, 128, 128, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFDE7";
  ctx.font = "bold 120px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((name.trim().charAt(0) || "?").toUpperCase(), 128, 138);
  return canvas;
}

interface LoadedPhoto {
  url: string;
  texture: THREE.Texture;
}

/**
 * Always resolves to a local initials texture by default (drawn synchronously, so it can never
 * fail). If a photoUrl is provided, an effect swaps in the real photo once it loads; a load/CORS
 * failure just leaves the initials texture in place. The loaded photo is tagged with the url it
 * came from so a photoUrl change can't briefly show the previous person's photo while the new one
 * is still loading.
 */
export default function usePhotoTexture(photoUrl: string, name: string): THREE.Texture {
  const initialsTexture = useMemo(() => {
    const tex = new THREE.CanvasTexture(drawInitialsCanvas(name));
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [name]);

  const [loadedPhoto, setLoadedPhoto] = useState<LoadedPhoto | null>(null);

  useEffect(() => {
    if (!photoUrl) return;
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      photoUrl,
      (loaded) => {
        if (cancelled) return;
        loaded.colorSpace = THREE.SRGBColorSpace;
        setLoadedPhoto({ url: photoUrl, texture: loaded });
      },
      undefined,
      () => {
        /* keep the initials texture already in place */
      }
    );
    return () => {
      cancelled = true;
    };
  }, [photoUrl]);

  return loadedPhoto && loadedPhoto.url === photoUrl ? loadedPhoto.texture : initialsTexture;
}
