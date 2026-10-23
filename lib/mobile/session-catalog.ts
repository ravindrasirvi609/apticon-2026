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
  { id: "d1-01", day: 1, start: "08:30", end: "10:00", type: "logistics", title: "Registration" },
  { id: "d1-10", day: 1, start: "08:30", end: "10:00", type: "break", title: "Breakfast" },
  { id: "d1-02", day: 1, start: "10:30", end: "12:00", type: "inaugural", title: "Inaugural Function" },
  { id: "d1-15", day: 1, start: "12:00", end: "12:40", type: "keynote", title: "KLE Oration Lecture" },
  { id: "d1-16", day: 1, start: "12:40", end: "13:10", type: "keynote", title: "Dr. G. Bhagwant Memorial Lecture" },
  { id: "d1-17", day: 1, start: "13:10", end: "14:00", type: "panel", title: "Panel Discussion I — Pharma Teacher’s Sankalp: From Teaching to Transforming Competencies" },
  { id: "d1-04", day: 1, start: "14:00", end: "14:30", type: "break", title: "Lunch" },
  { id: "d1-13", day: 1, start: "14:30", end: "17:30", type: "scientific", title: "Oral/Poster Presentations" },
  { id: "d1-18", day: 1, start: "14:30", end: "15:10", type: "keynote", title: "M. L. Schroff Memorial Lecture" },
  { id: "d1-19", day: 1, start: "15:10", end: "15:50", type: "keynote", title: "Dr. G. P. Srivastava Memorial Lecture" },
  { id: "d1-20", day: 1, start: "15:50", end: "16:30", type: "keynote", title: "Shri A. Mishra Memorial Lecture in Pharmaceutical Technology" },
  { id: "d1-21", day: 1, start: "16:30", end: "17:00", type: "workshop", title: "Workshop on AI Softwares" },
  { id: "d1-22", day: 1, start: "17:00", end: "17:15", type: "break", title: "High-Tea" },
  { id: "d1-09", day: 1, start: "17:15", end: "20:00", type: "cultural", title: "Award Function and Cultural Night" },
  { id: "d1-14", day: 1, start: "20:00", end: "22:00", type: "break", title: "Dinner" },
  { id: "d2-09", day: 2, start: "08:00", end: "09:30", type: "break", title: "Breakfast" },
  { id: "d2-10", day: 2, start: "09:30", end: "10:10", type: "keynote", title: "J. S. S. Oration Lecture" },
  { id: "d2-11", day: 2, start: "10:00", end: "12:00", type: "scientific", title: "Oral/Poster Presentations" },
  { id: "d2-12", day: 2, start: "10:10", end: "11:10", type: "panel", title: "Women Forum Event — Panel Discussion II" },
  { id: "d2-13", day: 2, start: "11:10", end: "11:50", type: "keynote", title: "54th IPC Trust Sponsored Lecture" },
  { id: "d2-14", day: 2, start: "11:50", end: "12:50", type: "panel", title: "Panel Discussion III" },
  { id: "d2-04", day: 2, start: "13:00", end: "14:00", type: "break", title: "Lunch" },
  { id: "d2-08", day: 2, start: "14:00", end: "16:00", type: "valedictory", title: "Valedictory Function" },
];
