import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { ADMIN_PATHS } from "@/lib/admin/paths";
import { supabaseConfigured } from "@/lib/supabase/config";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Admin Data Access Layer: the ONE place that decides "is this request an admin?".
 *
 * proxy.ts only does a quick, optimistic redirect for signed-out visitors. The real check is
 * here and runs in every admin page and every admin Server Action (they never trust the browser):
 *   1. a valid Supabase session (getClaims verifies the token signature), and
 *   2. the user is listed in public.admins (database function is_admin()).
 * Even if both were bypassed, Row Level Security in the database refuses non-admins.
 */
export interface Admin {
  id: string;
  email: string;
  /** Supabase client acting as this admin: every query runs under Row Level Security. */
  db: SupabaseClient;
}

export const ADMIN_LOGIN_PATH = ADMIN_PATHS.login;
export const ADMIN_HOME_PATH = ADMIN_PATHS.home;

/** The signed-in admin, or null. Cached per request, so a page and its parts share one check. */
export const getAdmin = cache(async (): Promise<Admin | null> => {
  if (!supabaseConfigured()) return null;
  // Request time only. With partial prefetching Next may read the session cookie while building
  // the prefetch shell, and the token check below compares expiry times with Date.now(), which is
  // not allowed there ("unstable value Date.now() while prerendering").
  await connection();
  const db = await createSessionClient();
  const { data, error } = await db.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;
  const { data: isAdmin, error: rpcError } = await db.rpc("is_admin");
  if (rpcError || isAdmin !== true) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "", db };
});

/**
 * Use at the top of every admin page and admin action. Anyone else goes to the login page;
 * `?dil=1` makes proxy.ts clear a session that is valid but not an admin's (no redirect loop).
 */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect(`${ADMIN_LOGIN_PATH}?dil=1`);
  return admin;
}
