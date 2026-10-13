import { createClient } from "@supabase/supabase-js";

// Ensure Node.js < 22 has a WebSocket fallback so @supabase/supabase-js
// does not crash during Next.js SSR / build time with:
// "Error: Node.js 20 detected without native WebSocket support."
if (typeof globalThis.WebSocket === "undefined") {
  try {
    // @ts-expect-error Fallback for runtimes without native WebSocket
    globalThis.WebSocket = class DummyWebSocket {};
  } catch {
    // ignore if globalThis.WebSocket is read-only
  }
}

function cleanSupabaseUrl(url?: string): string {
  if (!url) return "";
  let cleaned = url.trim();
  // Remove /rest/v1 or trailing slashes if user copied from API endpoint
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  return cleaned;
}

const rawSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";
const supabaseUrl = cleanSupabaseUrl(rawSupabaseUrl);
const supabaseKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ""
).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseUrl.startsWith("http") && supabaseKey
);

function createSafeSupabaseClient() {
  if (!isSupabaseConfigured) return null;
  try {
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    return null;
  }
}

export const supabase = createSafeSupabaseClient();
