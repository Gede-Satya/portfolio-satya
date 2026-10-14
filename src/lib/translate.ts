/**
 * Client helper to translate Indonesian text to English via /api/translate
 */
export async function translateIdToEn(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed, from: "id", to: "en" }),
    });

    if (!res.ok) return "";
    const data = await res.json();
    if (data.success && typeof data.translation === "string") {
      return data.translation;
    }
  } catch (error) {
    console.error("Translation request failed:", error);
  }

  return "";
}
