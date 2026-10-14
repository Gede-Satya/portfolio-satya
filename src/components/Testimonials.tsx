"use client";

import React, { useState, useEffect } from "react";
import { Star, MessageSquarePlus, Send, X, CheckCircle2, Sparkles, User, Briefcase, Quote } from "lucide-react";
import { Language, TestimonialItem } from "@/types/portfolio";

interface TestimonialsProps {
  lang: Language;
  testimonials?: TestimonialItem[];
  onShowToast?: (message: string, type?: "success" | "info" | "error") => void;
}

export const Testimonials: React.FC<TestimonialsProps> = ({
  lang,
  testimonials,
  onShowToast,
}) => {
  const [items, setItems] = useState<TestimonialItem[]>(testimonials || []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (testimonials) {
      setItems(testimonials.filter((item) => item.visible !== false));
    }
  }, [testimonials]);

  const ratingDescriptions: Record<number, { id: string; en: string }> = {
    5: { id: "Luar Biasa (5/5)", en: "Exceptional (5/5)" },
    4: { id: "Sangat Baik (4/5)", en: "Very Good (4/5)" },
    3: { id: "Baik (3/5)", en: "Good (3/5)" },
    2: { id: "Cukup (2/5)", en: "Fair (2/5)" },
    1: { id: "Perlu Peningkatan (1/5)", en: "Needs Improvement (1/5)" },
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!author.trim()) {
      setErrorMessage(
        lang === "id"
          ? "Silakan masukkan nama lengkap Anda."
          : "Please enter your name."
      );
      return;
    }

    if (!quote.trim()) {
      setErrorMessage(
        lang === "id"
          ? "Silakan tuliskan ulasan atau pengalaman kerja sama Anda."
          : "Please write your review or collaboration experience."
      );
      return;
    }

    if (quote.trim().length < 10) {
      setErrorMessage(
        lang === "id"
          ? "Ulasan minimal 10 karakter agar lebih informatif."
          : "Review should be at least 10 characters long."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Partial<TestimonialItem> = {
        author: author.trim(),
        role: role.trim() || (lang === "id" ? "Rekan Kolaborasi" : "Collaborator"),
        rating,
        quote: {
          id: quote.trim(),
          en: quote.trim(),
        },
        initials: getInitials(author.trim()),
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal mengirim ulasan.");
      }

      const createdItem: TestimonialItem = data.data || {
        ...payload,
        id: "testi-" + Date.now(),
      };

      // Update state locally so review immediately shows up
      setItems((prev) => [createdItem, ...prev]);
      setSubmitSuccess(true);
      
      const successToast = lang === "id"
        ? "Terima kasih! Ulasan dan bintang Anda berhasil dikirim."
        : "Thank you! Your review and rating have been posted.";
      
      if (onShowToast) {
        onShowToast(successToast, "success");
      }

      // Reset form fields
      setAuthor("");
      setRole("");
      setQuote("");
      setRating(5);
      
      // Auto close form after 3 seconds or keep success visible
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsFormOpen(false);
      }, 2500);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setErrorMessage(msg);
      if (onShowToast) {
        onShowToast(msg, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="testimonials" className="py-20 border-t border-zinc-200/60 dark:border-zinc-800/60 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header & Action Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {lang === "id" ? "Ulasan & Rekomendasi" : "Reviews & Endorsements"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {lang === "id" ? "Bintang & Feedback" : "Rating & Feedback"}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {lang === "id" ? "Apa Kata Rekan & Klien" : "What Colleagues & Clients Say"}
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
              {lang === "id"
                ? "Penilaian nyata dan umpan balik langsung mengenai kualitas kode, komunikasi, dan kerja sama proyek."
                : "Authentic feedback and ratings on code quality, communication, and project delivery."}
            </p>
          </div>

          <div>
            <button
              onClick={() => {
                setIsFormOpen(!isFormOpen);
                setSubmitSuccess(false);
                setErrorMessage("");
              }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm ${
                isFormOpen
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02]"
              }`}
            >
              {isFormOpen ? (
                <>
                  <X className="w-4 h-4" />
                  {lang === "id" ? "Tutup Form" : "Close Form"}
                </>
              ) : (
                <>
                  <MessageSquarePlus className="w-4 h-4" />
                  {lang === "id" ? "Beri Ulasan & Bintang" : "Write a Review"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form Modal / Inline Collapsible Box */}
        {isFormOpen && (
          <div className="mb-14 p-6 sm:p-8 rounded-2xl glass-panel border border-indigo-500/30 bg-gradient-to-b from-indigo-950/10 to-transparent dark:from-indigo-950/20 shadow-xl shadow-indigo-500/5 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-200/60 dark:border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {lang === "id" ? "Kirimkan Ulasan & Penilaian Anda" : "Leave Your Review & Rating"}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {lang === "id"
                      ? "Ulasan Anda akan langsung ditampilkan secara transparan di portofolio ini."
                      : "Your review will be displayed publicly on this portfolio."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Tutup form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {lang === "id" ? "Ulasan Berhasil Dikirim!" : "Review Submitted!"}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                  {lang === "id"
                    ? "Terima kasih banyak atas waktu dan bintang yang Anda berikan untuk Satya Dharma."
                    : "Thank you for taking the time to share your review and rating."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Interactive Star Rating Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    {lang === "id" ? "Penilaian Bintang" : "Rating"} <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-zinc-100/80 dark:bg-zinc-900/60 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const activeVal = hoverRating || rating;
                        const isFilled = starVal <= activeVal;
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setRating(starVal)}
                            onMouseEnter={() => setHoverRating(starVal)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 focus:outline-none transition-transform hover:scale-125"
                            aria-label={`${starVal} bintang`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                isFilled
                                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                  : "text-zinc-300 dark:text-zinc-600"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-sm font-semibold text-amber-500 dark:text-amber-400">
                      {ratingDescriptions[hoverRating || rating]?.[lang]}
                    </span>
                  </div>
                </div>

                {/* Input Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {lang === "id" ? "Nama Lengkap Anda" : "Your Full Name"} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder={lang === "id" ? "Contoh: Budi Santoso" : "e.g., Jane Doe"}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {lang === "id" ? "Peran / Perusahaan / Hubungan" : "Role / Company / Relation"}
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder={
                          lang === "id"
                            ? "Contoh: Klien Web / Tech Lead di PT ABC"
                            : "e.g., Client / Product Lead @ TechCorp"
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Review Text Area */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {lang === "id" ? "Ulasan / Masukan Kerja Sama" : "Your Review / Feedback"} <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {quote.length} {lang === "id" ? "karakter" : "chars"}
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder={
                      lang === "id"
                        ? "Bagikan pengalaman kerja sama, ketepatan waktu, kualitas kode, atau komunikasi dengan Satya Dharma..."
                        : "Share your experience working with Satya Dharma, code quality, timeliness, communication..."
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all leading-relaxed"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
                    {errorMessage}
                  </div>
                )}

                {/* Submit & Cancel */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {lang === "id" ? "Batal" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {lang === "id" ? "Mengirim..." : "Submitting..."}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {lang === "id" ? "Kirim Ulasan & Bintang" : "Submit Review"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Testimonials Grid or Empty State */}
        {items.length === 0 ? (
          <div className="p-10 rounded-2xl glass-panel text-center max-w-xl mx-auto border border-dashed border-zinc-300 dark:border-zinc-700/80">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {lang === "id" ? "Belum Ada Ulasan" : "No Reviews Yet"}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              {lang === "id"
                ? "Pernah bekerja sama, memesan proyek, atau berdiskusi dengan Satya Dharma? Jadilah orang pertama yang memberikan ulasan & bintang!"
                : "Have you collaborated, commissioned a project, or worked with Satya Dharma? Be the first to leave a review and star rating!"}
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
            >
              <MessageSquarePlus className="w-4 h-4" />
              {lang === "id" ? "Tulis Ulasan Pertama" : "Write the First Review"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => {
              const starCount = item.rating || 5;
              const textContent =
                typeof item.quote === "string"
                  ? item.quote
                  : item.quote?.[lang] || item.quote?.id || item.quote?.en || "";

              return (
                <div
                  key={item.id || idx}
                  className="p-6 rounded-2xl glass-panel flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all hover:shadow-lg hover:shadow-indigo-500/5 group"
                >
                  <div>
                    {/* Stars & Quote Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-amber-400" title={`${starCount} dari 5 bintang`}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < starCount
                                ? "fill-amber-400 text-amber-400"
                                : "text-zinc-200 dark:text-zinc-700"
                            }`}
                          />
                        ))}
                      </div>
                      <Quote className="w-5 h-5 text-indigo-500/30 group-hover:text-indigo-500/50 transition-colors" />
                    </div>

                    {/* Review text */}
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic mb-6">
                      &ldquo;{textContent}&rdquo;
                    </p>
                  </div>

                  {/* Author information */}
                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
                      {item.initials || getInitials(item.author)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {item.author}
                      </h4>
                      <p className="text-[11px] text-zinc-500 truncate">{item.role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
