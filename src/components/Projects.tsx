"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "./Icons";
import { projectsData } from "@/data/portfolioData";
import { Language, ProjectItem } from "@/types/portfolio";
import { ProjectModal } from "./ProjectModal";

interface ProjectsProps {
  lang: Language;
  projects?: ProjectItem[];
}

export const Projects: React.FC<ProjectsProps> = ({ lang, projects }) => {
  const [filter, setFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const filters = [
    { id: "all", label: lang === "id" ? "Semua Proyek" : "All Projects" },
    { id: "fullstack", label: "Full-Stack" },
    { id: "frontend", label: "Frontend" },
    { id: "backend", label: "Backend & Systems" },
  ];

  const sourceProjects = projects || projectsData;
  const filteredProjects =
    filter === "all"
      ? sourceProjects
      : sourceProjects.filter((p) => p.category === filter);

  return (
    <section id="projects" className="py-20 border-t border-zinc-200/60 dark:border-zinc-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {lang === "id" ? "Portofolio Karya" : "Selected Works"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2">
            {lang === "id" ? "Proyek Unggulan Terpilih" : "Featured Engineering Projects"}
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
            {lang === "id"
              ? "Aplikasi web end-to-end yang dibangun dengan fokus pada arsitektur bersih, latensi rendah, dan pengalaman pengguna optimal."
              : "End-to-end web applications crafted with strict emphasis on clean architecture, minimal latency, and delightful UX."}
          </p>
        </div>

        {/* Project Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === f.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project: ProjectItem) => (
            <article
              key={project.id}
              className="rounded-3xl glass-panel overflow-hidden border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 group"
            >
              <div>
                {/* Project Image Box */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-zinc-900/80 dark:bg-black/80 text-white backdrop-blur-md border border-white/10 shadow-sm">
                      {project.badge}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-7">
                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                    {project.tags.slice(0, 4).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-mono text-zinc-400">
                        +{project.tags.length - 4}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                    {project.summary[lang]}
                  </p>

                  {/* Metrics preview bubbles */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60 mb-6 text-center">
                    {project.metrics.map((m, i) => (
                      <div key={i}>
                        <span className="block font-bold text-xs text-zinc-900 dark:text-white font-mono">
                          {m.val}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {m.lbl[lang]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-0 flex items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800/60">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <span>{lang === "id" ? "Detail Arsitektur" : "Architecture Case"}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                    title="GitHub Repository"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Modal Dialog */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        lang={lang}
      />
    </section>
  );
};
