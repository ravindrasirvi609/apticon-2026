import { Apple, Play } from "lucide-react";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.apticon.app";
export const APP_STORE_URL =
  "https://apps.apple.com/us/app/apticon/id6816069432";

function StoreIcon({ store }: { store: "play" | "apple" }) {
  if (store === "apple") {
    return <Apple size={22} strokeWidth={2.2} aria-hidden="true" />;
  }

  return <Play size={22} fill="currentColor" strokeWidth={2.2} aria-hidden="true" />;
}

export function AppStoreLinks({ compact = false }: { compact?: boolean }) {
  const linkClass = compact
    ? "flex min-w-36 items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
    : "flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white transition-colors hover:bg-white/20";

  return (
    <div className={`flex ${compact ? "flex-row flex-wrap" : "flex-col"} gap-2`}>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label="Download APTICON from Google Play"
      >
        <StoreIcon store="play" />
        <span className="leading-tight">
          <span className="block text-[9px] uppercase tracking-wider text-white/60">
            Get it on
          </span>
          <span className="block text-sm font-semibold">Google Play</span>
        </span>
      </a>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label="Download APTICON from the App Store"
      >
        <StoreIcon store="apple" />
        <span className="leading-tight">
          <span className="block text-[9px] uppercase tracking-wider text-white/60">
            Download on the
          </span>
          <span className="block text-sm font-semibold">App Store</span>
        </span>
      </a>
    </div>
  );
}

export default function AppStoreLinksPanel() {
  return (
    <aside className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 rounded-l-2xl bg-[var(--primary-900)] p-3 shadow-xl lg:block">
      <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--accent-400)]">
        APTICON App
      </p>
      <AppStoreLinks />
    </aside>
  );
}
