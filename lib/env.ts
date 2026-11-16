import "server-only";

/**
 * Server-only secrets (SMTP, Turnstile, Supabase service key...).
 *
 * - `import "server-only"` makes the build FAIL if a client component ever imports this file,
 *   so a secret can never end up in the browser bundle.
 * - No fallback values: a missing secret throws a clear error at the moment it is needed,
 *   instead of silently sending mail with a default or empty password.
 * - Values live only in `.env.local` (local) and in Vercel's environment settings (production).
 *   `.env.example` lists the names.
 *
 * Variables starting with NEXT_PUBLIC_ are NOT secrets (they are copied into the browser code);
 * read those directly with process.env, never through this file.
 */
export type SecretName =
  | "SMTP_HOST"
  | "SMTP_PORT"
  | "SMTP_USER"
  | "SMTP_PASS"
  | "MAIL_FROM"
  | "MAIL_TO"
  | "TURNSTILE_SECRET_KEY"
  | "SUPABASE_SECRET_KEY";

export function requireEnv(name: SecretName): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    // Names only: never include a value in an error message or log.
    throw new Error(`Missing environment variable ${name}. Add it to .env.local (see .env.example) or to the Vercel project settings.`);
  }
  return value.trim();
}
