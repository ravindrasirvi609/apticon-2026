import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery | APTICON 2026",
  description: "Photo gallery from APTICON 2026 and previous editions of the Annual National Convention.",
};

export default function GalleryPage() {
  return <GalleryClient />;
}
