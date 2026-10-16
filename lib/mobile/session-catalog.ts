// Session catalog used to enforce when delegates may ask questions / leave feedback.
// Mirrors apticon-delegates/remote-data/schedule.json (same ids). If a session's TIME changes
// there, update it here too — ids are what link the two, times are enforced only on this side.

export type CatalogSessionType =
  | "inaugural"
  | "keynote"
  | "scientific"
  | "workshop"
  | "panel"
  | "cultural"
  | "valedictory"
  | "break"
  | "logistics";

export interface CatalogSession {
  id: string;
  day: 1 | 2;
  /** HH:MM, Asia/Kolkata */
  start: string;
  end: string;
  type: CatalogSessionType;
  title: string;
}

/** Conference day -> calendar date (IST). APTICON 2026: 24-25 Oct. */
export const DAY_DATES: Record<1 | 2, string> = {
  1: "2026-10-24",
  2: "2026-10-25",
};

export const SESSION_CATALOG: CatalogSession[] = [
  { id: "d1-01", day: 1, start: "09:00", end: "10:00", type: "logistics", title: "Registration & Welcome Kit Distribution" },
  { id: "d1-02", day: 1, start: "10:00", end: "11:30", type: "inaugural", title: "Inaugural Ceremony" },
  { id: "d1-03", day: 1, start: "11:30", end: "12:30", type: "keynote", title: "Presidential Address" },
  { id: "d1-04", day: 1, start: "12:30", end: "13:30", type: "break", title: "Lunch & Networking" },
  { id: "d1-05", day: 1, start: "13:30", end: "15:00", type: "keynote", title: "Keynote: Viksit Bharat 2047 — Pharmacy's Role" },
  { id: "d1-06", day: 1, start: "15:00", end: "16:30", type: "scientific", title: "Scientific Session I: Pharmaceutical Education Innovation" },
  { id: "d1-07", day: 1, start: "16:30", end: "17:00", type: "break", title: "Tea Break" },
  { id: "d1-08", day: 1, start: "17:00", end: "18:30", type: "scientific", title: "Scientific Session II: Drug Discovery & Development" },
  { id: "d1-09", day: 1, start: "19:00", end: "21:00", type: "cultural", title: "Cultural Evening — Chhattisgarhi Folk Performances" },
  { id: "d2-01", day: 2, start: "09:00", end: "10:30", type: "keynote", title: "Keynote: Atmanirbhar Bharat — Indigenous Pharma" },
  { id: "d2-02", day: 2, start: "10:30", end: "12:00", type: "scientific", title: "Scientific Session III: Clinical Pharmacy & Pharmacovigilance" },
  { id: "d2-03", day: 2, start: "12:00", end: "13:00", type: "workshop", title: "Workshop: Outcome-Based Pharmacy Education" },
  { id: "d2-04", day: 2, start: "13:00", end: "14:00", type: "break", title: "Lunch" },
  { id: "d2-05", day: 2, start: "14:00", end: "15:30", type: "scientific", title: "Scientific Session IV: Herbal Medicine & Traditional Knowledge" },
  { id: "d2-06", day: 2, start: "15:30", end: "16:00", type: "break", title: "Tea Break" },
  { id: "d2-07", day: 2, start: "16:00", end: "17:00", type: "panel", title: "Panel Discussion: Future of Pharmacy Education in India" },
  { id: "d2-08", day: 2, start: "17:00", end: "18:00", type: "valedictory", title: "Valedictory Ceremony & Awards" },
];
