"use client";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { staggerContainer, fadeUp } from "@/lib/animations";

interface Member {
  name: string;
  designation: string;
  institution: string;
  role?: string;
}

const COMMITTEE: { group: string; color: string; members: Member[] }[] = [
  {
    group: "Patrons",
    color: "from-[var(--gold-500)] to-amber-600",
    members: [
      { name: "Vice Chancellor", designation: "Vice Chancellor", institution: "Pt. Ravishankar Shukla University, Raipur", role: "Chief Patron" },
      { name: "APTI National President", designation: "National President, APTI", institution: "To Be Announced", role: "Patron" },
    ],
  },
  {
    group: "Organizing Leadership",
    color: "from-[var(--crimson-800)] to-[var(--crimson-900)]",
    members: [
      { name: "Organizing Chairman", designation: "Professor & Head", institution: "University Institute of Pharmacy, Pt. RSU, Raipur", role: "Chairman" },
      { name: "Organizing Secretary", designation: "Associate Professor", institution: "University Institute of Pharmacy, Pt. RSU, Raipur", role: "Secretary" },
      { name: "Joint Secretary", designation: "Assistant Professor", institution: "University Institute of Pharmacy, Pt. RSU, Raipur", role: "Jt. Secretary" },
      { name: "Treasurer", designation: "Professor", institution: "Raipur College of Pharmacy", role: "Treasurer" },
    ],
  },
  {
    group: "Scientific Committee",
    color: "from-[var(--navy-800)] to-[var(--navy-900)]",
    members: [
      { name: "Scientific Chairperson", designation: "Professor", institution: "To Be Announced" },
      { name: "Scientific Co-Chair", designation: "Associate Professor", institution: "To Be Announced" },
      { name: "Member", designation: "Professor", institution: "To Be Announced" },
      { name: "Member", designation: "Professor", institution: "To Be Announced" },
      { name: "Member", designation: "Professor", institution: "To Be Announced" },
      { name: "Member", designation: "Associate Professor", institution: "To Be Announced" },
    ],
  },
  {
    group: "Registration Committee",
    color: "from-emerald-700 to-emerald-900",
    members: [
      { name: "Registration Chair", designation: "Assistant Professor", institution: "To Be Announced" },
      { name: "Member", designation: "Assistant Professor", institution: "To Be Announced" },
      { name: "Member", designation: "Assistant Professor", institution: "To Be Announced" },
    ],
  },
  {
    group: "Cultural Committee",
    color: "from-pink-700 to-pink-900",
    members: [
      { name: "Cultural Chair", designation: "Professor", institution: "To Be Announced" },
      { name: "Member", designation: "Lecturer", institution: "To Be Announced" },
      { name: "Member", designation: "Lecturer", institution: "To Be Announced" },
    ],
  },
  {
    group: "Hospitality & Transport",
    color: "from-orange-700 to-orange-900",
    members: [
      { name: "Hospitality Chair", designation: "Professor", institution: "To Be Announced" },
      { name: "Member", designation: "Assistant Professor", institution: "To Be Announced" },
      { name: "Member", designation: "Lecturer", institution: "To Be Announced" },
    ],
  },
];

function MemberCard({ member, gradient }: { member: Member; gradient: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl bg-white border border-[var(--gold-500)]/15 overflow-hidden shadow-sm hover:shadow-md hover:border-[var(--gold-500)]/40 transition-all duration-300 group"
    >
      {/* Color strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />
      <div className="p-5 flex gap-4 items-start">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-b ${gradient} flex items-center justify-center flex-shrink-0`}>
          <User size={20} className="text-white/80" />
        </div>
        <div className="min-w-0">
          {member.role && (
            <span className={`inline-block mb-1 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm bg-gradient-to-r ${gradient} text-white`}>
              {member.role}
            </span>
          )}
          <p className="font-semibold text-sm text-[var(--dark-text)] leading-snug truncate group-hover:text-[var(--crimson-800)] transition-colors">
            {member.name}
          </p>
          <p className="text-xs text-[var(--muted-text)] mt-0.5 leading-snug">{member.designation}</p>
          <p className="text-xs text-[var(--muted-text)] leading-snug">{member.institution}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommitteeClient() {
  return (
    <div className="bg-[var(--cream-50)] min-h-screen">

      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div className="absolute inset-0 tribal-pattern-bg opacity-30" aria-hidden />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Organizing Committee</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            The <span className="text-gradient-crimson">Team</span> Behind APTICON
          </h1>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-text)] max-w-xl mx-auto">
            Dedicated pharmacy educators and professionals working together to make APTICON 2026 a landmark event.
          </p>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* Committee groups */}
      <section className="py-16 md:py-20">
        <div className="container-site space-y-16">
          {COMMITTEE.map((group) => (
            <div key={group.group}>
              <ScrollReveal className="mb-8">
                <div className="flex items-center gap-4">
                  <div className={`h-8 w-1.5 rounded-full bg-gradient-to-b ${group.color}`} />
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)]">
                    {group.group}
                  </h2>
                </div>
              </ScrollReveal>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {group.members.map((member, i) => (
                  <MemberCard key={i} member={member} gradient={group.color} />
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
