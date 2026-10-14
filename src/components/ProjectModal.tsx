"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, ExternalLink, CheckCircle, Layers, Cpu, AlertCircle } from "lucide-react";
import { GithubIcon } from "./Icons";
import { ProjectItem, Language } from "@/types/portfolio";

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  lang: Language;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  lang,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel bg-white dark:bg-[#121217] p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
          aria-label="Tutup detail modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
              {project.badge}
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            {project.title}
          </h3>
        </div>

        {/* Project Image */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Engineering Metrics Ribbon */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 mb-6 text-center">
            {project.metrics.map((m, i) => (
              <div key={i}>
                <span className="block font-extrabold text-sm sm:text-base text-indigo-600 dark:text-indigo-400 font-mono">
                  {m.val}
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">
                  {m.lbl[lang] || m.lbl.id}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Overview & Architecture Details */}
        <div className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {/* Overview */}
          <div>
            <h4 className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-white mb-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>{lang === "id" ? "Ikhtisar Proyek" : "Project Overview"}</span>
            </h4>
            <p>
              {project.details?.overview?.[lang] ||
                project.details?.overview?.id ||
                project.summary?.[lang] ||
                project.summary?.id ||
                "-"}
            </p>
          </div>

          {/* System Architecture */}
          <div>
            <h4 className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-white mb-2">
              <Cpu className="w-4 h-4 text-emerald-500" />
              <span>
                {lang === "id" ? "Desain Arsitektur Sistem" : "System Architecture"}
              </span>
            </h4>
            <p className="whitespace-pre-line">
              {project.details?.architecture?.[lang] ||
                project.details?.architecture?.id ||
                (lang === "id"
                  ? "Arsitektur sistem belum didokumentasikan untuk proyek ini."
                  : "System architecture has not been documented for this project yet.")}
            </p>
          </div>

          {/* Highlights */}
          {((project.details?.highlights?.[lang] || project.details?.highlights?.id || []).length > 0) && (
            <div>
              <h4 className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-white mb-3">
                <CheckCircle className="w-4 h-4 text-cyan-500" />
                <span>
                  {lang === "id" ? "Sorotan Fitur & Keamanan" : "Key Highlights & Security"}
                </span>
              </h4>
              <ul className="space-y-2">
                {(project.details?.highlights?.[lang] || project.details?.highlights?.id || []).map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-indigo-500 font-bold mt-0.5">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenge Solved */}
          {(project.details?.challengesSolved?.[lang] || project.details?.challengesSolved?.id) && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-zinc-800 dark:text-zinc-200">
              <h4 className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span>
                  {lang === "id" ? "Tantangan Rekayasa & Solusi" : "Engineering Challenge & Solution"}
                </span>
              </h4>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                {project.details?.challengesSolved?.[lang] ||
                  project.details?.challengesSolved?.id}
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>{lang === "id" ? "Kode Sumber (GitHub)" : "Source Code"}</span>
            </a>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <span>Live Demo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            {lang === "id" ? "Tutup" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
