"use client";
import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Mail, User } from "lucide-react";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/shadcn/tabs";
import { staggerContainer, fadeUp } from "@/lib/animations";
import {
  NATIONAL_BODY,
  STATE_BRANCHES,
  type CommitteeGroup,
  type CommitteeMember,
} from "@/lib/committee-data";
import {
  ACADEMIC_PARTNERS,
  CHIEF_GUESTS,
  CO_PATRONS,
  INDUSTRY_PATRONS,
  LOC,
  MENTORS,
  NATIONAL_ADVISORS,
  PATRONS,
  PCI_MEMBERS,
  REGISTRATION_COMMITTEE,
  REGULATORY_PATRONS,
  SCIENTIFIC_COMMITTEE,
  TASK_COMMITTEES,
  WOMEN_FORUM,
  YOUNG_LEADERSHIP,
} from "@/lib/committee-rosters";

const PRIMARY = "from-[var(--primary-800)] to-[var(--accent-500)]";
const GOLD = "from-[var(--accent-500)] to-amber-600";
const MAROON = "from-[var(--primary-800)] to-[var(--primary-900)]";
const SECONDARY = "from-[var(--secondary-800)] to-[var(--secondary-900)]";
const EMERALD = "from-emerald-700 to-emerald-900";
const PINK = "from-pink-700 to-pink-900";

function MemberCard({
  member,
  gradient,
}: {
  member: CommitteeMember;
  gradient: string;
}) {
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
              loading="lazy"
              className="w-28 h-28 rounded-full object-cover object-top ring-4 ring-white shadow-md"
            />
          ) : (
            <div
              className={`w-28 h-28 rounded-full bg-gradient-to-br ${gradient} ring-4 ring-white shadow-md flex items-center justify-center`}
            >
              <User size={36} className="text-white/90" />
            </div>
          )}
        </div>

        {member.role && (
          <span
            className={`inline-block mb-2 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-gradient-to-r ${gradient} text-white`}
          >
            {member.role}
          </span>
        )}
        <p className="font-semibold text-sm text-[var(--dark-text)] leading-snug group-hover:text-[var(--primary-800)] transition-colors">
          {member.name}
        </p>
        {member.designation && (
          <p className="text-xs text-[var(--muted-text)] mt-1 leading-snug">
            {member.designation}
          </p>
        )}
        {member.institution && (
          <p className="text-xs text-[var(--muted-text)] leading-snug line-clamp-2">
            {member.institution}
          </p>
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

// Smaller card for the large brochure rosters (mentors, advisors, task committees…).
function CompactMemberCard({ member }: { member: CommitteeMember }) {
  return (
    <div className="flex flex-col items-center text-center rounded-xl bg-white border border-[var(--accent-500)]/15 p-3 shadow-sm hover:shadow-md hover:border-[var(--accent-500)]/40 transition-all duration-300">
      {member.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.image}
          alt={member.name}
          loading="lazy"
          className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg object-cover object-top shadow-sm"
        />
      ) : (
        <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg bg-[var(--surface-100)] flex items-center justify-center">
          <User size={28} className="text-[var(--muted-text)]" />
        </div>
      )}
      <p className="mt-2 font-semibold text-xs sm:text-[13px] text-[var(--dark-text)] leading-snug">
        {member.name}
      </p>
      {member.role && (
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-500)]">
          {member.role}
        </p>
      )}
      {(member.designation || member.institution) && (
        <p className="mt-0.5 text-[11px] text-[var(--muted-text)] leading-snug line-clamp-2">
          {[member.designation, member.institution].filter(Boolean).join(", ")}
        </p>
      )}
    </div>
  );
}

function GroupHeading({ title, color }: { title: string; color: string }) {
  return (
    <ScrollReveal className="mb-6">
      <div className="flex items-center gap-4">
        <div className={`h-8 w-1.5 rounded-full bg-gradient-to-b ${color}`} />
        <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-[var(--dark-text)]">
          {title}
        </h2>
      </div>
    </ScrollReveal>
  );
}

function LargeGroup({
  title,
  members,
  color,
}: {
  title: string;
  members: CommitteeMember[];
  color: string;
}) {
  return (
    <div>
      <GroupHeading title={title} color={color} />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {members.map((member, i) => (
          <MemberCard key={i} member={member} gradient={color} />
        ))}
      </motion.div>
    </div>
  );
}

function CompactGroup({
  title,
  members,
  color,
  small,
}: {
  title: string;
  members: CommitteeMember[];
  color: string;
  small?: boolean;
}) {
  return (
    <div>
      {small ? (
        <h3 className="font-display font-semibold text-lg text-[var(--primary-800)] mb-4 flex items-center gap-3">
          <span className={`h-6 w-1 rounded-full bg-gradient-to-b ${color}`} />
          {title}
        </h3>
      ) : (
        <GroupHeading title={title} color={color} />
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {members.map((member, i) => (
          <CompactMemberCard key={i} member={member} />
        ))}
      </div>
    </div>
  );
}

function CompactGroups({
  groups,
  color,
}: {
  groups: CommitteeGroup[];
  color: string;
}) {
  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <CompactGroup
          key={g.title}
          title={g.title}
          members={g.members}
          color={color}
          small
        />
      ))}
    </div>
  );
}

