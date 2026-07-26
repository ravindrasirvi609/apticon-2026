"use client";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#ffffff",
          border: "1px solid rgba(212,175,55,0.3)",
          color: "#1A1A2E",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        },
      }}
    />
  );
}
