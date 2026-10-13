import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET() {
  const matchingEnvKeys = Object.keys(process.env).filter((k) =>
    /supabase|postgres|database|next_public/i.test(k)
  );

  const envStatus = {
    matchingEnvKeys,
    has_NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    has_SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    has_SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    has_SUPABASE_SECRET_KEY: Boolean(process.env.SUPABASE_SECRET_KEY),
    has_SUPABASE_PUBLISHABLE_KEY: Boolean(process.env.SUPABASE_PUBLISHABLE_KEY),
    has_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    has_NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    has_SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
    isSupabaseConfigured,
  };

  const supabaseTest: {
    canRead: boolean;
    canWrite: boolean;
    rowCount: number;
    readError: any;
    writeError: any;
  } = {
    canRead: false,
    canWrite: false,
    rowCount: 0,
    readError: null,
    writeError: null,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("portfolio_content")
        .select("id, updated_at");

      if (error) {
        supabaseTest.readError = {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        };
      } else {
        supabaseTest.canRead = true;
        supabaseTest.rowCount = data?.length || 0;
      }
    } catch (e) {
      supabaseTest.readError = String(e);
    }
  }

  return NextResponse.json({
    envStatus,
    supabaseTest,
  });
}
