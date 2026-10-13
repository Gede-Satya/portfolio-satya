"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Menu, X, ArrowUpRight, Sparkles } from "lucide-react";
import { Language } from "@/types/portfolio";
import { PortfolioContent } from "@/lib/storage";
import { siteConfig } from "@/data/portfolioData";

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  profile?: PortfolioContent["profile"];
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  profile,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
  const firstName = name.trim().split(/\s+/)[0].toLowerCase();
  const location = profile?.location || siteConfig.location;
  const isAvailable = profile?.available !== false;

  const navLinks = [
    { href: "#about", label: lang === "id" ? "Tentang" : "About" },
    { href: "#skills", label: lang === "id" ? "Keahlian" : "Skills" },
    { href: "#projects", label: lang === "id" ? "Proyek" : "Projects" },
    { href: "#experience", label: lang === "id" ? "Pengalaman" : "Experience" },
    { href: "#terminal", label: lang === "id" ? "Terminal" : "Terminal" },
    { href: "#contact", label: lang === "id" ? "Kontak" : "Contact" },
  ];

  return (
    <>
      {/* Top Availability Bar */}
      <div className="bg-surface-subtle dark:bg-[#0c0c10] border-b border-zinc-200 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-400 py-2 px-4 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {isAvailable
                ? lang === "id"
                  ? "Tersedia untuk Peluang Kerja Penuh Waktu & Kontrak Proyek"
                  : "Available for Full-Time Roles & High-Impact Contracts"
                : lang === "id"
                ? "Saat ini sedang menangani proyek aktif"
                : "Currently engaged in active projects"}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 font-mono text-[11px]">
            <span>📍 {location}</span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? "glass-header shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#hero"
            className="flex items-center gap-2.5 group"
            aria-label={`${name} Home`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
                {name}
              </span>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                {firstName}.dev
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100/70 dark:bg-zinc-800/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-700/50 text-sm">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white font-medium rounded-full hover:bg-white/80 dark:hover:bg-zinc-700/60 transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher Pill */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors shadow-sm"
              title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
              aria-label="Toggle language"
            >
              <span className={lang === "id" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-zinc-400"}>
                ID
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className={lang === "en" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-zinc-400"}>
                EN
              </span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors shadow-sm"
              aria-label="Toggle color mode"
              title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700 transition-transform -rotate-12 hover:rotate-0 duration-300" />
              )}
            </button>

            {/* Direct Contact Button */}
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 shadow-sm transition-all hover:scale-[1.02]"
            >
              <span>{lang === "id" ? "Hubungi Saya" : "Get in Touch"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <span>{lang === "id" ? "Hubungi Saya Sekarang" : "Get in Touch Now"}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
