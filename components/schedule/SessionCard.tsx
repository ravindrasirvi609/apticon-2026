import { Clock, MapPin } from "lucide-react";
import { SESSION_COLORS } from "@/lib/constants";

interface SessionItem {
  time: string;
  title: string;
  type: string;
  hall: string;
  description?: string;
}

export default function SessionCard({
  session,
  index,
}: {
  session: SessionItem;
  index: number;
}) {
  const colorClass =
    SESSION_COLORS[session.type] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="flex gap-4 group">
      {/* Timeline dot + connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-4 h-4 rounded-full border-2 mt-1 transition-all duration-300
          ${
            session.type === "break" || session.type === "logistics"
              ? "border-gray-300 bg-gray-100"
              : "border-[var(--primary-800)] bg-white group-hover:bg-[var(--primary-800)]"
          }`}
        />
        {index >= 0 && (
          <div className="w-px flex-1 bg-gradient-to-b from-[var(--accent-500)]/40 to-transparent mt-1 min-h-[2rem]" />
        )}
      </div>

      {/* Content */}
      <div
        className={`flex-1 mb-4 rounded-2xl p-4 border transition-all duration-300
        ${
          session.type === "break" || session.type === "logistics"
            ? "bg-[var(--surface-100)] border-[var(--surface-200)]"
            : "bg-white border-[var(--accent-500)]/15 hover:border-[var(--accent-500)]/40 hover:shadow-md"
        }`}
      >
        <div className="flex flex-wrap items-start gap-2 mb-2">
          <span
            className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${colorClass}`}
          >
            {session.type}
          </span>
        </div>
        <h3 className="font-semibold text-sm md:text-base text-[var(--dark-text)] leading-snug">
          {session.title}
        </h3>
        {session.description && (
          <p className="mt-1 text-xs text-[var(--muted-text)] leading-relaxed">
            {session.description}
          </p>
        )}
        <div className="flex flex-wrap gap-3 mt-3">
          <span className="flex items-center gap-1 text-xs text-[var(--muted-text)]">
            <Clock size={11} /> {session.time}
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--muted-text)]">
            <MapPin size={11} /> {session.hall}
          </span>
        </div>
      </div>
    </div>
  );
}
