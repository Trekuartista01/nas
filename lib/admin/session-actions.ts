"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH } from "@/lib/admin/auth";
import { checkRateLimit, visitorId } from "@/lib/forms/rate-limit";
import { supabaseConfigured } from "@/lib/supabase/config";
import { createSessionClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
  email?: string;
}

const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(200),
});

const WRONG = "Email-i ose fjalëkalimi është gabim.";

/**
 * Admin sign-in (email + password, Supabase Auth). The same message is shown for a wrong
 * password, an unknown email and a non-admin account, so the form can't be used to discover
 * which emails have accounts. Rate limited per visitor on top of Supabase's own auth limits.
 */
export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!supabaseConfigured()) return { error: "Paneli nuk është lidhur ende me databazën." };

  const raw = { email: String(formData.get("email") ?? "").trim(), password: String(formData.get("password") ?? "") };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { error: WRONG, email: raw.email.slice(0, 254) };

  const waitMinutes = await checkRateLimit(await visitorId(), "admin-login");
  if (waitMinutes > 0) {
    return { error: `Shumë përpjekje. Provo përsëri pas ${waitMinutes} ${waitMinutes === 1 ? "minute" : "minutash"}.`, email: raw.email };
  }

  const db = await createSessionClient();
  const { error } = await db.auth.signInWithPassword(parsed.data);
  if (error) return { error: WRONG, email: raw.email };

  const { data: isAdmin } = await db.rpc("is_admin");
  if (isAdmin !== true) {
    await db.auth.signOut();
    return { error: WRONG, email: raw.email };
  }
  redirect(ADMIN_HOME_PATH);
}

export async function signOut(): Promise<void> {
  if (supabaseConfigured()) {
    const db = await createSessionClient();
    await db.auth.signOut();
  }
  redirect(ADMIN_LOGIN_PATH);
}
