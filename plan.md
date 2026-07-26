# APTICON 2026 — Complete Website Build Plan

## Event Details (from official flyer)

| Field | Value |
|---|---|
| Event | APTICON 2026 — 28th Annual National Convention |
| Theme | "Pharma Teacher's Sankalp: Viksit Pharmacist for Atmanirbhar Bharat" |
| Sub-vision | Viksit Bharat 2047 |
| Hosted by | APTI Chhattisgarh State Branch |
| In association with | University Institute of Pharmacy, Pt. Ravishankar Shukla University, Raipur (C.G.) |
| Dates | 24th & 25th October 2026 |
| Venue | Pt. Deendayal Upadhyay Auditorium, G.E. Road, Raipur (C.G.) |
| Contact | apticon2026@gmail.com |
| Registration | Opens Soon |

---

## Tech Stack

- **Framework**: Next.js 16.2.12 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Animations**: Framer Motion + CSS custom animations
- **Fonts**: Google Fonts — Playfair Display (headings), Inter (body), Tiro Devanagari Hindi (Hindi text accents)
- **Icons**: Lucide React
- **Form**: React Hook Form (for registration & abstract submission)

### Packages to install
```
npm install framer-motion lucide-react react-hook-form
```

---

## Color Palette (extracted from official flyer)

```
--crimson-900: #6B0F0F    (deepest dark border, footer bg)
--crimson-800: #8B1A1A    (primary brand red — main banner)
--crimson-700: #A52020    (hover states, accents)
--crimson-600: #C0392B    (gradient mid)

--gold-500:    #D4AF37    (golden accent — primary gold)
--gold-400:    #F5C842    (bright gold, CTA buttons)
--gold-300:    #FFD95A    (light gold shimmer)

--navy-900:    #0D1B6E    (APTICON title blue)
--navy-800:    #1A237E    (deep navy)
--navy-700:    #283593    (section headers)

--cream-50:    #FFFDE7    (page background)
--cream-100:   #FFF8E1    (card backgrounds)
--cream-200:   #FFECB3    (subtle tinted sections)

--white:       #FFFFFF
--dark-text:   #1A1A2E   (primary text on light)
--muted-text:  #5D4037   (secondary text)
```

---

## Typography System

| Role | Font | Weight | Size |
|---|---|---|---|
| Hero Title | Playfair Display | 900 | clamp(3rem, 8vw, 7rem) |
| Section Heading | Playfair Display | 700 | clamp(2rem, 4vw, 3.5rem) |
| Sub-heading | Inter | 600 | 1.25–1.5rem |
| Body | Inter | 400 | 1rem |
| Hindi/Sanskrit accents | Tiro Devanagari | 400 | 1.1rem |
| Caption | Inter | 300 | 0.875rem |

---

## Cultural Design Language (Raipur / Chhattisgarh)

Every section incorporates authentic Chhattisgarh visual identity:

- **Bastar tribal art** patterns as SVG border ornaments
- **Gondi art** motifs — geometric sun, peacock, fish — as subtle watermarks in section backgrounds
- **Folk dancer silhouettes** (matching flyer imagery) as decorative dividers
- **Lotus** (state flower of Chhattisgarh) as card icons, section separators
- **Terracotta motifs** — earthy patterns from local pottery
- **Chhattisgarh rath / chariot wheel** as timeline bullet icon
- **Mahanadi river wave** SVG as an animated section-break wave
- **Traditional rangoli** radial patterns as hover effects on speaker cards
- **Bull motifs** (visible on flyer borders) as decorative corner elements

---

## Website Architecture

### Pages (App Router)

