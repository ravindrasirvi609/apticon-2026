export const EVENT = {
  name: "APTICON 2026",
  edition: "28th Annual National Convention",
  theme: "Pharma Teacher's Sankalp: Viksit Pharmacist for Atmanirbhar Bharat",
  themeHindi: "फार्मा शिक्षकों का संकल्प - विकसित भारत 2047",
  vision: "Viksit Bharat 2047",
  dates: { start: "2026-10-24", end: "2026-10-25" },
  dateDisplay: "24th & 25th October 2026",
  venue: "Pt. Deendayal Upadhyay Auditorium, G.E. Road, Raipur (C.G.)",
  venueAddress:
    "G.E. Road, near Science College, Amanaka, Raipur, Chhattisgarh – 492010",
  host: "APTI Chhattisgarh State Branch",
  hostedBy: "Association of Pharmaceutical Teachers of India (APTI) Central Zone",
  organisedBy: "Association of Pharmaceutical Teachers of India (APTI) C.G. State Branch",
  partner:
    "University Institute of Pharmacy, Pt. Ravishankar Shukla University, Raipur (C.G.)",
  universityAccreditation: "NAAC Accredited 'A+'",
  contact: "apticon2026@gmail.com",
  website: "www.apticon.in",
  targetDate: new Date("2026-10-24T09:00:00+05:30"),
};

// Abstract submissions are open for 1 hour today from 2:00 PM to 3:00 PM IST.
export const ABSTRACT_SUBMISSION_START = new Date("2026-10-15T14:00:00+05:30");
export const ABSTRACT_SUBMISSION_DEADLINE = new Date("2026-10-15T15:00:00+05:30");

// Registrations are currently closed. Keep this shared by the public UI and
// payment endpoints so the closure cannot be bypassed with a direct request.
export const REGISTRATION_OPEN = false;

export function isAbstractSubmissionOpen(now = new Date()) {
  return now >= ABSTRACT_SUBMISSION_START && now <= ABSTRACT_SUBMISSION_DEADLINE;
}

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Committee", href: "/committee" },
  { label: "Sponsors", href: "/sponsors" },
  // { label: "Speakers", href: "/speakers" },
  { label: "Schedule", href: "/schedule" },
  { label: "Venue", href: "/venue" },
  { label: "Registration", href: "/registration" },
  { label: "Abstracts", href: "/abstracts" },
  { label: "Presentation Guidelines", href: "/guidelines" },
  { label: "Exhibition", href: "/exhibition" },
  { label: "Gallery", href: "/gallery" },
  { label: "WPD Post", href: "/wpd" },
  { label: "Contact", href: "/contact" },
];

