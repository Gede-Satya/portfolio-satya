import fs from "fs";
import path from "path";
import {
  siteConfig,
  projectsData,
  skillsData,
  timelineData,
  testimonialsData,
} from "@/data/portfolioData";
import { ProjectItem, SkillItem, TimelineItem, TestimonialItem } from "@/types/portfolio";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface PillarItem {
  id: string;
  title: { id: string; en: string };
  desc: { id: string; en: string };
  icon: "layout" | "server" | "cloud" | "cpu";
}

export interface AboutContent {
  kicker: { id: string; en: string };
  title: { id: string; en: string };
  subtitle: { id: string; en: string };
  bioHeading: { id: string; en: string };
  bioP1: { id: string; en: string };
  bioP2: { id: string; en: string };
  specs: {
    location: { id: string; en: string };
    education: { id: string; en: string };
    focus: { id: string; en: string };
    availability: { id: string; en: string };
  };
  pillars: PillarItem[];
}

export interface HeroStats {
  years: { val: string; lbl: { id: string; en: string } };
  projects: { val: string; lbl: { id: string; en: string } };
  uptime: { val: string; lbl: { id: string; en: string } };
}

export interface PortfolioContent {
  profile: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    available: boolean;
    github: string;
    linkedin: string;
    whatsapp: string;
    avatar?: string;
    headline: { id: string; en: string };
    subheadline: { id: string; en: string };
    bioP1?: { id: string; en: string };
    bioP2?: { id: string; en: string };
  };
  about: AboutContent;
  heroStats: HeroStats;
  projects: ProjectItem[];
  skills: SkillItem[];
  timeline: TimelineItem[];
  testimonials: TestimonialItem[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_FILE = path.join(DATA_DIR, "portfolio-content.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const AUTH_FILE = path.join(DATA_DIR, "admin-auth.json");

function ensureDirectoryExistence() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    // Read-only filesystem in serverless environments
  }
}

function safeWriteFile(filePath: string, content: string): void {
  try {
    ensureDirectoryExistence();
    fs.writeFileSync(filePath, content, "utf-8");
  } catch (error) {
    console.warn(`Filesystem write skipped for ${filePath}:`, error);
  }
}

