import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import HeroConceptStrip from "@/components/home/HeroConceptStrip";
import HighlightsBar from "@/components/home/HighlightsBar";
import AboutPreview from "@/components/home/AboutPreview";
import PatronsSection from "@/components/home/PatronsSection";
import ThemeSection from "@/components/home/ThemeSection";
import SpeakerTeaser from "@/components/home/SpeakerTeaser";
import ScheduleTeaser from "@/components/home/ScheduleTeaser";
import VenuePreview from "@/components/home/VenuePreview";
import SponsorMarquee from "@/components/home/SponsorMarquee";
import CulturalDivider from "@/components/ui/CulturalDivider";

export const metadata: Metadata = {
  title: "APTICON 2026 | 28th Annual National Convention — Raipur",
  description:
    "APTICON 2026 — 28th Annual National Convention of the Association of Pharmaceutical Teachers of India. Theme: Pharma Teacher's Sankalp: Viksit Pharmacist for Atmanirbhar Bharat. 24–25 October 2026, Raipur, Chhattisgarh.",
  openGraph: {
    title: "APTICON 2026 — 28th Annual National Convention",
    description:
      "Pharma Teacher's Sankalp: Viksit Pharmacist for Atmanirbhar Bharat. 24–25 October 2026, Raipur, Chhattisgarh.",
    url: "https://apticon2026.org",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "APTICON 2026 — 28th Annual National Convention",
  description:
    "Pharma Teacher's Sankalp: Viksit Pharmacist for Atmanirbhar Bharat",
  startDate: "2026-10-24T09:00:00+05:30",
  endDate: "2026-10-25T21:00:00+05:30",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "Pt. Deendayal Upadhyay Auditorium",
    address: {
      "@type": "PostalAddress",
      streetAddress: "G.E. Road",
      addressLocality: "Raipur",
      addressRegion: "Chhattisgarh",
      addressCountry: "IN",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "APTI Chhattisgarh State Branch",
    email: "apticon2026@gmail.com",
  },
  url: "https://apticon2026.org",
};

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Event schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Full-viewport hero */}
      <HeroSection />

      {/* 2. Convention concept graphic band */}
      <HeroConceptStrip />

      {/* 3. Scrolling highlights marquee */}
      <HighlightsBar />

      {/* 3. About preview + animated stats */}
      <AboutPreview />

      {/* 4. Bastar border separator */}
      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* 4b. Patrons */}
      <PatronsSection />

      {/* 5. Conference theme — primary full-width */}
      <ThemeSection />

      {/* 6. Speakers teaser */}
      {/* <SpeakerTeaser /> */}

      {/* 7. Lotus row separator */}
      <CulturalDivider variant="lotus-row" className="py-2 container-site" />

      {/* 8. Two-day schedule overview */}
      {/* <ScheduleTeaser /> */}

      {/* 9. Venue + Raipur tourism */}
      <VenuePreview />

      {/* 10. Sponsors marquee */}
      {/* <SponsorMarquee /> */}
    </>
  );
}