export const COMMITTEE_SUBLINKS = [
  { label: "Patrons", href: "/committee#patrons" },
  { label: "Organizing Committee", href: "/committee#organizing" },
  { label: "Task Committees", href: "/committee#task" },
  { label: "APTI National", href: "/committee#national" },
  { label: "Advisors & Mentors", href: "/committee#advisors" },
  { label: "Young Leadership", href: "/committee#young" },
  { label: "PCI & Regulatory", href: "/committee#regulatory" },
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

// Scientific tracks as listed in the brochure (display only — the abstract form keeps ABSTRACT_THEMES).
export const SCIENTIFIC_TRACKS = [
  "Pharmaceutical Technology, Nanotechnology, Nanomedicine & Advanced Drug Delivery",
  "Medicinal Chemistry, Drug Discovery & Computational Pharmaceutical Sciences",
  "Pharmacognosy, Indigenous Drugs, Herbal Medicines & Phytopharmaceuticals",
  "Pharmacology, Toxicology, Clinical Research & Pharmacovigilance",
  "Pharmaceutical Analysis, Quality Assurance, Regulatory Science & Drug Regulatory Affairs",
  "Biopharmaceuticals, Pharmacokinetics, Pharmacodynamics & Precision Medicine",
  "Pharmaceutical Biotechnology, Biologics & Advanced Therapeutics",
  "Pharmaceutical Education, Professional Pharmacy, Practice & Public Health",
  "Artificial Intelligence, Bioinformatics, Medical Devices, Diagnostics & Digital Transformation in Pharmacy",
  "Pharmaceutical Management, Intellectual Property, Innovation, Sustainability & Future of Pharma",
];

export const SCHEDULE_DAY1 = [
  {
    time: "08:30 – 10:00",
    title: "Registration",
    type: "logistics",
    hall: "Auditorium Lobby",
  },
  {
    time: "08:30 – 10:00",
    title: "Breakfast",
    type: "break",
    hall: "Cafeteria",
  },
  {
    time: "10:30 – 12:00",
    title: "Inaugural Function",
    type: "inaugural",
    hall: "Main Auditorium",
  },
  {
    time: "12:00 – 12:40",
    title: "KLE Oration Lecture",
    type: "keynote",
    hall: "Main Auditorium",
    description: "Technical Session 1\nShri B. R. Shankaranand Ji, All India Organizing Secretary, Bharatiya Shikshan Mandal (BSM)\nChair: Prof. Arun Nanda, Professor, Maharshi Dayanand University, Rohtak, Haryana\nCo-chair: Prof. Anil Pethe, Professor & Dean, Datta Meghe College of Pharmacy, Adani Institute of Higher Education & Research, Deemed University, Wardha",
  },
  {
    time: "12:40 – 13:10",
    title: "Dr. G. Bhagwant Memorial Lecture",
    type: "keynote",
    hall: "Main Auditorium",
    description: "Technical Session 1\nProf. Umesh Banakar, Professor and President, Banakar Consulting Services, Westfield, Indiana, USA. Founder, Goa Center for Excellence in Intellectual Property (GCEIP)\nChair: Prof. Prabhakar Veera Reddy, University College of Pharmaceutical Sciences, Palamuru University, Mahabubnagar, Telangana\nCo-chair: Dr. Sarath Chandran C, CC Member, PCI, College of Pharmaceutical Sciences, Govt Medical College Kannur, Pariyaram",
  },
  {
    time: "13:10 – 14:00",
    title: "Panel Discussion I — Pharma Teacher’s Sankalp: From Teaching to Transforming Competencies",
    type: "panel",
    hall: "Main Auditorium",
    description: "Technical Session 1\nImplementation of New PCI Curriculum for Skill-Based, Innovation-Driven and Future-Ready Pharmacy Education\nModerator: Prof. Rakesh Somani, Principal, School of Pharmacy, DY Patil University, Navi Mumbai\nPanelists:\n• Dr. Ajay Sachan, Deputy Drugs Controller India, CDSCO, Ahmedabad Zone, Ministry of Health and Family Welfare, Govt. of India\n• Dr. Tilak Raj Bhardwaj, Baddi University of Engineering Science and Technology, Baddi, HP\n• Dr. Akash Ved, Professor and Head, Dr. A.P.J. Abdul Kalam Technical University, UP\n• Prof. Sohan Chitlange, Vice-President APTI West Zone; Vice Chancellor, ALARD University, Pune\n• Prof. M. Venkat Ramanna, Vice-President, APTI South Zone\n• Mr. Manoj Karwa, Head – Clinical Trials & Pharmacovigilance\n• Dr. Vikas Batra, Senior Group Leader (R&D), Sun Pharma, Gurugram",
  },
  {
    time: "14:00 – 14:30",
    title: "Lunch",
    type: "break",
    hall: "Cafeteria",
  },
  {
    time: "14:30 – 17:30",
    title: "Oral/Poster Presentations",
    type: "scientific",
    hall: "Main Lobby",
    description: "Runs in parallel with Technical Session 2.",
  },
  {
    time: "14:30 – 15:10",
    title: "M. L. Schroff Memorial Lecture",
    type: "keynote",
    hall: "Main Auditorium",
    description: "Technical Session 2\nProf. Vandana Patravale, Professor, Pharmaceutics, Institute of Chemical Technology, Mumbai\nChair: Dr. Narendra Devanaboyina, Principal, VJ's College of Pharmacy, Rajahmundry, Andhra Pradesh\nCo-chair: Dr. Vishal Kumar Gupta, Dean (Academics), JSS Academy of Higher Education and Research, Mysuru",
  },
  {
    time: "15:10 – 15:50",
    title: "Dr. G. P. Srivastava Memorial Lecture",
    type: "keynote",
    hall: "Main Auditorium",
    description: "Technical Session 2\nProf. Ing. Ladislav Kokoska, Professor, Faculty of Tropical AgriSciences, Czech University of Life Sciences, Prague\nChair: Prof. Kamla Pathak, Director, Research and Innovation, Lloyd Group of Institutions, Greater Noida\nCo-chair: Prof. Vandana Garg, Professor, Maharshi Dayanand University (MDU), Rohtak, Haryana",
  },
  {
    time: "15:50 – 16:30",
    title: "Shri A. Mishra Memorial Lecture in Pharmaceutical Technology",
    type: "keynote",
    hall: "Main Auditorium",
    description: "Technical Session 2\nProf. Manish Chaurasiya, Scientist G, CSIR-Central Drug Research Institute, Lucknow\nChair: Dr. Akhlesh K. Singhai, Director, School of Pharmacy, LNCT University, Bhopal\nCo-chair: Dr. K. Ravi Shankar, Principal & Professor, Aditya College of Pharmacy, Kakinada, Andhra Pradesh",
  },
  {
    time: "16:30 – 17:00",
    title: "Workshop on AI Softwares",
    type: "workshop",
    hall: "Main Auditorium",
    description: "Technical Session 2\nDr. Dharmendra Ahuja, Bureau for Health and Education Experimental Pharmacology Software",
  },
  {
    time: "17:00 – 17:15",
    title: "Hye-Tea",
    type: "break",
    hall: "Cafeteria",
  },
  {
    time: "17:15 – 20:00",
    title: "Award Function and Cultural Night",
    type: "cultural",
    hall: "Main Auditorium",
  },
  {
    time: "20:00 – 22:00",
    title: "Dinner",
    type: "break",
    hall: "Cafeteria",
  },
];

export const SCHEDULE_DAY2 = [
  {
    time: "08:00 – 09:30",
    title: "Breakfast",
    type: "break",
    hall: "Cafeteria",
  },
  {
    time: "09:30 – 10:10",
    title: "J. S. S. Oration Lecture",
    type: "keynote",
    hall: "Main Auditorium",
    description: "Prof. M. D. Burande, Director, Pharmaceutical Sciences, JSPM University, Wagholi, Pune\nChair: Dr. Surendra H. Bodake, HOD, Department of Pharmacology, GGU, Bilaspur\nCo-chair: Dr. Mohammed Haneefa, Principal, Moulana College of Pharmacy, Angadippuram, Kerala",
  },
  {
    time: "10:00 – 12:00",
    title: "Oral/Poster Presentations",
    type: "scientific",
    hall: "Main Lobby",
  },
  {
    time: "10:10 – 11:10",
    title: "Women Forum Event — Panel Discussion II",
    type: "panel",
    hall: "Main Auditorium",
    description: "Women in Pharma: From Empowerment to Leadership for Viksit Bharat @2047\nModerator: Prof. Vandana Soni, Professor, Department of Pharmaceutical Sciences, Dr. Harisingh Gour Vishwavidyalaya\nPanelists:\n• Prof. Vandana Patravale, Professor, Pharmaceutics, Institute of Chemical Technology, Mumbai\n• Prof. Meena Chintamaneni, Pro Vice-Chancellor, NMIMS Deemed to be University, Mumbai\n• Prof. Milind J. Umekar, President, APTI; Director, Smt. Kishoritai Bhoyar College of Pharmacy, Kamptee, Nagpur\n• Prof. Deependra Singh, Chairman ERC, Pharmacy Council of India; Professor, University Institute of Pharmacy, Pt. Ravishankar Shukla University, Raipur\n• Prof. Suneela Dhaneswar, Director, Amity University, Mumbai\n• Dr. Sanju Nanda, Professor, Department of Pharmaceutical Sciences, Maharshi Dayanand University, Rohtak, Haryana",
  },
  {
    time: "11:10 – 11:50",
    title: "54th IPC Trust Sponsored Lecture",
    type: "keynote",
    hall: "Main Auditorium",
    description: "Prof. Sanjay Jain, Professor, Department of Pharmaceutics, Dr. H. S. Gour University, Sagar, MP\nChair: Prof. N. V. V. Jagan Mohan Reddy, Professor, VJ's College of Pharmacy, Rajahmundry, Andhra Pradesh\nCo-chair: Dr. K. Venkat Ramanna, President, APTI AP State Branch",
  },
  {
    time: "11:50 – 12:50",
    title: "Panel Discussion III",
    type: "panel",
    hall: "Main Auditorium",
    description: "From Classroom to Pharmaceutical Innovation: Connecting Academia and Industry. Academia–Industry Convergence for Innovation, Quality, Research and an Atmanirbhar Pharmaceutical Ecosystem\nModerator: Prof. Rohit Dutt, Vice-President, APTI North Zone\nPanelists:\n• Dr. Arun S. Bhatnagar, Director General and Group Advisor, Sparsh and IIST Group of Institutions\n• Dr. Lovleen Kumar, Associate Director, Analytical Research & Development, Dr. Reddy's Laboratories, Hyderabad\n• Dr. Nagendra K Singh, Lead, Global MS&T Capacity Hub, Sandoz, Hyderabad\n• Dr. Sandeep Suryavanshi, Deputy General Manager, Alkem, Daman, Vapi\n• Mr. Kishor Jadwani, Chancellor, Columbia Professional University\n• Prof. Umesh Patil, Department of Pharmaceutical Sciences, Dr. Harisingh Gour Vishwavidyalaya",
  },
  {
    time: "13:00 – 14:00",
    title: "Lunch",
    type: "break",
    hall: "Cafeteria",
  },
  {
    time: "14:00 – 16:00",
    title: "Valedictory Function",
    type: "valedictory",
    hall: "Main Auditorium",
    description: "Release of APTI journals and newsletters; Awards & Felicitation Ceremony; APTI Annual General Body Meeting.",
  },
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
    description:
      "India's widest waterfall — the horseshoe-shaped 'Niagara of India' on the Indravati River.",
    icon: "💦",
    image: {
      src: "/cultural/CHITRAKOTE.jpg",
      alt: "Chitrakote Falls, the 'Niagara of India' in Chhattisgarh",
    },
  },
  {
    name: "Tirathgarh Waterfall",
    description:
      "A multi-tiered cascade inside Kanger Valley National Park, framed by dense sal forest.",
    icon: "💧",
    image: {
      src: "/cultural/Tirathgarh Waterfall Jagdalpur Chhattisgarh.jpg",
      alt: "Tirathgarh Waterfall near Jagdalpur, Chhattisgarh",
    },
  },
  {
    name: "Kanger Valley National Park",
    description:
      "A biosphere reserve of caves, waterfalls and rare orchids deep in Bastar's forests.",
    icon: "🌳",
    image: {
      src: "/cultural/Kanger Ghati National Park Chattisgarh.jpg",
      alt: "Kanger Valley (Kanger Ghati) National Park, Chhattisgarh",
    },
  },
  {
    name: "Kotumsar Caves",
    description:
      "Ancient limestone caves with striking stalactite and stalagmite formations.",
    icon: "🦇",
    image: {
      src: "/cultural/kotumsar-caves-jagdalpur-chhattisgarh-1-attr-hero.jpeg",
      alt: "Kotumsar Caves near Jagdalpur, Chhattisgarh",
    },
  },
  {
    name: "Ratanpur Fort",
    description:
      "A Kalachuri-era fort and temple town, once capital of the ancient Chhattisgarh kingdom.",
    icon: "🏰",
    image: {
      src: "/cultural/Ratanpur Fort.jpg",
      alt: "Ratanpur Fort in Chhattisgarh",
    },
  },
  {
    name: "Gaurighat",
    description:
      "A tranquil riverside ghat and waterfall pool, a favourite escape near Raipur.",
    icon: "🌅",
    image: {
      src: "/cultural/GAURGHAAT_small_02.JPG",
      alt: "Gaurighat waterfall near Raipur, Chhattisgarh",
    },
  },
];