export function getDefaultContent(): PortfolioContent {
  return {
    profile: {
      name: siteConfig.name,
      title: siteConfig.title,
      email: siteConfig.email,
      phone: siteConfig.phone,
      location: siteConfig.location,
      available: true,
      github: siteConfig.github,
      linkedin: siteConfig.linkedin,
      whatsapp: siteConfig.whatsapp,
      avatar: "/uploads/foto_wasit_satya-1791865121487.png",
      headline: {
        id: "Membangun sistem web skalavel & pengalaman digital elegan.",
        en: "Crafting high-performance web systems & elegant digital products.",
      },
      subheadline: {
        id: "Hai, saya Satya. Menggabungkan arsitektur backend berkecepatan tinggi dengan keahlian antarmuka React & Next.js yang bersih, modular, dan responsif.",
        en: "Hi, I'm Satya. Bridging robust low-latency backend architectures with modern React & Next.js user interfaces that are fluid, accessible, and clean.",
      },
    },
    about: {
      kicker: {
        id: "Profil & Latar Belakang",
        en: "Profile & Background",
      },
      title: {
        id: "Menyelesaikan Masalah Kompleks Melalui Arsitektur Kode yang Bersih",
        en: "Engineering Scalable Solutions Through Elegant, Resilient Code",
      },
      subtitle: {
        id: "Keseimbangan antara ketelitian struktur data, performa server, dan estetika visual tingkat tinggi.",
        en: "A balanced synthesis of rigorous data modeling, backend throughput, and refined visual aesthetics.",
      },
      bioHeading: {
        id: "Tentang Saya & Latar Belakang",
        en: "About Me & Engineering Journey",
      },
      bioP1: {
        id: "Saya adalah seorang Software Engineer & Full-Stack Web Developer dengan pengalaman membangun sistem digital untuk perusahaan teknologi dan rintisan inovatif. Menguasai siklus hidup software secara menyeluruh: mulai dari desain skema basis data relasional hingga pengalaman pengguna akhir yang responsif.",
        en: "I am a Software Engineer & Full-Stack Developer with experience architecting digital products for high-growth tech companies and innovative startups. I thrive across the full software lifecycle: from database schemas to responsive, high-fidelity user experiences.",
      },
      bioP2: {
        id: "Bagi saya, perangkat lunak yang hebat tidak hanya sekadar berjalan, tetapi mudah dipelihara, diuji secara komprehensif, dan memberikan nilai nyata bagi pengguna dengan latensi seminimal mungkin.",
        en: "For me, great software is not just functional—it is maintainable, thoroughly tested, and delivers delightful tangible value to users with minimal latency.",
      },
      specs: {
        location: {
          id: "Bali / Jakarta, Indonesia (WIB)",
          en: "Bali / Jakarta, Indonesia (GMT+7)",
        },
        education: {
          id: "S.Kom - Rekayasa Perangkat Lunak / Ilmu Komputer",
          en: "B.Sc. in Software Engineering / Computer Science",
        },
        focus: {
          id: "Full-Stack Web & Next.js Ecosystem",
          en: "Full-Stack Web & Next.js Ecosystem",
        },
        availability: {
          id: "Tersedia untuk Remote / Hybrid",
          en: "Available for Remote / Hybrid",
        },
      },
      pillars: [
        {
          id: "p1",
          icon: "layout",
          title: {
            id: "Frontend Craftsmanship",
            en: "Frontend Craftsmanship",
          },
          desc: {
            id: "Membangun antarmuka dinamis dan responsif dengan Next.js 14, React Server Components, TypeScript, serta CSS modern yang mengutamakan aksesibilitas dan kemulusan 60fps.",
            en: "Crafting fluid, high-fidelity responsive user experiences with Next.js 14, React Server Components, TypeScript, and modern CSS tuned for WCAG accessibility.",
          },
        },
        {
          id: "p2",
          icon: "server",
          title: {
            id: "Robust Backend & API",
            en: "Robust Backend & API",
          },
          desc: {
            id: "Merancang REST API, GraphQL, microservices efisien, autentikasi terproteksi dengan Node.js, Express, serta Golang untuk pemrosesan paralel berlatensi rendah.",
            en: "Engineering resilient REST and GraphQL microservices, hardened auth workflows, and concurrent event pipelines via Node.js, Express, and Golang.",
          },
        },
        {
          id: "p3",
          icon: "cloud",
          title: {
            id: "DevOps & Cloud Architecture",
            en: "DevOps & Cloud Architecture",
          },
          desc: {
            id: "Otomasi containerization dengan Docker, multi-environment CI/CD pipeline, edge compute Vercel, dan manajemen cache Redis untuk menjamin reliabilitas produksi.",
            en: "Containerizing services via Docker, automated zero-downtime CI/CD workflows, edge runtime caching, and Redis layers ensuring 99.9% uptime reliability.",
          },
        },
        {
          id: "p4",
          icon: "cpu",
          title: {
            id: "Performance & Code Integrity",
            en: "Performance & Code Integrity",
          },
          desc: {
            id: "Penerapan clean code, pengujian otomatis (unit, integrasi, E2E), modularitas terisolasi, dan audit Core Web Vitals dengan skor Lighthouse 95+ secara konsisten.",
            en: "Disciplined clean code principles, automated test coverage (unit, integration, E2E), strict decoupling, and sub-100ms response targets with 95+ Lighthouse audits.",
          },
        },
      ],
    },
    heroStats: {
      years: { val: "4+", lbl: { id: "Thn Pengalaman", en: "Years Exp" } },
      projects: { val: "28+", lbl: { id: "Proyek Selesai", en: "Delivered" } },
      uptime: { val: "99.9%", lbl: { id: "Fokus Uptime", en: "Uptime SLA" } },
    },
    projects: projectsData,
    skills: skillsData,
    timeline: timelineData,
    testimonials: testimonialsData,
  };
}

