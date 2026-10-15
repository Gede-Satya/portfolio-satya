"use client";

import React from "react";
import { Layout, Server, Cloud, Cpu, CheckCircle2, FileDown } from "lucide-react";
import { Language } from "@/types/portfolio";
import { AboutContent, PortfolioContent, PillarItem } from "@/lib/storage";

interface AboutProps {
  lang: Language;
  about?: AboutContent;
  profile?: PortfolioContent["profile"];
}

export const About: React.FC<AboutProps> = ({ lang, about, profile }) => {
  const renderPillarIcon = (iconName: string) => {
    switch (iconName) {
      case "server":
        return <Server className="w-5 h-5 text-emerald-500" />;
      case "cloud":
        return <Cloud className="w-5 h-5 text-cyan-500" />;
      case "cpu":
        return <Cpu className="w-5 h-5 text-amber-500" />;
      case "layout":
      default:
        return <Layout className="w-5 h-5 text-indigo-500" />;
    }
  };

  const defaultPillars: PillarItem[] = [
    {
      id: "p1",
      icon: "layout",
      title: { id: "Frontend Craftsmanship", en: "Frontend Craftsmanship" },
      desc: {
        id: "Membangun antarmuka dinamis dan responsif dengan Next.js 14, React Server Components, TypeScript, serta CSS modern yang mengutamakan aksesibilitas dan kemulusan 60fps.",
        en: "Crafting fluid, high-fidelity responsive user experiences with Next.js 14, React Server Components, TypeScript, and modern CSS tuned for WCAG accessibility.",
      },
      visible: true,
    },
    {
      id: "p2",
      icon: "server",
      title: { id: "Robust Backend & API", en: "Robust Backend & API" },
      desc: {
        id: "Merancang REST API, GraphQL, microservices efisien, autentikasi terproteksi dengan Node.js, Express, serta Golang untuk pemrosesan paralel berlatensi rendah.",
        en: "Engineering resilient REST and GraphQL microservices, hardened auth workflows, and concurrent event pipelines via Node.js, Express, and Golang.",
      },
      visible: true,
    },
    {
      id: "p3",
      icon: "cloud",
      title: { id: "DevOps & Cloud Architecture", en: "DevOps & Cloud Architecture" },
      desc: {
        id: "Otomasi containerization dengan Docker, multi-environment CI/CD pipeline, edge compute Vercel, dan manajemen cache Redis untuk menjamin reliabilitas produksi.",
        en: "Containerizing services via Docker, automated zero-downtime CI/CD workflows, edge runtime caching, and Redis layers ensuring 99.9% uptime reliability.",
      },
      visible: true,
    },
    {
      id: "p4",
      icon: "cpu",
      title: { id: "Performance & Code Integrity", en: "Performance & Code Integrity" },
      desc: {
        id: "Penerapan clean code, pengujian otomatis (unit, integrasi, E2E), modularitas terisolasi, dan audit Core Web Vitals dengan skor Lighthouse 95+ secara konsisten.",
        en: "Disciplined clean code principles, automated test coverage (unit, integration, E2E), strict decoupling, and sub-100ms response targets with 95+ Lighthouse audits.",
      },
      visible: true,
    },
  ];

  const rawPillars: PillarItem[] = about?.pillars?.length ? about.pillars : defaultPillars;
  const pillarsList = rawPillars.filter((p) => p.visible !== false);

  const kicker =
    about?.kicker?.[lang] ||
    (lang === "id" ? "Profil & Pendekatan Teknis" : "Profile & Philosophy");

  const title =
    about?.title?.[lang] ||
    (lang === "id"
      ? "Menyelesaikan Masalah Kompleks Melalui Arsitektur Kode yang Bersih"
      : "Engineering Scalable Solutions Through Elegant, Resilient Code");

  const subtitle =
    about?.subtitle?.[lang] ||
    (lang === "id"
      ? "Keseimbangan antara ketelitian struktur data, performa server, dan estetika visual tingkat tinggi."
      : "A balanced synthesis of rigorous data modeling, backend throughput, and refined visual aesthetics.");

  const bioHeading =
    about?.bioHeading?.[lang] ||
    (lang === "id"
      ? "Tentang Saya & Latar Belakang"
      : "About Me & Engineering Journey");

  const bioP1 =
    about?.bioP1?.[lang] ||
    profile?.bioP1?.[lang] ||
    (lang === "id"
      ? `Saya adalah seorang ${profile?.title || "Full-Stack Developer"} dengan pengalaman membangun sistem digital untuk perusahaan teknologi dan rintisan inovatif. Menguasai siklus hidup software secara menyeluruh: mulai dari desain skema basis data relasional hingga pengalaman pengguna akhir yang responsif.`
      : `I am a ${profile?.title || "Full-Stack Developer"} with experience architecting digital products for high-growth tech companies and enterprise clients. I thrive across the full software lifecycle: from relational database schemas to responsive, high-fidelity user experiences.`);

  const bioP2 =
    about?.bioP2?.[lang] ||
    profile?.bioP2?.[lang] ||
    (lang === "id"
      ? "Bagi saya, perangkat lunak yang hebat tidak hanya sekadar berjalan, tetapi mudah dipelihara, diuji secara komprehensif, dan memberikan nilai nyata bagi pengguna dengan latensi seminimal mungkin."
      : "For me, great software is not just functional—it is maintainable, thoroughly tested, and delivers delightful tangible value to users with minimal latency.");

  const locationVal =
    about?.specs?.location?.[lang] ||
    profile?.location ||
    (lang === "id" ? "Bali / Denpasar, Indonesia (WITA)" : "Bali / Denpasar, Indonesia (GMT+8)");

  const educationVal =
    about?.specs?.education?.[lang] ||
    (lang === "id"
      ? "S.Kom - Rekayasa Perangkat Lunak / Ilmu Komputer"
      : "B.Sc. in Software Engineering / Computer Science");

  const focusVal =
    about?.specs?.focus?.[lang] ||
    `${profile?.title || "Web Developer"} & Next.js Ecosystem`;

  const availabilityVal =
    about?.specs?.availability?.[lang] ||
    (profile?.available !== false
      ? lang === "id"
        ? "Tersedia untuk Remote / Hybrid"
        : "Available for Remote / Hybrid"
      : lang === "id"
      ? "Sedang Menangani Proyek Aktif"
      : "Currently Booked");

  return (
    <section id="about" className="py-20 border-t border-zinc-200/60 dark:border-zinc-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {kicker}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2">
            {title}
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Bio Card */}
          <div
            className={`${
              pillarsList.length > 0
                ? "lg:col-span-5"
                : "lg:col-span-12 max-w-4xl mx-auto w-full"
            } p-6 sm:p-8 rounded-2xl glass-panel space-y-6 transition-all duration-300`}
          >
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {bioHeading}
            </h3>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {bioP1}
            </p>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {bioP2}
            </p>

            {/* Specs Table */}
            <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/80 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-400 block font-medium">
                  {lang === "id" ? "Lokasi" : "Location"}
                </span>
                <span className="text-zinc-900 dark:text-zinc-200 font-semibold mt-0.5 block">
                  {locationVal}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block font-medium">
                  {lang === "id" ? "Pendidikan" : "Education"}
                </span>
                <span className="text-zinc-900 dark:text-zinc-200 font-semibold mt-0.5 block">
                  {educationVal}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block font-medium">
                  {lang === "id" ? "Fokus Utama" : "Primary Focus"}
                </span>
                <span className="text-zinc-900 dark:text-zinc-200 font-semibold mt-0.5 block truncate">
                  {focusVal}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block font-medium">
                  {lang === "id" ? "Status" : "Status"}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 inline shrink-0" />
                  <span className="truncate">{availabilityVal}</span>
                </span>
              </div>
            </div>

            {/* CV Download CTA */}
            {profile?.cvUrl && profile?.showCvButton !== false && (
              <div className="pt-2">
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={profile.name ? `CV_${profile.name.replace(/\s+/g, "_")}.pdf` : "CV_Satya_Dharma.pdf"}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold text-xs transition-all hover:scale-[1.01] shadow-sm group"
                >
                  <FileDown className="w-4 h-4 text-indigo-500 group-hover:translate-y-0.5 transition-transform" />
                  <span>
                    {lang === "id"
                      ? "Unduh Curriculum Vitae Lengkap (PDF)"
                      : "Download Full Curriculum Vitae (PDF)"}
                  </span>
                </a>
              </div>
            )}
          </div>

          {/* Right Dynamic Pillars Cards */}
          {pillarsList.length > 0 && (
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
              {pillarsList.map((pillar, idx) => {
                // If 1 card total: span 2 cols
                // If 3 cards total: 3rd card (idx === 2) spans 2 cols to fill row 2 completely without gaps
                const isSpanFull =
                  pillarsList.length === 1 ||
                  (pillarsList.length === 3 && idx === 2);

                return (
                  <div
                    key={pillar.id || idx}
                    className={`p-6 rounded-2xl glass-panel hover:border-zinc-400/50 dark:hover:border-zinc-600/50 transition-all duration-300 group flex flex-col justify-between ${
                      isSpanFull ? "sm:col-span-2" : ""
                    }`}
                  >
                    {isSpanFull ? (
                      <div className="sm:flex sm:items-start sm:gap-4 w-full">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center shrink-0 mb-4 sm:mb-0 group-hover:scale-105 transition-transform">
                          {renderPillarIcon(pillar.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                            {pillar.title[lang]}
                          </h4>
                          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {pillar.desc[lang]}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                            {renderPillarIcon(pillar.icon)}
                          </div>
                          <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                            {pillar.title[lang]}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                          {pillar.desc[lang]}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
