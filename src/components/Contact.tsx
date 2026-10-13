"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, MapPin, Send, Check, Copy } from "lucide-react";
import { Language } from "@/types/portfolio";
import { siteConfig } from "@/data/portfolioData";
import { PortfolioContent } from "@/lib/storage";

interface ContactProps {
  lang: Language;
  onCopyEmail: (email: string) => void;
  copied: boolean;
  onShowToast: (message: string) => void;
  profile?: PortfolioContent["profile"];
}

export const Contact: React.FC<ContactProps> = ({
  lang,
  onCopyEmail,
  copied,
  onShowToast,
  profile,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const email = profile?.email || siteConfig.email;
  const whatsappUrl = profile?.whatsapp || siteConfig.whatsapp;
  const phone = profile?.phone || siteConfig.phone;
  const location = profile?.location || siteConfig.location;
  const isAvailable = profile?.available !== false;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = lang === "id" ? "Nama wajib diisi." : "Name is required.";
    }
    if (!formData.email.trim()) {
      errs.email = lang === "id" ? "Email wajib diisi." : "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email =
        lang === "id" ? "Format email tidak valid." : "Invalid email address.";
    }
    if (!formData.subject) {
      errs.subject =
        lang === "id" ? "Pilih topik diskusi." : "Please select a topic.";
    }
    if (!formData.message.trim() || formData.message.length < 10) {
      errs.message =
        lang === "id"
          ? "Pesan minimal 10 karakter."
          : "Message must be at least 10 characters.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onShowToast(
          lang === "id"
            ? "Pesan Anda berhasil terkirim! Saya akan merespons segera."
            : "Your message has been sent successfully! I'll get back to you shortly."
        );
        setFormData({ name: "", email: "", subject: "", message: "" });
        setErrors({});
      } else {
        onShowToast(data.message || "Gagal mengirim pesan.");
      }
    } catch (err) {
      onShowToast(
        lang === "id"
          ? "Gagal terhubung ke server. Silakan coba lagi."
          : "Failed to connect to server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 border-t border-zinc-200/60 dark:border-zinc-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {lang === "id" ? "Kontak & Diskusi" : "Get In Touch"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2">
            {lang === "id" ? "Mari Bahas Proyek & Peluang Anda" : "Let's Build Something Exceptional"}
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
            {lang === "id"
              ? "Punya lowongan kerja rekayasa web, proyek freelance, atau ingin berkonsultasi arsitektur? Hubungi saya kapan saja."
              : "Have a full-time engineering opportunity, freelance contract, or architecture inquiry? Reach out anytime."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Channels Info Card */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {lang === "id" ? "Saluran Komunikasi Langsung" : "Direct Contact Channels"}
            </h3>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {lang === "id"
                ? "Saya biasanya merespons pesan dalam kurun waktu kurang dari 24 jam pada hari kerja."
                : "I typically respond within less than 24 hours on business days."}
            </p>

            <div className="space-y-4 pt-2">
              {/* Email */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 font-medium block">Email</span>
                    <a
                      href={`mailto:${email}`}
                      className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white hover:text-indigo-600 transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => onCopyEmail(email)}
                  className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"
                  title="Salin email"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 font-medium block">WhatsApp</span>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white hover:text-emerald-600 transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mr-3">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-500 font-medium block">
                    {lang === "id" ? "Lokasi & Zona Waktu" : "Location & Timezone"}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">
                    {location}
                  </span>
                </div>
              </div>
            </div>

            {/* Ready badge */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-medium">
                {isAvailable
                  ? lang === "id"
                    ? `Tersedia untuk peluang kerja Remote maupun On-site (${location}).`
                    : `Available for immediate Remote or Hybrid (${location}) engagements.`
                  : lang === "id"
                  ? "Sedang menangani proyek aktif, namun tetap terbuka untuk konsultasi teknis."
                  : "Currently handling active projects, but open to technical inquiries."}
              </span>
            </div>
          </div>

          {/* Right Interactive Contact Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl glass-panel">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {lang === "id" ? "Nama Lengkap *" : "Your Name *"}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={`e.g. ${profile?.name || siteConfig.name}`}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                  />
                  {errors.name && (
                    <span className="text-[11px] text-rose-500 mt-1 block">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {lang === "id" ? "Alamat Email *" : "Your Email *"}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="alex@company.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                  />
                  {errors.email && (
                    <span className="text-[11px] text-rose-500 mt-1 block">
                      {errors.email}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {lang === "id" ? "Topik Diskusi *" : "Subject / Opportunity *"}
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                >
                  <option value="" disabled>
                    {lang === "id" ? "Pilih kategori kebutuhan..." : "Select discussion category..."}
                  </option>
                  <option value="Full-Time Role">
                    {lang === "id"
                      ? "Peluang Kerja Penuh Waktu (Full-Time Role)"
                      : "Full-Time Software Engineer Opportunity"}
                  </option>
                  <option value="Freelance Web Project">
                    {lang === "id"
                      ? "Proyek Freelance Web / Kontrak"
                      : "Freelance / Contract Web Development"}
                  </option>
                  <option value="Consultation & Architecture">
                    {lang === "id"
                      ? "Konsultasi Arsitektur Perangkat Lunak"
                      : "Software Architecture Consultation"}
                  </option>
                  <option value="General Inquiry">
                    {lang === "id" ? "Pertanyaan Umum / Lainnya" : "General Inquiry"}
                  </option>
                </select>
                {errors.subject && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {errors.subject}
                  </span>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {lang === "id" ? "Pesan atau Rincian Proyek *" : "Your Message *"}
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {formData.message.length}/500
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder={
                    lang === "id"
                      ? "Ceritakan ringkasan tujuan, jangka waktu, atau kebutuhan teknologi Anda..."
                      : "Tell me about your project timeline, requirements, or tech stack..."
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors resize-none"
                />
                {errors.message && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {errors.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>
                    {lang === "id" ? "Mengirim Pesan..." : "Sending Message..."}
                  </span>
                ) : (
                  <>
                    <span>
                      {lang === "id" ? "Kirim Pesan Sekarang" : "Send Message Now"}
                    </span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
