import { NextResponse } from "next/server";

// Cache translations in memory to improve speed and conserve rate limits
const translationCache = new Map<string, string>();

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, "/");
}

async function translateSingle(
  text: string,
  from: string,
  to: string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const cacheKey = `${from}:${to}:${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 1. Primary: MyMemory Translation API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed
    )}&langpair=${from}|${to}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Portfolio-App/1.0" },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const data = await res.json();
      const rawText = data?.responseData?.translatedText;
      if (
        rawText &&
        typeof rawText === "string" &&
        !rawText.toUpperCase().startsWith("MYMEMORY WARNING:")
      ) {
        const clean = decodeHtmlEntities(rawText);
        translationCache.set(cacheKey, clean);
        return clean;
      }
    }
  } catch (err) {
    console.warn("MyMemory API translation attempt failed:", err);
  }

  // 2. Secondary: Lingva public instances
  const lingvaEndpoints = [
    "https://lingva.ml/api/v1",
    "https://translate.plausibility.cloud/api/v1",
  ];

  for (const endpoint of lingvaEndpoints) {
    try {
      const lingvaUrl = `${endpoint}/${from}/${to}/${encodeURIComponent(trimmed)}`;
      const res = await fetch(lingvaUrl, {
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.translation) {
          const clean = decodeHtmlEntities(data.translation);
          translationCache.set(cacheKey, clean);
          return clean;
        }
      }
    } catch {
      // Try next endpoint
    }
  }

  // Fallback: Return original text if network services are unavailable
  return trimmed;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, from = "id", to = "en" } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ success: true, translation: "" });
    }

    const trimmed = text.trim();

    // If multi-line (e.g. project highlights or multiline bio)
    if (trimmed.includes("\n")) {
      const lines = text.split("\n");
      const translatedLines = await Promise.all(
        lines.map(async (line: string) => {
          if (!line.trim()) return "";
          return await translateSingle(line, from, to);
        })
      );
      return NextResponse.json({
        success: true,
        translation: translatedLines.join("\n"),
      });
    }

    const result = await translateSingle(trimmed, from, to);
    return NextResponse.json({
      success: true,
      translation: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menerjemahkan teks" },
      { status: 500 }
    );
  }
}