export interface TravelPlace {
  name: string;
  description: string;
  image: string;
  distance?: string;
  time?: string;
}

// From the brochure — road distance and travel time from Raipur.
export const PLACES_CHHATTISGARH: TravelPlace[] = [
  {
    name: "Chitrakote Falls",
    description:
      "A major natural attraction of Chhattisgarh, widely known for its dramatic waterfall landscape.",
    image: "/cultural/CHITRAKOTE.jpg",
    distance: "~274 km",
    time: "~4 hr 24 min",
  },
  {
    name: "Tirathgarh Waterfall",
    description:
      "A scenic waterfall destination associated with the forests of Bastar.",
    image: "/cultural/Tirathgarh Waterfall Jagdalpur Chhattisgarh.jpg",
    distance: "~290 km",
    time: "~5 hr",
  },
  {
    name: "Kanger Valley National Park",
    description: "A biodiversity-rich natural destination in Bastar.",
    image: "/cultural/Kanger Ghati National Park Chattisgarh.jpg",
    distance: "~285 km",
    time: "~5 hr",
  },
  {
    name: "Kotumsar Caves",
    description: "A well-known cave attraction in the Kanger Valley region.",
    image: "/cultural/kotumsar-caves-jagdalpur-chhattisgarh-1-attr-hero.jpeg",
    distance: "~285 km",
    time: "~5 hr",
  },
  {
    name: "Sirpur",
    description:
      "An important archaeological and cultural heritage destination.",
    image: "/cultural/brochure/sirpur.jpg",
    distance: "~82 km",
    time: "~1 hr 14 min",
  },
  {
    name: "Bhoramdeo",
    description: "A historic temple and heritage site.",
    image: "/cultural/brochure/bhoramdeo.jpg",
    distance: "~135 km",
    time: "~2 hr 9 min",
  },
  {
    name: "Barnawapara",
    description: "A nature and wildlife destination.",
    image: "/cultural/brochure/barnawapara.jpg",
    distance: "~106 km",
    time: "~2 hr 45 min",
  },
  {
    name: "Mainpat",
    description: "A hill destination known for scenic landscapes.",
    image: "/cultural/brochure/mainpat.jpg",
    distance: "~300 km",
    time: "~6 hr",
  },
];

