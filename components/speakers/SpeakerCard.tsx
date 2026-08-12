"use client";
import { motion } from "framer-motion";
import { User } from "lucide-react";

export interface Speaker {
  name: string;
  title: string;
  institution: string;
  topic?: string;
  role: "keynote" | "invited" | "chair" | "workshop";
  image?: string;
}

const roleStyles: Record<Speaker["role"], string> = {
  keynote:  "bg-[var(--primary-800)] text-white",
  invited:  "bg-[var(--secondary-800)] text-white",
  chair:    "bg-emerald-700 text-white",
  workshop: "bg-purple-700 text-white",
};

const roleLabels: Record<Speaker["role"], string> = {
  keynote:  "Keynote",
  invited:  "Invited Speaker",
  chair:    "Session Chair",
  workshop: "Workshop",
};

export default function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <div className="flip-card group h-64">
      <div className="flip-card-inner h-full">
        {/* Front */}
        <div className="flip-card-front h-full rounded-2xl bg-white border border-[var(--accent-500)]/20 shadow-sm flex flex-col items-center justify-center p-5 text-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[var(--surface-200)] border-2 border-[var(--accent-500)]/30 overflow-hidden flex items-center justify-center">
              {speaker.image
                ? <img src={speaker.image} alt={speaker.name} className="w-full h-full object-cover" />
                : <User size={32} className="text-[var(--muted-text)]" />
              }
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="absolute -inset-2 rounded-full border border-dashed border-[var(--accent-500)]/25"
            />
          </div>
          <div>
            <p className="font-display font-bold text-base text-[var(--dark-text)] leading-snug">{speaker.name}</p>
            <p className="text-xs text-[var(--muted-text)] mt-0.5 leading-snug">{speaker.title}</p>
            <p className="text-xs text-[var(--muted-text)] leading-snug">{speaker.institution}</p>
          </div>
          <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${roleStyles[speaker.role]}`}>
            {roleLabels[speaker.role]}
          </span>
        </div>

        {/* Back */}
        <div className="flip-card-back h-full rounded-2xl bg-[var(--dark-text)] border border-[var(--accent-500)]/20 flex flex-col items-center justify-center p-5 text-center gap-3">
          <img src="/cultural/lotus.svg" alt="" className="w-10 h-10 opacity-50" />
          <p className="font-display font-bold text-base text-[var(--accent-400)] leading-snug">{speaker.name}</p>
          {speaker.topic && (
            <>
              <p className="text-xs text-white/50 uppercase tracking-widest font-semibold">Topic</p>
              <p className="text-sm text-white/80 leading-relaxed">{speaker.topic}</p>
            </>
          )}
          <p className="text-xs text-white/50 leading-snug mt-1">{speaker.institution}</p>
        </div>
      </div>
    </div>
  );
}
