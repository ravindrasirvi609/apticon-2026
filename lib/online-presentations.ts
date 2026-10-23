// Online oral presentations (21 Oct 2026) and e-poster schedule (22 Oct 2026).
// Transcribed from the official schedule PDFs. Entries marked "Not in abstract
// book" in the source have no title/affiliation here.

export interface OralPresentation {
  name: string;
  paperId: string;
  theme: string;
}

export interface EPoster {
  code: string;
  author: string;
  title?: string;
  affiliation?: string;
  subject: string;
}

export const ORAL_ONLINE = {
  date: "21 October 2026",
  time: "2:00 PM onwards",
  mode: "Online Mode",
};

export const EPOSTER_SCHEDULE = {
  date: "22 October 2026",
  time: "11:00 AM onwards",
  mode: "E-Poster Mode",
};

export const ORAL_ONLINE_LIST: OralPresentation[] = [
  {
    name: "Motapothula Venu",
    paperId: "O-PT-6",
    theme: "Pharmaceutical Technology",
  },
  {
    name: "Saloni Jaswal",
    paperId: "O-PT-105",
    theme: "Pharmaceutical Technology",
  },
  {
    name: "Dr. Raju Thenge",
    paperId: "O-PT-25",
    theme: "Pharmaceutical Technology",
  },
  {
    name: "Tilotma Sahu",
    paperId: "O-PT-103",
    theme: "Pharmaceutical Technology",
  },
  {
    name: "Dr. Neha Dubey",
    paperId: "O-PT-115",
    theme: "Pharmaceutical Technology",
  },
  {
    name: "Dr. Mukesh Kumar Singh",
    paperId: "O-PT-9",
    theme: "Pharmaceutical Technology",
  },
  {
    name: "Dr Shilpi Prasad",
    paperId: "O-PT-106",
    theme: "Pharmaceutical Technology",
  },
  {
    name: "Dr. Popat Mohite",
    paperId: "O-PT-75",
    theme: "Pharmaceutical Technology",
  },
  {
    name: "Sarika Sahu",
    paperId: "O-PT-147",
    theme: "Pharmaceutical Technology",
  },
  {
    name: "Harsh Chute",
    paperId: "O-PT-28",
    theme: "Pharmaceutical Technology",
  },
  {
    name: "Rajesh Choudhary",
    paperId: "O-PT-165",
    theme: "Pharmaceutical Technology",
  },
  { name: "Geeta", paperId: "O-PC-138", theme: "Pharmacognosy" },
  { name: "Samistha Shukla", paperId: "O-PC-277", theme: "Pharmacognosy" },
  { name: "Dr. Abhijeet Puri", paperId: "O-PC-12", theme: "Pharmacognosy" },
  { name: "Durga P Gupta", paperId: "O-PC-97", theme: "Pharmacognosy" },
  { name: "Bharti Bhatia", paperId: "O-PC-83", theme: "Pharmacognosy" },
  {
    name: "Dr. Mrs. Shailju Gulshan Gurunani",
    paperId: "O-PC-155",
    theme: "Pharmacognosy",
  },
  { name: "Grecy Nawrang", paperId: "O-PC-96", theme: "Pharmacognosy" },
  { name: "Durga Gupta", paperId: "O-PC-97", theme: "Pharmacognosy" },
  { name: "Shweta Kumari Saw", paperId: "O-PL-86", theme: "Pharmacology" },
  {
    name: "Samiksha Devendra Vaidya",
    paperId: "O-PL-87",
    theme: "Pharmacology",
  },
  { name: "Dr Saurabh Maru", paperId: "O-PL-80", theme: "Pharmacology" },
  { name: "Harshna Vishwakarma", paperId: "O-PL-82", theme: "Pharmacology" },
  { name: "Arunava Mishra", paperId: "O-PL-11", theme: "Pharmacology" },
  { name: "Saurav Kumar", paperId: "O-PL-281", theme: "Pharmacology" },
  { name: "Purvi Sahu", paperId: "O-PL-85", theme: "Pharmacology" },
  { name: "Vinay Bisen", paperId: "O-PL-57", theme: "Pharmacology" },
  { name: "Komal Thakre", paperId: "O-PL-54", theme: "Pharmacology" },
  { name: "Jaya Shree", paperId: "O-PL-166", theme: "Pharmacology" },
];