export const PLACES_RAIPUR: TravelPlace[] = [
  {
    name: "Mahant Ghasidas Memorial Museum",
    description:
      "A prominent museum showcasing the archaeological, tribal and cultural heritage of Chhattisgarh.",
    image: "/cultural/brochure/mahant-ghasidas-museum.jpg",
  },
  {
    name: "Purkhauti Muktangan",
    description:
      "An open-air cultural museum depicting the state's tribal lifestyle, traditions, folk art and architecture.",
    image: "/cultural/brochure/purkhauti-muktangan.jpg",
  },
  {
    name: "Nandan Van Zoo & Safari, Naya Raipur",
    description:
      "A major wildlife and eco-tourism destination featuring diverse flora and fauna in a natural setting.",
    image: "/cultural/brochure/nandan-van-zoo.jpg",
  },
  {
    name: "Telibandha (Marine Drive)",
    description:
      "A popular urban leisure destination around the picturesque Telibandha Lake, especially vibrant during the evening.",
    image: "/cultural/brochure/telibandha.jpg",
  },
  {
    name: "MM Fun City",
    description:
      "A popular recreational and water-park destination near Raipur, suitable for families and visitors seeking leisure activities.",
    image: "/cultural/brochure/mm-fun-city.jpg",
  },
  {
    name: "Rajiv Lochan Temple, Rajim",
    description:
      "A historic temple town at the confluence of the Mahanadi, Pairi and Sondhur rivers, known for its religious and architectural heritage.",
    image: "/cultural/brochure/rajiv-lochan-temple.jpg",
  },
  {
    name: "Sirpur (Near Raipur)",
    description:
      "A prominent archaeological and cultural heritage destination of Chhattisgarh.",
    image: "/cultural/brochure/sirpur-near-raipur.jpg",
  },
];

