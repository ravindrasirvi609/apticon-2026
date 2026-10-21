"use client";
import { useMemo, useState } from "react";
import { Calendar, Clock, Search, Video } from "lucide-react";
import {
  EPOSTER_LIST,
  EPOSTER_SCHEDULE,
  EPOSTER_SUBJECTS,
  ORAL_ONLINE,
  ORAL_ONLINE_LIST,
} from "@/lib/online-presentations";

function Header({
  title,
  date,
  time,
  mode,
  count,
}: {
  title: string;
  date: string;
  time: string;
  mode: string;
  count: number;
}) {
  return (
    <div className="rounded-2xl bg-[var(--primary-800)] p-6 text-white">
      <p className="text-xs font-bold tracking-widest uppercase text-[var(--accent-400)] mb-2">
        {mode}
      </p>
      <h2 className="font-display font-bold text-xl md:text-2xl">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/80">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} /> {date}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} /> {time}
        </span>
        <span className="flex items-center gap-1.5">
          <Video size={14} /> {count} presentations
        </span>
      </div>
    </div>
  );
}

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
    <div className="relative">
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-text)]"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-[var(--accent-500)]/25 bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--dark-text)] outline-none focus:border-[var(--primary-800)]"
      />
    </div>
  );
}

export function OralOnlineList() {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ORAL_ONLINE_LIST.map((r, i) => ({ ...r, sr: i + 1 })).filter(
      (r) =>
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.paperId.toLowerCase().includes(q) ||
        r.theme.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <Header
        title="Oral Presentation — Online Mode"
        date={ORAL_ONLINE.date}
        time={ORAL_ONLINE.time}
        mode={ORAL_ONLINE.mode}
        count={ORAL_ONLINE_LIST.length}
      />
      <SearchBox
        value={query}
        onChange={setQuery}
        placeholder="Search by name, paper ID or theme"
      />
      <div className="overflow-x-auto rounded-2xl border border-[var(--accent-500)]/15 bg-white">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="bg-[var(--primary-800)] text-left text-xs uppercase tracking-wider text-white">
              <th className="px-4 py-3 w-14">Sr. No</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Paper ID</th>
              <th className="px-4 py-3">Theme</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.sr}
                className="border-t border-[var(--surface-200)] hover:bg-[var(--surface-100)]"
              >
                <td className="px-4 py-3 text-[var(--muted-text)]">{r.sr}</td>
                <td className="px-4 py-3 font-medium text-[var(--dark-text)]">
                  {r.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs font-bold text-[var(--primary-800)]">
                  {r.paperId}
                </td>
                <td className="px-4 py-3 text-[var(--muted-text)]">
                  {r.theme}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-[var(--muted-text)]"
                >
                  No presentations match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EPosterList() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");

  const posters = useMemo(
    () => EPOSTER_LIST.map((p, i) => ({ ...p, sr: i + 1 })),
    [],
  );

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EPOSTER_SUBJECTS.filter((s) => subject === "all" || s === subject)
      .map((s) => ({
        subject: s,
        total: posters.filter((p) => p.subject === s).length,
        items: posters.filter(
          (p) =>
            p.subject === s &&
            (!q ||
              p.author.toLowerCase().includes(q) ||
              p.code.toLowerCase().includes(q) ||
              p.title?.toLowerCase().includes(q) ||
              p.affiliation?.toLowerCase().includes(q)),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [posters, query, subject]);

  return (
    <div className="space-y-6">
      <Header
        title="E-Poster Presentations"
        date={EPOSTER_SCHEDULE.date}
        time={EPOSTER_SCHEDULE.time}
        mode={EPOSTER_SCHEDULE.mode}
        count={EPOSTER_LIST.length}
      />

      {/* Summary by subject */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--accent-500)]/15 bg-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="bg-[var(--primary-800)] text-left text-xs uppercase tracking-wider text-white">
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3 w-28 text-right">E-Posters</th>
            </tr>
          </thead>
          <tbody>
            {EPOSTER_SUBJECTS.map((s) => (
              <tr key={s} className="border-t border-[var(--surface-200)]">
                <td className="px-4 py-2.5 text-[var(--dark-text)]">{s}</td>
                <td className="px-4 py-2.5 text-right font-bold text-[var(--primary-800)]">
                  {posters.filter((p) => p.subject === s).length}
                </td>
              </tr>
            ))}
            <tr className="border-t border-[var(--surface-200)] bg-[var(--surface-100)] font-bold">
              <td className="px-4 py-2.5">Total</td>
              <td className="px-4 py-2.5 text-right text-[var(--primary-800)]">
                {EPOSTER_LIST.length}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search by author, code, title or affiliation"
          />
        </div>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          aria-label="Filter by subject"
          className="rounded-full border border-[var(--accent-500)]/25 bg-white px-4 py-2.5 text-sm text-[var(--dark-text)] outline-none focus:border-[var(--primary-800)] md:max-w-xs"
        >
          <option value="all">All subjects</option>
          {EPOSTER_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {groups.length === 0 && (
        <div className="rounded-2xl bg-white border border-[var(--accent-500)]/15 p-8 text-center text-sm text-[var(--muted-text)]">
          No e-posters match your search.
        </div>
      )}

      {groups.map((g) => (
        <section key={g.subject}>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--primary-800)]">
            {g.subject}{" "}
            <span className="font-normal text-[var(--muted-text)]">
              ({g.items.length}
              {g.items.length !== g.total ? ` of ${g.total}` : ""})
            </span>
          </h3>
          <div className="space-y-3">
            {g.items.map((p) => (
              <article
                key={p.code}
                className="rounded-2xl border border-[var(--accent-500)]/15 bg-white p-4 transition-all hover:border-[var(--accent-500)]/40 hover:shadow-md"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--primary-800)] px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-white">
                    {p.code}
                  </span>
                  <span className="text-xs text-[var(--muted-text)]">
                    #{p.sr}
                  </span>
                </div>
                <h4 className="text-sm font-semibold leading-snug text-[var(--dark-text)] md:text-base">
                  {p.title ?? "Title not available in abstract book"}
                </h4>
                <p className="mt-1 text-sm font-medium text-[var(--primary-800)]">
                  {p.author}
                </p>
                {p.affiliation && (
                  <p className="mt-0.5 text-xs text-[var(--muted-text)]">
                    {p.affiliation}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