export function getPortfolioContent(): PortfolioContent {
  ensureDirectoryExistence();
  if (!fs.existsSync(CONTENT_FILE)) {
    const defaultData = getDefaultContent();
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
    return defaultData;
  }

  try {
    const fileContent = fs.readFileSync(CONTENT_FILE, "utf-8");
    const parsed = JSON.parse(fileContent);
    const defaults = getDefaultContent();

    // Preserve existing user customizations while auto-migrating newly supported sections
    const merged: PortfolioContent = {
      ...defaults,
      ...parsed,
      profile: {
        ...defaults.profile,
        ...(parsed.profile || {}),
      },
      about: {
        ...defaults.about,
        ...(parsed.about || {}),
        specs: {
          ...defaults.about.specs,
          ...(parsed.about?.specs || {}),
        },
        pillars: parsed.about?.pillars?.length ? parsed.about.pillars : defaults.about.pillars,
      },
      heroStats: {
        ...defaults.heroStats,
        ...(parsed.heroStats || {}),
      },
      projects: parsed.projects?.length ? parsed.projects : defaults.projects,
      skills: parsed.skills?.length ? parsed.skills : defaults.skills,
      timeline: parsed.timeline?.length ? parsed.timeline : defaults.timeline,
      testimonials: (parsed.testimonials?.length ? parsed.testimonials : defaults.testimonials).map(
        (t: TestimonialItem, idx: number) => ({
          ...t,
          id: t.id || `testi-${idx + 1}`,
        })
      ),
    };

    // If file was missing 'about', 'heroStats', or 'testimonials', update the saved file
    if (!parsed.about || !parsed.heroStats || !parsed.testimonials) {
      fs.writeFileSync(CONTENT_FILE, JSON.stringify(merged, null, 2), "utf-8");
    }

    return merged;
  } catch (error) {
    console.error("Error reading portfolio content file, returning defaults:", error);
    return getDefaultContent();
  }
}

export function savePortfolioContent(content: PortfolioContent): void {
  safeWriteFile(CONTENT_FILE, JSON.stringify(content, null, 2));
}

export function resetToDefaultContent(): PortfolioContent {
  const defaultData = getDefaultContent();
  savePortfolioContent(defaultData);
  return defaultData;
}

export async function getPortfolioContentAsync(): Promise<PortfolioContent> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("portfolio_content")
        .select("content")
        .eq("id", "main")
        .single();

      if (!error && data?.content) {
        return data.content as PortfolioContent;
      }

      // If table is empty or row does not exist, seed with local content
      const localContent = getPortfolioContent();
      await supabase.from("portfolio_content").upsert({
        id: "main",
        content: localContent,
        updated_at: new Date().toISOString(),
      });
      return localContent;
    } catch (err) {
      console.warn("Supabase fetch portfolio error, falling back to local:", err);
    }
  }

  return getPortfolioContent();
}

export async function savePortfolioContentAsync(content: PortfolioContent): Promise<void> {
  safeWriteFile(CONTENT_FILE, JSON.stringify(content, null, 2));

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("portfolio_content").upsert({
        id: "main",
        content,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error("Supabase upsert portfolio error:", error);
      }
    } catch (err) {
      console.error("Supabase save portfolio exception:", err);
    }
  }
}

export async function resetToDefaultContentAsync(): Promise<PortfolioContent> {
  const defaultData = getDefaultContent();
  await savePortfolioContentAsync(defaultData);
  return defaultData;
}

