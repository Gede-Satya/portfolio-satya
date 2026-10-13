"use client";

import React, { useState } from "react";
import { skillsData } from "@/data/portfolioData";
import { Language, SkillItem } from "@/types/portfolio";

interface SkillsProps {
  lang: Language;
  skills?: SkillItem[];
}

export const Skills: React.FC<SkillsProps> = ({ lang, skills }) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: lang === "id" ? "Semua Keahlian" : "All Skills" },
    { id: "frontend", label: "Frontend" },
    { id: "backend", label: "Backend & API" },
    { id: "database", label: "Database & Cloud" },
    { id: "tools", label: "Tools & Testing" },
  ];

  const sourceSkills = skills || skillsData;
  const filteredSkills =
    activeCategory === "all"
      ? sourceSkills
      : sourceSkills.filter((s) => s.category === activeCategory);

  return (
    <section id="skills" className="py-20 border-t border-zinc-200/60 dark:border-zinc-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {lang === "id" ? "Kemampuan Teknis" : "Technical Arsenal"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2">
            {lang === "id" ? "Teknologi & Ekosistem Utama" : "Technologies & Modern Stack"}
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
            {lang === "id"
              ? "Perangkat dan bahasa pemrograman yang saya gunakan setiap hari dalam lingkungan pengembangan produksi."
              : "Tools, frameworks, and runtime environments I deploy daily across production architectures."}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSkills.map((skill: SkillItem, index: number) => (
            <div
              key={index}
              className="p-5 rounded-2xl glass-panel hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 border border-zinc-200/50 dark:border-zinc-700/50 group-hover:scale-105 transition-transform">
                      {skill.iconText}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                        {skill.name}
                      </h4>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {skill.exp[lang]}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold border ${
                      skill.level === "Expert"
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                    }`}
                  >
                    {skill.level}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                  {skill.desc[lang]}
                </p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-1">
                  <span>{lang === "id" ? "Tingkat Kemahiran" : "Proficiency"}</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {skill.progress}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${skill.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
