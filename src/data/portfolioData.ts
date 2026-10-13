import { ProjectItem, SkillItem, TimelineItem, TestimonialItem } from "@/types/portfolio";

export const siteConfig = {
  name: "Gede Satya Budi Dharma Wiguna",
  title: "Web Developer",
  email: "satyadharma1609@gmail.com",
  phone: "0895394043443",
  location: "Bali, Denpasar",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  whatsapp: "https://wa.me/6281234567890",
};

export const projectsData: ProjectItem[] = [
  {
    id: "saas",
    title: "Nexa SaaS – Enterprise Analytics & Workflow",
    category: "fullstack",
    badge: "Featured Full-Stack",
    image: "/assets/img/project-saas.jpg",
    tags: ["Next.js 14", "TypeScript", "Node.js", "PostgreSQL", "Redis", "Tailwind CSS"],
    summary: {
      id: "Platform SaaS analitik multi-tenant dengan dasbor metrik real-time, manajemen tim, pelacakan langganan MRR, dan visualisasi data interaktif.",
      en: "Multi-tenant enterprise analytics SaaS platform featuring real-time telemetry dashboards, team collaboration, MRR tracking, and interactive charts.",
    },
    metrics: [
      { val: "< 85ms", lbl: { id: "Latensi API", en: "API Latency" } },
      { val: "99.98%", lbl: { id: "Keandalan Uptime", en: "Uptime SLA" } },
      { val: "4.5k+", lbl: { id: "Pengguna Aktif", en: "Active Users" } },
    ],
    githubUrl: "https://github.com",
    liveUrl: "https://demo.example.com",
    details: {
      overview: {
        id: "Nexa SaaS dirancang untuk menyederhanakan pemantauan metrik bisnis SaaS dan aktivitas pengguna. Menggunakan arsitektur modular yang memisahkan ingestion pipeline berkecepatan tinggi dengan antarmuka analitik yang responsif.",
        en: "Nexa SaaS was engineered to streamline SaaS business metrics monitoring and user activity auditing. Utilizes a modular architecture decoupling high-speed ingestion pipelines from responsive UI dashboards.",
      },
      architecture: {
        id: "Frontend dibangun menggunakan Next.js 14 App Router dengan React Server Components untuk rendering secepat kilat. Backend didukung oleh Node.js microservices, PostgreSQL untuk integritas relasional, dan Redis cache cluster untuk optimasi query analitik.",
        en: "The frontend is powered by Next.js 14 App Router with React Server Components for lightning-fast rendering. The backend is orchestrated via Node.js microservices, PostgreSQL with connection pooling, and a Redis cluster for analytics caching.",
      },
      highlights: {
        id: [
          "Autentikasi multi-tenant aman berbasis JWT dengan role-based access control (RBAC)",
          "Sinkronisasi data real-time menggunakan Server-Sent Events (SSE) dan WebSocket",
          "Dukungan multi-mata uang dan integrasi webhook pembayaran langganan Stripe",
          "Kompresi data time-series menghemat penyimpanan database hingga 35%",
        ],
        en: [
          "Secure multi-tenant authentication with RBAC and session protection",
          "Real-time live telemetry stream via Server-Sent Events and WebSockets",
          "Multi-currency recurring billing with Stripe webhook synchronization",
          "Time-series log compression saving up to 35% database footprint",
        ],
      },
      challengesSolved: {
        id: "Tantangan utama adalah menangani lonjakan query agregasi ketika ribuan pengguna melihat dasbor secara bersamaan. Solusinya diatasi dengan partisi tabel PostgreSQL dan materialized views yang disegarkan secara bertahap via worker queue Redis.",
        en: "The core challenge was scaling aggregate analytics queries under sudden peak loads. Solved using PostgreSQL table partitioning and materialized views incrementally refreshed via a background Redis worker queue.",
      },
    },
  },
  {
    id: "ecommerce",
    title: "Urban Market – Modern Headless Commerce",
    category: "fullstack",
    badge: "E-Commerce Web",
    image: "/assets/img/project-ecommerce.jpg",
    tags: ["React", "Next.js", "Tailwind CSS", "Express API", "Stripe", "Docker"],
    summary: {
      id: "Platform e-commerce responsif dengan katalog instan, filter multi-atribut dinamis, keranjang belanja terenkripsi, dan alur checkout minimalis 3 langkah.",
      en: "High-performance headless e-commerce platform with instant client-side catalog search, multi-faceted filtering, encrypted carts, and streamlined 3-step checkout.",
    },
    metrics: [
      { val: "99/100", lbl: { id: "Skor Lighthouse", en: "Lighthouse Score" } },
      { val: "3-Step", lbl: { id: "Alur Checkout", en: "Checkout Flow" } },
      { val: "100%", lbl: { id: "Mobile Responsif", en: "Responsive" } },
    ],
    githubUrl: "https://github.com",
    liveUrl: "https://demo.example.com",
    details: {
      overview: {
        id: "Urban Market mengutamakan kecepatan navigasi dan kenyamanan bertransaksi di perangkat desktop maupun seluler. Menyediakan pengalaman belanja tanpa hambatan berkat optimasi gambar otomatis dan pre-fetching rute.",
        en: "Urban Market prioritizes navigation speed and friction-free transactions across devices. Delivers seamless shopping through automatic asset optimization and aggressive route prefetching.",
      },
      architecture: {
        id: "Mengusung pola headless commerce dengan decoupling penuh antara storefront dan backend order engine. State keranjang dikelola secara optimistik dengan sinkronisasi local storage dan sinkronisasi server asinkron.",
        en: "Adopts a headless commerce architecture fully separating frontend storefront from the order fulfillment backend. Cart states are managed optimistically with persistent storage and asynchronous server sync.",
      },
      highlights: {
        id: [
          "Pencarian produk instan di bawah 50ms dengan debounced fuzzy search",
          "Integrasi pembayaran internasional dan metode transfer lokal",
          "Automasi notifikasi email resi dan update status pengiriman via webhook",
          "Dukungan mode gelap dan mode terang dengan adaptasi visual penuh",
        ],
        en: [
          "Sub-50ms instant product lookup with debounced fuzzy search indexing",
          "International payment processing and localized payment rails",
          "Automated receipt dispatch and tracking status alerts via webhooks",
          "Adaptive light/dark visual theme support across all checkout steps",
        ],
      },
      challengesSolved: {
        id: "Mencegah race condition ketika beberapa pembeli melakukan checkout terhadap stok barang terakhir secara bersamaan. Diatasi dengan database row-level locking dan atomic stock deduction pada level transaksi ACID.",
        en: "Preventing race conditions when multiple concurrent shoppers purchased limited stock items. Solved using database row-level locking and atomic stock deductions within ACID transaction boundaries.",
      },
    },
  },
  {
    id: "ai",
    title: "NeuroFlow – Visual AI Workflow Builder",
    category: "fullstack",
    badge: "AI DevTools",
    image: "/assets/img/project-ai.jpg",
    tags: ["TypeScript", "Python", "FastAPI", "React Flow", "WebSockets", "PostgreSQL"],
    summary: {
      id: "Aplikasi visual node-graph builder untuk merangkai pipeline LLM agenik, pengujian prompt interaktif, dan inspeksi kode generasi secara real-time.",
      en: "Visual node-graph workspace for chaining agentic LLM workflows, interactive prompt prototyping, and live real-time code generation inspection.",
    },
    metrics: [
      { val: "Streaming", lbl: { id: "Respons Token", en: "Token Output" } },
      { val: "DAG Engine", lbl: { id: "Eksekusi Node", en: "Workflow Graph" } },
      { val: "Zero-Lag", lbl: { id: "Canvas Visual", en: "Canvas Perf" } },
    ],
    githubUrl: "https://github.com",
    liveUrl: "https://demo.example.com",
    details: {
      overview: {
        id: "NeuroFlow adalah developer tool modern yang memungkinkan rekayasawan perangkat lunak menyusun alur kerja AI kompleks (RAG, tool invocation, evaluator) tanpa menulis skrip berulang.",
        en: "NeuroFlow is a modern developer platform that empowers software engineers to design multi-step agentic AI pipelines (RAG, tool calling, evaluators) visually with live testing.",
      },
      architecture: {
        id: "Canvas antarmuka dibangun dengan React dan kustomisasi TypeScript canvas SVG. Engine eksekusi berbasis Directed Acyclic Graph (DAG) di backend Python FastAPI memvalidasi siklus node dan mengeksekusi sub-tugas secara asinkron.",
        en: "The interface canvas is engineered in React with custom TypeScript SVG connectors. A high-throughput Directed Acyclic Graph (DAG) engine in FastAPI validates node graphs and triggers tasks concurrently.",
      },
      highlights: {
        id: [
          "Ekspor otomatis konfigurasi alur kerja ke kode Python (Flask/FastAPI) dan TypeScript",
          "Integrasi multi-penyedia model (OpenAI, Anthropic, Gemini, serta model lokal Ollama)",
          "Inspeksi real-time untuk waktu inferensi, penggunaan token, dan error log",
          "Fitur collaborative workspace dengan shareable read-only snapshot URL",
        ],
        en: [
          "One-click workflow export to production-ready Python or TypeScript boilerplate",
          "Multi-model provider support (OpenAI, Anthropic, Gemini, and local Ollama models)",
          "Real-time telemetry inspector for token cost, latency breakdown, and log tracing",
          "Collaborative workspace sharing with encrypted read-only snapshot links",
        ],
      },
      challengesSolved: {
        id: "Menjaga performa canvas tetap stabil pada 60fps saat ratusan node dan konektor kabel bergerak. Dioptimalkan dengan virtualisasi rendering canvas dan debouncing status graph.",
        en: "Maintaining smooth 60fps canvas panning and zooming with hundreds of connected nodes. Solved with viewport virtualization and selective graph node re-renders.",
      },
    },
  },
];

