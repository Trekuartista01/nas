import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";
import { supabasePublicConfig } from "@/lib/supabase/config";

/**
 * Server-only client with the SECRET key. It bypasses Row Level Security, so use it only for
 * the few jobs visitors can't do themselves: saving form leads and newsletter sign-ups,
 * and the shared rate-limit counter. Never for anything an admin does (that uses the admin's
 * own session, so the database rules and audit log apply).
 */
export function serviceConfigured(): boolean {
  return supabasePublicConfig() !== null && Boolean(process.env.SUPABASE_SECRET_KEY?.trim());
}

export function createServiceClient(): SupabaseClient {
  const config = supabasePublicConfig();
  if (!config) throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  return createClient(config.url, requireEnv("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
