"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Wrench,
  Clock,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  Search,
  RefreshCw,
  Save,
  AlertCircle,
  Eye,
  Check,
  Download,
  RotateCcw,
  BookOpen,
  Quote,
  Star,
} from "lucide-react";
import {
  PortfolioContent,
  ContactMessage,
  getDefaultContent,
  AboutContent,
  HeroStats,
} from "@/lib/storage";
import { ProjectItem, SkillItem, TimelineItem, TestimonialItem } from "@/types/portfolio";
import { Toast } from "@/components/Toast";
import { ImageUpload } from "@/components/ImageUpload";

type AdminTab =
  | "overview"
  | "profile"
  | "about"
  | "projects"
  | "skills"
  | "timeline"
  | "testimonials"
  | "inbox"
  | "settings";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<{
    originalName?: string;
    item: SkillItem;
  } | null>(null);

  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<TimelineItem | null>(null);

  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);

  // Deleting item tracking for smooth exit animations
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // In-app custom confirmation modal (replaces native window.confirm to prevent browser blocking)
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  // Settings state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auth guard and initial data load
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    loadData(true);
  }, [router]);

  const loadData = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setLoading(true);
    try {
      const [resContent, resMessages] = await Promise.all([
        fetch(`/api/portfolio?_t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/contact?_t=${Date.now()}`, { cache: "no-store" }),
      ]);

      const dataContent = await resContent.json();
      const dataMessages = await resMessages.json();

      if (dataContent.success) setContent(dataContent.data);
      if (dataMessages.success) setMessages(dataMessages.data);
    } catch (err) {
      showToast("Gagal memuat data dari server");
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  // Save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: content.profile }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Profil berhasil diperbarui & sinkron ke web!");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  // Save about section & hero stats
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          about: content.about,
          heroStats: content.heroStats,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Latar Belakang & Filosofi berhasil disimpan & sinkron ke web!");
      } else {
        showToast(data.message || "Gagal menyimpan latar belakang");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menyimpan latar belakang");
    } finally {
      setSaving(false);
    }
  };

  // Projects actions
  const handleSaveProject = async (project: ProjectItem) => {
    setSaving(true);
    const isEditing = editingProject && editingProject.id === project.id;
    try {
      const res = await fetch("/api/projects", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          isEditing ? "Proyek berhasil diperbarui" : "Proyek baru ditambahkan"
        );
        setProjectModalOpen(false);
        setEditingProject(null);
        loadData();
      }
    } catch (err) {
      showToast("Gagal menyimpan proyek");
    } finally {
      setSaving(false);
    }
  };

  const executeDeleteProject = async (id: string) => {
    const deleteKey = `proj-${id}`;
    setDeletingId(deleteKey);
    try {
      const [res] = await Promise.all([
        fetch(`/api/projects?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
        new Promise((resolve) => setTimeout(resolve, 320)),
      ]);
      const data = await res.json();
      if (data.success) {
        showToast("Proyek berhasil dihapus");
        if (content) {
          setContent({
            ...content,
            projects: content.projects.filter((p) => p.id !== id),
          });
        }
        loadData(false);
      } else {
        showToast(data.message || "Gagal menghapus proyek");
      }
    } catch (err) {
      showToast("Gagal menghapus proyek");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteProject = (id: string, title?: string) => {
    setConfirmModal({
      title: "Hapus Proyek",
      message: `Apakah Anda yakin ingin menghapus proyek ${title ? `"${title}"` : "ini"}? Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: "Hapus Proyek",
      onConfirm: () => executeDeleteProject(id),
    });
  };

  // Skills actions
  const handleSaveSkill = async (skill: SkillItem, originalName?: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/skills", {
        method: originalName ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...skill, originalName }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          originalName ? "Keahlian diperbarui" : "Keahlian baru ditambahkan"
        );
        setSkillModalOpen(false);
        setEditingSkill(null);
        loadData(false);
      }
    } catch (err) {
      showToast("Gagal menyimpan keahlian");
    } finally {
      setSaving(false);
    }
  };

  const executeDeleteSkill = async (name: string) => {
    const deleteKey = `skill-${name}`;
    setDeletingId(deleteKey);
    try {
      const [res] = await Promise.all([
        fetch(`/api/skills?name=${encodeURIComponent(name)}`, {
          method: "DELETE",
        }),
        new Promise((resolve) => setTimeout(resolve, 320)),
      ]);
      const data = await res.json();
      if (data.success) {
        showToast(`Keahlian "${name}" berhasil dihapus`);
        if (content) {
          setContent({
            ...content,
            skills: content.skills.filter(
              (s) => s.name.trim().toLowerCase() !== name.trim().toLowerCase()
            ),
          });
        }
        loadData(false);
      } else {
        showToast(data.message || "Gagal menghapus keahlian");
      }
    } catch (err) {
      showToast("Gagal menghapus keahlian");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteSkill = (name: string) => {
    setConfirmModal({
      title: "Hapus Keahlian",
      message: `Apakah Anda yakin ingin menghapus keahlian "${name}" dari portofolio? Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: "Hapus Keahlian",
      onConfirm: () => executeDeleteSkill(name),
    });
  };

  // Timeline actions
  const handleSaveTimeline = async (item: TimelineItem) => {
    setSaving(true);
    const isEditing = editingTimeline && editingTimeline.id === item.id;
    try {
      const res = await fetch("/api/timeline", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          isEditing ? "Riwayat diperbarui" : "Riwayat baru ditambahkan"
        );
        setTimelineModalOpen(false);
        setEditingTimeline(null);
        loadData();
      }
    } catch (err) {
      showToast("Gagal menyimpan riwayat");
    } finally {
      setSaving(false);
    }
  };

  const executeDeleteTimeline = async (id: string) => {
    const deleteKey = `time-${id}`;
    setDeletingId(deleteKey);
    try {
      const [res] = await Promise.all([
        fetch(`/api/timeline?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
        new Promise((resolve) => setTimeout(resolve, 320)),
      ]);
      const data = await res.json();
      if (data.success) {
        showToast("Riwayat berhasil dihapus");
        if (content) {
          setContent({
            ...content,
            timeline: content.timeline.filter((t) => t.id !== id),
          });
        }
        loadData(false);
      } else {
        showToast(data.message || "Gagal menghapus riwayat");
      }
    } catch (err) {
      showToast("Gagal menghapus riwayat");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteTimeline = (id: string) => {
    setConfirmModal({
      title: "Hapus Riwayat Pengalaman",
      message: "Apakah Anda yakin ingin menghapus riwayat ini? Tindakan ini tidak dapat dibatalkan.",
      confirmLabel: "Hapus Riwayat",
      onConfirm: () => executeDeleteTimeline(id),
    });
  };

  // Testimonial actions
  const handleSaveTestimonial = async (item: TestimonialItem) => {
    setSaving(true);
    const isEditing = Boolean(editingTestimonial && editingTestimonial.id === item.id);
    try {
      const res = await fetch("/api/testimonials", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          isEditing ? "Rekomendasi diperbarui" : "Rekomendasi baru ditambahkan"
        );
        setTestimonialModalOpen(false);
        setEditingTestimonial(null);
        loadData(false);
      }
    } catch (err) {
      showToast("Gagal menyimpan rekomendasi");
    } finally {
      setSaving(false);
    }
  };

  const executeDeleteTestimonial = async (id: string) => {
    const deleteKey = `testi-${id}`;
    setDeletingId(deleteKey);
    try {
      const [res] = await Promise.all([
        fetch(`/api/testimonials?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        }),
        new Promise((resolve) => setTimeout(resolve, 320)),
      ]);
      const data = await res.json();
      if (data.success) {
        showToast("Rekomendasi berhasil dihapus");
        if (content) {
          setContent({
            ...content,
            testimonials: (content.testimonials || []).filter((t) => t.id !== id),
          });
        }
        loadData(false);
      } else {
        showToast(data.message || "Gagal menghapus rekomendasi");
      }
    } catch (err) {
      showToast("Gagal menghapus rekomendasi");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteTestimonial = (id?: string) => {
    if (!id) return;
    setConfirmModal({
      title: "Hapus Rekomendasi Rekan",
      message: "Apakah Anda yakin ingin menghapus rekomendasi rekan ini? Tindakan ini tidak dapat dibatalkan.",
      confirmLabel: "Hapus Rekomendasi",
      onConfirm: () => executeDeleteTestimonial(id),
    });
  };

  // Messages actions
  const handleToggleReadMessage = async (id: string, currentRead: boolean) => {
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: !currentRead }),
      });
      const data = await res.json();
      if (data.success) {
        loadData(false);
      }
    } catch (err) {
      showToast("Gagal memperbarui status pesan");
    }
  };

  const executeDeleteMessage = async (id: string) => {
    const deleteKey = `msg-${id}`;
    setDeletingId(deleteKey);
    try {
      const [res] = await Promise.all([
        fetch(`/api/contact?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
        new Promise((resolve) => setTimeout(resolve, 320)),
      ]);
      const data = await res.json();
      if (data.success) {
        showToast("Pesan dihapus");
        setMessages((prev) => prev.filter((m) => m.id !== id));
        loadData(false);
      } else {
        showToast(data.message || "Gagal menghapus pesan");
      }
    } catch (err) {
      showToast("Gagal menghapus pesan");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteMessage = (id: string) => {
    setConfirmModal({
      title: "Hapus Pesan Kontak",
      message: "Apakah Anda yakin ingin menghapus pesan ini dari kotak masuk?",
      confirmLabel: "Hapus Pesan",
      onConfirm: () => executeDeleteMessage(id),
    });
  };

  // Reset to default seed
  const executeResetDefaults = async () => {
    try {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Konten berhasil di-reset ke nilai default!");
        if (data.data) setContent(data.data);
        loadData(false);
      }
    } catch (err) {
      showToast("Gagal me-reset konten");
    }
  };

  const handleResetDefaults = () => {
    setConfirmModal({
      title: "Reset Konten ke Nilai Default",
      message: "Apakah Anda yakin ingin me-reset seluruh konten ke nilai default awal? Data yang belum di-backup akan ditimpa.",
      confirmLabel: "Reset Konten",
      onConfirm: executeResetDefaults,
    });
  };

  // Update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Password admin berhasil diperbarui!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        showToast(data.message || "Gagal memperbarui password");
      }
    } catch (err) {
      showToast("Terjadi kesalahan server");
    }
  };

  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-[#09090c] text-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
          <p className="text-sm font-mono text-zinc-400">Memuat Portofolio CMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090c] text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#111116] border-r border-zinc-800/80 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo brand */}
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                AP
              </div>
              <div>
                <span className="font-bold text-sm text-white block">
                  Portofolio CMS
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  v2.0 • Admin Panel
                </span>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "overview"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ringkasan Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "profile"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profil &amp; Data Diri</span>
            </button>

            <button
              onClick={() => setActiveTab("about")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "about"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Latar Belakang &amp; Filosofi</span>
            </button>

            <button
              onClick={() => setActiveTab("projects")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "projects"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="w-4 h-4" />
                <span>Kelola Proyek</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-300 font-mono">
                {content.projects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("skills")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "skills"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Wrench className="w-4 h-4" />
                <span>Keahlian &amp; Stack</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-300 font-mono">
                {content.skills.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("timeline")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "timeline"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                <span>Pengalaman &amp; Karir</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-300 font-mono">
                {content.timeline.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("testimonials")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "testimonials"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Quote className="w-4 h-4" />
                <span>Rekomendasi Rekan</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-300 font-mono">
                {content.testimonials?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("inbox")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "inbox"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>Kotak Masuk Pesan</span>
              </div>
              {unreadMessagesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "settings"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan &amp; Backup</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-800/80 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
          >
            <span>Buka Web Public</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="h-16 border-b border-zinc-800/80 bg-[#111116]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-zinc-400">
              CMS Sinkronisasi Aktif (JSON Live Storage)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-medium text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Lihat Portofolio</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Tab Body */}
        <div className="p-6 sm:p-8 max-w-5xl w-full">
          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold text-white">Ringkasan Portofolio</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Pantau metrik konten, data proyek, dan pesan masuk dari calon klien atau perekrut.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-5 rounded-2xl bg-[#121217] border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Total Proyek</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">
                    {content.projects.length}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono mt-1 block">
                    Live di halaman portofolio
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Keahlian Terdaftar</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">
                    {content.skills.length}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                    Frontend, Backend &amp; Cloud
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Riwayat Pengalaman</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">
                    {content.timeline.length}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono mt-1 block">
                    Timeline karir &amp; edukasi
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Rekomendasi Rekan</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">
                    {content.testimonials?.length || 0}
                  </span>
                  <span className="text-[10px] text-yellow-400 font-mono mt-1 block">
                    Ulasan &amp; endorsement
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-zinc-800 col-span-2 sm:col-span-1">
                  <span className="text-xs text-zinc-400 block">Pesan Masuk</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">
                    {messages.length}
                  </span>
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    {unreadMessagesCount} belum dibaca
                  </span>
                </div>
              </div>

              {/* Profile Card Preview */}
              <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-18 rounded-xl overflow-hidden relative bg-zinc-800 border border-zinc-700 aspect-[3/4] shrink-0">
                    <Image
                      src={content.profile.avatar || "/assets/img/avatar.jpg"}
                      alt="Avatar"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {content.profile.name}
                    </h3>
                    <p className="text-xs text-indigo-400 font-mono">
                      {content.profile.title}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {content.profile.email} • {content.profile.location}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("profile")}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
                >
                  Edit Data Diri
                </button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setProjectModalOpen(true);
                  }}
                  className="p-4 rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500 bg-zinc-900/40 hover:bg-indigo-950/20 text-left transition-all group"
                >
                  <Plus className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm block text-white">
                    Tambah Proyek Baru
                  </span>
                  <span className="text-xs text-zinc-400">
                    Tambahkan studi kasus portofolio web baru
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("about")}
                  className="p-4 rounded-xl border border-dashed border-zinc-700 hover:border-purple-500 bg-zinc-900/40 hover:bg-purple-950/20 text-left transition-all group"
                >
                  <BookOpen className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm block text-white">
                    Latar Belakang &amp; Filosofi
                  </span>
                  <span className="text-xs text-zinc-400">
                    Ubah bio, heading, spesifikasi &amp; 4 pilar
                  </span>
                </button>

                <button
                  onClick={() => {
                    setEditingSkill(null);
                    setSkillModalOpen(true);
                  }}
                  className="p-4 rounded-xl border border-dashed border-zinc-700 hover:border-emerald-500 bg-zinc-900/40 hover:bg-emerald-950/20 text-left transition-all group"
                >
                  <Plus className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm block text-white">
                    Tambah Keahlian
                  </span>
                  <span className="text-xs text-zinc-400">
                    Perbarui tech stack dan kemahiran
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("inbox")}
                  className="p-4 rounded-xl border border-dashed border-zinc-700 hover:border-rose-500 bg-zinc-900/40 hover:bg-rose-950/20 text-left transition-all group"
                >
                  <Mail className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm block text-white">
                    Buka Kotak Pesan
                  </span>
                  <span className="text-xs text-zinc-400">
                    Lihat pesan yang dikirim dari kontak
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Profil &amp; Data Diri</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Ubah informasi dasar, headline, dan bio dwibahasa (ID &amp; EN).
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-4">
                  <h3 className="font-bold text-sm text-indigo-400 border-b border-zinc-800 pb-2">
                    Informasi Utama &amp; Foto Profil
                  </h3>

                  <div className="mb-4">
                    <ImageUpload
                      label="Foto Profil / Avatar"
                      aspect="portrait"
                      value={content.profile.avatar || "/assets/img/avatar.jpg"}
                      onChange={(url) =>
                        setContent({
                          ...content,
                          profile: { ...content.profile, avatar: url },
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={content.profile.name}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            profile: { ...content.profile, name: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Jabatan / Spesialisasi
                      </label>
                      <input
                        type="text"
                        value={content.profile.title}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            profile: { ...content.profile, title: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={content.profile.email}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            profile: { ...content.profile, email: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        WhatsApp / No. HP
                      </label>
                      <input
                        type="text"
                        value={content.profile.phone}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            profile: { ...content.profile, phone: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Lokasi &amp; Zona Waktu
                      </label>
                      <input
                        type="text"
                        value={content.profile.location}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            profile: { ...content.profile, location: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        URL Profil GitHub
                      </label>
                      <input
                        type="text"
                        value={content.profile.github}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            profile: { ...content.profile, github: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        URL Profil LinkedIn
                      </label>
                      <input
                        type="text"
                        value={content.profile.linkedin}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            profile: { ...content.profile, linkedin: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Headlines Dwibahasa */}
                <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-4">
                  <h3 className="font-bold text-sm text-indigo-400 border-b border-zinc-800 pb-2">
                    Headline Hero Banner (Dwibahasa)
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Headline Utama (Bahasa Indonesia)
                    </label>
                    <input
                      type="text"
                      value={content.profile.headline.id}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          profile: {
                            ...content.profile,
                            headline: {
                              ...content.profile.headline,
                              id: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Main Headline (English)
                    </label>
                    <input
                      type="text"
                      value={content.profile.headline.en}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          profile: {
                            ...content.profile,
                            headline: {
                              ...content.profile.headline,
                              en: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Sub-headline (Bahasa Indonesia)
                    </label>
                    <textarea
                      rows={2}
                      value={content.profile.subheadline.id}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          profile: {
                            ...content.profile,
                            subheadline: {
                              ...content.profile.subheadline,
                              id: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Sub-headline (English)
                    </label>
                    <textarea
                      rows={2}
                      value={content.profile.subheadline.en}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          profile: {
                            ...content.profile,
                            subheadline: {
                              ...content.profile.subheadline,
                              en: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? "Menyimpan..." : "Simpan Perubahan Profil"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: ABOUT / LATAR BELAKANG */}
          {activeTab === "about" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Latar Belakang &amp; Filosofi Rekayasa
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Kelola narasi profil, cerita perjalanan karir, spesifikasi teknis, 4 pilar rekayasa, dan metrik hero.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveAbout} className="space-y-6">
                {/* 1. Header & Judul Bagian */}
                <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-4">
                  <h3 className="font-bold text-sm text-indigo-400 border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Header &amp; Judul Bagian Latar Belakang</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Kicker / Badge Kategori (Bahasa Indonesia)
                      </label>
                      <input
                        type="text"
                        value={content.about?.kicker?.id || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              kicker: {
                                ...content.about?.kicker,
                                id: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="Profil & Pendekatan Teknis"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Kicker / Category Badge (English)
                      </label>
                      <input
                        type="text"
                        value={content.about?.kicker?.en || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              kicker: {
                                ...content.about?.kicker,
                                en: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="Profile & Philosophy"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Judul Utama Bagian (Bahasa Indonesia)
                      </label>
                      <input
                        type="text"
                        value={content.about?.title?.id || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              title: {
                                ...content.about?.title,
                                id: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Section Main Title (English)
                      </label>
                      <input
                        type="text"
                        value={content.about?.title?.en || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              title: {
                                ...content.about?.title,
                                en: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Subjudul Pengantar (Bahasa Indonesia)
                      </label>
                      <textarea
                        rows={2}
                        value={content.about?.subtitle?.id || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              subtitle: {
                                ...content.about?.subtitle,
                                id: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Section Subtitle (English)
                      </label>
                      <textarea
                        rows={2}
                        value={content.about?.subtitle?.en || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              subtitle: {
                                ...content.about?.subtitle,
                                en: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Cerita Pengembang & Narasi Bio */}
                <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-4">
                  <h3 className="font-bold text-sm text-indigo-400 border-b border-zinc-800 pb-2">
                    Kartu Narasi Bio &amp; Latar Belakang Perjalanan
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Judul Kartu Bio (Bahasa Indonesia)
                      </label>
                      <input
                        type="text"
                        value={content.about?.bioHeading?.id || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              bioHeading: {
                                ...content.about?.bioHeading,
                                id: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Bio Card Heading (English)
                      </label>
                      <input
                        type="text"
                        value={content.about?.bioHeading?.en || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              bioHeading: {
                                ...content.about?.bioHeading,
                                en: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Paragraf 1 – Perjalanan &amp; Keahlian Inti (Bahasa Indonesia)
                      </label>
                      <textarea
                        rows={3}
                        value={content.about?.bioP1?.id || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              bioP1: {
                                ...content.about?.bioP1,
                                id: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Paragraph 1 – Background &amp; Core Mastery (English)
                      </label>
                      <textarea
                        rows={3}
                        value={content.about?.bioP1?.en || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              bioP1: {
                                ...content.about?.bioP1,
                                en: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Paragraf 2 – Filosofi &amp; Komitmen Kualitas (Bahasa Indonesia)
                      </label>
                      <textarea
                        rows={3}
                        value={content.about?.bioP2?.id || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              bioP2: {
                                ...content.about?.bioP2,
                                id: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Paragraph 2 – Philosophy &amp; Quality Value (English)
                      </label>
                      <textarea
                        rows={3}
                        value={content.about?.bioP2?.en || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              bioP2: {
                                ...content.about?.bioP2,
                                en: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Spesifikasi Cepat (Quick Specs) */}
                <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-4">
                  <h3 className="font-bold text-sm text-indigo-400 border-b border-zinc-800 pb-2">
                    Tabel Spesifikasi Cepat (Quick Specs)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Spesifikasi: Lokasi (Bahasa Indonesia)
                      </label>
                      <input
                        type="text"
                        value={content.about?.specs?.location?.id || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              specs: {
                                ...content.about?.specs,
                                location: {
                                  ...content.about?.specs?.location,
                                  id: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        placeholder="Bali / Jakarta, Indonesia (WITA / WIB)"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Spec: Location (English)
                      </label>
                      <input
                        type="text"
                        value={content.about?.specs?.location?.en || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              specs: {
                                ...content.about?.specs,
                                location: {
                                  ...content.about?.specs?.location,
                                  en: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        placeholder="Bali / Jakarta, Indonesia (GMT+8 / GMT+7)"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Spesifikasi: Pendidikan (Bahasa Indonesia)
                      </label>
                      <input
                        type="text"
                        value={content.about?.specs?.education?.id || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              specs: {
                                ...content.about?.specs,
                                education: {
                                  ...content.about?.specs?.education,
                                  id: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Spec: Education (English)
                      </label>
                      <input
                        type="text"
                        value={content.about?.specs?.education?.en || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              specs: {
                                ...content.about?.specs,
                                education: {
                                  ...content.about?.specs?.education,
                                  en: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Spesifikasi: Fokus Utama (Bahasa Indonesia)
                      </label>
                      <input
                        type="text"
                        value={content.about?.specs?.focus?.id || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              specs: {
                                ...content.about?.specs,
                                focus: {
                                  ...content.about?.specs?.focus,
                                  id: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Spec: Primary Focus (English)
                      </label>
                      <input
                        type="text"
                        value={content.about?.specs?.focus?.en || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              specs: {
                                ...content.about?.specs,
                                focus: {
                                  ...content.about?.specs?.focus,
                                  en: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Spesifikasi: Status Ketersediaan (Bahasa Indonesia)
                      </label>
                      <input
                        type="text"
                        value={content.about?.specs?.availability?.id || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              specs: {
                                ...content.about?.specs,
                                availability: {
                                  ...content.about?.specs?.availability,
                                  id: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Spec: Availability Status (English)
                      </label>
                      <input
                        type="text"
                        value={content.about?.specs?.availability?.en || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              specs: {
                                ...content.about?.specs,
                                availability: {
                                  ...content.about?.specs?.availability,
                                  en: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. 4 Pilar Rekayasa Perangkat Lunak */}
                <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-6">
                  <h3 className="font-bold text-sm text-indigo-400 border-b border-zinc-800 pb-2">
                    4 Pilar Rekayasa Perangkat Lunak (Engineering Pillars)
                  </h3>

                  <div className="space-y-6">
                    {(content.about?.pillars || []).map((pillar, pIdx) => (
                      <div
                        key={pillar.id || pIdx}
                        className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-indigo-400">
                            Pilar #{pIdx + 1} ({pillar.id})
                          </span>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] text-zinc-400 font-medium">
                              Ikon:
                            </label>
                            <select
                              value={pillar.icon}
                              onChange={(e) => {
                                const newPillars = [...(content.about?.pillars || [])];
                                newPillars[pIdx] = {
                                  ...newPillars[pIdx],
                                  icon: e.target.value as any,
                                };
                                setContent({
                                  ...content,
                                  about: {
                                    ...content.about,
                                    pillars: newPillars,
                                  },
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white outline-none"
                            >
                              <option value="layout">Layout (Frontend)</option>
                              <option value="server">Server (Backend)</option>
                              <option value="cloud">Cloud (DevOps)</option>
                              <option value="cpu">CPU (Performance)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                              Judul Pilar (ID)
                            </label>
                            <input
                              type="text"
                              value={pillar.title.id}
                              onChange={(e) => {
                                const newPillars = [...(content.about?.pillars || [])];
                                newPillars[pIdx] = {
                                  ...newPillars[pIdx],
                                  title: {
                                    ...newPillars[pIdx].title,
                                    id: e.target.value,
                                  },
                                };
                                setContent({
                                  ...content,
                                  about: {
                                    ...content.about,
                                    pillars: newPillars,
                                  },
                                });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                              Pillar Title (EN)
                            </label>
                            <input
                              type="text"
                              value={pillar.title.en}
                              onChange={(e) => {
                                const newPillars = [...(content.about?.pillars || [])];
                                newPillars[pIdx] = {
                                  ...newPillars[pIdx],
                                  title: {
                                    ...newPillars[pIdx].title,
                                    en: e.target.value,
                                  },
                                };
                                setContent({
                                  ...content,
                                  about: {
                                    ...content.about,
                                    pillars: newPillars,
                                  },
                                });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                              Deskripsi Pilar (ID)
                            </label>
                            <textarea
                              rows={3}
                              value={pillar.desc.id}
                              onChange={(e) => {
                                const newPillars = [...(content.about?.pillars || [])];
                                newPillars[pIdx] = {
                                  ...newPillars[pIdx],
                                  desc: {
                                    ...newPillars[pIdx].desc,
                                    id: e.target.value,
                                  },
                                };
                                setContent({
                                  ...content,
                                  about: {
                                    ...content.about,
                                    pillars: newPillars,
                                  },
                                });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                              Pillar Description (EN)
                            </label>
                            <textarea
                              rows={3}
                              value={pillar.desc.en}
                              onChange={(e) => {
                                const newPillars = [...(content.about?.pillars || [])];
                                newPillars[pIdx] = {
                                  ...newPillars[pIdx],
                                  desc: {
                                    ...newPillars[pIdx].desc,
                                    en: e.target.value,
                                  },
                                };
                                setContent({
                                  ...content,
                                  about: {
                                    ...content.about,
                                    pillars: newPillars,
                                  },
                                });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Statistik Metrik Hero Ribbon */}
                <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-4">
                  <h3 className="font-bold text-sm text-indigo-400 border-b border-zinc-800 pb-2">
                    Statistik Metrik Hero Ribbon (3 Metrik di Kartu Avatar)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Stat 1 */}
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <label className="block text-[11px] font-bold text-zinc-300">
                        Metrik #1 (Pengalaman)
                      </label>
                      <input
                        type="text"
                        value={content.heroStats?.years?.val || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            heroStats: {
                              ...content.heroStats,
                              years: {
                                ...content.heroStats?.years,
                                val: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="4+"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-indigo-500 font-bold"
                      />
                      <input
                        type="text"
                        value={content.heroStats?.years?.lbl?.id || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            heroStats: {
                              ...content.heroStats,
                              years: {
                                ...content.heroStats?.years,
                                lbl: {
                                  ...content.heroStats?.years?.lbl,
                                  id: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        placeholder="Thn Pengalaman (ID)"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-300 outline-none"
                      />
                      <input
                        type="text"
                        value={content.heroStats?.years?.lbl?.en || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            heroStats: {
                              ...content.heroStats,
                              years: {
                                ...content.heroStats?.years,
                                lbl: {
                                  ...content.heroStats?.years?.lbl,
                                  en: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        placeholder="Years Exp (EN)"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-300 outline-none"
                      />
                    </div>

                    {/* Stat 2 */}
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <label className="block text-[11px] font-bold text-zinc-300">
                        Metrik #2 (Proyek Selesai)
                      </label>
                      <input
                        type="text"
                        value={content.heroStats?.projects?.val || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            heroStats: {
                              ...content.heroStats,
                              projects: {
                                ...content.heroStats?.projects,
                                val: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="28+"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-indigo-500 font-bold"
                      />
                      <input
                        type="text"
                        value={content.heroStats?.projects?.lbl?.id || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            heroStats: {
                              ...content.heroStats,
                              projects: {
                                ...content.heroStats?.projects,
                                lbl: {
                                  ...content.heroStats?.projects?.lbl,
                                  id: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        placeholder="Proyek Selesai (ID)"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-300 outline-none"
                      />
                      <input
                        type="text"
                        value={content.heroStats?.projects?.lbl?.en || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            heroStats: {
                              ...content.heroStats,
                              projects: {
                                ...content.heroStats?.projects,
                                lbl: {
                                  ...content.heroStats?.projects?.lbl,
                                  en: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        placeholder="Delivered (EN)"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-300 outline-none"
                      />
                    </div>

                    {/* Stat 3 */}
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <label className="block text-[11px] font-bold text-zinc-300">
                        Metrik #3 (Keandalan / Uptime)
                      </label>
                      <input
                        type="text"
                        value={content.heroStats?.uptime?.val || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            heroStats: {
                              ...content.heroStats,
                              uptime: {
                                ...content.heroStats?.uptime,
                                val: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="99.9%"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-emerald-400 outline-none focus:border-indigo-500 font-bold"
                      />
                      <input
                        type="text"
                        value={content.heroStats?.uptime?.lbl?.id || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            heroStats: {
                              ...content.heroStats,
                              uptime: {
                                ...content.heroStats?.uptime,
                                lbl: {
                                  ...content.heroStats?.uptime?.lbl,
                                  id: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        placeholder="Fokus Uptime (ID)"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-300 outline-none"
                      />
                      <input
                        type="text"
                        value={content.heroStats?.uptime?.lbl?.en || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            heroStats: {
                              ...content.heroStats,
                              uptime: {
                                ...content.heroStats?.uptime,
                                lbl: {
                                  ...content.heroStats?.uptime?.lbl,
                                  en: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        placeholder="Uptime SLA (EN)"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-300 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {saving ? "Menyimpan..." : "Simpan Perubahan Latar Belakang & Filosofi"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Kelola Proyek</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Tambah, edit, atau hapus proyek portofolio yang ditampilkan ke publik.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setProjectModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Proyek</span>
                </button>
              </div>

              {/* Projects List */}
              <div className="space-y-4">
                {content.projects.map((project: ProjectItem) => {
                  const isDeleting = deletingId === `proj-${project.id}`;
                  return (
                    <div
                      key={project.id}
                      className={`p-5 rounded-2xl bg-[#121217] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 ease-out transform ${
                        isDeleting
                          ? "opacity-0 scale-90 -translate-y-2 pointer-events-none bg-rose-500/10 border-rose-500/30"
                          : "opacity-100 scale-100 translate-y-0 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-xl overflow-hidden relative bg-zinc-800 shrink-0">
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-indigo-400 font-semibold">
                              {project.category}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {project.badge}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-white mt-1">
                            {project.title}
                          </h4>
                          <p className="text-xs text-zinc-400 line-clamp-1">
                            {project.summary.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => {
                            setEditingProject(project);
                            setProjectModalOpen(true);
                          }}
                          disabled={isDeleting}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors disabled:opacity-50"
                          title="Edit Proyek"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          disabled={isDeleting}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-50"
                          title="Hapus Proyek"
                        >
                          {isDeleting ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: SKILLS */}
          {activeTab === "skills" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Keahlian &amp; Tech Stack</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Kelola teknologi, level kemahiran, dan deskripsi kemampuan.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingSkill(null);
                    setSkillModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Keahlian</span>
                </button>
              </div>

              {/* Skills List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.skills.map((skill: SkillItem, idx: number) => {
                  const isDeleting = deletingId === `skill-${skill.name}`;
                  return (
                    <div
                      key={skill.name || idx}
                      className={`p-4 rounded-2xl bg-[#121217] border flex items-center justify-between gap-3 transition-all duration-300 ease-out transform ${
                        isDeleting
                          ? "opacity-0 scale-90 -translate-y-2 pointer-events-none bg-rose-500/10 border-rose-500/30"
                          : "opacity-100 scale-100 translate-y-0 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-indigo-400">
                          {skill.iconText}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{skill.name}</h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {skill.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {skill.level} • {skill.progress}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingSkill({
                              originalName: skill.name,
                              item: { ...skill },
                            });
                            setSkillModalOpen(true);
                          }}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50"
                          title="Edit Keahlian"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(skill.name)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 disabled:opacity-50"
                          title="Hapus Keahlian"
                        >
                          {isDeleting ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Pengalaman &amp; Karir</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Kelola riwayat pekerjaan, posisi jabatan, dan latar belakang pendidikan.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingTimeline(null);
                    setTimelineModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Riwayat</span>
                </button>
              </div>

              {/* Timeline List */}
              <div className="space-y-4">
                {content.timeline.map((item: TimelineItem) => {
                  const isDeleting = deletingId === `time-${item.id}`;
                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl bg-[#121217] border flex items-start justify-between gap-4 transition-all duration-300 ease-out transform ${
                        isDeleting
                          ? "opacity-0 scale-90 -translate-y-2 pointer-events-none bg-rose-500/10 border-rose-500/30"
                          : "opacity-100 scale-100 translate-y-0 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-indigo-400">
                            {item.period}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {item.badge.id}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white mt-1">
                          {item.role.id}
                        </h4>
                        <p className="text-xs font-medium text-zinc-400">
                          {item.company}
                        </p>
                        <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                          {item.description.id}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingTimeline(item);
                            setTimelineModalOpen(true);
                          }}
                          disabled={isDeleting}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTimeline(item.id)}
                          disabled={isDeleting}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: TESTIMONIALS */}
          {activeTab === "testimonials" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Rekomendasi Rekan (Endorsements)</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Kelola testimoni, ulasan rekan kerja, tech lead, atau klien yang ditampilkan di halaman depan portofolio.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingTestimonial(null);
                    setTestimonialModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Rekomendasi</span>
                </button>
              </div>

              {(!content.testimonials || content.testimonials.length === 0) ? (
                <div className="p-12 text-center rounded-2xl bg-[#121217] border border-zinc-800 text-zinc-500 text-xs font-mono">
                  Belum ada rekomendasi rekan yang ditambahkan.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.testimonials.map((item: TestimonialItem, idx: number) => {
                    const itemId = item.id || `testi-idx-${idx}`;
                    const isDeleting = deletingId === `testi-${item.id}`;
                    return (
                      <div
                        key={itemId}
                        className={`p-5 rounded-2xl bg-[#121217] border flex flex-col justify-between transition-all duration-300 ease-out transform group ${
                          isDeleting
                            ? "opacity-0 scale-90 -translate-y-2 pointer-events-none bg-rose-500/10 border-rose-500/30"
                            : "opacity-100 scale-100 translate-y-0 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div>
                          {/* Rating & Action buttons */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1 text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                              ))}
                            </div>
                            <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingTestimonial(item);
                                  setTestimonialModalOpen(true);
                                }}
                                disabled={isDeleting}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors disabled:opacity-50"
                                title="Edit Rekomendasi"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTestimonial(item.id)}
                                disabled={isDeleting}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-50"
                                title="Hapus Rekomendasi"
                              >
                                {isDeleting ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Quote Content */}
                          <div className="space-y-2 mb-4">
                            <div className="text-xs text-zinc-300 line-clamp-3 leading-relaxed italic border-l-2 border-indigo-500/40 pl-3">
                              &ldquo;{item.quote.id}&rdquo;
                            </div>
                            {item.quote.en && item.quote.en !== item.quote.id && (
                              <div className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed italic pl-3 border-l-2 border-zinc-800">
                                EN: &ldquo;{item.quote.en}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Author Info */}
                        <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {item.initials || (item.author ? item.author.slice(0, 2).toUpperCase() : "AP")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">
                              {item.author}
                            </h4>
                            <p className="text-[11px] text-zinc-400 truncate">
                              {item.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: INBOX */}
          {activeTab === "inbox" && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold text-white">Kotak Masuk Pesan</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Pesan yang dikirimkan oleh pengunjung melalui formulir kontak portofolio publik.
                </p>
              </div>

              {messages.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#121217] border border-zinc-800 text-zinc-500 text-xs font-mono">
                  Belum ada pesan yang masuk.
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg: ContactMessage) => {
                    const isDeleting = deletingId === `msg-${msg.id}`;
                    return (
                      <div
                        key={msg.id}
                        className={`p-5 rounded-2xl border transition-all duration-300 ease-out transform ${
                          isDeleting
                            ? "opacity-0 scale-90 -translate-y-2 pointer-events-none bg-rose-500/10 border-rose-500/30"
                            : msg.read
                            ? "opacity-100 scale-100 translate-y-0 bg-[#121217] border-zinc-800 text-zinc-400"
                            : "opacity-100 scale-100 translate-y-0 bg-[#151520] border-indigo-500/40 text-zinc-200 shadow-md"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                msg.read ? "bg-zinc-600" : "bg-emerald-400 animate-pulse"
                              }`}
                            />
                            <h4 className="font-bold text-sm text-white">{msg.name}</h4>
                            <span className="text-xs text-zinc-400">&lt;{msg.email}&gt;</span>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500">
                            {new Date(msg.createdAt).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="mb-3">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 text-indigo-400 font-mono">
                            {msg.subject}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 mb-4">
                          {msg.message}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleReadMessage(msg.id, msg.read)}
                              disabled={isDeleting}
                              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors disabled:opacity-50"
                            >
                              {msg.read ? "Tandai Belum Dibaca" : "Tandai Sudah Dibaca"}
                            </button>
                            <a
                              href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(
                                msg.subject
                              )}`}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                            >
                              Balas via Email
                            </a>
                          </div>

                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                            title="Hapus Pesan"
                          >
                            {isDeleting ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold text-white">Pengaturan CMS &amp; Backup</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Ubah kata sandi admin dan kelola cadangan data portofolio.
                </p>
              </div>

              {/* Password update card */}
              <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-4">
                <h3 className="font-bold text-sm text-white">Ubah Password Admin</h3>
                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Password Saat Ini
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md"
                  >
                    Simpan Password Baru
                  </button>
                </form>
              </div>

              {/* Backup & Restore */}
              <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-4">
                <h3 className="font-bold text-sm text-white">Cadangan &amp; Pemulihan Data</h3>
                <p className="text-xs text-zinc-400">
                  Unduh seluruh database portofolio ke file JSON cadangan atau kembalikan ke nilai awal benih (default seed).
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="data:text/json;charset=utf-8,"
                    onClick={(e) => {
                      e.preventDefault();
                      const blob = new Blob([JSON.stringify(content, null, 2)], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `portfolio-backup-${Date.now()}.json`;
                      a.click();
                      showToast("Backup JSON berhasil diunduh");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                  >
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span>Ekspor Data JSON</span>
                  </a>

                  <button
                    onClick={handleResetDefaults}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors border border-rose-500/20"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Konten ke Nilai Default</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* PROJECT MODAL (Add / Edit) */}
      {projectModalOpen && (
        <ProjectFormModal
          initialProject={editingProject}
          onClose={() => {
            setProjectModalOpen(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
        />
      )}

      {/* SKILL MODAL (Add / Edit) */}
      {skillModalOpen && (
        <SkillFormModal
          initialSkill={editingSkill?.item}
          originalName={editingSkill?.originalName}
          onClose={() => {
            setSkillModalOpen(false);
            setEditingSkill(null);
          }}
          onSave={handleSaveSkill}
        />
      )}

      {/* TIMELINE MODAL (Add / Edit) */}
      {timelineModalOpen && (
        <TimelineFormModal
          initialItem={editingTimeline}
          onClose={() => {
            setTimelineModalOpen(false);
            setEditingTimeline(null);
          }}
          onSave={handleSaveTimeline}
        />
      )}

      {/* TESTIMONIAL MODAL (Add / Edit) */}
      {testimonialModalOpen && (
        <TestimonialFormModal
          initialItem={editingTestimonial}
          onClose={() => {
            setTestimonialModalOpen(false);
            setEditingTestimonial(null);
          }}
          onSave={handleSaveTestimonial}
        />
      )}

      {/* CONFIRMATION MODAL (Replaces window.confirm) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#121218] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{confirmModal.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const run = confirmModal.onConfirm;
                  setConfirmModal(null);
                  run();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmModal.confirmLabel || "Ya, Hapus"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

// -------------------------------------------------------------
// SUB-COMPONENTS: MODAL FORMS
// -------------------------------------------------------------

function ProjectFormModal({
  initialProject,
  onClose,
  onSave,
}: {
  initialProject: ProjectItem | null;
  onClose: () => void;
  onSave: (p: ProjectItem) => void;
}) {
  const [formData, setFormData] = useState<ProjectItem>(
    initialProject || {
      id: "proj-" + Date.now(),
      title: "",
      category: "fullstack",
      badge: "Featured Full-Stack",
      image: "/assets/img/project-saas.jpg",
      tags: ["Next.js", "TypeScript", "Tailwind CSS"],
      summary: { id: "", en: "" },
      metrics: [
        { val: "< 100ms", lbl: { id: "Latensi", en: "Latency" } },
        { val: "99.9%", lbl: { id: "Uptime", en: "Uptime" } },
      ],
      githubUrl: "https://github.com",
      liveUrl: "https://demo.example.com",
      details: {
        overview: { id: "", en: "" },
        architecture: { id: "", en: "" },
        highlights: { id: ["Fitur A", "Fitur B"], en: ["Feature A", "Feature B"] },
        challengesSolved: { id: "", en: "" },
      },
    }
  );

  const [tagInput, setTagInput] = useState(formData.tags.join(", "));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({ ...formData, tags: tagsArray });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#121217] border border-zinc-800 p-6 sm:p-8 text-zinc-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-6">
          {initialProject ? "Edit Proyek Portofolio" : "Tambah Proyek Baru"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Judul Proyek *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="mis. Nexa SaaS"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as "fullstack" | "frontend" | "backend",
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
              >
                <option value="fullstack">Full-Stack</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend &amp; Systems</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Badge Tag
            </label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              placeholder="mis. Featured Full-Stack"
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <ImageUpload
              label="Gambar Mockup / Banner Proyek"
              aspect="landscape"
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Tech Tags (pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Next.js 14, TypeScript, PostgreSQL, Docker"
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Ringkasan Proyek (Bahasa Indonesia) *
            </label>
            <textarea
              rows={2}
              required
              value={formData.summary.id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  summary: { ...formData.summary, id: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Project Summary (English) *
            </label>
            <textarea
              rows={2}
              required
              value={formData.summary.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  summary: { ...formData.summary, en: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Tautan GitHub
              </label>
              <input
                type="text"
                value={formData.githubUrl}
                onChange={(e) =>
                  setFormData({ ...formData, githubUrl: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Tautan Live Demo (Opsional)
              </label>
              <input
                type="text"
                value={formData.liveUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, liveUrl: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              Simpan Proyek
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SkillFormModal({
  initialSkill,
  originalName,
  onClose,
  onSave,
}: {
  initialSkill?: SkillItem;
  originalName?: string;
  onClose: () => void;
  onSave: (skill: SkillItem, orig?: string) => void;
}) {
  const [formData, setFormData] = useState<SkillItem>(
    initialSkill || {
      name: "",
      category: "frontend",
      level: "Advanced",
      exp: { id: "3+ Tahun", en: "3+ Years" },
      desc: { id: "", en: "" },
      progress: 85,
      iconText: "JS",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, originalName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121217] border border-zinc-800 p-6 text-zinc-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-6">
          {originalName ? "Edit Keahlian" : "Tambah Keahlian Baru"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Nama Keahlian *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="mis. React.js"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Singkatan Ikon (1-4 huruf)
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={formData.iconText}
                onChange={(e) =>
                  setFormData({ ...formData, iconText: e.target.value })
                }
                placeholder="mis. TS"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-emerald-500"
              >
                <option value="frontend">Frontend</option>
                <option value="backend">Backend &amp; API</option>
                <option value="database">Database &amp; Cloud</option>
                <option value="tools">Tools &amp; Workflow</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    level: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-emerald-500"
              >
                <option value="Expert">Expert</option>
                <option value="Advanced">Advanced</option>
                <option value="Intermediate">Intermediate</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Kemahiran ({formData.progress}%)
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={formData.progress}
                onChange={(e) =>
                  setFormData({ ...formData, progress: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Deskripsi Singkat (Bahasa Indonesia)
            </label>
            <input
              type="text"
              value={formData.desc.id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  desc: { ...formData.desc, id: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Short Description (English)
            </label>
            <input
              type="text"
              value={formData.desc.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  desc: { ...formData.desc, en: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              Simpan Keahlian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TimelineFormModal({
  initialItem,
  onClose,
  onSave,
}: {
  initialItem: TimelineItem | null;
  onClose: () => void;
  onSave: (item: TimelineItem) => void;
}) {
  const [formData, setFormData] = useState<TimelineItem>(
    initialItem || {
      id: "time-" + Date.now(),
      period: "2024 — Sekarang",
      role: { id: "", en: "" },
      company: "",
      badge: { id: "Penuh Waktu", en: "Full-Time" },
      badgeType: "work",
      description: { id: "", en: "" },
      skills: ["React", "Node.js"],
    }
  );

  const [skillsInput, setSkillsInput] = useState(
    formData.skills?.join(", ") || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const arr = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({ ...formData, skills: arr });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121217] border border-zinc-800 p-6 text-zinc-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-6">
          {initialItem ? "Edit Riwayat Pengalaman" : "Tambah Riwayat Pengalaman"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Periode Waktu
              </label>
              <input
                type="text"
                required
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                placeholder="mis. 2023 — Sekarang"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Tipe Riwayat
              </label>
              <select
                value={formData.badgeType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    badgeType: e.target.value as "work" | "education",
                    badge:
                      e.target.value === "work"
                        ? { id: "Penuh Waktu", en: "Full-Time" }
                        : { id: "Pendidikan", en: "Education" },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
              >
                <option value="work">Pengalaman Kerja</option>
                <option value="education">Pendidikan / Akademik</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Perusahaan / Institusi *
            </label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="mis. TechScale Labs • Jakarta"
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Jabatan / Gelar (ID) *
              </label>
              <input
                type="text"
                required
                value={formData.role.id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: { ...formData.role, id: e.target.value },
                  })
                }
                placeholder="Senior Full-Stack Developer"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Role / Degree (EN) *
              </label>
              <input
                type="text"
                required
                value={formData.role.en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: { ...formData.role, en: e.target.value },
                  })
                }
                placeholder="Senior Full-Stack Developer"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Deskripsi Tanggung Jawab &amp; Dampak (ID)
            </label>
            <textarea
              rows={2}
              value={formData.description.id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: { ...formData.description, id: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Description &amp; Impact (EN)
            </label>
            <textarea
              rows={2}
              value={formData.description.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: { ...formData.description, en: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Keahlian Terkait (pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="Next.js, TypeScript, PostgreSQL, Docker"
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              Simpan Riwayat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TestimonialFormModal({
  initialItem,
  onClose,
  onSave,
}: {
  initialItem: TestimonialItem | null;
  onClose: () => void;
  onSave: (item: TestimonialItem) => void;
}) {
  const [formData, setFormData] = useState<TestimonialItem>(
    initialItem || {
      id: "testi-" + Date.now(),
      author: "",
      role: "",
      initials: "",
      quote: {
        id: "",
        en: "",
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let initials = formData.initials.trim();
    if (!initials && formData.author.trim()) {
      const parts = formData.author.trim().split(" ");
      initials =
        parts.length > 1
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : parts[0].slice(0, 2).toUpperCase();
    }
    onSave({
      ...formData,
      initials,
      quote: {
        id: formData.quote.id.trim(),
        en: formData.quote.en.trim() || formData.quote.id.trim(),
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#14141a] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">
              {initialItem ? "Edit Rekomendasi Rekan" : "Tambah Rekomendasi Rekan"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-300 mb-1">
                Nama Lengkap Rekan *
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="mis. Budi Hartono"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Inisial Avatar
              </label>
              <input
                type="text"
                maxLength={3}
                value={formData.initials}
                onChange={(e) =>
                  setFormData({ ...formData, initials: e.target.value.toUpperCase() })
                }
                placeholder="mis. BH"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500 font-mono text-center uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Jabatan &amp; Perusahaan / Relasi *
            </label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="mis. Lead Engineer @ ScaleUp ID / Mantan Rekan Kerja"
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Ulasan / Testimoni (Bahasa Indonesia) *
            </label>
            <textarea
              required
              rows={3}
              value={formData.quote.id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quote: { ...formData.quote, id: e.target.value },
                })
              }
              placeholder="Tuliskan ulasan atau rekomendasi rekan dalam Bahasa Indonesia..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Testimonial / Endorsement (English)
            </label>
            <textarea
              rows={3}
              value={formData.quote.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quote: { ...formData.quote, en: e.target.value },
                })
              }
              placeholder="Opsional (akan menggunakan versi ID jika dikosongkan)..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/20"
            >
              Simpan Rekomendasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

