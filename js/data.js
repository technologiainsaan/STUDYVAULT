/**
 * STUDYVAULT - Real Academic Resources & Initial Testimonial Data
 * Price: ₹50 each (Indian Rupees)
 */

const REAL_PRODUCTS = [
  // --- DISCRETE MATHEMATICS RESOURCES ---
  {
    id: "dm-sets-notes",
    title: "SETS & SUBSETS COMPREHENSIVE NOTES",
    category: "discrete-math",
    categoryLabel: "Discrete Mathematics",
    badge: "AVAILABLE NOW",
    subject: "Discrete Mathematics",
    price: 50,
    originalPrice: 199,
    rating: 4.9,
    reviewsCount: 84,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=700&q=80",
    description: "Detailed notes on Sets: Set definitions, notation, Venn diagrams, universal sets, power sets, Cartesian products, and comprehensive solved theorems.",
    highlights: [
      "Set operations (Union, Intersection, Complement, Difference)",
      "Venn diagrams & visual proofs",
      "Power set properties & cardinality theorems",
      "Direct verified PDF file from Discrete Math syllabus"
    ],
    fileUrl: "assets/discrete_math/Sets_Notes.pdf",
    format: "PDF Document"
  },
  {
    id: "dm-relations-notes",
    title: "RELATIONS ON A SET - COMPLETE STUDY NOTES",
    category: "discrete-math",
    categoryLabel: "Discrete Mathematics",
    badge: "AVAILABLE NOW",
    subject: "Discrete Mathematics",
    price: 50,
    originalPrice: 199,
    rating: 5.0,
    reviewsCount: 112,
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80",
    description: "In-depth notes on Relations on a Set: Reflexive, Symmetric, Anti-Symmetric, Transitive relations, Equivalence relations, Equivalence classes, and Hasse diagrams.",
    highlights: [
      "Reflexive, Symmetric, Transitive & Equivalence relations",
      "Partial Ordering Relations (Posets) & Hasse diagrams",
      "Equivalence classes & Partition of sets",
      "Step-by-step solved university questions"
    ],
    fileUrl: "assets/discrete_math/Relations_on_a_Set_Notes.pdf",
    format: "PDF Document"
  },
  {
    id: "dm-countable-sets",
    title: "COUNTABLE & UNCOUNTABLE SETS MASTER NOTES",
    category: "discrete-math",
    categoryLabel: "Discrete Mathematics",
    badge: "AVAILABLE NOW",
    subject: "Discrete Mathematics",
    price: 50,
    originalPrice: 199,
    rating: 4.8,
    reviewsCount: 65,
    image: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=700&q=80",
    description: "Comprehensive guide to Infinite Sets, Countability, Cantor's Diagonalization proof, Hilbert's Hotel paradox, and mapping bijections to natural numbers.",
    highlights: [
      "Cardinality of finite and infinite sets",
      "Countable vs Uncountable definitions with rigorous proofs",
      "Cantor's Diagonalization Theorem",
      "Exam-oriented derivation steps"
    ],
    fileUrl: "assets/discrete_math/Countable_and_Uncountable_Sets.pdf",
    format: "PDF Document"
  },
  {
    id: "dm-induction-number-theory",
    title: "MATHEMATICAL INDUCTION & NUMBER THEORY",
    category: "discrete-math",
    categoryLabel: "Discrete Mathematics",
    badge: "AVAILABLE NOW",
    subject: "Discrete Mathematics",
    price: 50,
    originalPrice: 199,
    rating: 4.9,
    reviewsCount: 94,
    image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=700&q=80",
    description: "Principles of Mathematical Induction (Weak and Strong induction), Well-Ordering Principle, Divisibility theorems, Prime numbers, and Euclidean algorithm.",
    highlights: [
      "Weak & Strong Induction proof step templates",
      "Well-Ordering Principle and proof by contradiction",
      "Euclidean GCD Algorithm & Modular Arithmetic",
      "High probability university exam problems solved"
    ],
    fileUrl: "assets/discrete_math/Principles_of_Mathematical_Induction_and_Number_Theory.pdf",
    format: "PDF Document"
  },

  // --- E-COMMERCE RESOURCES ---
  {
    id: "ecom-unit-1",
    title: "E-COMMERCE UNIT 1: COMPLETE PRESENTATION",
    category: "e-commerce",
    categoryLabel: "E-Commerce",
    badge: "AVAILABLE NOW",
    subject: "E-Commerce",
    price: 50,
    originalPrice: 199,
    rating: 4.9,
    reviewsCount: 78,
    image: "https://images.unsplash.com/photo-1556742049-0a67e557224c?auto=format&fit=crop&w=700&q=80",
    description: "Complete Unit 1 presentation deck covering introduction to E-Commerce, architectural framework, electronic commerce vs traditional commerce, and business models (B2B, B2C, C2C).",
    highlights: [
      "Full lecture slide deck (Unit 1.pptx)",
      "E-Commerce architectural framework explained visually",
      "B2B, B2C, C2C, C2B business model comparisons",
      "Forces fueling e-commerce growth"
    ],
    fileUrl: "assets/e_commerce/Unit 1.pptx",
    format: "PowerPoint Presentation (.pptx)"
  },
  {
    id: "ecom-unit-2",
    title: "E-COMMERCE UNIT 2: ADVANCED FRAMEWORKS",
    category: "e-commerce",
    categoryLabel: "E-Commerce",
    badge: "AVAILABLE NOW",
    subject: "E-Commerce",
    price: 50,
    originalPrice: 199,
    rating: 4.8,
    reviewsCount: 72,
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=700&q=80",
    description: "Comprehensive Unit 2 slide deck: Consumer-oriented electronic commerce, mercantile process models, electronic payment systems (EPS), digital cash, smart cards, and credit debit flows.",
    highlights: [
      "Complete lecture slides (Unit 2.pptx)",
      "Mercantile process models (Consumer & Merchant perspective)",
      "Electronic payment mechanisms (EPS, Digital wallets, Smart cards)",
      "Payment gateway architectures & transaction flows"
    ],
    fileUrl: "assets/e_commerce/Unit 2.pptx",
    format: "PowerPoint Presentation (.pptx)"
  },
  {
    id: "ecom-unit-3",
    title: "E-COMMERCE UNIT 3: COMPREHENSIVE STUDY NOTES",
    category: "e-commerce",
    categoryLabel: "E-Commerce",
    badge: "AVAILABLE NOW",
    subject: "E-Commerce",
    price: 50,
    originalPrice: 199,
    rating: 5.0,
    reviewsCount: 104,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80",
    description: "Complete written notes for Unit 3 covering Electronic Data Interchange (EDI), EDI architecture, value-added networks (VAN), supply chain integration, and enterprise intranets.",
    highlights: [
      "Complete structured study document (Unit 3 notes.docx)",
      "EDI legal, security, and standardization issues",
      "Value Added Networks (VAN) vs Internet-based EDI",
      "Intra-organizational commerce & supply chain workflows"
    ],
    fileUrl: "assets/e_commerce/Unit 3 notes.docx",
    format: "Word Document (.docx)"
  },
  {
    id: "ecom-unit-4",
    title: "E-COMMERCE UNIT 4: STRATEGY & ADVERTISING",
    category: "e-commerce",
    categoryLabel: "E-Commerce",
    badge: "AVAILABLE NOW",
    subject: "E-Commerce",
    price: 50,
    originalPrice: 199,
    rating: 4.8,
    reviewsCount: 68,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=700&q=80",
    description: "Unit 4 slide deck covering advertising and marketing on the Internet, search engine strategies, multimedia online content, desktop video processing, and security considerations.",
    highlights: [
      "Full lecture slides (unit 4.pptx)",
      "Online marketing strategies & digital advertising formats",
      "Information-based marketing & customer engagement metrics",
      "Multimedia architectures and video streaming protocols"
    ],
    fileUrl: "assets/e_commerce/unit 4.pptx",
    format: "PowerPoint Presentation (.pptx)"
  },
  {
    id: "ecom-internet-protocols",
    title: "INTERNET PROTOCOLS IN E-COMMERCE",
    category: "e-commerce",
    categoryLabel: "E-Commerce",
    badge: "AVAILABLE NOW",
    subject: "E-Commerce & Networking",
    price: 50,
    originalPrice: 199,
    rating: 4.9,
    reviewsCount: 89,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=700&q=80",
    description: "Thorough guide explaining the networking and security protocols that power modern E-Commerce transactions: TCP/IP, HTTP/HTTPS, SSL/TLS, FTP, SMTP, and DNS.",
    highlights: [
      "Structured guide (Internet Protocols.docx)",
      "Secure socket layer (SSL/TLS) transaction encryption",
      "HTTP request-response cycle and statelessness solutions",
      "DNS routing and server architectures for high availability"
    ],
    fileUrl: "assets/e_commerce/Internet Protocols.docx",
    format: "Word Document (.docx)"
  },
  {
    id: "ecom-standards-specs",
    title: "INTERNET STANDARDS & SPECIFICATIONS MANUAL",
    category: "e-commerce",
    categoryLabel: "E-Commerce",
    badge: "AVAILABLE NOW",
    subject: "E-Commerce & Networking",
    price: 50,
    originalPrice: 199,
    rating: 4.7,
    reviewsCount: 56,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=700&q=80",
    description: "Official standards documentation covering RFC specifications, IETF, W3C standards, cryptographic key exchange standards, and legal compliance in electronic commerce.",
    highlights: [
      "Reference manual (Internet Standards and Specifications.docx)",
      "RFC standards governing Internet protocols",
      "Cryptographic standards & digital signature validity",
      "Payment Card Industry (PCI-DSS) security alignment"
    ],
    fileUrl: "assets/e_commerce/Internet Standards and Specifications in E-Commerce.docx",
    format: "Word Document (.docx)"
  }
];

