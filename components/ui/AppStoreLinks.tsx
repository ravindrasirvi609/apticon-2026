import Image from "next/image";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.apticon.app";
export const APP_STORE_URL =
  "https://apps.apple.com/us/app/apticon/id6816069432";

export const APP_NAME = "APTICON Delegates App";

// Official store badges (public/badges). Apple's SVG is 120×40; Google's PNG is cropped to the
// badge itself (564×168) so both sit on the same baseline when given the same height.
const BADGES = {
  play: {
    src: "/badges/google-play-badge.png",
    width: 564,
    height: 168,
    href: PLAY_STORE_URL,
    alt: "Get it on Google Play",
    label: "Download the APTICON Delegates App from Google Play",
  },
  apple: {
    src: "/badges/app-store-badge.svg",
    width: 120,
    height: 40,
    href: APP_STORE_URL,
    alt: "Download on the App Store",
    label: "Download the APTICON Delegates App from the App Store",
  },
} as const;

export type Store = keyof typeof BADGES;

/** One official store badge as a link. `className` sets the height, e.g. "h-11". */
export function StoreBadge({
  store,
  className = "h-11",
}: {
  store: Store;
  className?: string;
}) {
  const b = BADGES[store];
  return (
    <a
      href={b.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={b.label}
      className="inline-block shrink-0 rounded-[9px] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      <Image
        src={b.src}
        alt={b.alt}
        width={b.width}
        height={b.height}
        unoptimized
        className={`${className} w-auto`}
      />
    </a>
  );
}

export function AppStoreLinks({
  compact = false,
  stacked = false,
}: {
  compact?: boolean;
  /** Force one badge per row (the desktop side tab). */
  stacked?: boolean;
}) {
  const height = compact ? "h-10" : "h-11";
  return (
    <div
      className={`flex ${stacked ? "flex-col items-start" : "flex-row flex-wrap items-center"} gap-3`}
    >
      <StoreBadge store="play" className={height} />
      <StoreBadge store="apple" className={height} />
    </div>
  );
}

/** Desktop side tab. Phones get <MobileAppBanner /> and the home-page section instead. */
export default function AppStoreLinksPanel() {
  return (
    <aside
      aria-label={`Download the ${APP_NAME}`}
      className="site-chrome fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 rounded-l-2xl bg-[var(--primary-900)] p-3 shadow-xl print:hidden lg:block"
    >
      <p className="mb-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--accent-400)]">
        Download the
      </p>
      <p className="mb-2.5 text-center text-xs font-bold leading-tight text-white">
        APTICON
        <br />
        Delegates App
      </p>
      <AppStoreLinks stacked />
    </aside>
  );
}