```
app/
├── layout.tsx                  ← root layout, fonts, metadata
├── page.tsx                    ← Home page
├── about/
│   └── page.tsx                ← About APTICON & APTI
├── speakers/
│   └── page.tsx                ← Keynote & invited speakers
├── schedule/
│   └── page.tsx                ← Full 2-day program
├── venue/
│   └── page.tsx                ← Venue + Raipur tourism
├── registration/
│   └── page.tsx                ← Registration info & form
├── abstracts/
│   └── page.tsx                ← Call for papers & submission
├── committee/
│   └── page.tsx                ← Organizing committee
├── gallery/
│   └── page.tsx                ← Photo gallery (previous APTICONs)
├── sponsors/
│   └── page.tsx                ← Sponsor tiers
└── contact/
    └── page.tsx                ← Contact + map embed
```

### Components

```
components/
├── layout/
│   ├── Navbar.tsx              ← Sticky glass-morphism navbar
│   ├── Footer.tsx              ← Cultural footer with links
│   └── MobileMenu.tsx          ← Animated slide-in menu
├── home/
│   ├── HeroSection.tsx         ← Animated hero with countdown
│   ├── CountdownTimer.tsx      ← Live countdown to Oct 24
│   ├── HighlightsBar.tsx       ← Marquee stats banner
│   ├── AboutPreview.tsx        ← Quick about with animation
│   ├── ThemeSection.tsx        ← Conference theme reveal
│   ├── KeynoteSpeakerTeaser.tsx
│   ├── ScheduleTeaser.tsx
│   ├── VenuePreview.tsx
│   └── SponsorMarquee.tsx
├── ui/
│   ├── AnimatedHeading.tsx     ← Stagger letter-by-letter heading
│   ├── GlowCard.tsx            ← Card with hover glow effect
│   ├── CulturalDivider.tsx     ← SVG folk-art section divider
│   ├── FloatingParticles.tsx   ← CSS particle background
│   ├── ScrollReveal.tsx        ← Framer Motion scroll wrapper
│   ├── GoldenBadge.tsx         ← "28th Annual" badge component
│   └── PulseButton.tsx         ← Animated CTA button
├── speakers/
│   ├── SpeakerCard.tsx         ← 3D flip card with bio
│   └── SpeakerGrid.tsx
├── schedule/
│   ├── DayTab.tsx
│   ├── SessionCard.tsx
│   └── TimelineTrack.tsx       ← Animated vertical timeline
├── registration/
│   ├── RegistrationForm.tsx
│   └── FeeTable.tsx
└── gallery/
    ├── MasonryGrid.tsx
    └── LightboxModal.tsx
```

---

## Page-by-Page Design Spec

---

### 1. HOME PAGE

#### Hero Section
- **Full-viewport** hero with a layered parallax background
- Layer 1: Cream gradient base
- Layer 2: Subtle Gondi-art SVG tile pattern (opacity 0.06)
- Layer 3: Folk dancer silhouette row at bottom edge
- **Center content**:
  - "28th Annual National Convention" — gold badge with shimmer animation
  - "APTICON" — massive display text, navy-to-crimson gradient, letter-by-letter stagger entrance
  - "2026" — crimson, bold
  - Theme text with typewriter animation
  - Date + venue pill badges
  - Two CTAs: "Register Now" (gold fill) + "View Program" (crimson outline)
- **Countdown timer** (days / hours / minutes / seconds) with flip-card animation
- Floating Lotus SVGs drift upward in the background (CSS keyframe)
- APTI logo + University logo watermarked in corners

#### Highlights Bar
- Horizontal scrolling marquee strip (crimson bg, gold text):
  `28th Annual Convention  •  500+ Delegates Expected  •  24–25 Oct 2026  •  Raipur, C.G.  •  Registration Opens Soon`

#### About Preview
- Two-column: left = text fade-in, right = animated stats counters
  - 28 years of APTICON
  - 1000+ Pharmacy Teachers network
  - 500+ Expected delegates
  - 20+ Speakers
- Bastar art border frame around the stats block

#### Theme Section
- Full-width crimson section
- Gold ornamental divider top/bottom
- Theme text in large Playfair Display
- Sub-vision "Viksit Bharat 2047" badge
- NAAC "A+" accreditation logo for university

