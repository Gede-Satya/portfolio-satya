"use client";

import React, { useState, useEffect } from "react";
import { Language } from "@/types/portfolio";
import { PortfolioContent } from "@/lib/storage";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Terminal } from "@/components/Terminal";
import { Experience } from "@/components/Experience";
import { Testimonials } from "@/components/Testimonials";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Toast } from "@/components/Toast";

interface PortfolioViewProps {
  initialData: PortfolioContent;
}

export function PortfolioView({ initialData }: PortfolioViewProps) {
  const [lang, setLang] = useState<Language>("id");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioContent>(initialData);

  // Sync when initialData changes from dynamic server render
  useEffect(() => {
    if (initialData) {
      setPortfolioData(initialData);
    }
  }, [initialData]);

  // Initialize theme, language, and background sync CMS data
  useEffect(() => {
    // Theme
    const storedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      }
    }

    // Language
    const storedLang = localStorage.getItem("lang") as Language | null;
    if (storedLang) {
      setLang(storedLang);
    }

    // Background sync live CMS data
    fetch(`/api/portfolio?_t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPortfolioData(data.data);
        }
      })
      .catch((err) => {
        console.error("Using server initial portfolio data fallback", err);
      });
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleToggleLang = () => {
    const nextLang = lang === "id" ? "en" : "id";
    setLang(nextLang);
    localStorage.setItem("lang", nextLang);
    showToast(
      nextLang === "en"
        ? "Language switched to English"
        : "Bahasa diubah ke Bahasa Indonesia"
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      showToast(
        lang === "id"
          ? `Alamat email ${email} berhasil disalin!`
          : `Email address ${email} copied to clipboard!`
      );
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        profile={portfolioData.profile}
      />

      <main>
        <Hero
          lang={lang}
          profile={portfolioData.profile}
          heroStats={portfolioData.heroStats}
          onCopyEmail={handleCopyEmail}
          copied={copied}
        />
        <About
          lang={lang}
          about={portfolioData.about}
          profile={portfolioData.profile}
        />
        <Skills lang={lang} skills={portfolioData.skills} />
        <Projects lang={lang} projects={portfolioData.projects} />
        <Terminal
          lang={lang}
          profile={portfolioData.profile}
          skills={portfolioData.skills}
          projects={portfolioData.projects}
          about={portfolioData.about}
        />
        <Experience lang={lang} timeline={portfolioData.timeline} />
        <Testimonials
          lang={lang}
          testimonials={portfolioData.testimonials}
        />
        <Contact
          lang={lang}
          profile={portfolioData.profile}
          onCopyEmail={handleCopyEmail}
          copied={copied}
          onShowToast={showToast}
        />
      </main>

      <Footer lang={lang} profile={portfolioData.profile} />

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
