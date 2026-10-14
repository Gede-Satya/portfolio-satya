"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Language } from "@/types/portfolio";
import { siteConfig } from "@/data/portfolioData";
import { PortfolioContent } from "@/lib/storage";

interface FooterProps {
  lang: Language;
  profile?: PortfolioContent["profile"];
}

export const Footer: React.FC<FooterProps> = ({ lang, profile }) => {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "AP";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const name = profile?.name || siteConfig.name;
  const initials = getInitials(name);
  const title = profile?.title || siteConfig.title;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60 bg-surface-subtle dark:bg-[#0c0c10] py-12 text-zinc-600 dark:text-zinc-400 text-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & tagline */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <img
              src="/icon.png"
              alt={name}
              width={24}
              height={24}
              className="w-6 h-6 rounded-md object-contain"
            />
            <span className="font-bold text-sm text-zinc-900 dark:text-white">
              {name}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">
            {title} • Next.js &amp; TypeScript
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center justify-center gap-5 font-medium">
          <a href="#about" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            {lang === "id" ? "Tentang" : "About"}
          </a>
          <a href="#skills" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            {lang === "id" ? "Keahlian" : "Skills"}
          </a>
          <a href="#projects" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            {lang === "id" ? "Proyek" : "Projects"}
          </a>
          <a href="#experience" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            {lang === "id" ? "Pengalaman" : "Experience"}
          </a>
          <a href="#terminal" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Terminal
          </a>
          <a href="#contact" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            {lang === "id" ? "Kontak" : "Contact"}
          </a>
          <a
            href="/admin"
            className="text-zinc-400 hover:text-indigo-500 font-mono text-[11px] transition-colors"
            title="Admin CMS Login"
          >
            [CMS]
          </a>
        </div>

        {/* Back to top & copyright */}
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-mono text-zinc-500">
            &copy; {currentYear} {name}.
          </span>
          <button
            onClick={scrollToTop}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors shadow-sm"
            aria-label="Kembali ke atas"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