export const skillsData: SkillItem[] = [
  // Frontend
  {
    name: "TypeScript",
    category: "frontend",
    level: "Expert",
    exp: { id: "4+ Tahun", en: "4+ Years" },
    desc: {
      id: "Strict type-safety, generics, utility types, dan refactoring terpercaya untuk aplikasi skala enterprise.",
      en: "Strict type-safety, advanced generics, utility types, and confident large-scale refactoring.",
    },
    progress: 95,
    iconText: "TS",
  },
  {
    name: "React.js & Next.js 14",
    category: "frontend",
    level: "Expert",
    exp: { id: "4+ Tahun", en: "4+ Years" },
    desc: {
      id: "Server Components (RSC), SSR, ISR, kustom Hooks, dan arsitektur state responsif (Zustand/Redux).",
      en: "React Server Components, SSR, ISR, custom hook composition, and scalable state stores.",
    },
    progress: 96,
    iconText: "Next",
  },
  {
    name: "Tailwind CSS & Modern UI",
    category: "frontend",
    level: "Expert",
    exp: { id: "4+ Tahun", en: "4+ Years" },
    desc: {
      id: "Sistem token desain, layout fluid responsif, glassmorphism, dan animasi performa tinggi 60fps.",
      en: "Design token systems, fluid responsive layouts, glassmorphism, and 60fps hardware-accelerated animations.",
    },
    progress: 94,
    iconText: "CSS",
  },
  // Backend
  {
    name: "Node.js & Express",
    category: "backend",
    level: "Expert",
    exp: { id: "4+ Tahun", en: "4+ Years" },
    desc: {
      id: "RESTful architecture, modular middleware, JWT session security, dan komunikasi real-time WebSocket.",
      en: "RESTful architectures, modular middleware, secure JWT sessions, and WebSocket event pipelines.",
    },
    progress: 92,
    iconText: "Node",
  },
  {
    name: "Golang (Go)",
    category: "backend",
    level: "Advanced",
    exp: { id: "2+ Tahun", en: "2+ Years" },
    desc: {
      id: "Microservice berkecepatan tinggi, concurrency goroutines, dan endpoint dengan latensi mikro.",
      en: "High-throughput microservices, concurrency with goroutines/channels, and ultra-low latency endpoints.",
    },
    progress: 82,
    iconText: "Go",
  },
  {
    name: "GraphQL & REST APIs",
    category: "backend",
    level: "Advanced",
    exp: { id: "3+ Tahun", en: "3+ Years" },
    desc: {
      id: "Perancangan skema bersih, rate limiting, OpenAPI/Swagger dokumentasi, dan query batching.",
      en: "Clean schema authoring, rate limiting, OpenAPI documentation, and query batching resolvers.",
    },
    progress: 88,
    iconText: "API",
  },
  // Database & Cloud
  {
    name: "PostgreSQL & Prisma / Drizzle",
    category: "database",
    level: "Expert",
    exp: { id: "4+ Tahun", en: "4+ Years" },
    desc: {
      id: "Skema relasional ternormalisasi, query indexing cepat, transaksi ACID, dan migrasi terotomasi.",
      en: "Normalized relational schemas, index tuning, atomic ACID transactions, and automated schema migrations.",
    },
    progress: 91,
    iconText: "PG",
  },
  {
    name: "Redis In-Memory Cache",
    category: "database",
    level: "Advanced",
    exp: { id: "3+ Tahun", en: "3+ Years" },
    desc: {
      id: "Caching tier, message queue publish/subscribe, rate limiter, dan session store berkecepatan tinggi.",
      en: "High-speed caching layers, pub/sub message brokers, distributed rate limiters, and session storage.",
    },
    progress: 86,
    iconText: "Redis",
  },
  {
    name: "Docker & AWS / Vercel Cloud",
    category: "database",
    level: "Advanced",
    exp: { id: "3+ Tahun", en: "3+ Years" },
    desc: {
      id: "Multi-stage containerization, docker-compose, edge deployment, dan automated CI/CD pipeline.",
      en: "Multi-stage container builds, docker-compose orchestration, edge functions, and automated CI/CD.",
    },
    progress: 87,
    iconText: "Cloud",
  },
  // Tools
  {
    name: "Git & GitHub Actions CI/CD",
    category: "tools",
    level: "Expert",
    exp: { id: "4+ Tahun", en: "4+ Years" },
    desc: {
      id: "Branching strategies, code review workflows, automated test runners, dan semantic versioning.",
      en: "Git workflow strategies, comprehensive PR reviews, automated test pipelines, and semantic versioning.",
    },
    progress: 95,
    iconText: "Git",
  },
  {
    name: "Jest, Vitest & Playwright",
    category: "tools",
    level: "Advanced",
    exp: { id: "3+ Tahun", en: "3+ Years" },
    desc: {
      id: "Unit testing, integration testing, dan end-to-end (E2E) automation untuk stabilitas produksi.",
      en: "Comprehensive unit testing, API integration suites, and end-to-end browser regression automation.",
    },
    progress: 84,
    iconText: "Test",
  },
  {
    name: "Figma to Code & Web Vitals",
    category: "tools",
    level: "Expert",
    exp: { id: "4+ Tahun", en: "4+ Years" },
    desc: {
      id: "Penerjemahan pixel-perfect, aksesibilitas WCAG, dan optimalisasi audit Google Lighthouse 95+.",
      en: "Pixel-perfect fidelity from design specs, WCAG accessibility compliance, and 95+ Lighthouse audits.",
    },
    progress: 94,
    iconText: "UI",
  },
];