// All sponsorship rates are exclusive of GST, per the updated sponsorship brochure.
export const MAJOR_EVENT_SPONSORSHIP = [
  {
    tier: "Main Event Sponsor",
    amount: "₹10,00,000",
    color: "#B8860B",
    featured: true,
    benefits: [
      "4 complimentary registrations",
      "4 executive accommodations",
      "Branding with APTICON logo at leaflets, inserts in kit bag",
      "Full-page colour advertisement in souvenir",
      "Branding at venue",
      "Display at main inaugural hall",
      "5×5 metre stall for exhibition",
      "Logo on all banners, standees, promotional stuff etc",
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
      "Branding with APTICON logo (APTICON leaflets)",
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
      "Branding with APTICON logo at leaflets",
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
      "Branding with APTICON logo at leaflets",
      "Half-page colour advertisement in souvenir",
      "Display at main inaugural hall",
      "Branding at venue",
      "3×3 sq. metre stall for exhibition",
      "Felicitation on stage",
    ],
  },
];

export const MATERIAL_SPONSORSHIP = [
  {
    category: "Kit Bag",
    note: "3 sponsors",
    amount: "₹3,00,000 each",
    benefits: [
      "1 complimentary registration",
      "Branding with APTICON logo on kit bags",
      "One page colour advertisement in souvenir",
      "Felicitation on stage",
    ],
  },
  {
    category: "Delegate ID Cards",
    note: "3 sponsors",
    amount: "₹1,50,000 each",
    benefits: [
      "1 complimentary registration",
      "Branding with APTICON logo on IDs",
      "Half-page B&W advertisement in souvenir",
      "Felicitation on stage",
    ],
  },
  {
    category: "Writing Pads",
    note: "1,600 nos.",
    amount: "₹1,50,000",
    benefits: [
      "1 complimentary registration",
      "Branding with APTICON logo on pads",
      "Half-page B&W advertisement in souvenir",
      "Felicitation on stage",
    ],
  },
  {
    category: "Ball Pen with Logo",
    note: "1,600 nos.",
    amount: "₹1,50,000",
    benefits: [
      "1 complimentary registration",
      "Branding with APTICON logo on pens",
      "Half-page B&W advertisement in souvenir",
      "Felicitation on stage",
    ],
  },
  {
    category: "Gift Samples & Kit Bag Inserts",
    note: "3 sponsors",
    amount: "₹1,00,000 each",
    benefits: [
      "1 complimentary registration",
      "Branding with APTICON logo as inserts in kit bags",
      "Half-page B&W advertisement in souvenir",
      "Felicitation on stage",
    ],
  },
  {
    category: "Volunteers' Uniform",
    note: "T-shirts & caps",
    amount: "₹1,50,000",
    benefits: [
      "1 complimentary registration",
      "Branding with APTICON logo on T-shirts & caps",
      "Half-page B&W advertisement in souvenir",
      "Felicitation on stage",
    ],
  },
];

