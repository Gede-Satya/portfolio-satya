"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  X,
  ExternalLink,
  Link as LinkIcon,
  Check,
  Loader2,
  FileDown,
  Eye,
  EyeOff,
} from "lucide-react";

interface CvUploadProps {
  value: string;
  onChange: (url: string) => void;
  showButton?: boolean;
  onToggleShowButton?: (show: boolean) => void;
}

export const CvUpload: React.FC<CvUploadProps> = ({
  value,
  onChange,
  showButton = true,
  onToggleShowButton,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [useUrlMode, setUseUrlMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    const validExtensions = [".pdf", ".doc", ".docx"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

    if (
      !validExtensions.includes(fileExt) &&
      !file.type.includes("pdf") &&
      !file.type.includes("word") &&
      !file.type.includes("document")
    ) {
      setError("Format file tidak didukung. Harap unggah file PDF atau DOCX.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("Ukuran file terlalu besar (maksimal 15MB).");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onChange(data.url);
      } else {
        setError(data.message || "Gagal mengunggah file CV.");
      }
    } catch {
      setError("Terjadi kesalahan saat mengunggah file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const isPdf = value.toLowerCase().endsWith(".pdf") || value.toLowerCase().includes(".pdf");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FileDown className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Curriculum Vitae (CV / Resume)</h3>
            <p className="text-[11px] text-zinc-400">
              Unggah file PDF CV atau cantumkan tautan Google Drive / Cloud Resume Anda.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setUseUrlMode(!useUrlMode)}
          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 transition-colors"
        >
          {useUrlMode ? (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>Ganti ke Upload Berkas (PDF)</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Ganti ke Mode Tautan URL Manual</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Visibility Toggle */}
      {onToggleShowButton && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            {showButton ? (
              <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <EyeOff className="w-4 h-4 text-zinc-500 shrink-0" />
            )}
            <div>
              <span className="text-xs font-semibold text-zinc-200 block">
                Tampilkan Tombol Unduh CV di Halaman Publik
              </span>
              <span className="text-[11px] text-zinc-500 block">
                {showButton
                  ? "Tombol 'Unduh CV' akan aktif dan dapat diklik oleh pengunjung web."
                  : "Tombol 'Unduh CV' dinonaktifkan sementara di halaman publik."}
              </span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showButton}
              onChange={(e) => onToggleShowButton(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      )}

      {/* Mode 1: Manual Link input */}
      {useUrlMode ? (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-300">
            Tautan / URL Berkas CV (Google Drive, Cloud Storage, dll.)
          </label>
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Contoh: https://drive.google.com/file/d/.../view atau /uploads/cv-satya.pdf"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white font-mono outline-none focus:border-indigo-500 placeholder:text-zinc-600"
            />
            <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          </div>
          {value && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                <Check className="w-3.5 h-3.5" />
                <span>Tautan CV telah tersimpan</span>
              </span>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
              >
                <span>Uji Buka CV</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      ) : (
        /* Mode 2: Drag and drop PDF upload */
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          {value ? (
            /* Active CV File Card */
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    isPdf
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                  }`}
                >
                  <FileText className="w-6 h-6" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white truncate max-w-[280px] sm:max-w-md block">
                      {value.split("/").pop() || "Curriculum Vitae"}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                        isPdf
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      }`}
                    >
                      {isPdf ? "PDF" : "DOC"}
                    </span>
                  </div>

                  <span className="text-[11px] text-zinc-500 font-mono truncate block mt-0.5">
                    {value}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                  title="Lihat Pratinjau CV"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Lihat CV</span>
                </a>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
                >
                  Ganti File
                </button>

                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Hapus Berkas CV"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Empty State Upload Dropzone */
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                dragActive
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900"
              }`}
            >
              {isUploading ? (
                <div className="flex items-center gap-2 text-indigo-400 py-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium text-xs">Mengunggah berkas CV...</span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-zinc-800/90 text-indigo-400 flex items-center justify-center mb-1">
                    <FileDown className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-zinc-200 text-xs sm:text-sm">
                    Klik untuk memilih berkas CV atau seret file PDF ke sini
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Mendukung format PDF atau DOCX (Maksimal 15MB)
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
