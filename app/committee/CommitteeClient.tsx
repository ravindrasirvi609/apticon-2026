"use client";
import { motion } from "framer-motion";
import { Mail, User } from "lucide-react";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { NATIONAL_BODY, STATE_BRANCHES } from "@/lib/committee-data";

interface Member {
  name: string;
  designation: string;
  institution: string;
  role?: string;
  email?: string;
  image?: string;
}

const COMMITTEE: { group: string; color: string; members: Member[] }[] = [
  {
    group: "National Body",
    color: "from-[var(--primary-800)] to-[var(--accent-500)]",
    members: NATIONAL_BODY.map((m) => ({
      name: m.name,
      designation: m.designation,
      institution: m.institution,
      role: m.role,
      email: m.email,
      image: m.image,
    })),
  },
  {
    group: "Patrons",
    color: "from-[var(--accent-500)] to-amber-600",
    members: [
      { name: "Vice Chancellor", designation: "Vice Chancellor", institution: "Pt. Ravishankar Shukla University, Raipur", role: "Chief Patron" },
      { name: "APTI National President", designation: "National President, APTI", institution: "To Be Announced", role: "Patron" },
    ],
  },
  {
    group: "Organizing Leadership",
    color: "from-[var(--primary-800)] to-[var(--primary-900)]",
    members: [
      { name: "Organizing Chairman", designation: "Professor & Head", institution: "University Institute of Pharmacy, Pt. RSU, Raipur", role: "Chairman" },
      { name: "Organizing Secretary", designation: "Associate Professor", institution: "University Institute of Pharmacy, Pt. RSU, Raipur", role: "Secretary" },
      { name: "Joint Secretary", designation: "Assistant Professor", institution: "University Institute of Pharmacy, Pt. RSU, Raipur", role: "Jt. Secretary" },
      { name: "Treasurer", designation: "Professor", institution: "Raipur College of Pharmacy", role: "Treasurer" },
    ],
  },
  {
    group: "Scientific Committee",
    color: "from-[var(--secondary-800)] to-[var(--secondary-900)]",
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
      className="relative rounded-2xl bg-white border border-[var(--accent-500)]/15 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[var(--accent-500)]/40 transition-all duration-300 group"
    >
      {/* Gradient banner */}
      <div className={`h-20 w-full bg-gradient-to-r ${gradient}`} />

      <div className="px-5 pb-5 flex flex-col items-center text-center">
        {/* Avatar overlapping the banner */}
        <div className="-mt-14 mb-3">
          {member.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.image}
              alt={member.name}
              className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-md"
            />
          ) : (
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${gradient} ring-4 ring-white shadow-md flex items-center justify-center`}>
              <User size={36} className="text-white/90" />
            </div>
          )}
        </div>

        {member.role && (
          <span className={`inline-block mb-2 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-gradient-to-r ${gradient} text-white`}>
            {member.role}
          </span>
        )}
        <p className="font-semibold text-sm text-[var(--dark-text)] leading-snug group-hover:text-[var(--primary-800)] transition-colors">
          {member.name}
        </p>
        <p className="text-xs text-[var(--muted-text)] mt-1 leading-snug">{member.designation}</p>
        <p className="text-xs text-[var(--muted-text)] leading-snug line-clamp-2">{member.institution}</p>
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--primary-800)] hover:underline max-w-full"
          >
            <Mail size={11} className="flex-shrink-0" />
            <span className="truncate">{member.email}</span>
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function CommitteeClient() {
  return (
    <div className="bg-[var(--surface-50)] min-h-screen">

      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div className="absolute inset-0 tribal-pattern-bg opacity-30" aria-hidden />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Organizing Committee</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            The <span className="text-gradient-primary">Team</span> Behind APTICON
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

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* State APTI Branches */}
      <section className="py-16 md:py-20">
        <div className="container-site">
          <ScrollReveal className="mb-12 text-center">
            <GoldenBadge>Across India</GoldenBadge>
            <h2 className="mt-4 font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)]">
              State APTI Branches
            </h2>
          </ScrollReveal>
          <div className="space-y-12">
            {STATE_BRANCHES.map((branch) => (
              <div key={branch.state}>
                <h3 className="font-display font-semibold text-lg text-[var(--primary-800)] mb-4 flex items-center gap-3">
                  <span className="h-6 w-1 rounded-full bg-gradient-to-b from-[var(--secondary-800)] to-[var(--secondary-900)]" />
                  {branch.state}
                </h3>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={staggerContainer}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {branch.members.map((member, i) => (
                    <MemberCard
                      key={i}
                      member={member}
                      gradient="from-[var(--secondary-800)] to-[var(--secondary-900)]"
                    />
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