#### Speakers Teaser
- Horizontal scroll carousel, 3D perspective tilt on hover
- "Speaker announcements coming soon" placeholder cards with rangoli spinner

#### Schedule Teaser
- Two-day overview cards with hover expand
- Animated timeline connector between days

#### Venue Preview
- Split: map iframe left + Raipur facts right
- Animated landmark icons (Mahant Ghasidas Museum, Nandanvan Zoo, Bhoramdeo Temple, Mahanadi)
- "Explore Raipur" button

#### Sponsors Marquee
- Auto-scrolling logo strip

---

### 2. ABOUT PAGE

Sections:
1. **About APTICON** — history of the annual convention (1998 → 2026), animated timeline
2. **About APTI** — Association of Pharmaceutical Teachers of India, mission, vision
3. **About APTI Chhattisgarh** — state branch, leadership
4. **About University Institute of Pharmacy** — UIP at Pt. RSU Raipur, facilities
5. **About Pt. Ravishankar Shukla University** — NAAC A+ accredited, Raipur
6. **Viksit Bharat 2047 connection** — government initiative alignment, infographic

---

### 3. SPEAKERS PAGE

Layout:
- **Keynote Speakers** — Large featured cards (with photo placeholder, institution, topic)
- **Invited Speakers** — Grid of medium flip-cards
- **Session Chairs** — compact list
- Each card: 3D flip on hover (front: photo + name; back: bio + topic + institution)
- Filter tabs: Keynote / Invited / Workshop / Panel

---

### 4. SCHEDULE PAGE

Layout:
- Day tabs: "Day 1 — 24 Oct" / "Day 2 — 25 Oct"
- Vertical animated timeline per day
- Each slot: time | session title | speaker | hall | category badge
- Categories: Inaugural | Keynote | Scientific | Workshop | Cultural | Valedictory
- Color-coded by category (using palette)
- "Download Program Book" PDF button

---

### 5. VENUE PAGE

Sections:
1. **Venue Details** — Pt. Deendayal Upadhyay Auditorium, GE Road, Raipur
   - Photos, capacity, facilities
   - Google Maps embed
2. **How to Reach Raipur**
   - By Air: Swami Vivekananda Airport (RPR) — nearest airport
   - By Train: Raipur Junction — major railway hub
   - By Road: NH 30, NH 53 connectivity
3. **Nearby Hotels** — curated list with distance from venue
4. **Explore Raipur** — cultural tourism section
   - Mahant Ghasidas Memorial Museum
   - Nandanvan Zoo & Fun World
   - Champaran (birthplace of Vallabhacharya)
   - Sirpur Archaeological Site
   - Rajim (Triveni Sangam)
   - Local cuisine: Chila, Bafauri, Aamat, Muthia

---

### 6. REGISTRATION PAGE

Sections:
1. **Registration Categories & Fee Table**
   | Category | Early Bird | Regular | On-Spot |
   |---|---|---|---|
   | APTI Member | ₹X,XXX | ₹X,XXX | ₹X,XXX |
   | Non-Member | ₹X,XXX | ₹X,XXX | ₹X,XXX |
   | Student | ₹X,XXX | ₹X,XXX | ₹X,XXX |
   | Accompanying Person | ₹X,XXX | ₹X,XXX | ₹X,XXX |

2. **Registration Form** (React Hook Form):
   - Personal info: Name, Designation, Institution, City, State
   - Contact: Email, Phone, WhatsApp
   - Category selection
   - Abstract submission checkbox
   - Payment section (UPI QR / bank transfer details)
   - Upload: payment proof

3. **Important Dates** — animated timeline

---

### 7. ABSTRACTS PAGE

Sections:
1. **Call for Abstracts** — invitation banner
2. **Themes for Submission**:
   - Pharmaceutical Education Innovation
   - Drug Discovery & Development
   - Clinical Pharmacy & Pharmacovigilance
   - Herbal & Traditional Medicine
   - Regulatory Affairs
   - Pharmacy Practice
   - Social & Community Pharmacy
