import Image from "next/image";
import { CalendarDays, MessageCircleQuestion, Star } from "lucide-react";
import { APP_NAME, AppStoreLinks } from "@/components/ui/AppStoreLinks";

const FEATURES = [
  { icon: CalendarDays, text: "Browse the session schedule on the go" },
  { icon: MessageCircleQuestion, text: "Send questions to speakers during sessions" },
  { icon: Star, text: "Share feedback on the sessions you attend" },
];

/** Home-page call to action for the delegate app — the one place phones always see it in full. */
export default function AppDownloadSection() {
  return (
    <section
      aria-labelledby="app-download-heading"
      className="relative overflow-hidden bg-gradient-to-br from-[var(--primary-900)] via-[var(--primary-800)] to-[var(--primary-900)] py-16 text-white md:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--accent-500)]/15 blur-3xl"
      />
      <div className="container-site relative grid items-center gap-10 md:grid-cols-[1fr_auto] md:gap-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-400)]">
            Free for all delegates
          </p>
          <h2
            id="app-download-heading"
            className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
          >
            Download the <span className="text-[var(--accent-400)]">{APP_NAME}</span>
          </h2>
          <p className="mt-4 max-w-xl text-base text-white/75 md:text-lg">
            Everything you need at APTICON 2026, in your pocket — available on Android
            and iPhone.
          </p>

          <ul className="mt-6 space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/90">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[var(--accent-400)]">
                  <Icon size={16} aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <AppStoreLinks />
          </div>
        </div>

        <div className="mx-auto md:mx-0 lg:mr-24">
          <div className="rounded-[2rem] border border-white/15 bg-white/5 p-3 shadow-2xl">
            <Image
              src="/apticon-icon.png"
              alt="APTICON 2026 app icon"
              width={200}
              height={200}
              className="h-40 w-40 rounded-3xl object-cover sm:h-48 sm:w-48"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