export const timelineData: TimelineItem[] = [
  {
    id: "exp-1",
    period: "2023 — Sekarang",
    role: { id: "Senior Full-Stack Engineer", en: "Senior Full-Stack Engineer" },
    company: "TechScale Labs • Jakarta / Hybrid",
    badge: { id: "Penuh Waktu", en: "Full-Time" },
    badgeType: "work",
    description: {
      id: "Memimpin tim rekayasa web dalam merancang arsitektur analitik SaaS multi-tenant berbasis Next.js 14 dan microservices Golang. Berhasil memangkas waktu muat halaman hingga 40% dan mengorkestrasi CI/CD zero-downtime deployment.",
      en: "Spearheaded web architecture for multi-tenant analytics SaaS using Next.js 14 and Golang services. Reduced initial page-load latency by 40% and orchestrated zero-downtime CI/CD deployment pipelines.",
    },
    skills: ["Next.js 14", "TypeScript", "Golang", "PostgreSQL", "AWS ECS", "Docker"],
  },
  {
    id: "exp-2",
    period: "2021 — 2023",
    role: { id: "Full-Stack Web Developer", en: "Full-Stack Web Developer" },
    company: "Innovate Digital Studio • Jakarta",
    badge: { id: "Penuh Waktu", en: "Full-Time" },
    badgeType: "work",
    description: {
      id: "Membangun lebih dari 12 aplikasi web berskala enterprise untuk klien teknologi dan e-commerce. Mengintegrasikan payment gateway Stripe & Midtrans serta merancang caching Redis berkecepatan tinggi.",
      en: "Engineered 12+ enterprise web platforms across fintech, retail, and tech startups. Integrated Stripe & regional payment systems and implemented resilient Redis caching tiers.",
    },
    skills: ["React", "Node.js", "Express", "PostgreSQL", "Redis", "Tailwind CSS"],
  },
  {
    id: "exp-3",
    period: "2020 — 2021",
    role: { id: "Frontend Web Developer", en: "Frontend Web Developer" },
    company: "Nusantara Creative Agency • Bandung",
    badge: { id: "Penuh Waktu", en: "Full-Time" },
    badgeType: "work",
    description: {
      id: "Mengembangkan antarmuka landing page interaktif pixel-perfect, optimalisasi performa animasi web, serta mencapai skor 95+ secara konsisten pada audit Google Core Web Vitals.",
      en: "Crafted interactive pixel-perfect landing platforms, optimized client-side animation rendering, and consistently attained 95+ scores across Google Core Web Vitals audits.",
    },
    skills: ["JavaScript (ES6+)", "React", "CSS3 / Sass", "Figma", "Webpack"],
  },
  {
    id: "edu-1",
    period: "2016 — 2020",
    role: { id: "Sarjana Komputer (S.Kom) - Ilmu Komputer", en: "B.Sc. in Computer Science" },
    company: "Universitas Indonesia (UI) • Depok",
    badge: { id: "Pendidikan", en: "Education" },
    badgeType: "education",
    description: {
      id: "Fokus studi pada Rekayasa Perangkat Lunak, Struktur Data & Algoritma, Basis Data Terdistribusi, dan Jaringan Komputer. Lulus dengan predikat Sangat Memuaskan (IPK 3.82/4.00).",
      en: "Majored in Software Engineering, Data Structures & Algorithms, Distributed Systems, and Computer Networks. Graduated with Honors (GPA 3.82 / 4.00).",
    },
    skills: ["Data Structures", "Algorithms", "Software Engineering", "Databases"],
  },
];

