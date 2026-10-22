"use client";
import { useMemo, useState } from "react";
import { Calendar, Clock, Download, FileText, MapPin, Search, Tag, Video } from "lucide-react";
import presentationData from "@/lib/presentation-schedules.json";

export interface OralItem {
  code: string;
  author: string;
  title: string;
  affiliation: string;
  subject: string;
  slot: string;
  hall: string;
  date: string;
  time: string;
  isOnline: boolean;
}

export interface PosterItem {
  code: string;
  author: string;
  title: string;
  affiliation: string;
  subject: string;
  day: string;
  date: string;
  time: string;
}

const ORAL_PRESENTATIONS: OralItem[] = presentationData.oral as OralItem[];
const POSTER_PRESENTATIONS: PosterItem[] = presentationData.poster as PosterItem[];

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative flex-1">
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-text)]"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-[var(--accent-500)]/25 bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--dark-text)] outline-none focus:border-[var(--primary-800)] shadow-sm"
      />
    </div>
  );
}

export function OralScheduleList() {
  const [query, setQuery] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("all");
  const [selectedHall, setSelectedHall] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const slots = useMemo(() => {
    const sSet = new Set(ORAL_PRESENTATIONS.map((item) => item.slot).filter(Boolean));
    return Array.from(sSet);
  }, []);

  const halls = useMemo(() => {
    const hSet = new Set(ORAL_PRESENTATIONS.map((item) => item.hall).filter(Boolean));
    return Array.from(hSet);
  }, []);

  const subjects = useMemo(() => {
    const subSet = new Set(ORAL_PRESENTATIONS.map((item) => item.subject).filter(Boolean));
    return Array.from(subSet);
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ORAL_PRESENTATIONS.filter((item) => {
      if (selectedSlot !== "all" && item.slot !== selectedSlot) return false;
      if (selectedHall !== "all" && item.hall !== selectedHall) return false;
      if (selectedSubject !== "all" && item.subject !== selectedSubject) return false;
      if (!q) return true;
      return (
        item.code.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.affiliation.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q)
      );
    });
  }, [query, selectedSlot, selectedHall, selectedSubject]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Download CTA */}
      <div className="rounded-2xl bg-gradient-to-br from-[var(--primary-900)] to-[var(--primary-800)] p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-500)]/20 border border-[var(--accent-400)]/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--accent-300)] mb-3">
            <MicIcon size={14} /> Oral Presentations
          </span>
          <h2 className="font-display font-black text-2xl md:text-3xl text-white">
            APTICON 2026 Oral Presentation Schedule
          </h2>
          <p className="mt-2 text-sm text-white/80 max-w-2xl leading-relaxed">
            Full physical and online schedule across multiple halls and time slots. Filter by slot, hall, subject theme, or search by abstract code or presenter name.
          </p>
        </div>

        <a
          href="/downloads/APTICON-2026-Oral-Schedule.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent-500)] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--accent-500)]/30 transition-all hover:bg-[var(--accent-400)] hover:scale-[1.02] shrink-0"
        >
          <Download size={16} />
          Download PDF Schedule
        </a>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search oral presentation by code, author, title or institution..."
        />

        <div className="flex flex-wrap gap-2.5">
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            aria-label="Filter by slot"
            className="rounded-full border border-[var(--accent-500)]/25 bg-white px-4 py-2.5 text-xs md:text-sm font-medium text-[var(--dark-text)] outline-none focus:border-[var(--primary-800)] shadow-sm"
          >
            <option value="all">All Slots</option>
            {slots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedHall}
            onChange={(e) => setSelectedHall(e.target.value)}
            aria-label="Filter by hall"
            className="rounded-full border border-[var(--accent-500)]/25 bg-white px-4 py-2.5 text-xs md:text-sm font-medium text-[var(--dark-text)] outline-none focus:border-[var(--primary-800)] shadow-sm"
          >
            <option value="all">All Halls</option>
            {halls.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            aria-label="Filter by subject"
            className="rounded-full border border-[var(--accent-500)]/25 bg-white px-4 py-2.5 text-xs md:text-sm font-medium text-[var(--dark-text)] outline-none focus:border-[var(--primary-800)] shadow-sm max-w-[200px] truncate"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results summary info */}
      <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted-text)] px-1">
        <span>
          Showing {filteredItems.length} of {ORAL_PRESENTATIONS.length} oral presentations
        </span>
      </div>

      {/* Items list */}
      <div className="space-y-4">
        {filteredItems.map((item, i) => (
          <article
            key={`${item.code}-${i}`}
            className="rounded-2xl border border-[var(--accent-500)]/15 bg-white p-5 transition-all hover:border-[var(--accent-500)]/40 hover:shadow-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--surface-200)]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--primary-800)] px-3 py-1 font-mono text-xs font-bold text-white shadow-sm">
                  {item.code}
                </span>
                {item.isOnline ? (
                  <span className="rounded-full bg-emerald-600/10 border border-emerald-600/30 text-emerald-700 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                    <Video size={12} /> ONLINE
                  </span>
                ) : (
                  <span className="rounded-full bg-[var(--surface-200)] text-[var(--dark-text)] px-2.5 py-0.5 text-xs font-medium">
                    Physical
                  </span>
                )}
                {item.subject && (
                  <span className="rounded-full bg-[var(--accent-500)]/10 text-[var(--accent-700)] px-2.5 py-0.5 text-xs font-semibold">
                    {item.subject}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[var(--muted-text)]">
                {item.slot && (
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-[var(--accent-500)]" /> {item.slot} ({item.time})
                  </span>
                )}
                {item.hall && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-[var(--accent-500)]" /> {item.hall}
                  </span>
                )}
                {item.date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-[var(--accent-500)]" /> {item.date}
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-base md:text-lg font-bold text-[var(--dark-text)] leading-snug">
              {item.title || "Title as submitted in Abstract Book"}
            </h3>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
              <div>
                <p className="font-semibold text-[var(--primary-800)]">{item.author}</p>
                {item.affiliation && (
                  <p className="text-xs text-[var(--muted-text)] mt-0.5">{item.affiliation}</p>
                )}
              </div>
            </div>
          </article>
        ))}

        {filteredItems.length === 0 && (
          <div className="rounded-2xl bg-white border border-[var(--accent-500)]/15 p-12 text-center text-[var(--muted-text)]">
            <FileText size={36} className="mx-auto mb-3 opacity-40 text-[var(--primary-800)]" />
            <p className="text-base font-semibold">No oral presentations match your filter.</p>
            <p className="text-xs mt-1">Try resetting search keywords or selecting all slots/halls.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function PosterScheduleList() {
  const [query, setQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const subjects = useMemo(() => {
    const subSet = new Set(POSTER_PRESENTATIONS.map((item) => item.subject).filter(Boolean));
    return Array.from(subSet);
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return POSTER_PRESENTATIONS.filter((item) => {
      if (selectedDay !== "all" && item.day !== selectedDay) return false;
      if (selectedSubject !== "all" && item.subject !== selectedSubject) return false;
      if (!q) return true;
      return (
        item.code.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.affiliation.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q)
      );
    });
  }, [query, selectedDay, selectedSubject]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Download CTA */}
      <div className="rounded-2xl bg-gradient-to-br from-[var(--primary-900)] to-[var(--primary-800)] p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-500)]/20 border border-[var(--accent-400)]/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--accent-300)] mb-3">
            <Tag size={14} /> Poster Presentations
          </span>
          <h2 className="font-display font-black text-2xl md:text-3xl text-white">
            APTICON 2026 Poster Presentation Schedule
          </h2>
          <p className="mt-2 text-sm text-white/80 max-w-2xl leading-relaxed">
            Detailed Day 1 & Day 2 Poster sessions schedule categorized by subject streams. Locate your poster board code, date, and assigned time slot.
          </p>
        </div>

        <a
          href="/downloads/APTICON-2026-Poster-Schedule.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent-500)] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--accent-500)]/30 transition-all hover:bg-[var(--accent-400)] hover:scale-[1.02] shrink-0"
        >
          <Download size={16} />
          Download PDF Schedule
        </a>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search poster presentation by code, author, title or college..."
        />

        <div className="flex flex-wrap gap-2.5">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            aria-label="Filter by day"
            className="rounded-full border border-[var(--accent-500)]/25 bg-white px-4 py-2.5 text-xs md:text-sm font-medium text-[var(--dark-text)] outline-none focus:border-[var(--primary-800)] shadow-sm"
          >
            <option value="all">All Days</option>
            <option value="Day 1">Day 1 (24 Oct)</option>
            <option value="Day 2">Day 2 (25 Oct)</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            aria-label="Filter by subject"
            className="rounded-full border border-[var(--accent-500)]/25 bg-white px-4 py-2.5 text-xs md:text-sm font-medium text-[var(--dark-text)] outline-none focus:border-[var(--primary-800)] shadow-sm max-w-[240px] truncate"
          >
            <option value="all">All Subject Streams</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results summary info */}
      <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted-text)] px-1">
        <span>
          Showing {filteredItems.length} of {POSTER_PRESENTATIONS.length} poster presentations
        </span>
      </div>

      {/* Items list */}
      <div className="space-y-4">
        {filteredItems.map((item, i) => (
          <article
            key={`${item.code}-${i}`}
            className="rounded-2xl border border-[var(--accent-500)]/15 bg-white p-5 transition-all hover:border-[var(--accent-500)]/40 hover:shadow-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--surface-200)]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--primary-800)] px-3 py-1 font-mono text-xs font-bold text-white shadow-sm">
                  {item.code}
                </span>
                {item.day && (
                  <span className="rounded-full bg-[var(--accent-500)]/15 text-[var(--primary-800)] px-2.5 py-0.5 text-xs font-bold">
                    {item.day}
                  </span>
                )}
                {item.subject && (
                  <span className="rounded-full bg-[var(--surface-200)] text-[var(--dark-text)] px-2.5 py-0.5 text-xs font-medium">
                    {item.subject}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[var(--muted-text)]">
                {item.date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-[var(--accent-500)]" /> {item.date}
                  </span>
                )}
                {item.time && (
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-[var(--accent-500)]" /> {item.time}
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-base md:text-lg font-bold text-[var(--dark-text)] leading-snug">
              {item.title || "Title as submitted in Abstract Book"}
            </h3>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
              <div>
                <p className="font-semibold text-[var(--primary-800)]">{item.author}</p>
                {item.affiliation && (
                  <p className="text-xs text-[var(--muted-text)] mt-0.5">{item.affiliation}</p>
                )}
              </div>
            </div>
          </article>
        ))}

        {filteredItems.length === 0 && (
          <div className="rounded-2xl bg-white border border-[var(--accent-500)]/15 p-12 text-center text-[var(--muted-text)]">
            <FileText size={36} className="mx-auto mb-3 opacity-40 text-[var(--primary-800)]" />
            <p className="text-base font-semibold">No poster presentations match your filter.</p>
            <p className="text-xs mt-1">Try resetting search keywords or selecting all days/subjects.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MicIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}
