"use client";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#ffffff",
          border: "1px solid rgba(234,88,12,0.3)",
          color: "#0F172A",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        },
      }}
    />
  );
}