const COMING_SOON_CATEGORIES = [
  {
    name: "Previous Year Papers (PYQ)",
    code: "pyq",
    tag: "COMING SOON...",
    description: "10-Year Chapterwise Solved Question Papers for University Exams",
    expectedDrop: "Releasing Soon..."
  },
  {
    name: "Predicted Guess Papers",
    code: "guess-paper",
    tag: "COMING SOON...",
    description: "Faculty-curated 99% probability exam question papers with model answers",
    expectedDrop: "Releasing Soon..."
  },
  {
    name: "Comprehensive Question Banks",
    code: "question-bank",
    tag: "COMING SOON...",
    description: "Categorized multi-concept practice vaults across difficulty levels",
    expectedDrop: "In Development..."
  },
  {
    name: "Visual Mind Maps & Cheatsheets",
    code: "mind-map",
    tag: "COMING SOON...",
    description: "A1 Printable memory diagrams, reaction pathways & formula posters",
    expectedDrop: "Drafting in Progress..."
  },
  {
    name: "Skill Roadmaps (DSA / Graphic Design)",
    code: "skill-roadmap",
    tag: "COMING SOON...",
    description: "180-Day step-by-step master roadmaps with code templates & portfolio guides",
    expectedDrop: "Releasing Soon..."
  }
];

const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    name: "Aman Verma",
    course: "BCA 3rd Semester",
    rating: 5,
    text: "Scanned the QR code, sent ₹50 and submitted the UTR. Within 20 minutes the Discrete Mathematics Relations notes were delivered to my Gmail. Super clear handwritten examples and proofs!",
    date: "2 days ago"
  },
  {
    id: "rev-2",
    name: "Pooja Sharma",
    course: "B.Tech Computer Science",
    rating: 5,
    text: "The E-Commerce Unit 1 & 2 presentations saved my semester internals! Very affordable at just ₹50 and genuine delivery.",
    date: "Yesterday"
  },
  {
    id: "rev-3",
    name: "Karan Mehta",
    course: "MCA 1st Year",
    rating: 5,
    text: "Great system with UTR tracking. I liked that we can check our order status directly on the website. Induction notes are top notch.",
    date: "3 days ago"
  }
];