3. **Abstract Guidelines** — word limit, format, submission deadline
4. **Important Dates** — animated vertical timeline
5. **Submission Form** — title, authors, institution, abstract body, theme selection, file upload

---

### 8. COMMITTEE PAGE

Sections:
1. **Patron** — Vice Chancellor, Pt. RSU
2. **Chief Patron** — APTI National President
3. **Organizing Chairman**
4. **Organizing Secretary**
5. **Scientific Committee**
6. **Registration Committee**
7. **Cultural Committee**
8. **Hospitality Committee**
- Each member: photo card with name, designation, institution
- Crimson/gold gradient badge for role

---

### 9. GALLERY PAGE

Sections:
1. **APTICON 2026 Highlights** (placeholder — updates as event progresses)
2. **Previous APTICONs** — masonry grid, lightbox on click
3. **Venue Photos** — Raipur auditorium + city
- Filter tabs by year / category
- Smooth lightbox with swipe support

---

### 10. SPONSORS PAGE

Sections:
1. **Why Sponsor** — reach, audience, branding
2. **Sponsorship Tiers**:
   - Platinum Sponsor
   - Gold Sponsor
   - Silver Sponsor
   - Bronze Sponsor
   - Supporting Sponsor
   - Knowledge Partner
   - Hospitality Partner
3. **Current Sponsors** (TBA placeholders)
4. **Download Brochure** button

---

### 11. CONTACT PAGE

Sections:
1. **Contact Cards** — organizing secretary, registration desk, abstract queries
2. **Email**: apticon2026@gmail.com
3. **Contact Form** — name, email, subject, message
4. **Venue Map** — Google Maps iframe embed
5. **Quick Links** to social (if any)

---

## Animation Blueprint

### Global Animations

| Animation | Trigger | Library | Notes |
|---|---|---|---|
| Page transition | route change | Framer Motion | slide + fade |
| Navbar shrink | scroll > 80px | CSS + JS | glass-morphism on scroll |
| Scroll reveal | element enters viewport | Framer Motion (whileInView) | fade + translateY |
| Stagger children | section mount | Framer Motion (staggerChildren) | 0.1s delay each |
| Smooth scroll | anchor links | CSS scroll-behavior | native |

### Hero Specific

| Element | Animation | Details |
|---|---|---|
| "APTICON" letters | Stagger entrance | Each letter flies in from bottom, 0.05s apart |
| "2026" | Scale + fade in | After letters settle, 0.4s delay |
| Countdown timer | Flip card | CSS 3D perspective flip on each digit change |
| Folk dancer silhouettes | Slow float + sway | CSS @keyframes, 6s infinite ease-in-out |
| Lotus particles | Float upward | CSS animation, random x-positions, 8–12s duration |
| Gold shimmer on badge | Shimmer sweep | CSS linear-gradient keyframe |
| CTA buttons | Pulse ring on hover | CSS box-shadow animation |

### Section-Level

| Section | Animation |
|---|---|
| Stats counters | Count up from 0 when in view |
| Speaker cards | 3D flip (CSS perspective + rotateY) on hover |
| Timeline (schedule) | Draw line top-to-bottom, nodes pop in sequence |
| Sponsor logos | Fade-in marquee infinite scroll |
| Gallery | Stagger fade-in masonry, scale on hover |
| Countdown flip | CSS 3D flip per digit, Framer Motion |

### Micro-interactions

- Button hover: translateY(-2px) + shadow deepens
- Card hover: scale(1.02) + gold border glow
- Nav link hover: crimson underline slides in from left
- Input focus: gold border + subtle glow
- Form submit: confetti burst (CSS + JS)

---

## Raipur Cultural Integration (Design Details)

### SVG Assets to Create

