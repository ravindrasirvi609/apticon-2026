export const EVENT = {
  name: "APTICON 2026",
  edition: "28th Annual National Convention",
  theme: "Pharma Teacher's Sankalp: Viksit Pharmacist for Atmanirbhar Bharat",
  themeHindi: "फार्मा शिक्षकों का संकल्प — विकसित भारत 2047",
  vision: "Viksit Bharat 2047",
  dates: { start: "2026-10-24", end: "2026-10-25" },
  dateDisplay: "24th & 25th October 2026",
  venue: "Pt. Deendayal Upadhyay Auditorium, G.E. Road, Raipur (C.G.)",
  host: "APTI Chhattisgarh State Branch",
  partner: "University Institute of Pharmacy, Pt. Ravishankar Shukla University, Raipur (C.G.)",
  universityAccreditation: "NAAC Accredited 'A+'",
  contact: "apticon2026@gmail.com",
  targetDate: new Date("2026-10-24T09:00:00+05:30"),
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Speakers", href: "/speakers" },
  { label: "Schedule", href: "/schedule" },
  { label: "Venue", href: "/venue" },
  { label: "Registration", href: "/registration" },
  { label: "Abstracts", href: "/abstracts" },
  { label: "Committee", href: "/committee" },
  { label: "Gallery", href: "/gallery" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "Contact", href: "/contact" },
];

export const STATS = [
  { value: 28, suffix: "th", label: "Annual Convention" },
  { value: 500, suffix: "+", label: "Expected Delegates" },
  { value: 20, suffix: "+", label: "Expert Speakers" },
  { value: 1000, suffix: "+", label: "APTI Members Network" },
];

export const ABSTRACT_THEMES = [
  "Pharmaceutical Technology",
  "Medicinal Chemistry",
  "Pharmacognosy, Indigenous Drugs, Herbal Formulations and Phytochemistry",
  "Pharmacology, Toxicology, Clinical Research & Pharmacovigilance",
  "Pharmaceutical Analysis and Quality Assurance",
  "Biopharmaceutics, Pharmacokinetics & Drug Metabolism",
  "Biotechnology and Biotherapeutics",
  "Pharmaceutical Education and Professional Pharmacy",
  "Drug Regulatory Affairs & Pharmaceutical Management",
  "Artificial Intelligence / Bioinformatics / Data Analytics",
];

export const SCHEDULE_DAY1 = [
  { time: "09:00 – 10:00", title: "Registration & Welcome Kit Distribution", type: "logistics", hall: "Main Lobby" },
  { time: "10:00 – 11:30", title: "Inaugural Ceremony", type: "inaugural", hall: "Main Auditorium", description: "Lamp lighting, welcome address, release of souvenir" },
  { time: "11:30 – 12:30", title: "Presidential Address", type: "keynote", hall: "Main Auditorium" },
  { time: "12:30 – 13:30", title: "Lunch & Networking", type: "break", hall: "Dining Hall" },
  { time: "13:30 – 15:00", title: "Keynote: Viksit Bharat 2047 — Pharmacy's Role", type: "keynote", hall: "Main Auditorium" },
  { time: "15:00 – 16:30", title: "Scientific Session I: Pharmaceutical Education Innovation", type: "scientific", hall: "Hall A" },
  { time: "16:30 – 17:00", title: "Tea Break", type: "break", hall: "Foyer" },
  { time: "17:00 – 18:30", title: "Scientific Session II: Drug Discovery & Development", type: "scientific", hall: "Hall A" },
  { time: "19:00 – 21:00", title: "Cultural Evening — Chhattisgarhi Folk Performances", type: "cultural", hall: "Open Stage" },
];

export const SCHEDULE_DAY2 = [
  { time: "09:00 – 10:30", title: "Keynote: Atmanirbhar Bharat — Indigenous Pharma", type: "keynote", hall: "Main Auditorium" },
  { time: "10:30 – 12:00", title: "Scientific Session III: Clinical Pharmacy & Pharmacovigilance", type: "scientific", hall: "Hall A" },
  { time: "12:00 – 13:00", title: "Workshop: Outcome-Based Pharmacy Education", type: "workshop", hall: "Hall B" },
  { time: "13:00 – 14:00", title: "Lunch", type: "break", hall: "Dining Hall" },
  { time: "14:00 – 15:30", title: "Scientific Session IV: Herbal Medicine & Traditional Knowledge", type: "scientific", hall: "Hall A" },
  { time: "15:30 – 16:00", title: "Tea Break", type: "break", hall: "Foyer" },
  { time: "16:00 – 17:00", title: "Panel Discussion: Future of Pharmacy Education in India", type: "panel", hall: "Main Auditorium" },
  { time: "17:00 – 18:00", title: "Valedictory Ceremony & Awards", type: "valedictory", hall: "Main Auditorium" },
];