export const testimonialsData: TestimonialItem[] = [
  {
    id: "testi-1",
    quote: {
      id: "Alex memiliki keahlian langka: sangat teliti pada ketahanan arsitektur backend dan efisiensi basis data, namun tetap memiliki cita rasa estetika tinggi dalam menyajikan UI/UX modern yang memikat pengguna.",
      en: "Alex possesses a rare blend: rigorously detail-oriented on backend architecture and database efficiency, yet equipped with sharp aesthetic intuition for delivering breathtaking, responsive UI/UX.",
    },
    author: "Budi Hartono",
    role: "VP of Engineering @ TechScale Labs",
    initials: "BH",
  },
  {
    id: "testi-2",
    quote: {
      id: "Kecepatan delivery dan kebersihan kode Alex sangat luar biasa. Proyek SaaS kami rilis 2 minggu lebih cepat dari target berkat pemisahan modul yang rapi dan dokumentasi API yang jelas.",
      en: "Alex's speed of execution and code clarity are truly exceptional. Our core SaaS product shipped 2 weeks ahead of schedule thanks to clean modular boundaries and solid API specs.",
    },
    author: "Sarah Lestari",
    role: "Product Lead @ Innovate Studio",
    initials: "SL",
  },
  {
    id: "testi-3",
    quote: {
      id: "Komunikatif, solutif, dan selalu memegang teguh standar best practice. Alex adalah tipe rekan insinyur yang membuat seluruh tim merasa percaya diri saat melakukan rilis ke tahap produksi.",
      en: "Communicative, solution-oriented, and relentlessly committed to engineering excellence. Alex is the teammate that brings calmness and confidence whenever pushing releases to production.",
    },
    author: "Michael Ryan",
    role: "Principal Software Architect",
    initials: "MR",
  },
];

