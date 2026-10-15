import type { MetadataRoute } from "next";
import { getPortfolioContent } from "@/lib/storage";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://portfolio-satya-five.vercel.app");

export default function sitemap(): MetadataRoute.Sitemap {
  const content = getPortfolioContent();

  const imagePaths = [
    "/og-image.png",
    "/satya-square.png",
    content.profile.avatar,
    ...content.projects.map((project) => project.image),
  ].filter(Boolean) as string[];

  const images: string[] = Array.from(
    new Set(imagePaths.map((path) => new URL(path, siteUrl).toString()))
  );

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      images,
    },
  ];
}