/**
 * Security headers sent with every response (wired in next.config.ts).
 *
 * Content-Security-Policy: the "without nonces" variant from the Next.js CSP guide.
 * A nonce-based CSP would force every page to render per request and turn off the static /
 * partial prerendering this site relies on, so Next's own inline scripts are allowed instead.
 * Everything else is locked to our own domain.
 *
 * When a new outside service is added, allow ONLY its host, in the directive it needs:
 *   - Supabase:                 added automatically from NEXT_PUBLIC_SUPABASE_URL (below):
 *                               connect-src (admin login + uploads), img-src + media-src (Storage files)
 *   - Cloudflare Turnstile:     script-src + frame-src https://challenges.cloudflare.com   (added, step 14)
 *   - Google Maps embed:        frame-src https://www.google.com
 */
const isDev = process.env.NODE_ENV === "development";

/** Origin of the Supabase project (https://<project>.supabase.co), or nothing while it isn't set. */
function supabaseOrigin(): string[] {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return [];
  try {
    return [new URL(raw).origin];
  } catch {
    return [];
  }
}
const supabase = supabaseOrigin();

const csp: Record<string, string[]> = {
  "default-src": ["'self'"],
  // 'unsafe-eval' only in dev: Turbopack's hot reload needs it.
  // challenges.cloudflare.com: Turnstile spam check on the forms.
  "script-src": ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com", ...(isDev ? ["'unsafe-eval'"] : [])],
  // Framer Motion and Next set inline style attributes.
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:", ...supabase],
  "media-src": ["'self'", ...supabase],
  "font-src": ["'self'"],
  "connect-src": ["'self'", ...supabase],
  "frame-src": ["https://challenges.cloudflare.com"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  // Production only: on http://localhost it would rewrite asset URLs to https and break the preview.
  ...(isDev ? {} : { "upgrade-insecure-requests": [] }),
};

const cspValue = Object.entries(csp)
  .map(([directive, sources]) => [directive, ...sources].join(" "))
  .join("; ");

export const securityHeaders = [
  { key: "Content-Security-Policy", value: cspValue },
  // Browsers only honour this over HTTPS (ignored on localhost). 2 years, as recommended.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Older browsers' version of frame-ancestors 'none': the site can't be embedded (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site uses none of these browser features; deny them to any embedded content too.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=(), browsing-topics=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];
