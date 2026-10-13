import type { MetadataRoute } from "next";
import { getPortfolioContent } from "@/lib/storage";

const siteUrl = "https://satyadharma.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const content = getPortfolioContent();

  const imagePaths = [
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