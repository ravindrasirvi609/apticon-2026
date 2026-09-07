import type { Metadata } from "next";
import ScheduleClient from "./ScheduleClient";

export const metadata: Metadata = {
  title: "Program Schedule | APTICON 2026",
  description:
    "Full two-day program schedule for APTICON 2026, 24–25 October 2026, Raipur.",
};

export default function SchedulePage() {
  return <ScheduleClient />;
}