const TABS = [
  { value: "patrons", label: "Patrons" },
  { value: "organizing", label: "Organizing Committee" },
  { value: "task", label: "Task Committees" },
  { value: "national", label: "APTI National" },
  { value: "advisors", label: "Advisors & Mentors" },
  { value: "young", label: "Young Leadership" },
  { value: "regulatory", label: "PCI & Regulatory" },
] as const;

const DEFAULT_TAB = "patrons";

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function readHashTab() {
  const fromHash = window.location.hash.replace("#", "");
  return TABS.some((t) => t.value === fromHash) ? fromHash : DEFAULT_TAB;
}

export default function CommitteeClient() {
  // The active tab lives in the URL hash so links like /committee#task work.
  const tab = useSyncExternalStore(subscribeToHash, readHashTab, () => DEFAULT_TAB);

  function changeTab(value: string) {
    window.history.replaceState(null, "", `#${value}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  return (
    <div className="bg-[var(--surface-50)] min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 tribal-pattern-bg opacity-30"
          aria-hidden
        />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Organizing Committee</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            The <span className="text-gradient-primary">Team</span> Behind
            APTICON
          </h1>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-text)] max-w-xl mx-auto">
            Patrons, mentors, advisors and dedicated pharmacy educators working
            together to make APTICON 2026 a landmark event.
          </p>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      <section className="py-12 md:py-16">
        <div className="container-site">
          <Tabs value={tab} onValueChange={changeTab}>
            <div className="sticky top-16 z-20 -mx-4 px-4 py-2 bg-[var(--surface-50)]/95 backdrop-blur">
              <TabsList className="w-full h-auto justify-start overflow-x-auto flex-nowrap gap-1">
                {TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="patrons" className="mt-10 space-y-16">
              <LargeGroup title="Chief Patron" members={CHIEF_GUESTS} color={GOLD} />
              <LargeGroup title="Patrons" members={PATRONS} color={PRIMARY} />
              <LargeGroup title="Co-Patrons" members={CO_PATRONS} color={MAROON} />
              <LargeGroup
                title="Industry Patrons"
                members={INDUSTRY_PATRONS}
                color={SECONDARY}
              />
              <LargeGroup
                title="Academic Partners"
                members={ACADEMIC_PARTNERS}
                color={EMERALD}
              />
            </TabsContent>

            <TabsContent value="organizing" className="mt-10 space-y-16">
              {LOC.map((g) => (
                <LargeGroup key={g.title} title={g.title} members={g.members} color={MAROON} />
              ))}
              <LargeGroup
                title="Scientific Committee"
                members={SCIENTIFIC_COMMITTEE}
                color={PINK}
              />
              <LargeGroup
                title="Registration Committee"
                members={REGISTRATION_COMMITTEE}
                color={EMERALD}
              />
            </TabsContent>

            <TabsContent value="task" className="mt-10">
              <GroupHeading title="Task Committees" color={SECONDARY} />
              <CompactGroups groups={TASK_COMMITTEES} color={SECONDARY} />
            </TabsContent>

            <TabsContent value="national" className="mt-10 space-y-16">
              <LargeGroup
                title="APTI National Office Bearers"
                members={NATIONAL_BODY}
                color={PRIMARY}
              />
              <CompactGroup title="APTI Women Forum" members={WOMEN_FORUM} color={PINK} />
              <div>
                <GroupHeading title="APTI State Branches Leadership" color={SECONDARY} />
                <CompactGroups
                  groups={STATE_BRANCHES.map((b) => ({ title: b.state, members: b.members }))}
                  color={SECONDARY}
                />
              </div>
            </TabsContent>

            <TabsContent value="advisors" className="mt-10 space-y-16">
              <CompactGroup title="Mentors" members={MENTORS} color={GOLD} />
              <CompactGroup
                title="APTI National Advisors"
                members={NATIONAL_ADVISORS}
                color={PRIMARY}
              />
            </TabsContent>

            <TabsContent value="young" className="mt-10">
              <CompactGroup
                title="APTI Young Leadership"
                members={YOUNG_LEADERSHIP}
                color={MAROON}
              />
            </TabsContent>

            <TabsContent value="regulatory" className="mt-10 space-y-16">
              <CompactGroup title="PCI Members" members={PCI_MEMBERS} color={PRIMARY} />
              <div>
                <GroupHeading title="Regulatory Patrons" color={EMERALD} />
                <CompactGroups groups={REGULATORY_PATRONS} color={EMERALD} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
