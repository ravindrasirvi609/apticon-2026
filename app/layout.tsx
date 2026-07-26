import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnnouncementBanner from "@/components/ui/AnnouncementBanner";
import ScrollProgressBar  from "@/components/ui/ScrollProgressBar";
import BackToTop          from "@/components/ui/BackToTop";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800", "900"],
});

const tiro = Tiro_Devanagari_Hindi({
  variable: "--font-tiro",
  subsets: ["devanagari"],
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "APTICON 2026 | 28th Annual National Convention — Raipur",
    template: "%s | APTICON 2026",
  },
  description:
    "APTICON 2026 — 28th Annual National Convention of the Association of Pharmaceutical Teachers of India. Theme: Pharma Teacher's Sankalp: Viksit Pharmacist for Atmanirbhar Bharat. 24–25 October 2026, Raipur, Chhattisgarh.",
  keywords: [
    "APTICON 2026",
    "APTI",
    "pharmacy conference",
    "pharmaceutical teachers",
    "Raipur",
    "Chhattisgarh",
    "Pt. Ravishankar Shukla University",
    "Viksit Bharat 2047",
  ],
  openGraph: {
    title: "APTICON 2026 — 28th Annual National Convention",
    description:
      "Pharma Teacher's Sankalp: Viksit Pharmacist for Atmanirbhar Bharat. 24–25 October 2026, Raipur (C.G.)",
    type: "website",
    locale: "en_IN",
    siteName: "APTICON 2026",
    url: "https://apticon2026.org",
  },
  twitter: {
    card: "summary_large_image",
    title: "APTICON 2026 — 28th Annual National Convention",
    description: "Pharma Teacher's Sankalp: Viksit Pharmacist for Atmanirbhar Bharat. 24–25 Oct 2026, Raipur, CG.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://apticon2026.org" },
};

export const viewport: Viewport = {
  themeColor: "#8B1A1A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${tiro.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-dvh flex flex-col bg-[var(--cream-50)] text-[var(--dark-text)] font-sans overflow-x-hidden">
        {/* Scroll progress line */}
        <ScrollProgressBar />
        {/* Skip to content — visible on keyboard focus */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--crimson-800)] focus:text-white focus:text-sm focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>
        {/* Sticky header: banner stacks above navbar, both stick together */}
        <div className="sticky top-0 z-30">
          <AnnouncementBanner />
          <Navbar />
        </div>
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        {/* Floating back-to-top */}
        <BackToTop />
      </body>
    </html>
  );
}
