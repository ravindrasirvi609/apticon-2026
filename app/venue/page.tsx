import type { Metadata } from "next";
import VenueClient from "./VenueClient";

export const metadata: Metadata = {
  title: "Venue & Travel | APTICON 2026",
  description: "Venue details, travel guide, and Raipur tourism information for APTICON 2026 at Pt. Deendayal Upadhyay Auditorium, G.E. Road, Raipur.",
};

export default function VenuePage() {
  return <VenueClient />;
}