export function getMessages(): ContactMessage[] {
  ensureDirectoryExistence();
  if (!fs.existsSync(MESSAGES_FILE)) {
    const sampleMessages: ContactMessage[] = [
      {
        id: "msg-1",
        name: "Hendra Wijaya",
        email: "hendra@innovatetech.co.id",
        subject: "Full-Time Role",
        message: "Halo, kami tertarik dengan portofolio Anda untuk posisi Senior Full-Stack Engineer di startup kami. Apakah Anda terbuka untuk jadwal wawancara teknis minggu ini?",
        createdAt: new Date().toISOString(),
        read: false,
      },
    ];
    safeWriteFile(MESSAGES_FILE, JSON.stringify(sampleMessages, null, 2));
    return sampleMessages;
  }

  try {
    const content = fs.readFileSync(MESSAGES_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading messages file:", error);
    return [];
  }
}

export function saveMessages(messages: ContactMessage[]): void {
  safeWriteFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

export async function getMessagesAsync(): Promise<ContactMessage[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          subject: item.subject,
          message: item.message,
          createdAt: item.created_at || item.createdAt || new Date().toISOString(),
          read: Boolean(item.read),
        }));
      }
    } catch (err) {
      console.warn("Supabase messages fetch error, fallback to local:", err);
    }
  }

  return getMessages();
}

export async function saveMessageAsync(message: ContactMessage): Promise<void> {
  const current = getMessages();
  saveMessages([message, ...current]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("contact_messages").insert({
        id: message.id,
        name: message.name,
        email: message.email,
        subject: message.subject,
        message: message.message,
        created_at: message.createdAt,
        read: message.read,
      });
    } catch (err) {
      console.error("Supabase insert message error:", err);
    }
  }
}

export async function updateMessageReadAsync(id: string, read: boolean): Promise<void> {
  const current = getMessages();
  const idx = current.findIndex((m) => m.id === id);
  if (idx !== -1) {
    current[idx].read = read;
    saveMessages(current);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from("contact_messages")
        .update({ read })
        .eq("id", id);
    } catch (err) {
      console.error("Supabase update message error:", err);
    }
  }
}

export async function deleteMessageAsync(id: string): Promise<void> {
  const current = getMessages().filter((m) => m.id !== id);
  saveMessages(current);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);
    } catch (err) {
      console.error("Supabase delete message error:", err);
    }
  }
}

export function getAdminCredentials(): { username: string; passwordHash: string } {
  ensureDirectoryExistence();
  if (!fs.existsSync(AUTH_FILE)) {
    const defaultAuth = {
      username: "admin",
      passwordHash: "admin123",
    };
    safeWriteFile(AUTH_FILE, JSON.stringify(defaultAuth, null, 2));
    return defaultAuth;
  }

  try {
    const content = fs.readFileSync(AUTH_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return { username: "admin", passwordHash: "admin123" };
  }
}

export function updateAdminCredentials(username: string, passwordHash: string): void {
  safeWriteFile(AUTH_FILE, JSON.stringify({ username, passwordHash }, null, 2));
}

export async function getAdminCredentialsAsync(): Promise<{ username: string; passwordHash: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("admin_auth")
        .select("username, password_hash")
        .eq("id", "admin")
        .single();

      if (!error && data) {
        return {
          username: data.username,
          passwordHash: data.password_hash,
        };
      }

      const localAuth = getAdminCredentials();
      await supabase.from("admin_auth").upsert({
        id: "admin",
        username: localAuth.username,
        password_hash: localAuth.passwordHash,
        updated_at: new Date().toISOString(),
      });
      return localAuth;
    } catch (err) {
      console.warn("Supabase admin auth error:", err);
    }
  }

  return getAdminCredentials();
}

export async function updateAdminCredentialsAsync(username: string, passwordHash: string): Promise<void> {
  updateAdminCredentials(username, passwordHash);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("admin_auth").upsert({
        id: "admin",
        username,
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Supabase update admin error:", err);
    }
  }
}
