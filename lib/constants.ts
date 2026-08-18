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
    { label: "Committee", href: "/committee" },
      { label: "Sponsors", href: "/sponsors" },
  // { label: "Speakers", href: "/speakers" },
  // { label: "Schedule", href: "/schedule" },
  { label: "Venue", href: "/venue" },
  { label: "Registration", href: "/registration" },
  { label: "Abstracts", href: "/abstracts" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export const STATS = [
  { value: 28, suffix: "th", label: "Annual Convention" },
  { value: 1500, suffix: "+", label: "Expected Delegates" },
  { value: 20, suffix: "+", label: "Expert Speakers" },
  { value: 10000, suffix: "+", label: "APTI Members Network" },
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
  inaugural: "bg-[#312E81] text-white",
  keynote: "bg-[#1E293B] text-white",
  scientific: "bg-emerald-700 text-white",
  workshop: "bg-purple-700 text-white",
  panel: "bg-orange-700 text-white",
  cultural: "bg-pink-700 text-white",
  valedictory: "bg-[#EA580C] text-[#0F172A]",
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

// All sponsorship rates are inclusive of GST, per "Sponsorship Opportunities" (APTICON 2026).
export const MAJOR_EVENT_SPONSORSHIP = [
  {
    tier: "Main Event Sponsor",
    amount: "₹10,00,000",
    color: "#B8860B",
    featured: true,
    benefits: [
      "3 complimentary registrations",
      "3 complimentary accommodations",
      "Branding with APTICON logo on leaflets & inserts in kit bag",
      "Full-page colour advertisement in souvenir",
      "Branding at venue",
      "Display at main inaugural hall",
      "5×5 metre stall for exhibition",
      "Logo on all banners, standees & promotional material",
      "Felicitation by Guest of Honour / Chief Guest",
    ],
  },
  {
    tier: "Platinum Sponsor",
    amount: "₹5,00,000",
    color: "#94A3B8",
    benefits: [
      "2 complimentary registrations",
      "2 complimentary accommodations",
      "Branding with APTICON logo on leaflets",
      "Full-page colour advertisement in souvenir",
      "Branding at venue",
      "Display at main inaugural hall",
      "3×3 sq. metre stall for exhibition",
      "Felicitation on stage",
    ],
  },
  {
    tier: "Gold Sponsor",
    amount: "₹3,00,000",
    color: "#D4AF37",
    benefits: [
      "1 complimentary registration",
      "1 complimentary accommodation",
      "Branding with APTICON logo on leaflets",
      "Full-page colour advertisement in souvenir",
      "Display at main inaugural hall",
      "Branding at venue",
      "3×3 sq. metre stall for exhibition",
      "Felicitation on stage",
    ],
  },
  {
    tier: "Silver Sponsor",
    amount: "₹2,00,000",
    color: "#C0C0C0",
    benefits: [
      "1 complimentary registration",
      "1 complimentary accommodation",
      "Branding with APTICON logo on leaflets",
      "Half-page colour advertisement in souvenir",
      "Display at main inaugural hall",
      "Branding at venue",
      "3×3 sq. metre stall for exhibition",
      "Felicitation on stage",
    ],
  },
];

export const MATERIAL_SPONSORSHIP = [
  { category: "Kit Bag", note: "3 sponsors", amount: "₹3,00,000 each", benefits: ["1 complimentary registration", "Branding with APTICON logo on kit bags", "One page colour advertisement in souvenir", "Felicitation on stage"] },
  { category: "Delegate ID Cards", note: "3 sponsors", amount: "₹1,50,000 each", benefits: ["1 complimentary registration", "Branding with APTICON logo on IDs", "Half-page B&W advertisement in souvenir", "Felicitation on stage"] },
  { category: "Writing Pads", note: "1,800 nos.", amount: "₹1,50,000", benefits: ["1 complimentary registration", "Branding with APTICON logo on pads", "Half-page B&W advertisement in souvenir", "Felicitation on stage"] },
  { category: "Ball Pen with Logo", note: "1,800 nos.", amount: "₹1,50,000", benefits: ["1 complimentary registration", "Branding with APTICON logo on pens", "Half-page B&W advertisement in souvenir", "Felicitation on stage"] },
  { category: "Gift Samples & Kit Bag Inserts", note: "3 sponsors", amount: "₹1,00,000 each", benefits: ["1 complimentary registration", "Branding with APTICON logo as inserts in kit bags", "Half-page B&W advertisement in souvenir", "Felicitation on stage"] },
  { category: "Volunteers' Uniform", note: "T-shirts & caps", amount: "₹1,50,000", benefits: ["1 complimentary registration", "Branding with APTICON logo on T-shirts & caps", "Half-page B&W advertisement in souvenir", "Felicitation on stage"] },
];

export const VENUE_SPONSORSHIP = [
  { category: "VVIP Lounge", amount: "₹1,00,000", benefits: ["1 complimentary registration", "Branding at VVIP lounge with APTICON logo", "Branding at venue", "Half-page B&W advertisement in souvenir"] },
  { category: "Registration Counters", amount: "₹1,00,000", benefits: ["1 complimentary registration", "Branding at registration counters with APTICON logo", "Half-page B&W advertisement in souvenir"] },
  { category: "APTICON Selfie Points", amount: "₹50,000", benefits: ["1 complimentary registration", "Branding at selfie points with APTICON logo", "Quarter-page B&W advertisement in souvenir"] },
  { category: "Front Office", amount: "₹25,000", benefits: ["Branding at front office with APTICON logo"] },
  { category: "Help Desk", amount: "₹25,000", benefits: ["Branding at help desk with APTICON logo"] },
  { category: "Layout & Directions Display", amount: "₹25,000", benefits: ["Branding at main entrance with APTICON logo"] },
  { category: "Outdoor Hoardings", amount: "₹1,00,000", benefits: ["2 large hoardings of sponsor outside the venue (standard size)"] },
];

export const FOOD_COURT_SPONSORSHIP = [
  { category: "Breakfast", note: "2,500 nos.", amount: "₹2,50,000", benefits: ["1 complimentary registration", "Branding in food court with APTICON logo", "Half-page colour advertisement in souvenir", "Felicitation on stage"] },
  { category: "Lunch", note: "4,000 nos.", amount: "₹7,50,000", benefits: ["4 complimentary registrations", "Accommodation for 4 representatives", "Branding in food court with APTICON logo", "Full-page colour advertisement in souvenir", "Felicitation on stage"] },
  { category: "Dinner", note: "2,000 nos.", amount: "₹5,00,000", benefits: ["3 complimentary registrations", "Accommodation for 3 representatives", "Branding in food court with APTICON logo", "Full-page colour advertisement in souvenir", "Felicitation on stage"] },
  { category: "Refreshments", amount: "₹1,50,000", benefits: ["1 complimentary registration", "Accommodation for 1 representative", "Branding in food court with APTICON logo", "Half-page B&W advertisement in souvenir", "Felicitation on stage"] },
];

export const OTHER_SPONSORSHIP = [
  { category: "Entertainment (Live Evening)", amount: "₹5,00,000", benefits: ["2 complimentary registrations", "2 complimentary accommodations", "Branding with APTICON logo on backdrop, standees & prominent venue spaces", "Half-page colour advertisement in souvenir", "Felicitation on stage"] },
  { category: "Mementoes", amount: "₹3,00,000", benefits: ["1 complimentary registration", "1 complimentary accommodation", "Branding with APTICON logo on prominent venue spaces", "Half-page colour advertisement in souvenir", "Felicitation on stage"] },
  { category: "Delegate Certificates", note: "2,000 nos.", amount: "₹2,00,000", benefits: ["Branding with APTICON logo on prominent venue spaces", "Half-page colour advertisement in souvenir", "Felicitation on stage"] },
  { category: "Scientific & Committee Certificates", note: "200 nos.", amount: "₹50,000", benefits: ["Branding with APTICON logo on prominent venue spaces", "Half-page colour advertisement in souvenir", "Felicitation on stage"] },
];

export const ACADEMIC_SPONSORSHIP = [
  { category: "Main Academic Partner", note: "1 slot", amount: "₹10,00,000", benefits: ["Position of Patron"] },
  { category: "Associate Academic Partner", note: "2 slots", amount: "₹5,00,000", benefits: ["Position of Co-Patron"] },
];

export const SOUVENIR_AD_RATES = [
  { category: "Back Cover Page", quantity: "1", amount: "₹2,00,000" },
  { category: "Front Inner Cover Page", quantity: "1", amount: "₹1,00,000" },
  { category: "Back Inner Cover Page", quantity: "1", amount: "₹1,00,000" },
  { category: "Full Page — Colour", quantity: "20", amount: "₹50,000" },
  { category: "Half Page — Colour", quantity: "20", amount: "₹30,000" },
  { category: "Full Page — B&W", quantity: "20", amount: "₹30,000" },
  { category: "Half Page — B&W", quantity: "20", amount: "₹15,000" },
  { category: "Quarter Page — Colour", quantity: "40", amount: "₹12,500" },
  { category: "Quarter Page — B&W", quantity: "40", amount: "₹10,000" },
];
