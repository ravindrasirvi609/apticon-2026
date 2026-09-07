export interface CommitteeMember {
  name: string;
  role: string;
  designation: string;
  institution: string;
  email?: string;
  image?: string;
}

export interface StateBranch {
  state: string;
  members: CommitteeMember[];
}

export const NATIONAL_BODY: CommitteeMember[] = [
  {
    name: "Dr. Milind Janrao Umekar",
    role: "President",
    designation: "Principal & Professor",
    institution:
      "Smt. Kishoritai Bhoyar College of Pharmacy, Behind Railway Station, New Kamptee, Nagpur, Maharashtra 441002",
    email: "aptipresident1@gmail.com",
    image: "/committee/national/milind-umekar.jpg?v=2",
  },
  {
    name: "Dr. Mihir Kumar Kar",
    role: "Vice President (Eastern Region)",
    designation: "Assistant Professor",
    institution:
      "Sri Jayadev College of Pharmaceutical Sciences, Naharkanta, Bhubaneswar 752101, Odisha",
    email: "mihirkar.apti@gmail.com",
    image: "/committee/national/mihir-kar.jpg?v=2",
  },
  {
    name: "Dr. Sohan Satyanarayan Chitlange",
    role: "Vice President (Western Region)",
    designation: "Vice-Chancellor",
    institution:
      "Alard University, Survey No. 47 and 50, Near Rajiv Gandhi IT Park, Marunji, Hinjawadi, Pune 411057",
    email: "sohanchitlange@rediffmail.com",
    image: "/committee/national/sohan-chitlange.jpg?v=2",
  },
  {
    name: "Dr. Deependra Singh",
    role: "Vice President (Central Region)",
    designation: "Professor",
    institution:
      "University Institute of Pharmacy, Pt. Ravishankar Shukla University, Raipur, Chhattisgarh 492010",
    email: "deependraiop@gmail.com",
    image: "/committee/national/deependra-singh.jpg?v=2",
  },
  {
    name: "Dr. Rohit Dutt",
    role: "Vice President (Northern Region)",
    designation: "Principal",
    institution: "GMN College, Alexandra Road, Ambala Cantt, Haryana 133001",
    email: "rohitdatt23@rediffmail.com",
    image: "/committee/national/rohit-dutt.jpg?v=2",
  },
  {
    name: "Dr. Muttavarapu Venkata Ramana",
    role: "Vice President (Southern Region)",
    designation: "Associate Professor",
    institution:
      "Vagdevi College of Pharmacy, Gurazala Post, Palnadu Dist, Andhra Pradesh",
    email: "ramanagbn@gmail.com",
    image: "/committee/national/muttavarapu-ramana.jpg?v=2",
  },
  {
    name: "Dr. Raman Dang",
    role: "Secretary",
    designation: "Principal",
    institution:
      "Krupanidhi College of Pharmacy, Chikka Bellandur, Carmelram Post, Varthur Hobli, Bangalore 560035, Karnataka",
    email: "ramandang2017@gmail.com",
    image: "/committee/national/raman-dang.jpg?v=2",
  },
  {
    name: "Dr. Anil M Pethe",
    role: "Associate Secretary",
    designation: "Professor & Dean",
    institution:
      "Datta Meghe College of Pharmacy, Datta Meghe Institute of Higher Education and Research, Sawangi (Meghe), Wardha, Maharashtra 442001",
    email: "anilpethe@gmail.com",
    image: "https://aptiindia.org/images/committee/anilpethe.png",
  },
  {
    name: "Dr. Raj Shekharan",
    role: "Executive Secretary",
    designation: "Principal",
    institution: "IKON College of Pharmacy, Bangalore",
    email: "rajasekaran.aacop@gmail.com",
    image: "/committee/national/raj-shekharan.jpg?v=2",
  },
  {
    name: "Dr. V Murugan",
    role: "Treasurer",
    designation: "Prof & Academic Director",
    institution:
      "Nargund College of Pharmacy, 2nd Main Rd, Hrushikesh Nagar, Dattatreya Nagar, Hosakerehalli, Bengaluru, Karnataka 560085",
    email: "murugan_9362@yahoo.com",
    image: "/committee/national/v-murugan.jpg?v=2",
  },
  {
    name: "Dr. Pravin Digambar Chaudhari",
    role: "Immediate Past President",
    designation: "Principal",
    institution: "Modern College of Pharmacy, Nigadi, Pune, Maharashtra",
    email: "pdchaudhari21@rediffmail.com",
    image: "/committee/national/pravin-chaudhari.jpg?v=2",
  },
  {
    name: "Dr. Vandana Patravale",
    role: "National Convenor, Women’s Forum",
    designation: "Professor",
    institution: "Institute of Chemical Technology, Mumbai, Maharashtra",
    email: "vbp_muict@yahoo.co.in",
    image: "/committee/national/vandana-patravale.jpg?v=2",
  },
];

