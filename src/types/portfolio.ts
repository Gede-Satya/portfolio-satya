export type Language = "id" | "en";

export interface ProjectItem {
  id: string;
  title: string;
  category: "fullstack" | "frontend" | "backend";
  badge: string;
  image: string;
  summary: {
    id: string;
    en: string;
  };
  tags: string[];
  metrics: {
    val: string;
    lbl: { id: string; en: string };
  }[];
  githubUrl: string;
  liveUrl?: string;
  details: {
    overview: { id: string; en: string };
    architecture: { id: string; en: string };
    highlights: { id: string[]; en: string[] };
    challengesSolved: { id: string; en: string };
  };
  visible?: boolean;
}

export interface SkillItem {
  name: string;
  category: "frontend" | "backend" | "database" | "tools";
  level: "Expert" | "Advanced" | "Intermediate";
  exp: { id: string; en: string };
  desc: { id: string; en: string };
  progress: number;
  iconText: string;
  visible?: boolean;
}

export interface TimelineItem {
  id: string;
  period: string;
  role: { id: string; en: string };
  company: string;
  badge: { id: string; en: string };
  badgeType: "work" | "education";
  description: { id: string; en: string };
  skills?: string[];
  visible?: boolean;
}

export interface TestimonialItem {
  id?: string;
  quote: { id: string; en: string };
  author: string;
  role: string;
  initials: string;
  rating?: number;
  createdAt?: string;
  visible?: boolean;
}
