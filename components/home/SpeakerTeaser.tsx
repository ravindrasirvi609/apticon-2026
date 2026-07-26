"use client";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp, scaleIn } from "@/lib/animations";
import GoldenBadge from "@/components/ui/GoldenBadge";
import PulseButton from "@/components/ui/PulseButton";
import { User } from "lucide-react";

const PLACEHOLDERS = [
  { role: "Chief Guest",         color: "from-[var(--crimson-800)] to-[var(--crimson-900)]" },
  { role: "Keynote Speaker",     color: "from-[var(--navy-800)] to-[var(--navy-900)]" },
  { role: "Invited Speaker",     color: "from-emerald-700 to-emerald-900" },
  { role: "Invited Speaker",     color: "from-purple-700 to-purple-900" },
  { role: "Session Chair",       color: "from-orange-700 to-orange-900" },
  { role: "Workshop Facilitator",color: "from-[var(--navy-700)] to-[var(--navy-800)]" },
];

export default function SpeakerTeaser() {
  return (
    <section className="py-20 md:py-28 bg-[var(--cream-100)] relative overflow-hidden">
      {/* Gondi sun right */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-80 h-80 opacity-20 pointer-events-none" aria-hidden>
        <img src="/cultural/gondi-sun.svg" alt="" className="w-full h-full" />
      </div>

      <div className="container-site relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="text-center mb-14"
        >
          <motion.div variants={scaleIn} className="flex justify-center">
            <GoldenBadge>Speakers</GoldenBadge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-5 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[var(--dark-text)]"
          >
            Distinguished{" "}
            <span className="text-gradient-crimson">Speakers</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-[var(--muted-text)] max-w-xl mx-auto">
            Speaker announcements will be updated soon. Stay tuned for an outstanding lineup of pharmacy educators and industry leaders.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {PLACEHOLDERS.map((sp, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flip-card group"
            >
              <div className="flip-card-inner h-44">
                {/* Front */}
                <div className="flip-card-front h-full">
                  <div className={`h-full rounded-2xl bg-gradient-to-b ${sp.color} flex flex-col items-center justify-center gap-3 p-4 border border-white/10`}>
                    {/* Avatar with rangoli-esque ring */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-[var(--gold-500)]/50 flex items-center justify-center">
                        <User size={24} className="text-white/60" />
                      </div>
                      {/* Spinning ring */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        className="absolute -inset-1 rounded-full border border-dashed border-[var(--gold-500)]/30"
                      />
                    </div>
                    <p className="text-xs font-semibold text-white/80 text-center leading-snug">
                      {sp.role}
                    </p>
                    <span className="text-[10px] text-[var(--gold-400)]/70 font-medium tracking-wide">
                      TBA
                    </span>
                  </div>
                </div>
                {/* Back */}
                <div className="flip-card-back h-full">
                  <div className="h-full rounded-2xl bg-[var(--dark-text)] flex flex-col items-center justify-center gap-2 p-4 border border-[var(--gold-500)]/20">
                    <img src="/cultural/lotus.svg" alt="" className="w-10 h-10 opacity-60" />
                    <p className="text-xs text-[var(--gold-400)] font-semibold text-center">
                      Announcement Coming Soon
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex justify-center"
        >
          <PulseButton href="/speakers" variant="outline">
            View All Speakers
          </PulseButton>
        </motion.div>
      </div>
    </section>
  );
}