1. **`BarterBorderTop.svg`** — Bastar tribal horizontal border (repeating geometric pattern)
2. **`GondiSun.svg`** — Gondi-art radial sun motif (section watermark)
3. **`FolkDancerSilhouette.svg`** — Traditional Chhattisgarhi dancer group (hero bottom layer)
4. **`LotusIcon.svg`** — Stylized lotus for section icons
5. **`WaveManahadi.svg`** — Abstract Mahanadi wave for section breaks
6. **`TribalPattern.svg`** — Repeating 60×60 tile from Bastar art (background texture)
7. **`BullCorner.svg`** — Decorative bull corner motif (matching flyer)
8. **`RangoliCircle.svg`** — Radial rangoli as card hover overlay

### Cultural Content Blocks

- **Did You Know?** sidebars about Chhattisgarh pharma education history
- Raipur tourism cards in Venue page with authentic cultural descriptions
- Section intro lines in Hindi: "फार्मा शिक्षकों का संकल्प — विकसित भारत 2047"
- Footer: Chhattisgarh state emblem SVG + "City of Temples and Tribals" tagline

---

## Implementation Order (Step-by-Step Build Sequence)

### Phase 1 — Foundation
1. Install packages: `framer-motion lucide-react react-hook-form`
2. Update `globals.css` — full color palette CSS variables, custom fonts, base animations
3. Update `layout.tsx` — metadata, font imports (Playfair Display + Inter + Tiro Devanagari Hindi), add Navbar + Footer wrappers
4. Create `/components/ui/` base components: `ScrollReveal`, `AnimatedHeading`, `CulturalDivider`, `GlowCard`, `PulseButton`
5. Create all SVG cultural assets in `/public/cultural/`

### Phase 2 — Layout Components
6. Build `Navbar.tsx` — responsive, glass-morphism, sticky with scroll shrink
7. Build `Footer.tsx` — crimson bg, gold text, links, contact, cultural pattern border
8. Build `MobileMenu.tsx` — slide-in overlay with Framer Motion

### Phase 3 — Home Page (flagship)
9. `HeroSection.tsx` — layered parallax, animated APTICON title, folk dancers, lotus particles
10. `CountdownTimer.tsx` — flip-card countdown to Oct 24, 2026
11. `HighlightsBar.tsx` — CSS marquee
12. `AboutPreview.tsx` — stats counters + Bastar frame
13. `ThemeSection.tsx` — full-width crimson, theme reveal
14. `SpeakerTeaser.tsx` — "coming soon" card carousel
15. `VenuePreview.tsx` — split layout
16. `SponsorMarquee.tsx`
17. Wire home `page.tsx`

### Phase 4 — Content Pages
18. About page — animated history timeline
19. Speakers page — 3D flip card grid
20. Schedule page — day tabs + animated timeline
21. Venue page — maps + Raipur tourism
22. Registration page — fee table + React Hook Form
23. Abstracts page — submission guidelines + form
24. Committee page — member cards
25. Gallery page — masonry + lightbox
26. Sponsors page — tier cards
27. Contact page — form + map

### Phase 5 — Polish
28. Add page transition wrapper in layout
29. Test all Framer Motion animations, fix any jank
30. Mobile responsiveness audit (all breakpoints: 375, 768, 1024, 1440)
31. SEO: metadata per page, Open Graph tags, structured data
32. Performance: image optimization, lazy loading, font optimization
33. Accessibility: aria-labels, focus management, contrast ratios

---

## File Structure (Final)

