"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Mail, Check, Terminal, ExternalLink, FileDown } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./Icons";
import { Language } from "@/types/portfolio";
import { siteConfig } from "@/data/portfolioData";
import { PortfolioContent, HeroStats } from "@/lib/storage";
import { LanyardBadge } from "./LanyardBadge";

interface HeroProps {
  lang: Language;
  onCopyEmail: (email: string) => void;
  copied: boolean;
  profile?: PortfolioContent["profile"];
  heroStats?: HeroStats;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  onCopyEmail,
  copied,
  profile,
  heroStats,
}) => {
  const [liveTime, setLiveTime] = useState<string>("");

  const isBali = profile?.location?.toLowerCase().includes("bali") ||
    profile?.location?.toLowerCase().includes("denpasar");
  const timeZone = isBali ? "Asia/Makassar" : "Asia/Jakarta";
  const tzAbbr = isBali ? "WITA" : "WIB";

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setLiveTime(new Intl.DateTimeFormat("en-GB", options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeZone]);

  const email = profile?.email || siteConfig.email;
  const github = profile?.github || siteConfig.github;
  const linkedin = profile?.linkedin || siteConfig.linkedin;
  const name = profile?.name || siteConfig.name;
  const title = profile?.title || siteConfig.title;

  const headline = profile?.headline?.[lang] || (
    lang === "id"
      ? "Membangun sistem web skalavel & pengalaman digital elegan."
      : "Crafting high-performance web systems & elegant digital products."
  );

  const subheadline = profile?.subheadline?.[lang] || (
    lang === "id"
      ? `Hai, saya ${name}. Menggabungkan arsitektur backend berkecepatan tinggi dengan keahlian antarmuka React & Next.js yang bersih, modular, dan responsif.`
      : `Hi, I'm ${name}. Bridging robust low-latency backend architectures with modern React & Next.js user interfaces that are fluid, accessible, and clean.`
  );

  return (
    <section id="hero" className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
      {/* Background Ambient Glows */}
      <div
        className="ambient-glow -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 dark:bg-indigo-600/15"
        aria-hidden="true"
      />
      <div
        className="ambient-glow top-48 right-0 w-[400px] h-[300px] bg-emerald-500/10 dark:bg-emerald-600/10"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-sm text-xs text-zinc-700 dark:text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">{title}</span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="font-mono text-[11px] text-zinc-500">
                {tzAbbr} {liveTime ? `${liveTime}` : "--:--:--"}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.12]">
              {headline}
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
              {subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 font-semibold text-sm shadow-md transition-all hover:scale-[1.02]"
              >
                <span>{lang === "id" ? "Eksplorasi Proyek" : "Explore Projects"}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-sm transition-all"
              >
                <span>{lang === "id" ? "Diskusi Proyek" : "Discuss Project"}</span>
              </a>

              {/* Unduh CV / Resume Button */}
              {profile?.cvUrl && profile?.showCvButton !== false && (
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={profile.name ? `CV_${profile.name.replace(/\s+/g, "_")}.pdf` : "CV_Satya_Dharma.pdf"}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-indigo-500/40 bg-indigo-50/90 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold text-sm shadow-sm transition-all hover:scale-[1.02] group"
                  title={lang === "id" ? "Unduh Curriculum Vitae (PDF)" : "Download Curriculum Vitae (PDF)"}
                >
                  <FileDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-y-0.5 transition-transform" />
                  <span>{lang === "id" ? "Unduh CV" : "Download CV"}</span>
                </a>
              )}

              <a
                href="#terminal"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-mono text-xs hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Developer CLI Terminal"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>&gt;_ CLI</span>
              </a>
            </div>

            {/* Quick Links & Copy Email */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 w-full text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-[11px]">
                {lang === "id" ? "Koneksi" : "Connect"}:
              </span>

              {github && (
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}

              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <LinkedinIcon className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              )}

              <button
                onClick={() => onCopyEmail(email)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white/50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 font-mono transition-all group"
                title="Salin alamat email"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Mail className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-500" />
                )}
                <span>{email}</span>
                {copied && (
                  <span className="text-[10px] text-emerald-500 font-sans font-medium">
                    {lang === "id" ? "Tersalin!" : "Copied!"}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Interactive 3D Lanyard ID Badge */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <LanyardBadge
              profile={profile}
              heroStats={heroStats}
              lang={lang}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