export const STATE_BRANCHES: StateBranch[] = [
  {
    state: "Andhra Pradesh",
    members: [
      {
        name: "Dr. K Venkata Ramana",
        role: "President",
        designation: "Professor & Principal",
        institution:
          "A S N Pharmacy College, Burripalem Road, Tenali, Guntur (Dt.)-522201 Andhra Pradesh",
        email: "drkvr70@gmail.com",
        image: "https://aptiindia.org/images/committee/AP/VENKATA.png",
      },
      {
        name: "Dr Y Ankamma Chowdary",
        role: "Vice President",
        designation: "Professor & Principal",
        institution:
          "NRI College Of Pharmacy, Pothvarappadu(V), Agiripalli(M),Krishna(Dt.) - 521212 Andhra Pradesh",
        email: "yarlagaddaac@yahoo.co.in",
        image: "https://aptiindia.org/images/committee/AP/ANKAMMA.png",
      },
      {
        name: "Dr. A. Lakshmana Rao",
        role: "Vice President",
        designation: "Professor & Principal",
        institution:
          "V. V. Institute Of Pharmaceutical Sciences, Gudlavalleru Post,Krishna (Dt.)-521356 Andhra Pradesh",
        email: "dralrao@gmail.com",
        image: "https://aptiindia.org/images/committee/AP/ATMAKUR.png",
      },
      {
        name: "Dr D Narendra",
        role: "Secretary",
        designation: "Professor & Principal",
        institution:
          "VJ's College Of Pharmacy Rajahmundry, East Godavari(Dt.) Andhra Pradesh",
        email: "narendrapharmacy1@gmail.com",
        image:
          "https://aptiindia.org/images/committee/AP/AP-secretary_photo_new.jpg",
      },
    ],
  },
  {
    state: "Assam",
    members: [
      {
        name: "Dr. Bhargab Jyoti Sahariah",
        role: "President",
        designation: "Principal",
        institution:
          "NETES Institute of Pharmaceutical Science, Mirza, Kamrup, Assam, India",
        email: "bhargabjyoti@gmail.com",
        image: "https://aptiindia.org/images/committee/AS/bhargab1.png",
      },
      {
        name: "Dr. Apurba Talukdar",
        role: "Vice President",
        designation: "Associate Professor",
        institution:
          "NETES Institute of Pharmaceutical Science, Santipur, Mirza Kamrup, Assam.",
        email: "apurbatalukdar83@gmail.com",
        image: "https://aptiindia.org/images/committee/AS/apruba1.png",
      },
      {
        name: "Dr. Ram Kumar Sahu",
        role: "Vice President",
        designation: "Assistant Professor",
        institution:
          "Department of Pharmaceutical Sciences, Assam University,Silchar, Assam, India",
        email: "ramsahu79@yahoo.co.in",
        image: "https://aptiindia.org/images/committee/AS/ram1.png",
      },
      {
        name: "Dr. Saikat Sen",
        role: "Secretary",
        designation: "Professor",
        institution:
          "Faculty of Pharmaceutical Sciences, Assam down town University, Guwahati, India.",
        email: "saikat.pharm@rediffmail.com",
        image: "https://aptiindia.org/images/committee/AS/sen1.png",
      },
    ],
  },
  {
    state: "Chhattisgarh",
    members: [
      {
        name: "Amber Vyas",
        role: "President",
        designation: "Assistant Professor",
        institution:
          "University Institute of Pharmacy, Pt. Ravishankar Shukla University, Raipur, Chhattisgarh 492010",
        email: "ambervyas@gmail.com",
        image: "https://aptiindia.org/images/committee/CG/amber.png",
      },
      {
        name: "Dr. Ajazuddin",
        role: "Vice President",
        designation: "Principal and Professor",
        institution:
          "Rungta College of Pharmaceutical Sciences and Research, Rungta Educational Campus, Bhilai, Chhattisgarh 490024",
        email: "write2ajaz@gmail.com",
        image: "https://aptiindia.org/images/committee/CG/azad.png",
      },
      {
        name: "Dr Shekhar Verma",
        role: "Vice President",
        designation: "Professor",
        institution:
          "University College of Pharmacy, Pt. Deendayal Upadhyay Memorial Health Sciences and Ayush University of Raipur, Chhattisgarh 492001",
        email: "shekharpharma@gmail.com",
        image: "https://aptiindia.org/images/committee/CG/shekhars.png",
      },
      {
        name: "Prof. Shivshankar Shukla",
        role: "Secretary",
        designation: "Professor",
        institution: "Columbia Institute of Pharmacy, Tekari Raipur (C.G.)",
        email: "shivpharma007@gmail.com",
        image: "https://aptiindia.org/images/committee/CG/shukla.png",
      },
    ],
  },
  {
    state: "Goa",
    members: [
      {
        name: "Dr. Mangirish N Deshpande",
        role: "President",
        designation: "Assistant Professor",
        institution:
          "PES's Rajaram and Tarabai Bandekar college of Pharmacy Farmagudi, Ponda, Goa",
        email: "mangirishd@gmail.com",
        image: "https://aptiindia.org/images/committee/GO/mangirish.png",
      },
      {
        name: "Dr. Shailendra S. Gurav",
        role: "Vice President",
        designation: "Professor",
        institution: "Goa College of Pharmacy, Panaji, Goa",
        email: "shailendra.gurav@nic.in",
        image: "https://aptiindia.org/images/committee/GO/shivaji.png",
      },
      {
        name: "Dr. (Mrs) Pearl K. Dighe",
        role: "Vice President",
        designation: "Assistant Professor",
        institution:
          "PES's Rajaram and Tarabai Bandekar College of Pharmacy, Farmagudi, Ponda, Goa",
        email: "pirespearl@gmail.com",
        image: "https://aptiindia.org/images/committee/GO/pearl.png",
      },
      {
        name: "Dr. Suwarna S. Bobde",
        role: "Secretary",
        designation: "Assistant Professor",
        institution:
          "PES’s Rajaram and Tarabai Bandekar college of Pharmacy, Farmagudi, Ponda, Goa",
        email: "suwarnabobde@gmail.com",
        image: "https://aptiindia.org/images/committee/GO/bobde.png",
      },
    ],
  },
  {
    state: "Gujarat",
    members: [
      {
        name: "Dr Tejal R. Gandhi",
        role: "President",
        designation: "Principal",
        institution:
          "Anand Pharmacy College, Milan Park Society, Near President Hotel, Navarangpura, Anand, Gujarat 380009",
        email: "gandhi.tejal@hotmail.com",
        image: "https://aptiindia.org/images/committee/GU/tejal.png",
      },
      {
        name: "Dr. Nehal J. Shah",
        role: "Vice President",
        designation: "Principal",
        institution:
          "Shivam Pharmaceutical Studies & Research Centre, Anand, Gujarat",
        email: "nehal9175@gmail.com",
        image: "https://aptiindia.org/images/committee/GU/nehal.png",
      },
      {
        name: "Dr. Dhiren P. Shah",
        role: "Vice President",
        designation: "Principal",
        institution:
          "C K Pithawalla Institute Of Pharmaceutical Science & Research, Near Malvan Mandir, Gavior Gam, Surat Gujarat- 395007",
        email: "dhirenpshah1@gmail.com",
        image: "https://aptiindia.org/images/committee/GU/dhiren.png",
      },
      {
        name: "Dr. D M Patel",
        role: "Secretary",
        designation: "Associate Professor",
        institution:
          "Graduate School of Pharmacy, Gujarat Technological University, Gandhinagar",
        email: "drdmpatel1971@gmail.com",
        image: "https://aptiindia.org/images/committee/Dr_D_M_Patel.jpg",
      },
    ],
  },
  {
    state: "Haryana",
    members: [
      {
        name: "Dr. Harish Dureja",
        role: "President",
        designation: "Professor And Head",
        institution:
          "Department Of Pharmaceutical Sciences, Maharshi Dayanand University, Rohtak, Haryana- 124001",
        email: "harishdureja@gmail.com",
        image: "https://aptiindia.org/images/committee/HA/dureja.png",
      },
      {
        name: "Shiv Kumar Yadav",
        role: "Vice President",
        designation: "Principal",
        institution:
          "B. S. Anangpuria Institute of Pharmacy, Alampur, Ballabgarh-Sohna Road, Faridabad-121004",
        email: "shivbsaip@gmail.com",
        image: "https://aptiindia.org/images/committee/HA/yadav.png",
      },
      {
        name: "Dr. Naveen Khatri",
        role: "Vice President",
        designation: "Assistant Professor",
        institution:
          "College of Pharmacy, Pt. B. D. Sharma, University of Health Sciences, Rohtak, Haryana-124001",
        email: "khatri_naveen1@yahoo.co.in",
        image: "https://aptiindia.org/images/committee/HA/khatri.png",
      },
      {
        name: "Prof.(Dr.) Jitender Singh",
        role: "Secretary",
        designation: "Professor & Principal",
        institution: "Lord Shiva College of Pharmacy, Sirsa",
        email: "saggujittu@yahoo.com",
        image: "https://aptiindia.org/images/committee/HA/singh.png",
      },
    ],
  },
  {
    state: "Himachal Pradesh",
    members: [
      {
        name: "Dr Rajendra Guleria",
        role: "President",
        designation: "Dean Pharmacy",
        institution:
          "Himachal Pradesh Technical University, Daruhi, Hamirpur Himachal Pradesh 177001",
        email: "guleria_rajender@yahoo.com",
        image: "https://aptiindia.org/images/committee/guleria.png",
      },
      {
        name: "Dr Bharat Parashar",
        role: "Vice President",
        designation: "Professor & Dean",
        institution:
          "Faculty of Pharmaceutical Sciences, ICFAI University, Himachal Pradesh 174103",
        email: "bharat.research@gmail.com",
        image: "https://aptiindia.org/images/committee/parashar.png",
      },
      {
        name: "Dr. Dheeraj Kaushik",
        role: "Vice President",
        designation: "Head of Department",
        institution:
          "Department of Pharmacy, Government Polytechnic for Women Kandaghat, Himachal Pradesh 173215",
        email: "dheerajkaushik1970@gmail.com",
        image: "https://aptiindia.org/images/committee/dheerej.png",
      },
      {
        name: "Dr Vinay Pandit",
        role: "Secretary",
        designation: "Professor & Head, Department of Pharmaceutics",
        institution:
          "Laureate Institute of Pharmacy, Village and Post Office Kathog, Tehsil Jawlamukhi, District Kangra Himachal Pradesh 176031",
        email: "vinay2121@gmail.com",
        image: "https://aptiindia.org/images/committee/HL/vinay.png",
      },
    ],
  },
  {
    state: "Jammu and Kashmir",
    members: [
      {
        name: "Mohammad Ishaq Geer",
        role: "President",
        designation: "Professor",
        institution: "Dept. of Pharmaceutical Sciences, University of Kashmir",
        email: "ishaqgeer@gmail.com",
        image:
          "https://aptiindia.org/images/committee/JK/MOHAMMAD-ISHAQ-GEER.png",
      },
      {
        name: "Dr. Gazanfar Ahmad",
        role: "Vice President",
        designation: "Assistant Professor",
        institution: "Prabha Harjilal College of Pharmacy, Jammu",
        email: "gazanfarahmads@gmail.com",
        image: "https://aptiindia.org/images/committee/JK/Gazanfar-Ahmad.png",
      },
      {
        name: "Junaid Tantray",
        role: "Vice President",
        designation: "Associate Professor",
        institution: "NIMS Institute of Pharmacy, NIMS University Jaipur",
        email: "junaidtantray22@gmail.com",
        image: "https://aptiindia.org/images/committee/JK/Junaid-Tantray.png",
      },
      {
        name: "Shahid-ud-Din Wani",
        role: "Secretary",
        designation: "Assistant Professor (Contractual)",
        institution: "Dept. of Pharmaceutical Sciences, University of Kashmir",
        email: "shahidpharma2013@gmail.com",
        image:
          "https://aptiindia.org/images/committee/JK/Shahid-ud-Din-Wani.png",
      },
    ],
  },
  {
    state: "Jharkhand",
    members: [
      {
        name: "Dr.Niranjan Sutar",
        role: "President",
        designation: "Professor & Head",
        institution:
          "H.G.E.A.College of Pharmacy, Bokaro Steel City, Jharkhand - 827010",
        email: "niranjansutar77@rediffmail.com",
        image: "https://aptiindia.org/images/committee/sutur.png",
      },
      {
        name: "Mrs. Ranju Garai",
        role: "Vice President",
        designation: "Vice Principal",
        institution:
          "HGEA College of Pharmacy, Viil/Post: Ghatiyali, P. S.: Pindrajora ,Dist-Bokaro, Jharkhand-827010",
        email: "ranjusutar_1981@rediffmail.com",
        image: "https://aptiindia.org/images/committee/JKD/ranju.png",
      },
      {
        name: "Dr. Deepak Kumar",
        role: "Vice President",
        designation: "",
        institution:
          "Professor cum principal Ranchi college of pharmacy Kute Toli Tetri Namkum Ranchi-834010",
        email: "deepakrcp17@gmail.com",
        image: "https://aptiindia.org/images/deepak_kumar_jrk.jpg",
      },
      {
        name: "Dr. Bishnudeo Lal Dass",
        role: "Secretary",
        designation: "Principal",
        institution:
          "Om Sadashiva College of Pharmacy, Sagdaha, Jasidih- Kumaitha stadium road, Jasidih,Deoghar-814142",
        image: "https://aptiindia.org/images/committee/JKD/dass.png",
      },
    ],
  },
  {
    state: "Karnataka",
    members: [
      {
        name: "Dr. H. Shivakumar",
        role: "President",
        designation: "Professor and Head Dept. of Pharmacology",
        institution:
          "BLDEA's SSM College of Pharmacy and Research Centre, A++, NAAC Accredited Vijayapur – 586013, Karnataka.",
        email: "shivkumarhugar@yahoo.com",
        image: "https://aptiindia.org/images/committee/KA/shivakumar.png",
      },
      {
        name: "Dr Shivakumar Shiddalingaswami Inamdar",
        role: "Vice President",
        designation: "Associate Professor Dept. of Pharmacology",
        institution:
          "HKE’s Matoshree Taradevi Rampure Institute of Pharmaceutical Sciences, Kalaburagi – 585105, Karnataka",
        email: "inamdar_06@rediffmail.com",
        image: "https://aptiindia.org/images/committee/KA/inamdar.png",
      },
      {
        name: "Dr. Charan C S",
        role: "Vice President",
        designation: "Associate Professor",
        institution:
          "Sharada Vilas College of Pharmacy, K M Puram, Mysuru Karnataka – 570004",
        email: "charangowdacs@gmail.com",
        image: "https://aptiindia.org/images/committee/KA/chanducs.png",
      },
      {
        name: "Dr. Nanjappaiah H.M",
        role: "Secretary",
        designation: "Associate Professor",
        institution:
          "BLDEA’s SSM College of Pharmacy & Research Center, A++, NAAC Accredited Vijayapur – 586013, Karnataka.",
        email: "ssmcop.nanjappaiahhanakuntimath@bldea.org",
        image: "https://aptiindia.org/images/committee/KA/nanjappaiah.png",
      },
    ],
  },
  {
    state: "Kerala",
    members: [
      {
        name: "Dr. Mohammed Haneefa K P",
        role: "President",
        designation: "Principal",
        institution: "Moulana College Of Pharmacy, Angadippuram, Kerala",
        email: "haneefa001@gmail.com",
        image: "https://aptiindia.org/images/committee/haneefa.png",
      },
      {
        name: "Dr. Sarath Chandran. C",
        role: "Vice President",
        designation: "Assistant Professor",
        institution:
          "College Of Pharmaceutical Sciences, Govt Medical College Kannur, Pariyaram, Kannur, Kerala",
        email: "scshenoy@gmail.com",
        image: "https://aptiindia.org/images/committee/KE/SARATH.png",
      },
      {
        name: "Dr. Sujith S Nair",
        role: "Vice President",
        designation: "Professor & Vice Principal",
        institution:
          "Crescent College Of Pharmaceutical Sciences, Madayipara, Payangadi R.S (P.O), Kannur, Kerala 670358",
        email: "tosujithsnair@gmail.com",
        image: "https://aptiindia.org/images/committee/KE/SUJITH.png",
      },
      {
        name: "Mr. Praveenraj R",
        role: "Secretary",
        designation: "Associate Professor",
        institution: "St. Joseph’s College Of Pharmacy, Cherthala, Kerala.",
        email: "r_praveenraj@rediffmail.com",
        image: "https://aptiindia.org/images/committee/KE/RAJ.png",
      },
    ],
  },
  {
    state: "Madhya Pradesh",
    members: [
      {
        name: "Dr. Nirmal Dongre",
        role: "President",
        designation: "Professor & Head",
        institution:
          "Institute Of Pharmaceutical Sciences, SAGE University Indore, Madhya Pradesh- 452020",
        email: "dongrenirmal@gmail.com",
        image: "https://aptiindia.org/images/committee/MP/NIRMAL.png",
      },
      {
        name: "Dr. Shailesh Jain",
        role: "Vice President",
        designation: "Dean, Faculty Of Pharmacy",
        institution:
          "SAM College Of Pharmacy, SAM Global University, Bhopal, Madhya Pradesh",
        email: "shailesh2210@gmail.com",
        image: "https://aptiindia.org/images/committee/MP/shailesh.png",
      },
      {
        name: "Dr. Alok Pal Jain",
        role: "Vice President",
        designation: "Principal",
        institution:
          "RKDF College of Pharmacy, Savpalli Radha Krishnan University, Misrod, Bhopal, Madhya Pradesh- 482047",
        email: "dralokpaljain@gmail.com",
        image: "https://aptiindia.org/images/committee/MP/alok.png",
      },
      {
        name: "Dr. Rakesh Patel",
        role: "Secretary",
        designation: "Principal",
        institution:
          "School of Pharmacy, Dr APJ Abdul Kalam University, Indore, Madhya Pradesh.",
        email: "secretaryaptimp2022@gmail.com",
        image: "https://aptiindia.org/images/committee/MP/rakesh.png",
      },
    ],
  },
  {
    state: "Maharashtra",
    members: [
      {
        name: "Dr. Rakesh R Somani",
        role: "President",
        designation: "Professor and Principal",
        institution: "D Y Patil University School of Pharmacy , Navi Mumbai",
        email: "rakeshrsomani@gmail.com",
        image: "https://aptiindia.org/images/maharashtra/Rakesh-R-Somani.jpg",
      },
      {
        name: "Dr. Shirish Premchand Jain",
        role: "Vice President",
        designation: "Professor and Principal",
        institution: "Rajarshi Shahu College of Pharmacy, Buldana",
        email: "shirishjain246955@gmail.com",
        image:
          "https://aptiindia.org/images/maharashtra/Shirish-Premchand-Jain.jpg",
      },
      {
        name: "Dr. Swaroop R. Lahoti",
        role: "Vice President",
        designation: "Professor and Head",
        institution:
          "Y.B. Chavan College of Pharmacy, Chh Sambhajinagar, Maharashtra-431001",
        email: "pharmalahoti@gmail.com",
        image: "https://aptiindia.org/images/maharashtra/Swaroop-R-Lahoti.jpg",
      },
      {
        name: "Dr. Vivekkumar K Redasani",
        role: "Hon. Secretary",
        designation: "Professor and Principal",
        institution:
          "MShri Vile Parle Kelavani Mandal’s College of Pharmacy, Shirpur",
        email: "drvivek.redasani@gmail.com",
        image:
          "https://aptiindia.org/images/maharashtra/Vivekkumar-K-Redasani.jpg",
      },
    ],
  },
  {
    state: "New Delhi",
    members: [
      {
        name: "P K Sahoo",
        role: "President",
        designation: "Professor",
        institution:
          "Delhi Institute of Pharmaceutical Sciences and Research (DIPSAR), New Delhi 110017",
        email: "pksahoo10@rediffmail.com",
        image: "https://aptiindia.org/images/committee/ND/sahoo.png",
      },
      {
        name: "Prof. Javed Ali",
        role: "Vice President",
        designation: "",
        institution: "",
        email: "javedali@yahoo.com",
      },
      {
        name: "Prof. Sanjula Baboota",
        role: "Vice President",
        designation: "",
        institution: "",
        email: "saboota@rediffmail.com",
      },
      {
        name: "Dr. Sushma Talegaonkar",
        role: "Secretary",
        designation: "",
        institution: "",
        email: "stalegaonkar@gmail.com",
      },
    ],
  },
  {
    state: "Orissa",
    members: [
      {
        name: "Dr. Somzeet Panda",
        role: "President",
        designation: "Professor",
        institution: "Gayatri College Of Pharmacy, Sambalpur, Odisha 768006",
        email: "somezeet@gmail.com",
        image: "https://aptiindia.org/images/committee/OD/somzeet.png",
      },
      {
        name: "Dr. Snigdha Pattnaik",
        role: "Vice President",
        designation: "Professor",
        institution:
          "School Of Pharmaceutical Sciences, Siksha 'O' Anusandhan University, Kalinga Nagar, Ghatikia, Bhubaneswar-751030, Odisha",
        email: "pattnaiksnigdha@yahoo.com",
        image: "https://aptiindia.org/images/committee/OD/snigdha.png",
      },
      {
        name: "Satyabrata Sahu",
        role: "Vice President",
        designation: "Professor",
        institution: "Dadhichi College Of Pharmacy, Cuttack, Odisha -754002",
        email: "satyabratasahu9@gmail.com",
        image: "https://aptiindia.org/images/committee/OD/sahu.png",
      },
      {
        name: "Dr. Sunit Sahoo",
        role: "Secretary",
        designation: "Lecturer",
        institution:
          "University Department of Pharmaceutical Sciences, Utkal University, Bhubaneswar",
        email: "sahoosunitkumar@gmail.com",
        image: "https://aptiindia.org/images/committee/OD/sunit.png",
      },
    ],
  },
  {
    state: "Punjab",
    members: [
      {
        name: "Dr. Gulshan Kumar Bansal",
        role: "President",
        designation: "Professor and Head",
        institution:
          "Department Of Pharmaceutical Sciences And Drug Research, Punjabi University, Patiala, Punjab 147002",
        email: "gulshanbansal@rediffmail.com",
        image: "https://aptiindia.org/images/committee/PU/gulshan.png",
      },
      {
        name: "Dr. Shailesh Sharma",
        role: "Vice President",
        designation: "Professor & Principal",
        institution:
          "Amar Shaheed Baba Ajit Singh Jujhar Singh Memorial College Of Pharmacy (An Autonomous College), Bela Ropar, Punjab 140111",
        email: "shailesh.bela@gmail.com",
        image: "https://aptiindia.org/images/committee/PU/sharma.png",
      },
      {
        name: "Dr. Subheet Kumar Jain",
        role: "Vice President",
        designation: "Professor",
        institution:
          "Department Of Pharmaceutical Sciences, Guru Nanak Dev University, Amritsar, Punjab",
        email: "subheetjain@rediffmail.com",
        image: "https://aptiindia.org/images/committee/PU/drjain.png",
      },
      {
        name: "Dr Suresh Kumar",
        role: "Secretary",
        designation: "Assistant Professor",
        institution:
          "Department of Pharmaceutical Sciences and Drug Research, Punjabi University, Patiala, Punjab 147002",
        email: "thakur_pu@yahoo.com",
        image:
          "https://aptiindia.org/images/committee/PU/PU_Dr_Suresh_Kumar.jpg",
      },
    ],
  },
  {
    state: "Rajasthan",
    members: [
      {
        name: "Dr Piush Sharma",
        role: "President",
        designation: "Professor & Principal",
        institution:
          "Maharishi Arvind College of Pharmacy, Jaipur, Rajasthan 302039",
        email: "joshipiush@gmail.com",
        image: "https://aptiindia.org/images/committee/RA/piyush.png",
      },
      {
        name: "Dr. Jayesh Dwivedi",
        role: "Vice President",
        designation: "Professor",
        institution: "Pacific College of Pharmacy, Udaipur, Rajasthan",
        email: "drjayeshdwivedi@yahoo.com",
        image: "https://aptiindia.org/images/committee/RA/dwivedi.png",
      },
      {
        name: "Dr. Vishal Garg",
        role: "Vice President",
        designation: "Professor & Principal",
        institution:
          "Jaipur School Of Pharmacy, Maharj Vinayak Global University, Jaipur, Rajasthan",
        email: "vishalgarg198427@gmail.com",
        image: "https://aptiindia.org/images/committee/RA/garg.png",
      },
      {
        name: "Dr. Kamal Singh Rathore",
        role: "Secretary",
        designation: "Associate Professor",
        institution: "Bhupal Nobles College of Pharmacy, Udaipur, Rajasthan",
        email: "kamalsrathore1234@gmail.com",
        image: "https://aptiindia.org/images/committee/RA/rathore.png",
      },
    ],
  },
  {
    state: "Tamil Nadu",
    members: [
      {
        name: "Dr Sankar V",
        role: "President",
        designation: "Vice Principal And Professor",
        institution: "PSG College Of Pharmacy, Coimbatore, Tamil Nadu 641004",
        email: "sansunv@yahoo.co.in",
        image: "https://aptiindia.org/images/committee/sankar.png",
      },
      {
        name: "Dr Srikanth Jeyabalan",
        role: "Vice President",
        designation: "Assistant Professor & Assistant Dean (Students)",
        institution: "Sri Ramachandra College Of Pharmacy, Tamilnadu",
        email: "srikanthcologist@gmail.com",
        image: "https://aptiindia.org/images/committee/srikanth.png",
      },
      {
        name: "Dr. Kandasamy C S",
        role: "Vice President",
        designation: "Professor",
        institution: "Karpagam College Of Pharmacy, Tamilnadu 641032",
        email: "kandacognosy@gmail.com",
        image: "https://aptiindia.org/images/committee/kandaswamy.png",
      },
      {
        name: "Dr R Sambathkumar",
        role: "Secretary",
        designation: "Professor and Principal",
        institution:
          "Erode College of Pharmacy , Vallipurathanpalayam post, Erode -638112, Tamil Nadu.",
        email: "sambathkumarecp@gmail.com",
        image: "https://aptiindia.org/images/committee/TN/sampath.png",
      },
    ],
  },
  {
    state: "Telangana",
    members: [
      {
        name: "Dr. Krishna Mohan Chinnala",
        role: "President",
        designation: "Professor & Dean",
        institution:
          "Nalla Narasimha Reddy Education Society's Group Of Institutions, Hyderabad, Telangana",
        email: "drchinnala@gmail.com",
        image: "https://aptiindia.org/images/committee/TL/chinnala.png",
      },
      {
        name: "Dr Raj Kumar Venisetty",
        role: "Vice President",
        designation: "Professor & Principal",
        institution:
          "Pratishta Institute Of Pharmaceutical Sciences, Suryapet, Telangana",
        email: "vrk10@hotmail.com",
        image: "https://aptiindia.org/images/committee/TL/venishetty.png",
      },
      {
        name: "Dr. Kantlam Chamakuri",
        role: "Vice President",
        designation: "Principal",
        institution:
          "Brilliant Grammar School Educational Society's Group Of Institutions Hyderabad",
        email: "kantlam3@gmail.com",
        image: "https://aptiindia.org/images/committee/TL/kantlam.png",
      },
      {
        name: "Dr. Narsimha Reddy Yellu",
        role: "Secretary",
        designation: "Professor",
        institution:
          "University College of Pharmaceutical Sciences, Kakatiya University, Warangal, Telangana",
        email: "ynrku@yahoo.co.in",
        image: "https://aptiindia.org/images/committee/TL/reddy.png",
      },
    ],
  },
  {
    state: "UT of DNH and DD",
    members: [
      {
        name: "Dr. Chandrakant Bonde",
        role: "President",
        designation: "Professor & Principal",
        institution: "S S R College of Pharmacy, Silvassa",
        email: "chandrakant.bonde@ssrpharmacy.edu.in",
        image:
          "https://aptiindia.org/images/committee/UT/Chandrakant_Bonde.png",
      },
      {
        name: "Dr. Smita Bonde",
        role: "Vice President",
        designation: "Professor, HOD (Pharmaceutics)",
        institution: "S S R College of Pharmacy, Silvassa",
        email: "smita.bonde@ssrpharmacy.edu.in",
        image: "https://aptiindia.org/images/committee/UT/Smita_Bonde.png",
      },
      {
        name: "Dr. Sonal Desai",
        role: "Secretary",
        designation: "Professor, HOD (Pharmaceutical Quality Assurance)",
        institution: "S S R College of Pharmacy, Silvassa",
        email: "sonal.desai@ssrpharmacy.edu.in",
        image: "https://aptiindia.org/images/committee/UT/Sonal_Desai.png",
      },
      {
        name: "Dr. Himanshu Solanki",
        role: "Treasurer",
        designation: "Associate Professor, Chairperson (Academics)",
        institution: "S S R College of Pharmacy, Silvassa",
        email: "himanshu.solanki@ssrpharmacy.edu.in",
        image: "https://aptiindia.org/images/committee/UT/Himanshu_Solanki.png",
      },
    ],
  },
  {
    state: "Uttar Pradesh",
    members: [
      {
        name: "Dr. Awani Kumar Rai",
        role: "President",
        designation: "Professor & Director",
        institution:
          "Pranveer Singh Institute Of Technology Kanpur, Uttar Pradesh 209305",
        email: "drawanikrai@gmail.com",
        image: "https://aptiindia.org/images/committee/UP/rai.png",
      },
      {
        name: "Dr. Anupam Kumar Sachan",
        role: "Vice President",
        designation: "Professor & Director",
        institution:
          "Dayanand Dinanath College, Institute Of Pharmacy Hamirpur Road, Kanpur, Uttar Pradesh 209214",
        email: "anupamkrsachan@gmail.com",
        image: "https://aptiindia.org/images/committee/UP/anupam.png",
      },
      {
        name: "Dr Pranay Wal",
        role: "Vice President",
        designation: "Professor & Dean Pharmacy",
        institution:
          "Pranveer Singh Institute Of Technology Kanpur, Uttar Pradesh 209305",
        email: "pranaywal@gmail.com",
        image: "https://aptiindia.org/images/committee/UP/pranay.png",
      },
      {
        name: "Dr Akash Ved",
        role: "Secretary",
        designation: "Associate Dean Pharmacy",
        institution:
          "Dr A P J Abdul Kalam Technical University, Goel Institute of Pharmaceutical Sciences, Lucknow",
        email: "akashved@gmail.com",
        image: "https://aptiindia.org/images/committee/UP/akash.png",
      },
    ],
  },
  {
    state: "Uttarakhand",
    members: [
      {
        name: "Dr. Rajeev Kumar Sharma",
        role: "President",
        designation: "Assistant Professor",
        institution: "DIT University, Makka Wala, Uttarakhand 248009",
        email: "rajeevsharmapharma@rediffmail.com",
        image: "https://aptiindia.org/images/committee/UK/raj.png",
      },
      {
        name: "Dr. Ganesh Bhatt",
        role: "Vice President",
        designation: "Principal",
        institution: "Shivalik College Of Pharmacy, Uttarakhand 248197",
        email: "ganesh_bhatt2@rediffmail.com",
        image: "https://aptiindia.org/images/committee/UK/ganesh.png",
      },
      {
        name: "Dr. Abhijeet Ojha",
        role: "Vice President",
        designation: "Principal",
        institution:
          "Six Sigma Institute Of Technology And Science, Rudrapur, Uttarakhand 263153",
        email: "ojhaabhijeet24@gmail.com",
        image: "https://aptiindia.org/images/committee/UK/abhijeet.png",
      },
      {
        name: "Dr Sanjay Singh",
        role: "Secretary",
        designation: "Principal",
        institution: "Siddhartha Institute of Pharmacy, Dehradun Uttarakhand",
        email: "sanjaymph@gmail.com",
        image: "https://aptiindia.org/images/committee/UK/sanjay.png",
      },
    ],
  },
  {
    state: "West Bengal",
    members: [
      {
        name: "Dr. Nityananda Mondal",
        role: "President",
        designation: "HOD, Pharmaceutics",
        institution:
          "BCDA College Of Pharmacy And Technology 78, Jessore Road (South), Hridaypur, Kolkata, West Bengal - 700127",
        email: "nmondal1@yahoo.co.in",
        image: "https://aptiindia.org/images/committee/WB/MONDAL.png",
      },
      {
        name: "Dr. Sudipta Das",
        role: "Vice President",
        designation: "Professor",
        institution:
          "Netaji Subhas Chandra Bose Institute Of Pharmacy, Chakdaha, Nadia, West Bengal 741222",
        email: "sudiptapharmacy6@gmail.com",
        image: "https://aptiindia.org/images/committee/WB/DAS.png",
      },
      {
        name: "Dr. Suman Acharyya",
        role: "Vice President",
        designation: "Professor",
        institution:
          "Netaji Subhas Chandra Bose Institute of Pharmacy, Nadia, West Bengal",
        email: "sumanacharyya78@gmail.com",
        image: "https://aptiindia.org/images/committee/WB/SUMAN.png",
      },
      {
        name: "Mr. Somsubhra Ghosh",
        role: "Secretary",
        designation: "Associate Professor",
        institution:
          "School of Pharmacy, The Neotia University, Diamond Harbour, W. B.",
        email: "somsubhraghosh@gmail.com",
        image: "https://aptiindia.org/images/committee/WB/GHOSH.png",
      },
    ],
  },
];
