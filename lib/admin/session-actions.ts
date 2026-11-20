"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH } from "@/lib/admin/auth";
import { checkRateLimit, visitorId } from "@/lib/forms/rate-limit";
import { supabaseConfigured } from "@/lib/supabase/config";
import { createSessionClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

const passwordSchema = z.string().min(1).max(200);

const WRONG = "Fjalëkalimi është gabim.";

/**
 * Admin sign-in: password only (decided with the client). There is one shared admin account in
 * Supabase Auth; its email lives in ADMIN_EMAIL on the server and is never shown or asked for.
 * Still a real Supabase session underneath, so Row Level Security and the audit log work as before.
 * Rate limited per visitor on top of Supabase's own auth limits.
 */
export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = process.env.ADMIN_EMAIL?.trim();
  if (!supabaseConfigured() || !email) return { error: "Paneli nuk është lidhur ende me databazën." };

  const parsed = passwordSchema.safeParse(String(formData.get("password") ?? ""));
  if (!parsed.success) return { error: WRONG };

  const waitMinutes = await checkRateLimit(await visitorId(), "admin-login");
  if (waitMinutes > 0) {
    return { error: `Shumë përpjekje. Provo përsëri pas ${waitMinutes} ${waitMinutes === 1 ? "minute" : "minutash"}.` };
  }

  const db = await createSessionClient();
  const { error } = await db.auth.signInWithPassword({ email, password: parsed.data });
  if (error) return { error: WRONG };

  const { data: isAdmin } = await db.rpc("is_admin");
  if (isAdmin !== true) {
    await db.auth.signOut();
    return { error: WRONG };
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