export const SESSION_COLORS: Record<string, string> = {
  inaugural: "bg-[#8B1A1A] text-white",
  keynote: "bg-[#1A237E] text-white",
  scientific: "bg-emerald-700 text-white",
  workshop: "bg-purple-700 text-white",
  panel: "bg-orange-700 text-white",
  cultural: "bg-pink-700 text-white",
  valedictory: "bg-[#D4AF37] text-[#1A1A2E]",
  break: "bg-gray-200 text-gray-700",
  logistics: "bg-gray-100 text-gray-600",
};

export const RAIPUR_PLACES = [
  {
    name: "Chitrakote Falls",
    description: "India's widest waterfall — the horseshoe-shaped 'Niagara of India' on the Indravati River.",
    icon: "💦",
    image: { src: "/cultural/CHITRAKOTE.jpg", alt: "Chitrakote Falls, the 'Niagara of India' in Chhattisgarh" },
  },
  {
    name: "Tirathgarh Waterfall",
    description: "A multi-tiered cascade inside Kanger Valley National Park, framed by dense sal forest.",
    icon: "💧",
    image: { src: "/cultural/Tirathgarh Waterfall Jagdalpur Chhattisgarh.jpg", alt: "Tirathgarh Waterfall near Jagdalpur, Chhattisgarh" },
  },
  {
    name: "Kanger Valley National Park",
    description: "A biosphere reserve of caves, waterfalls and rare orchids deep in Bastar's forests.",
    icon: "🌳",
    image: { src: "/cultural/Kanger Ghati National Park Chattisgarh.jpg", alt: "Kanger Valley (Kanger Ghati) National Park, Chhattisgarh" },
  },
  {
    name: "Kotumsar Caves",
    description: "Ancient limestone caves with striking stalactite and stalagmite formations.",
    icon: "🦇",
    image: { src: "/cultural/kotumsar-caves-jagdalpur-chhattisgarh-1-attr-hero.jpeg", alt: "Kotumsar Caves near Jagdalpur, Chhattisgarh" },
  },
  {
    name: "Ratanpur Fort",
    description: "A Kalachuri-era fort and temple town, once capital of the ancient Chhattisgarh kingdom.",
    icon: "🏰",
    image: { src: "/cultural/Ratanpur Fort.jpg", alt: "Ratanpur Fort in Chhattisgarh" },
  },
  {
    name: "Gaurighat",
    description: "A tranquil riverside ghat and waterfall pool, a favourite escape near Raipur.",
    icon: "🌅",
    image: { src: "/cultural/GAURGHAAT_small_02.JPG", alt: "Gaurighat waterfall near Raipur, Chhattisgarh" },
  },
];

export const SPONSORSHIP_TIERS = [
  { tier: "Platinum", amount: "₹5,00,000", color: "#E5E4E2", benefits: ["Prime logo placement", "Full-page souvenir ad", "Exhibition stall", "5 delegate passes", "Banner display"] },
  { tier: "Gold", amount: "₹3,00,000", color: "#D4AF37", benefits: ["Logo on all materials", "Half-page souvenir ad", "Exhibition stall", "3 delegate passes", "Banner display"] },
  { tier: "Silver", amount: "₹1,50,000", color: "#C0C0C0", benefits: ["Logo on website & backdrop", "Quarter-page souvenir ad", "2 delegate passes"] },
  { tier: "Bronze", amount: "₹75,000", color: "#CD7F32", benefits: ["Logo on website", "Mention in proceedings", "1 delegate pass"] },
  { tier: "Knowledge Partner", amount: "₹2,00,000", color: "#1A237E", benefits: ["Session branding", "Logo on all materials", "2 delegate passes", "Exhibitor stall"] },
];
