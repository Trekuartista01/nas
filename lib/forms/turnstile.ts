import "server-only";
import { requireEnv } from "@/lib/env";

/**
 * Cloudflare Turnstile ("are you human?") check, done on the server with the secret key.
 * The browser widget only produces a one-time token; the token means nothing until
 * Cloudflare confirms it here.
 *
 * OPTIONAL (decided 2026-11-12): without TURNSTILE_SECRET_KEY the check is off everywhere and the
 * forms rely on the spam trap + rate limit. Add the two keys in Vercel to switch it on, no code change.
 * Once a key is set, it is strict: a missing/fake token or Cloudflare being unreachable refuses the form.
 */
export const TURNSTILE_FIELD = "cf-turnstile-response";
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** On only when BOTH keys are set: with just the secret, the page would show no widget and every form would fail. */
export function turnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export type TurnstileResult = "ok" | "failed" | "unavailable";

export async function verifyTurnstile(token: string | null): Promise<TurnstileResult> {
  if (!turnstileConfigured()) return "ok"; // switched off: no keys set
  const secret = requireEnv("TURNSTILE_SECRET_KEY");

  // Tokens are at most 2048 characters; anything else is not a real token.
  if (!token || token.length > 2048) return "failed";

  const body = new URLSearchParams({ secret, response: token });

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (!res.ok) return "unavailable";
    const data = (await res.json()) as { success?: boolean };
    return data.success === true ? "ok" : "failed";
  } catch {
    // Cloudflare unreachable or slow: tell the visitor to retry / call, don't let it through.
    return "unavailable";
  }
}