export const VENUE_SPONSORSHIP = [
  {
    category: "VVIP Lounge",
    amount: "₹1,00,000",
    benefits: [
      "1 complimentary registration",
      "Branding at VVIP lounge with APTICON logo",
      "Branding at venue",
      "Half-page B&W advertisement in souvenir",
    ],
  },
  {
    category: "Registration Counters",
    amount: "₹1,00,000",
    benefits: [
      "1 complimentary registration",
      "Branding at registration counters with APTICON logo",
      "Half-page B&W advertisement in souvenir",
    ],
  },
  {
    category: "APTICON Selfie Points",
    amount: "₹50,000",
    benefits: [
      "1 complimentary registration",
      "Branding at selfie points with APTICON logo",
      "Quarter-page B&W advertisement in souvenir",
    ],
  },
  {
    category: "Front Office",
    amount: "₹25,000",
    benefits: ["Branding at front office with APTICON logo"],
  },
  {
    category: "Help Desk",
    amount: "₹25,000",
    benefits: ["Branding at help desk with APTICON logo"],
  },
  {
    category: "Layout & Directions Display",
    amount: "₹25,000",
    benefits: ["Branding at main entrance with APTICON logo"],
  },
  {
    category: "Outdoor Hoardings",
    amount: "₹1,00,000",
    benefits: [
      "2 large hoardings of sponsor outside the venue (standard size)",
    ],
  },
  {
    category: "Stalls (10 × 12 ft)",
    amount: "₹60,000",
    benefits: ["A tea table and 2 chairs will be provided with covered space"],
  },
];

