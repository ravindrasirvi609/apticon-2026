"use client";
import { motion } from "framer-motion";
import { Mail, User } from "lucide-react";
import GoldenBadge from "@/components/ui/GoldenBadge";
import ScrollReveal from "@/components/ui/ScrollReveal";
import CulturalDivider from "@/components/ui/CulturalDivider";
import PulseButton from "@/components/ui/PulseButton";
import { staggerContainer, fadeUp, fadeLeft, fadeRight } from "@/lib/animations";
import { EVENT } from "@/lib/constants";
import { NATIONAL_BODY } from "@/lib/committee-data";

const HISTORY = [
  { year: "1996", edition: "1st",  city: "Mysore, Karnataka",     note: "APTI's first Annual National Convention" },
  { year: "2000", edition: "5th",  city: "Udaipur, Rajasthan",    note: "Fifth edition of the convention" },
  { year: "2006", edition: "11th", city: "Bangalore, Karnataka", note: "Second time hosted in Bangalore" },
  { year: "2011", edition: "16th", city: "Moga, Punjab",         note: "Hosted in Punjab" },
  { year: "2016", edition: "21st", city: "Manipal",              note: "Second time hosted at Manipal University" },
  { year: "2022", edition: "25th", city: "Mysuru, Karnataka",    note: "Returned to APTICON's founding city" },
  { year: "2024", edition: "27th", city: "Bhubaneswar, Odisha",  note: "Most recent edition before APTICON 2024" },
  { year: "2026", edition: "28th", city: "Raipur (C.G.)",        note: "Viksit Bharat 2047 theme", current: true },
];

const ABOUT_SECTIONS = [
  {
    title: "About APTI",
    subtitle: "Association of Pharmaceutical Teachers of India",
    body: "Founded to unite pharmacy educators across India, APTI is the apex body representing pharmaceutical teachers at all levels. With a network of over 1,000 members spanning every state, APTI shapes the academic and professional direction of pharmacy education in India.",
    icon: "🏛️",
    color: "from-[var(--primary-800)] to-[var(--primary-900)]",
  },
  {
    title: "APTI Chhattisgarh",
    subtitle: "State Branch — Host of APTICON 2026",
    body: "The Chhattisgarh State Branch of APTI has been actively promoting pharmacy education across the state since its inception. With dedicated faculty members across multiple pharmacy institutions, the branch is proud to host the 28th edition of APTICON in the heart of central India.",
    icon: "🌿",
    color: "from-emerald-700 to-emerald-900",
  },
  {
    title: "University Institute of Pharmacy",
    subtitle: "Pt. Ravishankar Shukla University, Raipur",
    body: "Established as a premier centre for pharmaceutical education in Chhattisgarh, UIP at Pt. RSU offers undergraduate, postgraduate and doctoral programmes. The university holds NAAC 'A+' accreditation and has produced thousands of pharmacy graduates serving across India and abroad.",
    icon: "🎓",
    color: "from-[var(--secondary-800)] to-[var(--secondary-900)]",
  },
  {
    title: "Pt. Ravishankar Shukla University",
    subtitle: "NAAC A+ Accredited — Raipur, C.G.",
    body: "Named after Chhattisgarh's first Chief Minister, Pt. RSU is one of the largest universities in central India. Spread across a lush campus in Raipur, the university is home to 35+ departments and has been consistently accredited at the highest grade by NAAC.",
    icon: "🏫",
    color: "from-[var(--accent-500)] to-amber-600",
  },
];