export const terminalCommands: Record<string, { id: string; en: string }> = {
  help: {
    id: `Perintah yang tersedia:
  • bio       : Informasi ringkasan profil pengembang
  • skills    : Ringkasan stack teknologi utama
  • projects  : Daftar karya dan proyek unggulan
  • contact   : Informasi saluran kontak & email
  • hire      : Ketersediaan status kerja saat ini
  • clear     : Bersihkan layar terminal`,
    en: `Available commands:
  • bio       : Developer profile summary
  • skills    : Overview of core tech stack
  • projects  : Featured showcase projects
  • contact   : Contact channels & direct links
  • hire      : Current availability status
  • clear     : Clear the terminal console`,
  },
  bio: {
    id: `Alex Pratama | Full-Stack Web Developer
Lokasi      : Jakarta, Indonesia (WIB)
Pengalaman  : 4+ Tahun Rekayasa Perangkat Lunak
Filosofi    : Kode bersih, arsitektur skalabel, performa cepat (<100ms), dan UI/UX elegan.`,
    en: `Alex Pratama | Full-Stack Web Developer
Location    : Jakarta, Indonesia (GMT+7)
Experience  : 4+ Years in Software Engineering
Philosophy  : Clean code, resilient architecture, sub-100ms response, and elegant UI/UX.`,
  },
  skills: {
    id: `Frontend : Next.js 14, React, TypeScript, Tailwind CSS, Zustand
Backend  : Node.js, Express, Golang, GraphQL, REST APIs
Database : PostgreSQL, Redis, Prisma, Drizzle
DevOps   : Docker, AWS ECS, Vercel, GitHub Actions CI/CD`,
    en: `Frontend : Next.js 14, React, TypeScript, Tailwind CSS, Zustand
Backend  : Node.js, Express, Golang, GraphQL, REST APIs
Database : PostgreSQL, Redis, Prisma, Drizzle
DevOps   : Docker, AWS ECS, Vercel, GitHub Actions CI/CD`,
  },
  projects: {
    id: `1. Nexa SaaS     - Analytics Dashboard & Team Workspace (Next.js 14, Node.js, PostgreSQL)
2. Urban Market  - Modern Headless Commerce Platform (React, Tailwind, Stripe, Express)
3. NeuroFlow     - Visual AI Workflow & Prompt Builder (TypeScript, Python, FastAPI)
Ketik 'contact' atau klik 'Detail' pada kartu untuk informasi arsitektur lengkap.`,
    en: `1. Nexa SaaS     - Analytics Dashboard & Team Workspace (Next.js 14, Node.js, PostgreSQL)
2. Urban Market  - Modern Headless Commerce Platform (React, Tailwind, Stripe, Express)
3. NeuroFlow     - Visual AI Workflow & Prompt Builder (TypeScript, Python, FastAPI)
Type 'contact' or click 'Details' on cards for architecture deep-dives.`,
  },
  contact: {
    id: `Email    : alex.pratama.dev@gmail.com
WhatsApp : +62 812-3456-7890
LinkedIn : linkedin.com/in/alex-pratama
GitHub   : github.com/alexpratama`,
    en: `Email    : alex.pratama.dev@gmail.com
WhatsApp : +62 812-3456-7890
LinkedIn : linkedin.com/in/alex-pratama
GitHub   : github.com/alexpratama`,
  },
  hire: {
    id: `STATUS: TERSEDIA (Available for Hire)
Terbuka untuk posisi Full-time (Remote / Hybrid) maupun proyek Freelance Web skala menengah hingga besar.
Silakan kirim pesan melalui formulir kontak di bawah atau email alex.pratama.dev@gmail.com.`,
    en: `STATUS: AVAILABLE FOR HIRE
Open for Full-time roles (Remote / Hybrid) and high-impact Freelance contracts.
Feel free to drop a message in the contact form or email alex.pratama.dev@gmail.com.`,
  },
};
