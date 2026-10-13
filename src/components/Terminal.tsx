"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, CornerDownLeft, Sparkles } from "lucide-react";
import { Language, ProjectItem, SkillItem } from "@/types/portfolio";
import { terminalCommands, siteConfig } from "@/data/portfolioData";
import { AboutContent, PortfolioContent } from "@/lib/storage";

interface TerminalProps {
  lang: Language;
  profile?: PortfolioContent["profile"];
  skills?: SkillItem[];
  projects?: ProjectItem[];
  about?: AboutContent;
}

interface HistoryItem {
  command: string;
  output: string;
}

export const Terminal: React.FC<TerminalProps> = ({
  lang,
  profile,
  skills,
  projects,
  about,
}) => {
  const name = profile?.name || siteConfig.name;
  const userTag = profile?.name?.trim().split(/\s+/)[0]?.toLowerCase() || "dev";

  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      command: "welcome",
      output:
        lang === "id"
          ? `Selamat datang di ${name} CLI v2.4.\nKetik 'help' atau klik tombol pintasan di bawah untuk menjelajah.`
          : `Welcome to ${name} Interactive CLI v2.4.\nType 'help' or click the quick action chips below to explore.`,
    },
  ]);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const runCommand = (cmdText: string) => {
    const trimmed = cmdText.trim().toLowerCase();
    if (!trimmed) return;

    if (trimmed === "clear") {
      setHistory([]);
      setInput("");
      return;
    }

    let output = "";

    if (trimmed === "bio") {
      const bioP1 =
        about?.bioP1?.[lang] ||
        profile?.bioP1?.[lang] ||
        terminalCommands["bio"][lang];
      output = `${name} – ${profile?.title || "Web Developer"}\nLokasi: ${
        profile?.location || "Bali, Indonesia"
      }\nStatus: ${
        profile?.available !== false ? "Open for Work" : "Engaged"
      }\n\n${bioP1}`;
    } else if (trimmed === "contact") {
      output = `Email: ${profile?.email || "dev@example.com"}\nWhatsApp / Phone: ${
        profile?.phone || "081234567890"
      }\nGitHub: ${profile?.github || "https://github.com"}\nLinkedIn: ${
        profile?.linkedin || "https://linkedin.com"
      }`;
    } else if (trimmed === "skills" && skills?.length) {
      output = skills
        .map((s) => `• ${s.name} (${s.level}% - ${s.category})`)
        .join("\n");
    } else if (trimmed === "projects" && projects?.length) {
      output = projects
        .map(
          (p) =>
            `• ${p.title}\n  Summary: ${p.summary[lang]}\n  Live: ${p.liveUrl || "-"}`
        )
        .join("\n\n");
    } else {
      const commandResult = terminalCommands[trimmed];
      output = commandResult
        ? commandResult[lang]
        : lang === "id"
        ? `Perintah '${trimmed}' tidak dikenali. Ketik 'help' untuk melihat daftar perintah yang valid.`
        : `Command '${trimmed}' not found. Type 'help' to inspect valid commands.`;
    }

    setHistory((prev) => [...prev, { command: trimmed, output }]);
    setInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
  };

  const quickChips = ["help", "bio", "skills", "projects", "contact", "hire", "clear"];

  return (
    <section id="terminal" className="py-20 border-t border-zinc-200/60 dark:border-zinc-800/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 mb-2">
            <TerminalIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Developer Sandbox CLI</span>
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {lang === "id" ? "Terminal CLI Interaktif" : "Interactive Developer Terminal"}
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {lang === "id"
              ? "Jelajahi spesifikasi teknis dan portofolio saya langsung dari konsol perintah."
              : "Explore my background, architectural decisions, and availability directly via the console."}
          </p>
        </div>

        {/* Terminal Window */}
        <div
          className="rounded-2xl overflow-hidden glass-panel bg-[#0d0d12] text-zinc-200 font-mono text-xs sm:text-sm border border-zinc-800 shadow-2xl"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Terminal Title Bar */}
          <div className="px-4 py-3 bg-[#15151c] border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs text-zinc-400">{userTag}@macbook-pro:~ (zsh)</span>
            </div>
            <span className="text-[11px] text-zinc-500">Node v20.x</span>
          </div>

          {/* Terminal Output Area */}
          <div
            ref={outputRef}
            className="p-4 sm:p-6 space-y-4 max-h-80 overflow-y-auto leading-relaxed"
          >
            {history.map((item, index) => (
              <div key={index} className="space-y-1">
                {item.command !== "welcome" && (
                  <div className="flex items-center gap-2 text-indigo-400">
                    <span className="text-zinc-500">{userTag}@dev:~$</span>
                    <span className="font-semibold text-zinc-100">{item.command}</span>
                  </div>
                )}
                <pre className="text-zinc-300 font-mono whitespace-pre-wrap pl-2 border-l border-zinc-800">
                  {item.output}
                </pre>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="px-4 py-3 bg-[#121218] border-t border-zinc-800/80 flex items-center gap-2"
          >
            <span className="text-indigo-400 font-semibold">{userTag}@dev:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="type 'help', 'skills', 'bio'..."
              className="flex-1 bg-transparent text-zinc-100 outline-none font-mono text-xs sm:text-sm placeholder:text-zinc-600"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              type="submit"
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              aria-label="Jalankan perintah"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Action Chips */}
          <div className="px-4 py-3 bg-[#0d0d12] border-t border-zinc-800/60 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-zinc-500 mr-1">
              {lang === "id" ? "Pintasan:" : "Shortcuts:"}
            </span>
            {quickChips.map((cmd) => (
              <button
                key={cmd}
                onClick={(e) => {
                  e.stopPropagation();
                  runCommand(cmd);
                }}
                className="px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-indigo-600 text-zinc-300 hover:text-white transition-colors border border-zinc-700/60 hover:border-indigo-500"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