function MemberCard({ member }: { member: (typeof NATIONAL_BODY)[number] }) {
  const gradient = "from-[var(--primary-800)] to-[var(--accent-500)]";
  return (
    <motion.div
      variants={fadeUp}
      className="relative rounded-2xl bg-white border border-[var(--accent-500)]/15 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[var(--accent-500)]/40 transition-all duration-300 group"
    >
      <div className={`h-20 w-full bg-gradient-to-r ${gradient}`} />
      <div className="px-5 pb-5 flex flex-col items-center text-center">
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
          {member.designation && (
            <p className="text-xs text-[var(--muted-text)] mt-1 leading-snug">{member.designation}</p>
          )}
          {member.institution && (
            <p className="text-xs text-[var(--muted-text)] leading-snug line-clamp-2">{member.institution}</p>
          )}
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

export default function AboutClient() {
  return (
    <div className="bg-[var(--surface-50)] min-h-screen">

      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 tribal-pattern-bg opacity-30" aria-hidden />
        <div className="absolute right-0 top-0 w-96 h-96 opacity-20 pointer-events-none" aria-hidden>
          <img src="/cultural/gondi-sun.svg" alt="" className="w-full h-full" />
        </div>
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>About</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            About <span className="text-gradient-primary">APTICON</span> 2026
          </h1>
          <p className="mt-6 text-base md:text-xl text-[var(--muted-text)] max-w-2xl mx-auto leading-relaxed">
            The 28th Annual National Convention of the Association of Pharmaceutical Teachers of India — uniting educators, researchers, and leaders to shape the future of pharmacy.
          </p>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* APTI / University Cards */}
      <section className="py-20 md:py-24">
        <div className="container-site">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ABOUT_SECTIONS.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 0.1}>
                <div className="rounded-2xl overflow-hidden border border-[var(--accent-500)]/15 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row">
                  <div className={`w-full sm:w-20 py-6 sm:py-0 flex items-center justify-center bg-gradient-to-b ${s.color} flex-shrink-0`}>
                    <span className="text-4xl">{s.icon}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-bold text-xl text-[var(--dark-text)]">{s.title}</h3>
                    <p className="text-xs font-semibold text-[var(--accent-500)] tracking-wide uppercase mt-1 mb-3">{s.subtitle}</p>
                    <p className="text-sm text-[var(--muted-text)] leading-relaxed">{s.body}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* National Body */}
      <section className="py-20 md:py-24 bg-[var(--surface-100)]">
        <div className="container-site">
          <ScrollReveal className="mb-12 text-center">
            <GoldenBadge>APTI National Body</GoldenBadge>
            <h2 className="mt-4 font-display font-bold text-2xl sm:text-3xl md:text-4xl text-[var(--dark-text)]">
              National <span className="text-gradient-primary">Office Bearers</span>
            </h2>
          </ScrollReveal>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {NATIONAL_BODY.map((member, i) => (
              <MemberCard key={i} member={member} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Viksit Bharat section */}
      <section className="py-16 bg-[var(--secondary-900)] relative overflow-hidden">
        <div className="absolute inset-0 tribal-pattern-bg opacity-5" aria-hidden />
        <div className="container-site relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent-500)]/40 bg-[var(--accent-500)]/10 text-[var(--accent-400)] text-xs font-bold tracking-widest uppercase mb-6">
              Vision 2047
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-6">
              Viksit Bharat 2047 — Pharmacy's Role
            </h2>
            <p className="text-white/70 text-base md:text-lg leading-relaxed mb-8">
              India's vision of becoming a developed nation by 2047 places immense responsibility on healthcare and pharmaceutical professionals. APTICON 2026 aligns with this national goal by focusing on producing self-reliant, skilled, and ethical pharmacists who will power Atmanirbhar Bharat.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {["Skilled Pharmacy Graduates","Indigenous Drug Development","Community Health Champions"].map((item, i) => (
                <div key={i} className="flex gap-3 items-start p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[var(--accent-400)] font-black font-display text-xl leading-none">{String(i+1).padStart(2,"0")}</span>
                  <p className="text-sm text-white/80 font-medium leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-20 md:py-28 bg-[var(--surface-50)]">
        <div className="container-site">
          <ScrollReveal className="text-center mb-16">
            <GoldenBadge>Our Journey</GoldenBadge>
            <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[var(--dark-text)]">
              28 Editions of <span className="text-gradient-accent">Excellence</span>
            </h2>
          </ScrollReveal>

          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--accent-500)] via-[var(--primary-800)] to-[var(--accent-500)] -translate-x-px" aria-hidden />

            {HISTORY.map((h, i) => (
              <motion.div
                key={h.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={`relative pl-16 md:pl-0 mb-8 md:mb-10 md:w-1/2 ${i % 2 === 0 ? "md:pr-12 md:text-right md:ml-0" : "md:pl-12 md:ml-auto"}`}
              >
                {/* Dot */}
                <div className={`absolute top-3 left-3 md:left-auto ${i % 2 === 0 ? "md:-right-3.5" : "md:-left-3.5"} w-7 h-7 rounded-full border-2 flex items-center justify-center z-10
                  ${h.current ? "border-[var(--accent-500)] bg-[var(--accent-500)]" : "border-[var(--primary-800)] bg-white"}`}
                >
                  {h.current && <span className="text-[10px] font-black text-white">★</span>}
                </div>

                <div className={`rounded-2xl p-5 border shadow-sm
                  ${h.current
                    ? "bg-[var(--primary-800)] border-[var(--accent-500)]/40 text-white"
                    : "bg-white border-[var(--accent-500)]/20 text-[var(--dark-text)]"}`}
                >
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className={`font-display font-black text-2xl ${h.current ? "text-[var(--accent-400)]" : "text-[var(--primary-800)]"}`}>{h.year}</span>
                    <span className={`text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm ${h.current ? "bg-[var(--accent-500)]/20 text-[var(--accent-400)]" : "bg-[var(--surface-200)] text-[var(--muted-text)]"}`}>{h.edition} Edition</span>
                  </div>
                  <p className={`font-semibold text-sm ${h.current ? "text-white" : "text-[var(--dark-text)]"}`}>{h.city}</p>
                  <p className={`text-xs mt-1 ${h.current ? "text-white/70" : "text-[var(--muted-text)]"}`}>{h.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CulturalDivider variant="lotus-row" className="container-site" />

      <div className="py-12 text-center">
        <PulseButton href="/registration" variant="accent" pulse>Register for APTICON 2026</PulseButton>
      </div>
    </div>
  );
}
