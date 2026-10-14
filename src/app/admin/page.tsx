"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  X,
  RefreshCw,
  Save,
  Eye,
  Download,
  RotateCcw,
  BookOpen,
  Quote,
  Star,
  EyeOff,
  Link2,
  Cpu,
  Layers,
  AlertCircle,
  CheckCircle2,
  Activity,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  PortfolioContent,
  ContactMessage,
} from "@/lib/storage";
import { ProjectItem, SkillItem, TimelineItem, TestimonialItem } from "@/types/portfolio";
import { Toast } from "@/components/Toast";
import { ImageUpload } from "@/components/ImageUpload";
import { ProjectModal } from "@/components/ProjectModal";
import { translateIdToEn } from "@/lib/translate";

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

function TranslateButton({
  onClick,
  isTranslating,
  label = "Terjemahkan ke EN",
}: {
  onClick: () => void;
  isTranslating?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isTranslating}
      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1 transition-colors disabled:opacity-50"
      title="Terjemahkan otomatis dari teks Bahasa Indonesia ke Bahasa Inggris"
    >
      {isTranslating ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
          <span>Menerjemahkan...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

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
  const [previewProject, setPreviewProject] = useState<ProjectItem | null>(null);

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

  // Translation in-progress tracking
  const [translatingKey, setTranslatingKey] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTranslate = async (
    key: string,
    sourceText: string,
    onApply: (translated: string) => void
  ) => {
    if (!sourceText || !sourceText.trim()) {
      showToast("Teks Bahasa Indonesia masih kosong untuk diterjemahkan");
      return;
    }
    setTranslatingKey(key);
    try {
      const translated = await translateIdToEn(sourceText);
      if (translated) {
        onApply(translated);
        showToast("Berhasil diterjemahkan ke Bahasa Inggris ✨");
      } else {
        showToast("Gagal mendapatkan terjemahan dari server");
      }
    } catch {
      showToast("Terjadi kesalahan saat menerjemahkan");
    } finally {
      setTranslatingKey(null);
    }
  };

  const loadData = useCallback(async (showLoadingSpinner = false) => {
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
    } catch {
      showToast("Gagal memuat data dari server");
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  }, []);

  // Auth guard and initial data load
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    let isMounted = true;
    (async () => {
      try {
        const [resContent, resMessages] = await Promise.all([
          fetch(`/api/portfolio?_t=${Date.now()}`, { cache: "no-store" }),
          fetch(`/api/contact?_t=${Date.now()}`, { cache: "no-store" }),
        ]);

        const dataContent = await resContent.json();
        const dataMessages = await resMessages.json();

        if (isMounted) {
          if (dataContent.success) setContent(dataContent.data);
          if (dataMessages.success) setMessages(dataMessages.data);
        }
      } catch {
        if (isMounted) showToast("Gagal memuat data dari server");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [router]);

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

    // Optimistically update admin state so cards and thumbnails reflect changes instantly
    if (content) {
      setContent({
        ...content,
        projects: isEditing
          ? content.projects.map((p) => (p.id === project.id ? { ...p, ...project } : p))
          : [project, ...content.projects],
      });
    }

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
      loadData(false);
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

  // Toggle visibility handlers
  const handleToggleProjectVisibility = async (id: string, currentVisible: boolean) => {
    if (!content) return;
    const newVisible = !currentVisible;
    const project = content.projects.find((p) => p.id === id);
    if (!project) return;

    const updated = { ...project, visible: newVisible };
    setContent({
      ...content,
      projects: content.projects.map((p) => (p.id === id ? updated : p)),
    });

    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Proyek "${project.title}" ${newVisible ? "sekarang tampil di publik" : "disembunyikan dari publik"}`
        );
      } else {
        loadData(false);
        showToast(data.message || "Gagal mengubah visibilitas proyek");
      }
    } catch (err) {
      loadData(false);
      showToast("Gagal mengubah visibilitas proyek");
    }
  };

  const handleToggleSkillVisibility = async (name: string, currentVisible: boolean) => {
    if (!content) return;
    const newVisible = !currentVisible;
    const skill = content.skills.find((s) => s.name === name);
    if (!skill) return;

    const updated = { ...skill, visible: newVisible };
    setContent({
      ...content,
      skills: content.skills.map((s) => (s.name === name ? updated : s)),
    });

    try {
      const res = await fetch("/api/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updated, originalName: name }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Keahlian "${skill.name}" ${newVisible ? "sekarang tampil di publik" : "disembunyikan dari publik"}`
        );
      } else {
        loadData(false);
        showToast(data.message || "Gagal mengubah visibilitas keahlian");
      }
    } catch (err) {
      loadData(false);
      showToast("Gagal mengubah visibilitas keahlian");
    }
  };

  const handleToggleTimelineVisibility = async (id: string, currentVisible: boolean) => {
    if (!content) return;
    const newVisible = !currentVisible;
    const item = content.timeline.find((t) => t.id === id);
    if (!item) return;

    const updated = { ...item, visible: newVisible };
    setContent({
      ...content,
      timeline: content.timeline.map((t) => (t.id === id ? updated : t)),
    });

    try {
      const res = await fetch("/api/timeline", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Riwayat "${item.role.id}" ${newVisible ? "sekarang tampil di publik" : "disembunyikan dari publik"}`
        );
      } else {
        loadData(false);
        showToast(data.message || "Gagal mengubah visibilitas riwayat");
      }
    } catch (err) {
      loadData(false);
      showToast("Gagal mengubah visibilitas riwayat");
    }
  };

  const handleToggleTestimonialVisibility = async (id: string, currentVisible: boolean) => {
    if (!content) return;
    const newVisible = !currentVisible;
    const item = (content.testimonials || []).find((t) => t.id === id);
    if (!item) return;

    const updated = { ...item, visible: newVisible };
    setContent({
      ...content,
      testimonials: (content.testimonials || []).map((t) => (t.id === id ? updated : t)),
    });

    try {
      const res = await fetch("/api/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Rekomendasi dari "${item.author}" ${newVisible ? "sekarang tampil di publik" : "disembunyikan dari publik"}`
        );
      } else {
        loadData(false);
        showToast(data.message || "Gagal mengubah visibilitas rekomendasi");
      }
    } catch (err) {
      loadData(false);
      showToast("Gagal mengubah visibilitas rekomendasi");
    }
  };

  const handleTogglePillarVisibility = async (pIdx: number, currentVisible: boolean) => {
    if (!content) return;
    const newVisible = !currentVisible;
    const currentPillars = [...(content.about?.pillars || [])];
    if (!currentPillars[pIdx]) return;

    currentPillars[pIdx] = {
      ...currentPillars[pIdx],
      visible: newVisible,
    };

    const updatedAbout = {
      ...content.about,
      pillars: currentPillars,
    };

    setContent({
      ...content,
      about: updatedAbout,
    });

    try {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ about: updatedAbout }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Pilar "${currentPillars[pIdx].title.id}" ${newVisible ? "sekarang tampil di publik" : "disembunyikan dari publik"}`
        );
      }
    } catch (err) {
      loadData(false);
      showToast("Gagal memperbarui visibilitas pilar");
    }
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
                    {content.projects.filter((p) => p.visible !== false).length} publik • {content.projects.filter((p) => p.visible === false).length} draft
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Keahlian Terdaftar</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">
                    {content.skills.length}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                    {content.skills.filter((s) => s.visible !== false).length} publik • {content.skills.filter((s) => s.visible === false).length} draft
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Riwayat Pengalaman</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">
                    {content.timeline.length}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono mt-1 block">
                    {content.timeline.filter((t) => t.visible !== false).length} publik • {content.timeline.filter((t) => t.visible === false).length} draft
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Rekomendasi Rekan</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">
                    {content.testimonials?.length || 0}
                  </span>
                  <span className="text-[10px] text-yellow-400 font-mono mt-1 block">
                    {(content.testimonials || []).filter((t) => t.visible !== false).length} publik • {(content.testimonials || []).filter((t) => t.visible === false).length} draft
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
                      onChange={(e) => {
                        const val = e.target.value;
                        setContent({
                          ...content,
                          profile: {
                            ...content.profile,
                            headline: {
                              ...content.profile.headline,
                              id: val,
                            },
                          },
                        });
                      }}
                      onBlur={() => {
                        const idText = content.profile.headline.id?.trim();
                        if (idText && (!content.profile.headline.en || content.profile.headline.en === content.profile.headline.id)) {
                          handleTranslate("profile.headline", idText, (translated) => {
                            setContent((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    profile: {
                                      ...prev.profile,
                                      headline: { ...prev.profile.headline, en: translated },
                                    },
                                  }
                                : null
                            );
                          });
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Main Headline (English)
                      </label>
                      <TranslateButton
                        onClick={() =>
                          handleTranslate("profile.headline", content.profile.headline.id, (translated) => {
                            setContent((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    profile: {
                                      ...prev.profile,
                                      headline: { ...prev.profile.headline, en: translated },
                                    },
                                  }
                                : null
                            );
                          })
                        }
                        isTranslating={translatingKey === "profile.headline"}
                      />
                    </div>
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
                      onChange={(e) => {
                        const val = e.target.value;
                        setContent({
                          ...content,
                          profile: {
                            ...content.profile,
                            subheadline: {
                              ...content.profile.subheadline,
                              id: val,
                            },
                          },
                        });
                      }}
                      onBlur={() => {
                        const idText = content.profile.subheadline.id?.trim();
                        if (idText && (!content.profile.subheadline.en || content.profile.subheadline.en === content.profile.subheadline.id)) {
                          handleTranslate("profile.subheadline", idText, (translated) => {
                            setContent((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    profile: {
                                      ...prev.profile,
                                      subheadline: { ...prev.profile.subheadline, en: translated },
                                    },
                                  }
                                : null
                            );
                          });
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Sub-headline (English)
                      </label>
                      <TranslateButton
                        onClick={() =>
                          handleTranslate("profile.subheadline", content.profile.subheadline.id, (translated) => {
                            setContent((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    profile: {
                                      ...prev.profile,
                                      subheadline: { ...prev.profile.subheadline, en: translated },
                                    },
                                  }
                                : null
                            );
                          })
                        }
                        isTranslating={translatingKey === "profile.subheadline"}
                      />
                    </div>
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
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              kicker: {
                                ...content.about?.kicker,
                                id: val,
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          const idText = content.about?.kicker?.id?.trim();
                          if (idText && (!content.about?.kicker?.en || content.about?.kicker?.en === content.about?.kicker?.id)) {
                            handleTranslate("about.kicker", idText, (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        kicker: { ...prev.about.kicker, en: translated },
                                      },
                                    }
                                  : null
                              );
                            });
                          }
                        }}
                        placeholder="Profil & Pendekatan Teknis"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-zinc-300">
                          Kicker / Category Badge (English)
                        </label>
                        <TranslateButton
                          onClick={() =>
                            handleTranslate("about.kicker", content.about?.kicker?.id || "", (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        kicker: { ...prev.about.kicker, en: translated },
                                      },
                                    }
                                  : null
                              );
                            })
                          }
                          isTranslating={translatingKey === "about.kicker"}
                        />
                      </div>
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
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              title: {
                                ...content.about?.title,
                                id: val,
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          const idText = content.about?.title?.id?.trim();
                          if (idText && (!content.about?.title?.en || content.about?.title?.en === content.about?.title?.id)) {
                            handleTranslate("about.title", idText, (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        title: { ...prev.about.title, en: translated },
                                      },
                                    }
                                  : null
                              );
                            });
                          }
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-zinc-300">
                          Section Main Title (English)
                        </label>
                        <TranslateButton
                          onClick={() =>
                            handleTranslate("about.title", content.about?.title?.id || "", (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        title: { ...prev.about.title, en: translated },
                                      },
                                    }
                                  : null
                              );
                            })
                          }
                          isTranslating={translatingKey === "about.title"}
                        />
                      </div>
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
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              subtitle: {
                                ...content.about?.subtitle,
                                id: val,
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          const idText = content.about?.subtitle?.id?.trim();
                          if (idText && (!content.about?.subtitle?.en || content.about?.subtitle?.en === content.about?.subtitle?.id)) {
                            handleTranslate("about.subtitle", idText, (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        subtitle: { ...prev.about.subtitle, en: translated },
                                      },
                                    }
                                  : null
                              );
                            });
                          }
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-zinc-300">
                          Section Subtitle (English)
                        </label>
                        <TranslateButton
                          onClick={() =>
                            handleTranslate("about.subtitle", content.about?.subtitle?.id || "", (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        subtitle: { ...prev.about.subtitle, en: translated },
                                      },
                                    }
                                  : null
                              );
                            })
                          }
                          isTranslating={translatingKey === "about.subtitle"}
                        />
                      </div>
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
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              bioHeading: {
                                ...content.about?.bioHeading,
                                id: val,
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          const idText = content.about?.bioHeading?.id?.trim();
                          if (idText && (!content.about?.bioHeading?.en || content.about?.bioHeading?.en === content.about?.bioHeading?.id)) {
                            handleTranslate("about.bioHeading", idText, (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        bioHeading: { ...prev.about.bioHeading, en: translated },
                                      },
                                    }
                                  : null
                              );
                            });
                          }
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-zinc-300">
                          Bio Card Heading (English)
                        </label>
                        <TranslateButton
                          onClick={() =>
                            handleTranslate("about.bioHeading", content.about?.bioHeading?.id || "", (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        bioHeading: { ...prev.about.bioHeading, en: translated },
                                      },
                                    }
                                  : null
                              );
                            })
                          }
                          isTranslating={translatingKey === "about.bioHeading"}
                        />
                      </div>
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
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              bioP1: {
                                ...content.about?.bioP1,
                                id: val,
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          const idText = content.about?.bioP1?.id?.trim();
                          if (idText && (!content.about?.bioP1?.en || content.about?.bioP1?.en === content.about?.bioP1?.id)) {
                            handleTranslate("about.bioP1", idText, (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        bioP1: { ...prev.about.bioP1, en: translated },
                                      },
                                    }
                                  : null
                              );
                            });
                          }
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-zinc-300">
                          Paragraph 1 – Background &amp; Core Mastery (English)
                        </label>
                        <TranslateButton
                          onClick={() =>
                            handleTranslate("about.bioP1", content.about?.bioP1?.id || "", (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        bioP1: { ...prev.about.bioP1, en: translated },
                                      },
                                    }
                                  : null
                              );
                            })
                          }
                          isTranslating={translatingKey === "about.bioP1"}
                        />
                      </div>
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
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              bioP2: {
                                ...content.about?.bioP2,
                                id: val,
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          const idText = content.about?.bioP2?.id?.trim();
                          if (idText && (!content.about?.bioP2?.en || content.about?.bioP2?.en === content.about?.bioP2?.id)) {
                            handleTranslate("about.bioP2", idText, (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        bioP2: { ...prev.about.bioP2, en: translated },
                                      },
                                    }
                                  : null
                              );
                            });
                          }
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-zinc-300">
                          Paragraph 2 – Philosophy &amp; Quality Value (English)
                        </label>
                        <TranslateButton
                          onClick={() =>
                            handleTranslate("about.bioP2", content.about?.bioP2?.id || "", (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        bioP2: { ...prev.about.bioP2, en: translated },
                                      },
                                    }
                                  : null
                              );
                            })
                          }
                          isTranslating={translatingKey === "about.bioP2"}
                        />
                      </div>
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
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              specs: {
                                ...content.about?.specs,
                                location: {
                                  ...content.about?.specs?.location,
                                  id: val,
                                },
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          const idText = content.about?.specs?.location?.id?.trim();
                          if (idText && (!content.about?.specs?.location?.en || content.about?.specs?.location?.en === content.about?.specs?.location?.id)) {
                            handleTranslate("specs.location", idText, (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        specs: {
                                          ...prev.about.specs,
                                          location: { ...prev.about.specs.location, en: translated },
                                        },
                                      },
                                    }
                                  : null
                              );
                            });
                          }
                        }}
                        placeholder="Bali / Jakarta, Indonesia (WITA / WIB)"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-zinc-300">
                          Spec: Location (English)
                        </label>
                        <TranslateButton
                          onClick={() =>
                            handleTranslate("specs.location", content.about?.specs?.location?.id || "", (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        specs: {
                                          ...prev.about.specs,
                                          location: { ...prev.about.specs.location, en: translated },
                                        },
                                      },
                                    }
                                  : null
                              );
                            })
                          }
                          isTranslating={translatingKey === "specs.location"}
                        />
                      </div>
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
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              specs: {
                                ...content.about?.specs,
                                education: {
                                  ...content.about?.specs?.education,
                                  id: val,
                                },
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          const idText = content.about?.specs?.education?.id?.trim();
                          if (idText && (!content.about?.specs?.education?.en || content.about?.specs?.education?.en === content.about?.specs?.education?.id)) {
                            handleTranslate("specs.education", idText, (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        specs: {
                                          ...prev.about.specs,
                                          education: { ...prev.about.specs.education, en: translated },
                                        },
                                      },
                                    }
                                  : null
                              );
                            });
                          }
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-zinc-300">
                          Spec: Education (English)
                        </label>
                        <TranslateButton
                          onClick={() =>
                            handleTranslate("specs.education", content.about?.specs?.education?.id || "", (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        specs: {
                                          ...prev.about.specs,
                                          education: { ...prev.about.specs.education, en: translated },
                                        },
                                      },
                                    }
                                  : null
                              );
                            })
                          }
                          isTranslating={translatingKey === "specs.education"}
                        />
                      </div>
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
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              specs: {
                                ...content.about?.specs,
                                focus: {
                                  ...content.about?.specs?.focus,
                                  id: val,
                                },
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          const idText = content.about?.specs?.focus?.id?.trim();
                          if (idText && (!content.about?.specs?.focus?.en || content.about?.specs?.focus?.en === content.about?.specs?.focus?.id)) {
                            handleTranslate("specs.focus", idText, (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        specs: {
                                          ...prev.about.specs,
                                          focus: { ...prev.about.specs.focus, en: translated },
                                        },
                                      },
                                    }
                                  : null
                              );
                            });
                          }
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-zinc-300">
                          Spec: Primary Focus (English)
                        </label>
                        <TranslateButton
                          onClick={() =>
                            handleTranslate("specs.focus", content.about?.specs?.focus?.id || "", (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        specs: {
                                          ...prev.about.specs,
                                          focus: { ...prev.about.specs.focus, en: translated },
                                        },
                                      },
                                    }
                                  : null
                              );
                            })
                          }
                          isTranslating={translatingKey === "specs.focus"}
                        />
                      </div>
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
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              specs: {
                                ...content.about?.specs,
                                availability: {
                                  ...content.about?.specs?.availability,
                                  id: val,
                                },
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          const idText = content.about?.specs?.availability?.id?.trim();
                          if (idText && (!content.about?.specs?.availability?.en || content.about?.specs?.availability?.en === content.about?.specs?.availability?.id)) {
                            handleTranslate("specs.availability", idText, (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        specs: {
                                          ...prev.about.specs,
                                          availability: { ...prev.about.specs.availability, en: translated },
                                        },
                                      },
                                    }
                                  : null
                              );
                            });
                          }
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-zinc-300">
                          Spec: Availability Status (English)
                        </label>
                        <TranslateButton
                          onClick={() =>
                            handleTranslate("specs.availability", content.about?.specs?.availability?.id || "", (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        specs: {
                                          ...prev.about.specs,
                                          availability: { ...prev.about.specs.availability, en: translated },
                                        },
                                      },
                                    }
                                  : null
                              );
                            })
                          }
                          isTranslating={translatingKey === "specs.availability"}
                        />
                      </div>
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
                        className={`p-5 rounded-xl border space-y-4 transition-all ${
                          pillar.visible !== false
                            ? "bg-zinc-900/60 border-zinc-800"
                            : "bg-zinc-950/70 border-dashed border-zinc-800/80 opacity-80"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-indigo-400">
                              Pilar #{pIdx + 1} ({pillar.id})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleTogglePillarVisibility(pIdx, pillar.visible !== false)}
                              disabled={saving}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                                pillar.visible !== false
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200"
                              }`}
                              title={
                                pillar.visible !== false
                                  ? "Pilar ini tampil di publik. Klik untuk sembunyikan."
                                  : "Pilar ini disembunyikan. Klik untuk tampilkan di publik."
                              }
                            >
                              {pillar.visible !== false ? (
                                <>
                                  <Eye className="w-3 h-3 text-emerald-400" />
                                  <span>Publik</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 text-zinc-400" />
                                  <span>Draft</span>
                                </>
                              )}
                            </button>
                          </div>
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
                                  icon: e.target.value as "layout" | "server" | "cloud" | "cpu",
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
                                const val = e.target.value;
                                const newPillars = [...(content.about?.pillars || [])];
                                newPillars[pIdx] = {
                                  ...newPillars[pIdx],
                                  title: {
                                    ...newPillars[pIdx].title,
                                    id: val,
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
                              onBlur={() => {
                                const idText = pillar.title?.id?.trim();
                                if (idText && (!pillar.title?.en || pillar.title?.en === pillar.title?.id)) {
                                  handleTranslate(`pillar.${pIdx}.title`, idText, (translated) => {
                                    setContent((prev) => {
                                      if (!prev) return null;
                                      const pList = [...(prev.about?.pillars || [])];
                                      if (pList[pIdx]) {
                                        pList[pIdx] = {
                                          ...pList[pIdx],
                                          title: { ...pList[pIdx].title, en: translated },
                                        };
                                      }
                                      return { ...prev, about: { ...prev.about, pillars: pList } };
                                    });
                                  });
                                }
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-semibold text-zinc-300">
                                Pillar Title (EN)
                              </label>
                              <TranslateButton
                                onClick={() =>
                                  handleTranslate(`pillar.${pIdx}.title`, pillar.title?.id || "", (translated) => {
                                    setContent((prev) => {
                                      if (!prev) return null;
                                      const pList = [...(prev.about?.pillars || [])];
                                      if (pList[pIdx]) {
                                        pList[pIdx] = {
                                          ...pList[pIdx],
                                          title: { ...pList[pIdx].title, en: translated },
                                        };
                                      }
                                      return { ...prev, about: { ...prev.about, pillars: pList } };
                                    });
                                  })
                                }
                                isTranslating={translatingKey === `pillar.${pIdx}.title`}
                              />
                            </div>
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
                                const val = e.target.value;
                                const newPillars = [...(content.about?.pillars || [])];
                                newPillars[pIdx] = {
                                  ...newPillars[pIdx],
                                  desc: {
                                    ...newPillars[pIdx].desc,
                                    id: val,
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
                              onBlur={() => {
                                const idText = pillar.desc?.id?.trim();
                                if (idText && (!pillar.desc?.en || pillar.desc?.en === pillar.desc?.id)) {
                                  handleTranslate(`pillar.${pIdx}.desc`, idText, (translated) => {
                                    setContent((prev) => {
                                      if (!prev) return null;
                                      const pList = [...(prev.about?.pillars || [])];
                                      if (pList[pIdx]) {
                                        pList[pIdx] = {
                                          ...pList[pIdx],
                                          desc: { ...pList[pIdx].desc, en: translated },
                                        };
                                      }
                                      return { ...prev, about: { ...prev.about, pillars: pList } };
                                    });
                                  });
                                }
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-semibold text-zinc-300">
                                Pillar Description (EN)
                              </label>
                              <TranslateButton
                                onClick={() =>
                                  handleTranslate(`pillar.${pIdx}.desc`, pillar.desc?.id || "", (translated) => {
                                    setContent((prev) => {
                                      if (!prev) return null;
                                      const pList = [...(prev.about?.pillars || [])];
                                      if (pList[pIdx]) {
                                        pList[pIdx] = {
                                          ...pList[pIdx],
                                          desc: { ...pList[pIdx].desc, en: translated },
                                        };
                                      }
                                      return { ...prev, about: { ...prev.about, pillars: pList } };
                                    });
                                  })
                                }
                                isTranslating={translatingKey === `pillar.${pIdx}.desc`}
                              />
                            </div>
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
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent({
                            ...content,
                            heroStats: {
                              ...content.heroStats,
                              years: {
                                ...content.heroStats?.years,
                                lbl: {
                                  ...content.heroStats?.years?.lbl,
                                  id: val,
                                },
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          const idText = content.heroStats?.years?.lbl?.id?.trim();
                          if (idText && (!content.heroStats?.years?.lbl?.en || content.heroStats?.years?.lbl?.en === content.heroStats?.years?.lbl?.id)) {
                            handleTranslate("heroStats.years", idText, (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      heroStats: {
                                        ...prev.heroStats,
                                        years: {
                                          ...prev.heroStats?.years,
                                          lbl: { ...prev.heroStats?.years?.lbl, en: translated },
                                        },
                                      },
                                    }
                                  : null
                              );
                            });
                          }
                        }}
                        placeholder="Thn Pengalaman (ID)"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-300 outline-none"
                      />
                      <div className="flex items-center gap-1.5">
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
                        <TranslateButton
                          onClick={() =>
                            handleTranslate("heroStats.years", content.heroStats?.years?.lbl?.id || "", (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      heroStats: {
                                        ...prev.heroStats,
                                        years: {
                                          ...prev.heroStats?.years,
                                          lbl: { ...prev.heroStats?.years?.lbl, en: translated },
                                        },
                                      },
                                    }
                                  : null
                              );
                            })
                          }
                          isTranslating={translatingKey === "heroStats.years"}
                          label="EN"
                        />
                      </div>
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
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent({
                            ...content,
                            heroStats: {
                              ...content.heroStats,
                              projects: {
                                ...content.heroStats?.projects,
                                lbl: {
                                  ...content.heroStats?.projects?.lbl,
                                  id: val,
                                },
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          const idText = content.heroStats?.projects?.lbl?.id?.trim();
                          if (idText && (!content.heroStats?.projects?.lbl?.en || content.heroStats?.projects?.lbl?.en === content.heroStats?.projects?.lbl?.id)) {
                            handleTranslate("heroStats.projects", idText, (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      heroStats: {
                                        ...prev.heroStats,
                                        projects: {
                                          ...prev.heroStats?.projects,
                                          lbl: { ...prev.heroStats?.projects?.lbl, en: translated },
                                        },
                                      },
                                    }
                                  : null
                              );
                            });
                          }
                        }}
                        placeholder="Proyek Selesai (ID)"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-300 outline-none"
                      />
                      <div className="flex items-center gap-1.5">
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
                        <TranslateButton
                          onClick={() =>
                            handleTranslate("heroStats.projects", content.heroStats?.projects?.lbl?.id || "", (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      heroStats: {
                                        ...prev.heroStats,
                                        projects: {
                                          ...prev.heroStats?.projects,
                                          lbl: { ...prev.heroStats?.projects?.lbl, en: translated },
                                        },
                                      },
                                    }
                                  : null
                              );
                            })
                          }
                          isTranslating={translatingKey === "heroStats.projects"}
                          label="EN"
                        />
                      </div>
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
                        onChange={(e) => {
                          const val = e.target.value;
                          setContent({
                            ...content,
                            heroStats: {
                              ...content.heroStats,
                              uptime: {
                                ...content.heroStats?.uptime,
                                lbl: {
                                  ...content.heroStats?.uptime?.lbl,
                                  id: val,
                                },
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          const idText = content.heroStats?.uptime?.lbl?.id?.trim();
                          if (idText && (!content.heroStats?.uptime?.lbl?.en || content.heroStats?.uptime?.lbl?.en === content.heroStats?.uptime?.lbl?.id)) {
                            handleTranslate("heroStats.uptime", idText, (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      heroStats: {
                                        ...prev.heroStats,
                                        uptime: {
                                          ...prev.heroStats?.uptime,
                                          lbl: { ...prev.heroStats?.uptime?.lbl, en: translated },
                                        },
                                      },
                                    }
                                  : null
                              );
                            });
                          }
                        }}
                        placeholder="Fokus Uptime (ID)"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-300 outline-none"
                      />
                      <div className="flex items-center gap-1.5">
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
                        <TranslateButton
                          onClick={() =>
                            handleTranslate("heroStats.uptime", content.heroStats?.uptime?.lbl?.id || "", (translated) => {
                              setContent((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      heroStats: {
                                        ...prev.heroStats,
                                        uptime: {
                                          ...prev.heroStats?.uptime,
                                          lbl: { ...prev.heroStats?.uptime?.lbl, en: translated },
                                        },
                                      },
                                    }
                                  : null
                              );
                            })
                          }
                          isTranslating={translatingKey === "heroStats.uptime"}
                          label="EN"
                        />
                      </div>
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
                    Kelola portofolio, visibilitas publik, dan studi kasus arsitektur teknis sistem.
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

              {/* Architecture Stats Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-zinc-900 to-indigo-500/5 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-zinc-300">
                    Studi Kasus Arsitektur:{" "}
                    <strong className="text-white">
                      {content.projects.filter((p) => Boolean(p.details?.architecture?.id)).length} dari {content.projects.length}
                    </strong>{" "}
                    proyek telah dilengkapi arsitektur sistem.
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                  Klik ikon <Layers className="w-3.5 h-3.5 inline text-emerald-400" /> untuk pratinjau langsung modal arsitektur
                </span>
              </div>

              {/* Projects List */}
              <div className="space-y-4">
                {content.projects.map((project: ProjectItem) => {
                  const isDeleting = deletingId === `proj-${project.id}`;
                  const hasArchitecture = Boolean(project.details?.architecture?.id);
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-indigo-400 font-semibold">
                              {project.category}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {project.badge}
                            </span>
                            {hasArchitecture ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                                <Cpu className="w-3 h-3" />
                                <span>Arsitektur Siap</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Arsitektur Kosong</span>
                              </span>
                            )}
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
                          type="button"
                          onClick={() => setPreviewProject(project)}
                          disabled={isDeleting}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-300 transition-colors disabled:opacity-50"
                          title="Pratinjau Studi Kasus & Arsitektur Sistem"
                        >
                          <Layers className="w-4 h-4 text-emerald-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleProjectVisibility(project.id, project.visible !== false)}
                          disabled={isDeleting}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            project.visible !== false
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200"
                          }`}
                          title={
                            project.visible !== false
                              ? "Card ini aktif di publik. Klik untuk sembunyikan."
                              : "Card ini disembunyikan. Klik untuk tampilkan di publik."
                          }
                        >
                          {project.visible !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Publik</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
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
                          onClick={() => handleDeleteProject(project.id, project.title)}
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
                          type="button"
                          onClick={() => handleToggleSkillVisibility(skill.name, skill.visible !== false)}
                          disabled={isDeleting}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                            skill.visible !== false
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200"
                          }`}
                          title={
                            skill.visible !== false
                              ? "Tampil di publik. Klik untuk sembunyikan."
                              : "Disembunyikan. Klik untuk tampilkan."
                          }
                        >
                          {skill.visible !== false ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-400" />
                              <span>Publik</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-zinc-400" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
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
                          type="button"
                          onClick={() => handleToggleTimelineVisibility(item.id, item.visible !== false)}
                          disabled={isDeleting}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            item.visible !== false
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200"
                          }`}
                          title={
                            item.visible !== false
                              ? "Tampil di publik. Klik untuk sembunyikan."
                              : "Disembunyikan. Klik untuk tampilkan."
                          }
                        >
                          {item.visible !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Publik</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
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
                                type="button"
                                onClick={() => handleToggleTestimonialVisibility(item.id || itemId, item.visible !== false)}
                                disabled={isDeleting}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                                  item.visible !== false
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                    : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200"
                                }`}
                                title={
                                  item.visible !== false
                                    ? "Tampil di publik. Klik untuk sembunyikan."
                                    : "Disembunyikan. Klik untuk tampilkan."
                                }
                              >
                                {item.visible !== false ? (
                                  <>
                                    <Eye className="w-3 h-3 text-emerald-400" />
                                    <span>Publik</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3 text-zinc-400" />
                                    <span>Draft</span>
                                  </>
                                )}
                              </button>
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

      {/* PREVIEW ARSITEKTUR & STUDI KASUS MODAL */}
      {previewProject && (
        <ProjectModal
          project={previewProject}
          onClose={() => setPreviewProject(null)}
          lang="id"
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
  const [formData, setFormData] = useState<ProjectItem>(() =>
    initialProject
      ? {
          ...initialProject,
          visible: initialProject.visible !== false,
          details: {
            overview: initialProject.details?.overview || { id: "", en: "" },
            architecture: initialProject.details?.architecture || { id: "", en: "" },
            highlights: initialProject.details?.highlights || { id: [], en: [] },
            challengesSolved: initialProject.details?.challengesSolved || { id: "", en: "" },
          },
          metrics: initialProject.metrics || [
            { val: "< 85ms", lbl: { id: "Latensi API", en: "API Latency" } },
            { val: "99.98%", lbl: { id: "Keandalan Uptime", en: "Uptime SLA" } },
          ],
        }
      : {
          id: "proj-" + Date.now(),
          title: "",
          category: "fullstack",
          badge: "Featured Full-Stack",
          image: "/assets/img/project-saas.jpg",
          tags: ["Next.js 14", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL"],
          summary: { id: "", en: "" },
          visible: true,
          metrics: [
            { val: "< 85ms", lbl: { id: "Latensi API", en: "API Latency" } },
            { val: "99.98%", lbl: { id: "Keandalan Uptime", en: "Uptime SLA" } },
            { val: "99/100", lbl: { id: "Skor Lighthouse", en: "Lighthouse" } },
          ],
          githubUrl: "https://github.com",
          liveUrl: "https://demo.example.com",
          details: {
            overview: { id: "", en: "" },
            architecture: { id: "", en: "" },
            highlights: { id: [], en: [] },
            challengesSolved: { id: "", en: "" },
          },
        }
  );

  const [tagInput, setTagInput] = useState(() => formData.tags?.join(", ") || "");
  const [highlightsInputId, setHighlightsInputId] = useState(
    () => formData.details?.highlights?.id?.join("\n") || ""
  );
  const [highlightsInputEn, setHighlightsInputEn] = useState(
    () => formData.details?.highlights?.en?.join("\n") || ""
  );
  const [autoTranslateEn, setAutoTranslateEn] = useState(true);
  const [translatingField, setTranslatingField] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<"general" | "architecture">("general");
  const [showInnerPreview, setShowInnerPreview] = useState(false);

  const handleFieldTranslate = async (
    fieldKey: string,
    text: string,
    setter: (translated: string) => void
  ) => {
    if (!text.trim() || translatingField) return;
    setTranslatingField(fieldKey);
    try {
      const res = await translateIdToEn(text);
      if (res) setter(res);
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslatingField(null);
    }
  };

  const updateMetricVal = (index: number, val: string) => {
    const updated = [...(formData.metrics || [])];
    if (updated[index]) {
      updated[index] = { ...updated[index], val };
      setFormData({ ...formData, metrics: updated });
    }
  };

  const updateMetricLbl = (index: number, lang: "id" | "en", text: string) => {
    const updated = [...(formData.metrics || [])];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        lbl: {
          id: lang === "id" ? text : updated[index].lbl.id,
          en: lang === "en" ? text : updated[index].lbl.en,
        },
      };
      setFormData({ ...formData, metrics: updated });
    }
  };

  const addMetric = () => {
    const updated = [...(formData.metrics || [])];
    if (updated.length < 4) {
      updated.push({ val: "100%", lbl: { id: "Metrik Baru", en: "New Metric" } });
      setFormData({ ...formData, metrics: updated });
    }
  };

  const removeMetric = (index: number) => {
    const updated = (formData.metrics || []).filter((_, i) => i !== index);
    setFormData({ ...formData, metrics: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const highlightsId = highlightsInputId
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const highlightsEn = highlightsInputEn
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      ...formData,
      tags: tagsArray,
      details: {
        ...formData.details,
        highlights: {
          id: highlightsId,
          en: highlightsEn.length ? highlightsEn : highlightsId,
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#121217] border border-zinc-800 p-5 sm:p-8 text-zinc-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-white">
            {initialProject ? "Edit Proyek Portofolio" : "Tambah Proyek Baru"}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Lengkapi data proyek publik beserta studi kasus arsitektur teknis sistem.
          </p>
        </div>

        {/* Modal Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalTab("general")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                modalTab === "general"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-800"
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Informasi Umum</span>
            </button>
            <button
              type="button"
              onClick={() => setModalTab("architecture")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                modalTab === "architecture"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-800"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Detail Arsitektur &amp; Studi Kasus</span>
              {formData.details?.architecture?.id && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAutoTranslateEn(!autoTranslateEn)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              autoTranslateEn
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
            }`}
            title="Bila aktif, mengisi Bahasa Indonesia akan otomatis menerjemahkan ke Bahasa Inggris"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{autoTranslateEn ? "Auto-Translate EN Aktif" : "Auto-Translate EN Mati"}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* TAB 1: INFORMASI UMUM */}
          {modalTab === "general" && (
            <div className="space-y-4 animate-in fade-in">
              {/* Status Visibilitas Publik */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl ${
                      formData.visible !== false
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {formData.visible !== false ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-xs">Visibilitas Publik</p>
                    <p className="text-[11px] text-zinc-400">
                      {formData.visible !== false
                        ? "Tampil di halaman beranda / portofolio publik."
                        : "Disembunyikan dari publik (hanya terlihat di admin sebagai draft)."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      visible: prev.visible === false,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    formData.visible !== false ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.visible !== false ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

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
                  placeholder="Next.js 14, TypeScript, PostgreSQL, Docker, Redis"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Ringkasan Proyek Singkat (Bahasa Indonesia) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.summary.id}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      summary: {
                        ...prev.summary,
                        id: val,
                      },
                    }));
                  }}
                  onBlur={() => {
                    const idText = formData.summary.id.trim();
                    if (
                      autoTranslateEn &&
                      idText &&
                      (!formData.summary.en || formData.summary.en === formData.summary.id)
                    ) {
                      handleFieldTranslate("summary", idText, (translated) => {
                        setFormData((prev) => ({
                          ...prev,
                          summary: { ...prev.summary, en: translated },
                        }));
                      });
                    }
                  }}
                  placeholder="Deskripsi singkat yang tampil pada kartu proyek utama..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-zinc-300">
                    Project Summary (English) *
                  </label>
                  <TranslateButton
                    onClick={() =>
                      handleFieldTranslate("summary", formData.summary.id, (translated) => {
                        setFormData((prev) => ({
                          ...prev,
                          summary: { ...prev.summary, en: translated },
                        }));
                      })
                    }
                    isTranslating={translatingField === "summary"}
                  />
                </div>
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
                  placeholder="Short summary displayed on public card..."
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

              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <p className="font-bold text-indigo-300 text-xs">Lengkapi Kasus Arsitektur?</p>
                  <p className="text-[11px] text-zinc-400">
                    Tambahkan penjelasan arsitektur sistem, tantangan rekayasa, dan metrik performa.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalTab("architecture")}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Detail Arsitektur &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DETAIL ARSITEKTUR & STUDI KASUS */}
          {modalTab === "architecture" && (
            <div className="space-y-5 animate-in fade-in">
              {/* Info Banner */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-3">
                <Cpu className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-emerald-200">
                    Studi Kasus Arsitektur Sistem (Architecture Deep-Dive)
                  </p>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    Bagian ini akan ditampilkan dalam modal popup interaktif ketika pengunjung mengklik tombol <strong>&ldquo;Detail Arsitektur&rdquo;</strong> di kartu proyek Anda.
                  </p>
                </div>
              </div>

              {/* 1. Desain Arsitektur Sistem */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-white text-xs">
                      Desain Arsitektur Sistem (System Architecture) *
                    </h4>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    details.architecture
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Jelaskan pola arsitektur kode (mis. Microservices, Server Components, Modular Decoupling, Pipeline Data, Redis Caching, DB Partitioning) yang tampil di pop-up Studi Kasus Arsitektur.
                </p>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Arsitektur Sistem (Bahasa Indonesia) *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.details?.architecture?.id || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        details: {
                          ...prev.details,
                          architecture: {
                            ...prev.details?.architecture,
                            id: val,
                          },
                        },
                      }));
                    }}
                    onBlur={() => {
                      const idText = formData.details?.architecture?.id?.trim();
                      if (
                        autoTranslateEn &&
                        idText &&
                        (!formData.details?.architecture?.en ||
                          formData.details?.architecture?.en === formData.details?.architecture?.id)
                      ) {
                        handleFieldTranslate("architecture", idText, (translated) => {
                          setFormData((prev) => ({
                            ...prev,
                            details: {
                              ...prev.details,
                              architecture: { ...prev.details?.architecture, en: translated },
                            },
                          }));
                        });
                      }
                    }}
                    placeholder="Frontend dibangun menggunakan Next.js App Router dengan React Server Components. Backend diorkestrasikan melalui microservices Node.js, PostgreSQL dengan connection pooling, dan cluster Redis untuk analitik caching..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-emerald-500 leading-relaxed text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-zinc-300">
                      System Architecture (English) *
                    </label>
                    <TranslateButton
                      onClick={() =>
                        handleFieldTranslate(
                          "architecture",
                          formData.details?.architecture?.id || "",
                          (translated) => {
                            setFormData((prev) => ({
                              ...prev,
                              details: {
                                ...prev.details,
                                architecture: { ...prev.details?.architecture, en: translated },
                              },
                            }));
                          }
                        )
                      }
                      isTranslating={translatingField === "architecture"}
                    />
                  </div>
                  <textarea
                    rows={4}
                    value={formData.details?.architecture?.en || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        details: {
                          ...prev.details,
                          architecture: {
                            ...prev.details?.architecture,
                            en: val,
                          },
                        },
                      }));
                    }}
                    placeholder="The frontend is powered by Next.js App Router with React Server Components. The backend is orchestrated via Node.js microservices, PostgreSQL with pooling, and Redis cluster..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-emerald-500 leading-relaxed text-xs"
                  />
                </div>
              </div>

              {/* 2. Ikhtisar Proyek (Project Overview) */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-bold text-white text-xs">
                    Ikhtisar Mendalam (Project Overview)
                  </h4>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Ikhtisar Proyek (Bahasa Indonesia)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.details?.overview?.id || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        details: {
                          ...prev.details,
                          overview: {
                            ...prev.details?.overview,
                            id: val,
                          },
                        },
                      }));
                    }}
                    onBlur={() => {
                      const idText = formData.details?.overview?.id?.trim();
                      if (
                        autoTranslateEn &&
                        idText &&
                        (!formData.details?.overview?.en ||
                          formData.details?.overview?.en === formData.details?.overview?.id)
                      ) {
                        handleFieldTranslate("overview", idText, (translated) => {
                          setFormData((prev) => ({
                            ...prev,
                            details: {
                              ...prev.details,
                              overview: { ...prev.details?.overview, en: translated },
                            },
                          }));
                        });
                      }
                    }}
                    placeholder="Latar belakang masalah dan tujuan rekayasa proyek..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500 leading-relaxed text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-zinc-300">
                      Project Overview (English)
                    </label>
                    <TranslateButton
                      onClick={() =>
                        handleFieldTranslate(
                          "overview",
                          formData.details?.overview?.id || "",
                          (translated) => {
                            setFormData((prev) => ({
                              ...prev,
                              details: {
                                ...prev.details,
                                overview: { ...prev.details?.overview, en: translated },
                              },
                            }));
                          }
                        )
                      }
                      isTranslating={translatingField === "overview"}
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={formData.details?.overview?.en || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        details: {
                          ...prev.details,
                          overview: {
                            ...prev.details?.overview,
                            en: val,
                          },
                        },
                      }));
                    }}
                    placeholder="Problem context and architectural engineering objectives..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500 leading-relaxed text-xs"
                  />
                </div>
              </div>

              {/* 3. Tantangan Rekayasa & Solusi */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-amber-300 text-xs">
                    Tantangan Rekayasa &amp; Solusi (Engineering Challenge &amp; Solution)
                  </h4>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Tantangan &amp; Solusi (Bahasa Indonesia)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.details?.challengesSolved?.id || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        details: {
                          ...prev.details,
                          challengesSolved: {
                            ...prev.details?.challengesSolved,
                            id: val,
                          },
                        },
                      }));
                    }}
                    onBlur={() => {
                      const idText = formData.details?.challengesSolved?.id?.trim();
                      if (
                        autoTranslateEn &&
                        idText &&
                        (!formData.details?.challengesSolved?.en ||
                          formData.details?.challengesSolved?.en === formData.details?.challengesSolved?.id)
                      ) {
                        handleFieldTranslate("challengesSolved", idText, (translated) => {
                          setFormData((prev) => ({
                            ...prev,
                            details: {
                              ...prev.details,
                              challengesSolved: { ...prev.details?.challengesSolved, en: translated },
                            },
                          }));
                        });
                      }
                    }}
                    placeholder="Tantangan utama adalah menangani lonjakan query agregasi di bawah beban tinggi. Solusinya diatasi dengan partisi tabel PostgreSQL dan worker queue Redis..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-amber-500 leading-relaxed text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-zinc-300">
                      Challenge &amp; Solution (English)
                    </label>
                    <TranslateButton
                      onClick={() =>
                        handleFieldTranslate(
                          "challengesSolved",
                          formData.details?.challengesSolved?.id || "",
                          (translated) => {
                            setFormData((prev) => ({
                              ...prev,
                              details: {
                                ...prev.details,
                                challengesSolved: { ...prev.details?.challengesSolved, en: translated },
                              },
                            }));
                          }
                        )
                      }
                      isTranslating={translatingField === "challengesSolved"}
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={formData.details?.challengesSolved?.en || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        details: {
                          ...prev.details,
                          challengesSolved: {
                            ...prev.details?.challengesSolved,
                            en: val,
                          },
                        },
                      }));
                    }}
                    placeholder="The core challenge was scaling aggregate analytics queries under sudden peak loads. Solved using table partitioning and background worker queues..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-amber-500 leading-relaxed text-xs"
                  />
                </div>
              </div>

              {/* 4. Sorotan Fitur & Keamanan */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-bold text-white text-xs">
                      Sorotan Fitur &amp; Keamanan (Key Highlights)
                    </h4>
                  </div>
                  <span className="text-[10px] text-zinc-500">1 baris = 1 poin bullet</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">
                      Poin Sorotan (Bahasa Indonesia)
                    </label>
                    <textarea
                      rows={4}
                      value={highlightsInputId}
                      onChange={(e) => setHighlightsInputId(e.target.value)}
                      onBlur={() => {
                        const idText = highlightsInputId.trim();
                        if (
                          autoTranslateEn &&
                          idText &&
                          (!highlightsInputEn || highlightsInputEn === highlightsInputId)
                        ) {
                          handleFieldTranslate("highlights", idText, setHighlightsInputEn);
                        }
                      }}
                      placeholder={"Autentikasi multi-tenant dengan JWT dan RBAC\nSinkronisasi WebSocket dan Server-Sent Events\nDukungan multi-mata uang dan webhook pembayaran"}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-cyan-500 font-mono text-[11px] leading-relaxed"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-zinc-300">
                        Highlights (English)
                      </label>
                      <TranslateButton
                        onClick={() =>
                          handleFieldTranslate("highlights", highlightsInputId, setHighlightsInputEn)
                        }
                        isTranslating={translatingField === "highlights"}
                      />
                    </div>
                    <textarea
                      rows={4}
                      value={highlightsInputEn}
                      onChange={(e) => setHighlightsInputEn(e.target.value)}
                      placeholder={"Multi-tenant JWT authentication with RBAC\nReal-time WebSocket event pipeline\nMulti-currency recurring billing with webhooks"}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-cyan-500 font-mono text-[11px] leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Metrik Performa & Reliabilitas */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-white text-xs">
                      Metrik Performa &amp; Reliabilitas (Metrics Ribbon)
                    </h4>
                  </div>
                  {(formData.metrics?.length || 0) < 4 && (
                    <button
                      type="button"
                      onClick={addMetric}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Metrik</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {(formData.metrics || []).map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                    >
                      <div className="w-full sm:w-28 shrink-0">
                        <label className="block text-[10px] text-zinc-400 font-semibold mb-0.5">
                          Nilai
                        </label>
                        <input
                          type="text"
                          value={m.val}
                          onChange={(e) => updateMetricVal(mIdx, e.target.value)}
                          placeholder="mis. < 85ms"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-emerald-400 font-bold outline-none"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-[10px] text-zinc-400 font-semibold mb-0.5">
                          Label (ID)
                        </label>
                        <input
                          type="text"
                          value={m.lbl.id}
                          onChange={(e) => updateMetricLbl(mIdx, "id", e.target.value)}
                          onBlur={() => {
                            const idText = m.lbl?.id?.trim();
                            if (
                              autoTranslateEn &&
                              idText &&
                              (!m.lbl?.en || m.lbl?.en === m.lbl?.id)
                            ) {
                              handleFieldTranslate(`metric.${mIdx}`, idText, (trans) => {
                                updateMetricLbl(mIdx, "en", trans);
                              });
                            }
                          }}
                          placeholder="mis. Latensi API"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[10px] text-zinc-400 font-semibold">
                            Label (EN)
                          </label>
                          <TranslateButton
                            onClick={() =>
                              handleFieldTranslate(`metric.${mIdx}`, m.lbl?.id || "", (trans) => {
                                updateMetricLbl(mIdx, "en", trans);
                              })
                            }
                            isTranslating={translatingField === `metric.${mIdx}`}
                            label="EN"
                          />
                        </div>
                        <input
                          type="text"
                          value={m.lbl.en}
                          onChange={(e) => updateMetricLbl(mIdx, "en", e.target.value)}
                          placeholder="mis. API Latency"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none"
                        />
                      </div>

                      {(formData.metrics?.length || 0) > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMetric(mIdx)}
                          className="self-end sm:self-center p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors mt-auto"
                          title="Hapus Metrik"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80">
            <div>
              {modalTab === "architecture" ? (
                <button
                  type="button"
                  onClick={() => setModalTab("general")}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-semibold"
                >
                  &larr; Informasi Umum
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setModalTab("architecture")}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Atur Detail Arsitektur &rarr;</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowInnerPreview(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-850 hover:bg-emerald-500/15 hover:text-emerald-400 text-zinc-300 border border-zinc-750 text-xs font-semibold transition-colors"
                title="Pratinjau tampilan modal studi kasus & arsitektur proyek"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pratinjau Arsitektur</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
              >
                Simpan Proyek
              </button>
            </div>
          </div>
        </form>

        {/* Live In-Modal Architecture Preview */}
        {showInnerPreview && (
          <ProjectModal
            project={{
              ...formData,
              tags: tagInput
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
              details: {
                ...formData.details,
                highlights: {
                  id: highlightsInputId
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                  en: highlightsInputEn
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                },
              },
            }}
            onClose={() => setShowInnerPreview(false)}
            lang="id"
          />
        )}
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
  const [formData, setFormData] = useState<SkillItem>(() =>
    initialSkill
      ? { ...initialSkill, visible: initialSkill.visible !== false }
      : {
          name: "",
          category: "frontend",
          level: "Advanced",
          exp: { id: "3+ Tahun", en: "3+ Years" },
          desc: { id: "", en: "" },
          progress: 85,
          iconText: "JS",
          visible: true,
        }
  );

  const [autoTranslateEn, setAutoTranslateEn] = useState(true);
  const [translatingField, setTranslatingField] = useState<string | null>(null);

  const handleFieldTranslate = async (
    fieldKey: string,
    text: string,
    setter: (translated: string) => void
  ) => {
    if (!text.trim() || translatingField) return;
    setTranslatingField(fieldKey);
    try {
      const res = await translateIdToEn(text);
      if (res) setter(res);
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslatingField(null);
    }
  };

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
          {/* Status Visibilitas Publik */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl ${
                  formData.visible !== false
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {formData.visible !== false ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="font-semibold text-white text-xs">Visibilitas Publik</p>
                <p className="text-[11px] text-zinc-400">
                  {formData.visible !== false
                    ? "Tampil di section keahlian publik."
                    : "Disembunyikan (draft/arsip)."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  visible: prev.visible === false,
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                formData.visible !== false ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.visible !== false ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

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
                    category: e.target.value as "frontend" | "backend" | "database" | "tools",
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
                    level: e.target.value as "Expert" | "Advanced" | "Intermediate",
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
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-300">
                Deskripsi Singkat (Bahasa Indonesia)
              </label>
              <button
                type="button"
                onClick={() => setAutoTranslateEn(!autoTranslateEn)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  autoTranslateEn
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                }`}
                title="Bila aktif, mengisi Bahasa Indonesia akan otomatis menerjemahkan ke Bahasa Inggris"
              >
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                <span>{autoTranslateEn ? "Auto-Translate EN aktif" : "Auto-Translate EN mati"}</span>
              </button>
            </div>
            <input
              type="text"
              value={formData.desc.id}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  desc: {
                    ...prev.desc,
                    id: val,
                  },
                }));
              }}
              onBlur={() => {
                const idText = formData.desc.id.trim();
                if (
                  autoTranslateEn &&
                  idText &&
                  (!formData.desc.en || formData.desc.en === formData.desc.id)
                ) {
                  handleFieldTranslate("desc", idText, (translated) => {
                    setFormData((prev) => ({
                      ...prev,
                      desc: { ...prev.desc, en: translated },
                    }));
                  });
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-zinc-300">
                Short Description (English)
              </label>
              <TranslateButton
                onClick={() =>
                  handleFieldTranslate("desc", formData.desc.id, (translated) => {
                    setFormData((prev) => ({
                      ...prev,
                      desc: { ...prev.desc, en: translated },
                    }));
                  })
                }
                isTranslating={translatingField === "desc"}
              />
            </div>
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
  const [formData, setFormData] = useState<TimelineItem>(() =>
    initialItem
      ? { ...initialItem, visible: initialItem.visible !== false }
      : {
          id: "time-" + Date.now(),
          period: "2024 — Sekarang",
          role: { id: "", en: "" },
          company: "",
          badge: { id: "Penuh Waktu", en: "Full-Time" },
          badgeType: "work",
          description: { id: "", en: "" },
          skills: ["React", "Node.js"],
          visible: true,
        }
  );

  const [skillsInput, setSkillsInput] = useState(
    formData.skills?.join(", ") || ""
  );
  const [autoTranslateEn, setAutoTranslateEn] = useState(true);
  const [translatingField, setTranslatingField] = useState<string | null>(null);

  const handleFieldTranslate = async (
    fieldKey: string,
    text: string,
    setter: (translated: string) => void
  ) => {
    if (!text.trim() || translatingField) return;
    setTranslatingField(fieldKey);
    try {
      const res = await translateIdToEn(text);
      if (res) setter(res);
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslatingField(null);
    }
  };

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
          {/* Status Visibilitas Publik */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl ${
                  formData.visible !== false
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {formData.visible !== false ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="font-semibold text-white text-xs">Visibilitas Publik</p>
                <p className="text-[11px] text-zinc-400">
                  {formData.visible !== false
                    ? "Tampil di linimasa portofolio publik."
                    : "Disembunyikan (draft/arsip)."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  visible: prev.visible === false,
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                formData.visible !== false ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.visible !== false ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

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
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-zinc-300">
                  Jabatan / Gelar (ID) *
                </label>
                <button
                  type="button"
                  onClick={() => setAutoTranslateEn(!autoTranslateEn)}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors ${
                    autoTranslateEn
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  }`}
                  title="Bila aktif, mengisi Bahasa Indonesia akan otomatis menerjemahkan ke Bahasa Inggris"
                >
                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                  <span>{autoTranslateEn ? "Auto-EN" : "Manual"}</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={formData.role.id}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    role: {
                      ...prev.role,
                      id: val,
                    },
                  }));
                }}
                onBlur={() => {
                  const idText = formData.role.id.trim();
                  if (
                    autoTranslateEn &&
                    idText &&
                    (!formData.role.en || formData.role.en === formData.role.id)
                  ) {
                    handleFieldTranslate("role", idText, (translated) => {
                      setFormData((prev) => ({
                        ...prev,
                        role: { ...prev.role, en: translated },
                      }));
                    });
                  }
                }}
                placeholder="Senior Full-Stack Developer"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-zinc-300">
                  Role / Degree (EN) *
                </label>
                <TranslateButton
                  onClick={() =>
                    handleFieldTranslate("role", formData.role.id, (translated) => {
                      setFormData((prev) => ({
                        ...prev,
                        role: { ...prev.role, en: translated },
                      }));
                    })
                  }
                  isTranslating={translatingField === "role"}
                />
              </div>
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
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  description: {
                    ...prev.description,
                    id: val,
                  },
                }));
              }}
              onBlur={() => {
                const idText = formData.description.id.trim();
                if (
                  autoTranslateEn &&
                  idText &&
                  (!formData.description.en || formData.description.en === formData.description.id)
                ) {
                  handleFieldTranslate("description", idText, (translated) => {
                    setFormData((prev) => ({
                      ...prev,
                      description: { ...prev.description, en: translated },
                    }));
                  });
                }
              }}
              placeholder="Jelaskan peran teknis dan pencapaian Anda..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-zinc-300">
                Description &amp; Impact (EN)
              </label>
              <TranslateButton
                onClick={() =>
                  handleFieldTranslate("description", formData.description.id, (translated) => {
                    setFormData((prev) => ({
                      ...prev,
                      description: { ...prev.description, en: translated },
                    }));
                  })
                }
                isTranslating={translatingField === "description"}
              />
            </div>
            <textarea
              rows={2}
              value={formData.description.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: { ...formData.description, en: e.target.value },
                })
              }
              placeholder="Describe your technical responsibilities and impact..."
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
  const [formData, setFormData] = useState<TestimonialItem>(() =>
    initialItem
      ? { ...initialItem, visible: initialItem.visible !== false }
      : {
          id: "testi-" + Date.now(),
          author: "",
          role: "",
          initials: "",
          quote: {
            id: "",
            en: "",
          },
          visible: true,
        }
  );

  const [autoTranslateEn, setAutoTranslateEn] = useState(true);
  const [translatingField, setTranslatingField] = useState<string | null>(null);

  const handleFieldTranslate = async (
    fieldKey: string,
    text: string,
    setter: (translated: string) => void
  ) => {
    if (!text.trim() || translatingField) return;
    setTranslatingField(fieldKey);
    try {
      const res = await translateIdToEn(text);
      if (res) setter(res);
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslatingField(null);
    }
  };

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
          {/* Status Visibilitas Publik */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl ${
                  formData.visible !== false
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {formData.visible !== false ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="font-semibold text-white text-xs">Visibilitas Publik</p>
                <p className="text-[11px] text-zinc-400">
                  {formData.visible !== false
                    ? "Tampil di carousel rekomendasi publik."
                    : "Disembunyikan (draft/arsip)."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  visible: prev.visible === false,
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                formData.visible !== false ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.visible !== false ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

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
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-300">
                Ulasan / Testimoni (Bahasa Indonesia) *
              </label>
              <button
                type="button"
                onClick={() => setAutoTranslateEn(!autoTranslateEn)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  autoTranslateEn
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                }`}
                title="Bila aktif, mengisi Bahasa Indonesia akan otomatis menerjemahkan ke Bahasa Inggris"
              >
                <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                <span>{autoTranslateEn ? "Auto-Translate EN aktif" : "Auto-Translate EN mati"}</span>
              </button>
            </div>
            <textarea
              required
              rows={3}
              value={formData.quote.id}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  quote: {
                    ...prev.quote,
                    id: val,
                  },
                }));
              }}
              onBlur={() => {
                const idText = formData.quote.id.trim();
                if (
                  autoTranslateEn &&
                  idText &&
                  (!formData.quote.en || formData.quote.en === formData.quote.id)
                ) {
                  handleFieldTranslate("quote", idText, (translated) => {
                    setFormData((prev) => ({
                      ...prev,
                      quote: { ...prev.quote, en: translated },
                    }));
                  });
                }
              }}
              placeholder="Tuliskan ulasan atau rekomendasi rekan dalam Bahasa Indonesia..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-zinc-300">
                Testimonial / Endorsement (English)
              </label>
              <TranslateButton
                onClick={() =>
                  handleFieldTranslate("quote", formData.quote.id, (translated) => {
                    setFormData((prev) => ({
                      ...prev,
                      quote: { ...prev.quote, en: translated },
                    }));
                  })
                }
                isTranslating={translatingField === "quote"}
              />
            </div>
            <textarea
              rows={3}
              value={formData.quote.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quote: { ...formData.quote, en: e.target.value },
                })
              }
              placeholder="Optional english translation..."
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