export const FOOD_COURT_SPONSORSHIP = [
  {
    category: "Breakfast",
    note: "2,500 nos.",
    amount: "₹2,50,000",
    benefits: [
      "1 complimentary registration",
      "Branding in food court with APTICON logo",
      "Half-page colour advertisement in souvenir",
      "Felicitation on stage",
    ],
  },
  {
    category: "Lunch",
    note: "3,000 nos.",
    amount: "₹7,50,000",
    benefits: [
      "4 complimentary registrations",
      "Accommodation for 4 representatives",
      "Branding in food court with APTICON logo",
      "Full-page colour advertisement in souvenir",
      "Felicitation on stage",
    ],
  },
  {
    category: "Dinner",
    note: "1,500 nos.",
    amount: "₹5,00,000",
    benefits: [
      "3 complimentary registrations",
      "Accommodation for 3 representatives",
      "Branding in food court with APTICON logo",
      "Full-page colour advertisement in souvenir",
      "Felicitation on stage",
    ],
  },
  {
    category: "Refreshments",
    amount: "₹1,50,000",
    benefits: [
      "1 complimentary registration",
      "Accommodation for 1 representative",
      "Branding in food court with APTICON logo",
      "Half-page B&W advertisement in souvenir",
      "Felicitation on stage",
    ],
  },
];

export const OTHER_SPONSORSHIP = [
  {
    category: "Entertainment (Live Evening)",
    amount: "₹5,00,000",
    benefits: [
      "2 complimentary registrations",
      "2 complimentary accommodations",
      "Branding with APTICON logo on backdrop, standees & prominent venue spaces",
      "Half-page colour advertisement in souvenir",
      "Felicitation on stage",
    ],
  },
  {
    category: "Mementoes",
    amount: "₹3,00,000",
    benefits: [
      "1 complimentary registration",
      "1 complimentary accommodation",
      "Branding with APTICON logo on prominent venue spaces",
      "Half-page colour advertisement in souvenir",
      "Felicitation on stage",
    ],
  },
  {
    category: "Delegate Certificates",
    note: "1,600 nos.",
    amount: "₹2,00,000",
    benefits: [
      "Branding with APTICON logo on prominent venue spaces",
      "Half-page colour advertisement in souvenir",
      "Felicitation on stage",
    ],
  },
  {
    category: "Scientific & Committee Certificates",
    note: "200 nos.",
    amount: "₹50,000",
    benefits: [
      "Branding with APTICON logo on prominent venue spaces",
      "Half-page colour advertisement in souvenir",
      "Felicitation on stage",
    ],
  },
];

export const ACADEMIC_SPONSORSHIP = [
  {
    category: "Main Academic Partner",
    note: "1 slot",
    amount: "₹5,00,000",
    benefits: [],
  },
  {
    category: "Associate Academic Partner",
    note: "2 slots",
    amount: "₹3,00,000",
    benefits: [],
  },
];

export const SOUVENIR_AD_RATES = [
  { category: "Back Cover Page", quantity: "1", amount: "₹2,00,000" },
  { category: "Front Inner Cover Page", quantity: "1", amount: "₹1,00,000" },
  { category: "Back Inner Cover Page", quantity: "1", amount: "₹1,00,000" },
  { category: "Full Page — Colour", quantity: "20", amount: "₹50,000" },
  { category: "Half Page — Colour", quantity: "20", amount: "₹30,000" },
  { category: "Full Page — B&W", quantity: "20", amount: "₹30,000" },
  { category: "Half Page — B&W", quantity: "20", amount: "₹20,000" },
];

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
  "Other",
] as const;

export const DESIGNATIONS = [
  "Vice Chancellor",
  "Principal / Dean / Director",
  "Professor / Teacher",
  "Research Scholars / PG Students",
  "UG Students",
  "Professionals / Consultants",
  "Accompanying Person",
] as const;
