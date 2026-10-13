"use client";

import React from "react";
import { Briefcase, GraduationCap } from "lucide-react";
import { timelineData } from "@/data/portfolioData";
import { Language, TimelineItem } from "@/types/portfolio";

interface ExperienceProps {
  lang: Language;
  timeline?: TimelineItem[];
}

export const Experience: React.FC<ExperienceProps> = ({ lang, timeline }) => {
  const items = timeline || timelineData;
  return (
    <section id="experience" className="py-20 border-t border-zinc-200/60 dark:border-zinc-800/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {lang === "id" ? "Perjalanan Karir" : "Career Path"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2">
            {lang === "id" ? "Pengalaman & Riwayat Pendidikan" : "Experience & Academic Journey"}
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
            {lang === "id"
              ? "Rekam jejak kontribusi dalam merancang sistem web, memimpin delivery fitur, dan meningkatkan keandalan infrastruktur."
              : "Track record of shipping mission-critical features, leading frontend & backend architectures, and raising uptime standards."}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 sm:ml-6 space-y-12">
          {items.map((item: TimelineItem) => (
            <div key={item.id} className="relative pl-8 sm:pl-10 group">
              {/* Marker Dot */}
              <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-white dark:bg-[#121217] border-2 border-indigo-500 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm group-hover:scale-110 transition-transform">
                {item.badgeType === "work" ? (
                  <Briefcase className="w-3.5 h-3.5" />
                ) : (
                  <GraduationCap className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Content Card */}
              <div className="p-6 rounded-2xl glass-panel hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {item.period}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                      item.badgeType === "work"
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                    }`}
                  >
                    {item.badge[lang]}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {item.role[lang]}
                </h3>

                <h4 className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                  {item.company}
                </h4>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                  {item.description[lang]}
                </p>

                {item.skills && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    {item.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