const PT = "Pharmaceutical Technology";
const PL = "Pharmacology, Toxicology, Clinical Research & Pharmacovigilance";
const PC =
  "Pharmacognosy, Indigenous Drugs, Herbal Formulations and Phytochemistry";
const MC = "Medicinal Chemistry";
const PA = "Pharmaceutical Analysis and Quality Assurance";
const AI = "Artificial Intelligence / Bioinformatics / Data Analytics";
const PE = "Pharmaceutical Education and Professional Pharmacy";

export const EPOSTER_SUBJECTS = [PT, PL, PC, MC, PA, AI, PE];

export const EPOSTER_LIST: EPoster[] = [
  // Pharmaceutical Technology
  {
    code: "P-PT-6",
    author: "Ranjit K. Harwansh",
    title:
      "Enhanced photoprotection effect of novel quercetin–phospholipid complex gel through transdermal delivery",
    affiliation:
      "University Department of Pharmacy, Sant Gahira Guru Vishwavidyalaya, Sarguja, Ambikapur - 497001, India",
    subject: PT,
  },
  {
    code: "P-PT-25",
    author: "Kavin Kumar MC",
    title:
      "Development and In-Vitro Evaluation of Donepezil Loaded β-Cyclodextrin Nano-sponge Oral Film for Multifunctional Neuroprotective Activity",
    affiliation: "Vellalar College of Pharmacy",
    subject: PT,
  },
  {
    code: "P-PT-42",
    author: "Dr. Ashish Gupta",
    title:
      "Formulation and evaluation of metoprolol succinate sublingual tablet",
    affiliation:
      "Acropolis Institute of Pharmaceutical Education and Research, Indore, MP",
    subject: PT,
  },
  {
    code: "P-PT-45",
    author: "Ritam Paul",
    title:
      "Microneedle Patches: A Novel Approach for Transdermal Drug Delivery",
    affiliation: "Himalayan Pharmacy Institute",
    subject: PT,
  },
  {
    code: "P-PT-55",
    author: "Dr. Sachin M. Kokate",
    title:
      "Formulation and Evaluation of Herbal Under-Eye Roll-On Serum for Cosmetic Application",
    affiliation: "D Y Patil University School of Pharmacy, Navi Mumbai",
    subject: PT,
  },
  {
    code: "P-PT-69",
    author: "Bhimendra D. Pankar",
    title:
      "Formulation and Characterization of Agmatine-Loaded Chitosan Nanoparticle Nasal Spray for Alzheimer's Disease",
    affiliation: "Smt. Kishoritai Bhoyar College of Pharmacy",
    subject: PT,
  },
  {
    code: "P-PT-92",
    author: "Faizan Sayyad",
    title:
      "Formulation and Evaluation of Curcumin-Loaded Nanosponge Gel for Burn Wound Healing",
    affiliation:
      "Smt. Kishoritai Bhoyar College of Pharmacy, Kamptee, Nagpur - 441001",
    subject: PT,
  },
  {
    code: "P-PT-144",
    author: "Deb Saha",
    title:
      "A review on zein and fenugreek seed carriers for nimodipine amorphous solid dispersions: Matrix mechanics and solubility enhancement",
    affiliation: "Himalayan Pharmacy Institute",
    subject: PT,
  },
  {
    code: "P-PT-149",
    author: "Tencha Subba",
    title: "Gastroretentive Drug Delivery System",
    affiliation: "Himalayan Pharmacy Institute",
    subject: PT,
  },
  {
    code: "P-PT-150",
    author: "Ms. Krutika Mandloi",
    title:
      "Smart Pharmaceutical Formulations for Cancer Therapy: From Nanocarriers to Targeted and Personalized Drug Delivery",
    affiliation: "School of Pharmacy, DAVV, Indore, India (452001)",
    subject: PT,
  },
  {
    code: "P-PT-216",
    author: "Maneesha Kumari",
    title:
      "Formulation and Evaluation of Triamcinolone Acetonide transferosomal gel",
    affiliation: "Sri Rawatpura Sarkar Institute, Kumhari",
    subject: PT,
  },
  {
    code: "P-PT-228",
    author: "Ritesh Adak",
    title:
      "Nanocarrier-mediated antimicrobial therapy: Exploring aquasomes for localized infection management",
    affiliation: "Himalayan Pharmacy Institute",
    subject: PT,
  },
  {
    code: "P-PT-231",
    author: "Debaprasad Routray",
    title:
      "Carbon dots loaded suppository containing D-mannose as a strategy against E. coli mediated vaginosis: An in vitro feasibility analysis",
    affiliation: "Centurion University",
    subject: PT,
  },
  {
    code: "P-PT-242",
    author: "Souvik Bhattacharyya",
    title: "Stimuli-responsive nanogels for targeted cancer drug delivery",
    affiliation: "Himalayan Pharmacy Institute",
    subject: PT,
  },
  {
    code: "P-PT-274",
    author: "Rishabh Kumar",
    title:
      "Development and Characterization of Colon-Targeted Multiparticulate Delivery System of 5-Fluorouracil for Colorectal Cancer",
    affiliation: "Rungta International Skills University, Bhilai, CG",
    subject: PT,
  },
  {
    code: "P-PT-293",
    author: "Pallab Chattopadhyay",
    title:
      "A review on plant-based bioactives for transdermal anti-inflammatory therapy: Focus on ginger and herbal synthetic combinations",
    affiliation: "Himalayan Pharmacy Institute",
    subject: PT,
  },
  {
    code: "P-PT-303",
    author: "Mrs. Vishakha Patidar",
    title:
      "Development and Evaluation of an AI-Assisted Personalized Healthcare System for Improving Medication Adherence and Risk Prediction in Patients with Metabolic Disorders",
    affiliation:
      "Faculty of Pharmaceutical Science, SAGE University, Indore (452020)",
    subject: PT,
  },
  {
    code: "P-PT-315",
    author: "Kishore Ale",
    title: "Ocular In-Situ Gel Drug Delivery System",
    affiliation: "Himalayan Pharmacy Institute",
    subject: PT,
  },
  {
    code: "P-PT-316",
    author: "Md Kaif Ansari",
    title:
      "Solid Lipid Nanoparticles: A review of formulation, strategies, characterization, bioavailability enhancement and future perspectives",
    affiliation: "Himalayan Pharmacy Institute",
    subject: PT,
  },
  {
    code: "P-PT-317",
    author: "Khushi Kumari",
    title: "Colon targeted drug delivery system",
    affiliation: "Himalayan Pharmacy Institute",
    subject: PT,
  },
  {
    code: "P-PT-318",
    author: "Vishal Kumar Gupta Kanu",
    title: "Transdermal Anti-Inflammatory Patches for Musculoskeletal Pain",
    affiliation: "Himalayan Pharmacy Institute",
    subject: PT,
  },
  {
    code: "P-PT-362",
    author: "Subham Prusty",
    title:
      "Development of 5-Fluorouracil Hydrogel Beads for Treatment of Colorectal Cancer",
    affiliation: "Kanak Manjari Institute of Pharmaceutical Sciences, Rourkela",
    subject: PT,
  },
  {
    code: "P-PT-431",
    author: "Mr. Pankaj Kashyap",
    title:
      "Micro-needle based delivery systems for vaccines and biological: Chemistry and analytical evaluation",
    affiliation:
      "Danteswari College of Pharmacy, Borpadar, Raipur Road, Jagdalpur",
    subject: PT,
  },
  {
    code: "P-PT-438",
    author: "Surender Sah",
    title:
      "Natural Volatile Oils as Penetration Enhancers in Transdermal Drug Delivery: A Review with Special Emphasis on Piper betle Oil",
    affiliation: "Himalayan Pharmacy Institute",
    subject: PT,
  },
  {
    code: "P-PT-444",
    author: "Abhishek Kumar Sahu",
    title:
      "Development and Evaluation of Gastroretentive Floating Microspheres for Sustained Delivery of Clarithromycin",
    affiliation: "Rungta International Skill University, Bhilai, Chhattisgarh",
    subject: PT,
  },
  {
    code: "P-PT-454",
    author: "Himani",
    title:
      "Targeted Brain Tumor Therapy through Nanoformulation: An Intranasal Approach",
    affiliation: "Maharshi Dayanand University, Rohtak, Haryana",
    subject: PT,
  },
  {
    code: "P-PT-455",
    author: "Mohammad Faizan Haidery",
    title:
      "Development and evaluation of resveratrol loaded liposomes for senostatic activity",
    affiliation: "Smt. Kishoritai Bhoyar College of Pharmacy, Kamptee",
    subject: PT,
  },
  {
    code: "P-PT-460",
    author: "Dipti Nisha Dash",
    title:
      "Exploring Clitoria ternatea Flower Herbal Bioactives for Acne Management",
    affiliation:
      "Kanak Manjari Institute of Pharmaceutical Sciences, Rourkela, Odisha",
    subject: PT,
  },
  {
    code: "P-PT-553",
    author: "Dr. Geetanjali Sahu",
    title:
      "QbD-Based Development and Optimization of Rutin-Loaded Microemulsion for Improved In-Vitro Drug Release",
    subject: PT,
  },
  {
    code: "P-PT-554",
    author: "Shailendra Patel",
    title:
      "Development of Novel Topical Delivery System of Crisaborole for Management of Psoriasis",
    affiliation:
      "Shri Shankaracharya Professional University, Bhilai - 490020, Chhattisgarh, India",
    subject: PT,
  },
  {
    code: "P-PT-555",
    author: "Sunita Singh",
    title:
      "Development, In-vitro Characterization, and Topical Antifungal Efficacy of Chromone-loaded Hydrogel Against Clinical Candida Isolates",
    affiliation:
      "Shri Shankaracharya Institute of Pharmaceutical Sciences and Research, Junwani, Bhilai, CG, 490020",
    subject: PT,
  },
  {
    code: "P-PT-558",
    author: "Rashmi Suryavanshi",
    title:
      "Formulation Development and Evaluation of Lawsone Loaded Hydrogel for the Treatment of Diabetic Wounds",
    affiliation:
      "Shri Shankaracharya Institute of Pharmaceutical Sciences and Research, Junwani, Bhilai, Chhattisgarh, 490020",
    subject: PT,
  },
  { code: "P-PT-192", author: "Dr. Arpna Indurkhya", subject: PT },
  { code: "P-PT-94", author: "Harsh Chute", subject: PT },

  // Pharmacology, Toxicology, Clinical Research & Pharmacovigilance
  {
    code: "P-PL-14",
    author: "Chandini Navuduri",
    title:
      "Herbal Bioactives and Mucoadhesive Vaginal Gel Systems for Maintaining a Healthy Vaginal Microenvironment: A Review",
    affiliation: "Raghu College of Pharmacy",
    subject: PL,
  },
  {
    code: "P-PL-15",
    author: "Vaddadi Nandini",
    title: "Target Drug Delivery Systems for Urolithiasis",
    affiliation: "Raghu College of Pharmacy, AP",
    subject: PL,
  },
  {
    code: "P-PL-17",
    author: "Aditi Pinninti",
    title:
      "Tampons and women's health: Innovations, risks, and future perspectives",
    affiliation: "Andhra University",
    subject: PL,
  },
  {
    code: "P-PL-19",
    author: "Mule Navadeep Reddy",
    title:
      "Kidney-Targeted Drug Delivery Strategies for Urolithiasis: Advances, Challenges and Future Perspectives",
    affiliation: "Raghu College of Pharmacy",
    subject: PL,
  },
  {
    code: "P-PL-20",
    author: "Prashant V. Ajmire",
    title:
      "Mitragyna parvifolia Attenuates Paracetamol-Induced Hepatorenal Injury by Preserving Antioxidant Defense and Suppressing NF-κB Signaling",
    affiliation: "Dr. Rajendra Gode Institute of Pharmacy, Amravati",
    subject: PL,
  },
  {
    code: "P-PL-35",
    author: "Dr. Naveen Shivavedi",
    title:
      "UV Spectrophotometric Method Development for Validation of Levofloxacin Marketed Formulation Using Hydrotropy",
    affiliation:
      "Shri Ram Group of Institutions, Faculty of Pharmacy, Jabalpur, M.P.",
    subject: PL,
  },
  {
    code: "P-PL-65",
    author: "Kanchan Khare",
    title:
      "Agmatine Attenuates Bone Aging in a Rat Model of Accelerated Aging Induced by D-Galactose",
    affiliation: "Smt. Kishoritai Bhoyar College of Pharmacy, Kamptee, Nagpur",
    subject: PL,
  },
  {
    code: "P-PL-67",
    author: "Sagina Sirisha",
    title:
      "Strategy for phytonutrients for targeted drug delivery for uroliths",
    affiliation: "Raghu College of Pharmacy",
    subject: PL,
  },
  {
    code: "P-PL-138",
    author: "Krushna Baliram Bajgire",
    title:
      "Brain Agmatine Dysregulation and Its Pharmacological Modulation in ENU-Induced Glioblastoma: Neurobehavioural, Oxidative and Molecular Effects",
    affiliation:
      "Smt. Kishoritai Bhoyar College of Pharmacy, Kamptee, Nagpur, 441002",
    subject: PL,
  },
  {
    code: "P-PL-250",
    author: "Vijayapandi Pandy",
    title:
      "The Mirrored Plus Maze: A Novel Behavioural Paradigm for Rodent Anxiety Assessment",
    affiliation: "Dr. Vishwanath Karad MIT World Peace University, Pune",
    subject: PL,
  },
  {
    code: "P-PL-258",
    author: "Ashutosh Kumar Sahu",
    title:
      "Pharmacological evaluation of the antipsoriatic potential of stigmasterol in an experimental model of psoriasis",
    affiliation: "Rungta International Skills University, Bhilai",
    subject: PL,
  },
  {
    code: "P-PL-367",
    author: "Poonam Sahu",
    title:
      "Development and In Vivo Evaluation of a Multicomponent Herbal Phytosome Against Chemically Induced Hepatic Injury",
    affiliation: "Columbia Institute of Pharmacy",
    subject: PL,
  },
  {
    code: "P-PL-388",
    author: "Yashraj Yadav",
    title:
      "Multitarget Polyherbal (MAB) Modulation of Inflammation, Oxidative Stress and Intestinal Barrier Dysfunction in Drug-Induced Colitis: A Preclinical Study",
    affiliation: "Swami Vivekanand College of Pharmacy, Indore",
    subject: PL,
  },
  {
    code: "P-PL-389",
    author: "Shivam Kurmi",
    title: "Formulation and evaluation of clotrimazole topical emulgel",
    affiliation:
      "Shri Ram Group of Institutions, Faculty of Pharmacy, Jabalpur, M.P. 482002, India",
    subject: PL,
  },
  { code: "P-PL-374", author: "Alka Patel", subject: PL },

  // Pharmacognosy, Indigenous Drugs, Herbal Formulations and Phytochemistry
  {
    code: "P-PC-160",
    author: "Mamta Mairisha",
    title:
      "Integrated Phytochemical Profiling and Standardization of Pilocarpus jaborandi Leaf Extract Using Chromatographic and Spectrometric Approaches",
    affiliation: "Kamla Institute of Pharmaceutical Sciences",
    subject: PC,
  },
  {
    code: "P-PC-214",
    author: "Shailendra Gurav",
    title:
      "Environmental Sustainability through Bio-Nanocomposite Films: Real-Time Spoilage Detection and Extended Preservation for Perishable Foods",
    affiliation: "Goa College of Pharmacy, 18 June Road",
    subject: PC,
  },
  {
    code: "P-PC-227",
    author: "Dhanashree R. Bawane",
    title:
      "Development and evaluation of panchgavya-based niosomal formulations for the treatment of psoriasis",
    affiliation: "Smt. Kishoritai Bhoyar College of Pharmacy, Kamptee, Nagpur",
    subject: PC,
  },
  {
    code: "P-PC-285",
    author: "Arpan Sharma",
    title:
      "Palm seed oil and androgenetic alopecia: Exploring its potential role in 5α reductase, DHT signalling and hair growth",
    affiliation: "Himalayan Pharmacy Institute, Majhitar",
    subject: PC,
  },
  {
    code: "P-PC-297",
    author: "Simran P. Shedame",
    title:
      "Evaluation of Vermicidal Activity of Phytochemical Fractions from Moringa oleifera and Carica Papaya",
    affiliation: "Shree Sainath College of Pharmacy, Nagpur",
    subject: PC,
  },
  {
    code: "P-PC-411",
    author: "Dr. Rameshroo Kenwat",
    title:
      "Quality by Design (QbD)-Driven Formulation Development, Optimization, and Ex Vivo Evaluation of Emblica officinalis Extract-Loaded Nanoemulsion for Cataract Management",
    affiliation: "Faculty of Pharmacy, SRU, Raipur",
    subject: PC,
  },
  {
    code: "P-PC-413",
    author: "Dr. Kandukuri Atchuta Kumar",
    title:
      "A Novel Approach to Pyrexia: Formulating Nyctanthes arbortristis into a Convenient Topical Roll-On System",
    affiliation:
      "JNTUGV-College of Pharmaceutical Sciences, JNTUGV, Vizianagaram",
    subject: PC,
  },
  {
    code: "P-PC-556",
    author: "Vicky Soni",
    title:
      "A Review on Pharmacognostic and Pharmacological investigation of Nyctanthes Arbortristis Linn.",
    affiliation:
      "Shri Shankaracharya Institute of Pharmaceutical Sciences and Research, Junwani, Bhilai, CG, 490020",
    subject: PC,
  },
  {
    code: "P-PC-559",
    author: "Ms. Prachi Agrawal",
    title:
      "Investigation on Achyranthes aspera Linn. for the treatment of lung infection: An evidence based approach",
    affiliation:
      "Shri Shankaracharya Institute of Pharmaceutical Sciences & Research, Junwani, Bhilai, C.G",
    subject: PC,
  },

  // Medicinal Chemistry
  {
    code: "P-MC-13",
    author: "Baratam Sandhya Rani",
    title:
      "Quality evaluation of Nyctanthes arbor-tristis extracts by UV-Vis spectroscopy and high-performance thin-layer chromatography techniques",
    affiliation: "Raghu College of Pharmacy",
    subject: MC,
  },
  {
    code: "P-MC-48",
    author: "Priyanka Sinha",
    title:
      "Rational development of some novel pharmacotherapeutically active diversely substituted chalcone compounds",
    affiliation: "Shri Rawatpura Sarkar Institute of Pharmacy, Kumhari",
    subject: MC,
  },
  {
    code: "P-MC-49",
    author: "Bhishm Kumar Sahu",
    title:
      "In silico design of DPP-4 inhibitory quinazolines: A novel expedition in heterocyclic compound research for antidiabetic drug innovation",
    affiliation: "Columbia Institute of Pharmacy, Raipur",
    subject: MC,
  },
  {
    code: "P-MC-199",
    author: "Arpan Bhattarai",
    title:
      "In Silico Studies on Phytoconstituents of Equisetum Arvense for Antileishmanial Activity",
    affiliation: "Himalayan Pharmacy Institute, Majitar, Sikkim",
    subject: MC,
  },
  {
    code: "P-MC-202",
    author: "Priyanka Dewangan",
    title:
      "In Silico Investigation of Coumarin-Based Derivatives as Potential Inhibitors of DHFR and DNA Gyrase for Antimicrobial Applications",
    affiliation: "Royal College of Pharmacy",
    subject: MC,
  },
  {
    code: "P-MC-205",
    author: "Ms. Shraddha Chouhan",
    title:
      "In silico, Synthesis and Biological evaluation of Sulfonylhydrazones analogues Targeting as Antidiabetes Agents",
    affiliation: "Sri Aurobindo Institute of Pharmacy",
    subject: MC,
  },
  {
    code: "P-MC-278",
    author: "Anchal Verma",
    title:
      "Molecular Docking Based Design, Synthesis, Characterization and Antidiabetic Activity of Novel Coumarin Analogues",
    affiliation: "Shri Rawatpura Sarkar Institute of Pharmacy, Kumhari",
    subject: MC,
  },
  {
    code: "P-MC-409",
    author: "Dr. Sarika Sharma",
    title:
      "Molecular Design of 3-[1-(Diethylamino)ethyl] Phenyl Cyclopropyl (Methyl) Carbamate for Potential Memory Enhancement",
    affiliation: "Sri Aurobindo Institute of Pharmacy, Indore (M.P)",
    subject: MC,
  },
  {
    code: "P-MC-560",
    author: "Alka Verma",
    title:
      "Design, Synthesis, and Pharmacological Evaluation of Novel Cinnamic Acid Derivatives as Safer CNS-Active Therapeutic Agents",
    affiliation:
      "Shri Shankaracharya Institute of Pharmaceutical Sciences and Research, Junwani, Bhilai (SSPU)",
    subject: MC,
  },

  // Pharmaceutical Analysis and Quality Assurance
  {
    code: "P-PA-124",
    author: "Ritu Sapra",
    title:
      "Designing Greener Chromatography: An AQbD-Driven Stability Indicating RP-HPLC Approach for Simultaneous Determination of Antidiabetic Drugs in Combined Dosage Form",
    affiliation: "School of Pharmacy, DAVV, Indore",
    subject: PA,
  },
  {
    code: "P-PA-470",
    author: "Karan Kumar Sahu",
    title:
      "Qualitative analysis of moxifloxacin hydrochloride in-situ hydrogel for ophthalmic delivery",
    affiliation:
      "Kanak Manjari Institute of Pharmaceutical Sciences, Rourkela, Odisha",
    subject: PA,
  },

  // Artificial Intelligence / Bioinformatics / Data Analytics
  {
    code: "P-AI-557",
    author: "Laxmi Banjare",
    title:
      "Artificial Intelligent-based Designed Letrozole Analogues as Aromatase Inhibitors for Breast Cancer therapy",
    affiliation:
      "Shri Shankaracharya Institute of Pharmaceutical Sciences and Research, Bhilai, Junwani 490020",
    subject: AI,
  },

  // Pharmaceutical Education and Professional Pharmacy
  {
    code: "P-PE-176",
    author: "Tushar Bhattarai",
    title:
      "Formulation and Evaluation of Fast-Dissolving Oral Films: A Simple Approach for Improved Drug Administration",
    affiliation: "Himalayan Pharmacy Institute, Majitar, Sikkim",
    subject: PE,
  },
  {
    code: "P-PE-220",
    author: "Neha Sah",
    title: "Chewable Tablets",
    affiliation: "Himalayan Pharmacy Institute, Majitar, Sikkim",
    subject: PE,
  },
  {
    code: "P-PE-240",
    author: "Aditya Adhikari",
    title:
      "Lipid Nanoparticles for oral delivery of poorly water-soluble drugs: Formulation strategies, challenges and recent advances",
    affiliation: "Himalayan Pharmacy Institute, Majhitar, Sikkim",
    subject: PE,
  },
  {
    code: "P-PE-309",
    author: "Upasana Phukan",
    title:
      "Smart nanoparticles for Targeted Cancer Therapy: From Tumor Recognition to Intracellular Delivery",
    affiliation: "Himalayan Pharmacy Institute, Majitar, Sikkim",
    subject: PE,
  },
];
