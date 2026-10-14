"use client";

import React from "react";
import { Star, Quote } from "lucide-react";
import { testimonialsData } from "@/data/portfolioData";
import { Language, TestimonialItem } from "@/types/portfolio";

interface TestimonialsProps {
  lang: Language;
  testimonials?: TestimonialItem[];
}

export const Testimonials: React.FC<TestimonialsProps> = ({
  lang,
  testimonials,
}) => {
  const allItems = testimonials?.length ? testimonials : testimonialsData;
  const items = allItems.filter((item) => item.visible !== false);

  if (items.length === 0) return null;

  return (
    <section className="py-20 border-t border-zinc-200/60 dark:border-zinc-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {lang === "id" ? "Rekomendasi Rekan" : "Endorsements"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2">
            {lang === "id" ? "Apa Kata Pemimpin Tim & Kolega" : "Words From Engineering Leads"}
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
            {lang === "id"
              ? "Umpan balik langsung dari Tech Lead, Product Manager, dan rekan arsitek software."
              : "Direct feedback from Tech Leads, Product Managers, and software architects I've collaborated with."}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl glass-panel flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic mb-6">
                  &ldquo;{item.quote[lang]}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                  {item.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    {item.author}
                  </h4>
                  <p className="text-[11px] text-zinc-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
