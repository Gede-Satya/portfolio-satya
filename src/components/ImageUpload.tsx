"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Link as LinkIcon, Check, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  aspect?: "portrait" | "landscape" | "square";
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = "Gambar",
  placeholder = "Pilih file gambar atau masukkan URL...",
  aspect = "portrait",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [useUrlMode, setUseUrlMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WebP, SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5MB.");
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
        setError(data.message || "Gagal mengunggah gambar.");
      }
    } catch (err) {
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

  const thumbnailDimension =
    aspect === "portrait"
      ? "w-16 h-22 aspect-[3/4]"
      : aspect === "landscape"
      ? "w-20 h-14 aspect-[16/10]"
      : "w-16 h-16 aspect-square";

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-zinc-300">{label}</label>
          {aspect === "portrait" && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800/60">
              Format Portrait (3:4)
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setUseUrlMode(!useUrlMode)}
          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 transition-colors"
        >
          {useUrlMode ? (
            <>
              <Upload className="w-3 h-3" />
              <span>Ganti ke Mode Upload File</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3 h-3" />
              <span>Ganti ke Mode URL Manual</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px]">
          {error}
        </div>
      )}

      {/* Mode 1: Manual URL */}
      {useUrlMode ? (
        <div className="space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500 font-mono text-xs"
          />
        </div>
      ) : (
        /* Mode 2: File Upload Zone */
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          {value ? (
            /* Preview State with change button */
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 p-2.5 flex items-center gap-3">
              <div
                className={`relative rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/60 ${thumbnailDimension}`}
              >
                <Image
                  src={value}
                  alt="Preview"
                  fill
                  sizes="120px"
                  className="object-cover object-top"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-zinc-300 font-mono truncate block">
                  {value}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                  <Check className="w-3 h-3" />
                  <span>
                    {aspect === "portrait"
                      ? "Gambar portrait aktif"
                      : "Gambar aktif"}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium transition-colors"
                >
                  Ganti File
                </button>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Hapus gambar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Empty Upload Zone */
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                dragActive
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900"
              }`}
            >
              {isUploading ? (
                <div className="flex items-center gap-2 text-indigo-400 py-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium text-xs">
                    Mengunggah foto portrait...
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 text-indigo-400 flex items-center justify-center mb-1">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="font-semibold text-zinc-200 text-xs">
                    Klik untuk pilih foto portrait atau seret file ke sini
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    {aspect === "portrait"
                      ? "Rekomendasi rasio Portrait vertikal (3:4 atau 4:5), maks. 5MB"
                      : "Mendukung JPG, PNG, WebP, SVG (Maks. 5MB)"}
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
