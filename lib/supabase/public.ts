import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicConfig } from "@/lib/supabase/config";

/**
 * Client for PUBLIC reads (published catalog rows), used inside 'use cache' functions.
 * No cookies and no session, so the result is the same for every visitor and can be cached.
 * Uses the publishable key: Row Level Security only lets it read published rows.
 */
export function createPublicClient(): SupabaseClient | null {
  const config = supabasePublicConfig();
  if (!config) return null;
  return createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