```
apticon-2026/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── about/page.tsx
│   ├── speakers/page.tsx
│   ├── schedule/page.tsx
│   ├── venue/page.tsx
│   ├── registration/page.tsx
│   ├── abstracts/page.tsx
│   ├── committee/page.tsx
│   ├── gallery/page.tsx
│   ├── sponsors/page.tsx
│   └── contact/page.tsx
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileMenu.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── CountdownTimer.tsx
│   │   ├── HighlightsBar.tsx
│   │   ├── AboutPreview.tsx
│   │   ├── ThemeSection.tsx
│   │   ├── SpeakerTeaser.tsx
│   │   ├── VenuePreview.tsx
│   │   └── SponsorMarquee.tsx
│   ├── ui/
│   │   ├── AnimatedHeading.tsx
│   │   ├── GlowCard.tsx
│   │   ├── CulturalDivider.tsx
│   │   ├── FloatingParticles.tsx
│   │   ├── ScrollReveal.tsx
│   │   ├── GoldenBadge.tsx
│   │   └── PulseButton.tsx
│   ├── speakers/
│   │   ├── SpeakerCard.tsx
│   │   └── SpeakerGrid.tsx
│   ├── schedule/
│   │   ├── DayTab.tsx
│   │   ├── SessionCard.tsx
│   │   └── TimelineTrack.tsx
│   ├── registration/
│   │   ├── RegistrationForm.tsx
│   │   └── FeeTable.tsx
│   └── gallery/
│       ├── MasonryGrid.tsx
│       └── LightboxModal.tsx
├── public/
│   ├── cultural/
│   │   ├── bastar-border.svg
│   │   ├── gondi-sun.svg
│   │   ├── folk-dancers.svg
│   │   ├── lotus.svg
│   │   ├── mahanadi-wave.svg
│   │   ├── tribal-pattern.svg
│   │   └── rangoli-circle.svg
│   ├── logos/
│   │   ├── apti-logo.png
│   │   └── ptrsu-logo.png
│   └── images/
│       └── (venue, gallery, speakers)
├── lib/
│   ├── constants.ts            ← event data, dates, schedule
│   └── animations.ts           ← shared Framer Motion variants
├── plan.md                     ← THIS FILE
├── CLAUDE.md
├── AGENTS.md
└── package.json
```

---

## Data / Content Layer (`lib/constants.ts`)

```ts
// Event metadata
export const EVENT = {
  name: "APTICON 2026",
  edition: "28th Annual National Convention",
  theme: "Pharma Teacher's Sankalp: Viksit Pharmacist for Atmanirbhar Bharat",
  vision: "Viksit Bharat 2047",
  dates: { start: "2026-10-24", end: "2026-10-25" },
  venue: "Pt. Deendayal Upadhyay Auditorium, G.E. Road, Raipur (C.G.)",
  host: "APTI Chhattisgarh State Branch",
  partner: "University Institute of Pharmacy, Pt. Ravishankar Shukla University",
  contact: "apticon2026@gmail.com",
  targetDate: new Date("2026-10-24T09:00:00+05:30"),
};
```

---

## Responsive Breakpoints

| Breakpoint | Tailwind | Notes |
|---|---|---|
| Mobile | default / `sm:` (640px) | Single column, hamburger menu |
| Tablet | `md:` (768px) | Two column grids |
| Desktop | `lg:` (1024px) | Full layouts |
| Wide | `xl:` (1280px) + `2xl:` (1536px) | Max-width containers |

---

## SEO Metadata Plan

Each page exports a `metadata` object:
- `title`: `"[Page] | APTICON 2026 — Raipur"` 
- `description`: unique per page (150–160 chars)
- `openGraph`: image (1200×630 branded banner), url, type
- `keywords`: pharmacy, APTI, Chhattisgarh, conference 2026, Raipur
- Structured data: `Event` schema (JSON-LD) on home + registration pages

---

## Quality Checklist (before marking complete)

- [ ] All pages render without errors
- [ ] All animations play correctly on first load and scroll
- [ ] Countdown timer counts down to Oct 24, 2026 09:00 IST correctly
- [ ] Mobile menu opens/closes smoothly
- [ ] Registration form validates and shows success state
- [ ] Abstract form validates and shows success state
- [ ] All external links open in new tab with rel="noopener"
- [ ] Images have alt text
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] No console errors
- [ ] Lighthouse score: Performance ≥ 85, Accessibility ≥ 90
- [ ] Cultural SVG elements render correctly on all screen sizes
- [ ] Fonts load without FOUT (next/font used correctly)

---

*Plan version: 1.0 — Created 2026-07-26*
*Build this plan in order, phase by phase. Each phase must be fully working before the next begins.*
