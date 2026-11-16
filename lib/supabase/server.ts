import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabasePublicConfig } from "@/lib/supabase/config";

/**
 * Client acting as the signed-in admin (session from the auth cookies). Used by admin pages and
 * admin Server Actions, so every query runs under Row Level Security as that user.
 * Reading cookies makes the caller dynamic: use it only inside <Suspense> or in actions.
 */
export async function createSessionClient(): Promise<SupabaseClient> {
  const config = supabasePublicConfig();
  if (!config) throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).");
  const cookieStore = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only. proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
