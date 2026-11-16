import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { accessories } from "@/data/accessories";
import { ADMIN_PATHS } from "@/lib/admin/paths";
import { supabasePublicConfig } from "@/lib/supabase/config";

/**
 * Runs before rendering, for two jobs:
 *
 * 1. Real 404 status for unknown product URLs.
 *    Detail pages read the slug inside <Suspense>, so a page-level notFound() would stream with a 200.
 *    Checking the slug here, before rendering starts, lets an unknown URL return a true 404.
 *    Keep this check cheap: a set lookup only (later: a cached slug list from Supabase).
 *
 * 2. Admin panel (/admin/*): refreshes the Supabase session cookie and sends signed-out
 *    visitors to the login page. This is only a fast, optimistic check; the real one
 *    (valid session AND listed admin) runs on the server in lib/admin/auth.ts.
 */
const ACCESSORY_SLUGS = new Set(accessories.map((a) => a.slug));

// Any path no route matches renders app/not-found.tsx with a 404 status.
const NOT_FOUND_PATH = "/__nuk-u-gjet";
const ADMIN_LOGIN_PATH = ADMIN_PATHS.login;

export async function proxy(request: NextRequest) {
  const [, section, slug, ...rest] = request.nextUrl.pathname.split("/");

  if (section === "admin") return adminSession(request);

  if (section === "aksesoret" && slug && rest.length === 0) {
    let decoded = slug;
    try {
      decoded = decodeURIComponent(slug);
    } catch {
      // malformed escape sequence: treat as unknown
    }
    if (!ACCESSORY_SLUGS.has(decoded)) {
      return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
    }
  }
  return NextResponse.next();
}

async function adminSession(request: NextRequest): Promise<NextResponse> {
  const config = supabasePublicConfig();
  // Not connected yet: the panel itself shows a "not connected" screen.
  if (!config) return NextResponse.next();

  let response = NextResponse.next({ request });
  const db = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });
  // Validates the token and refreshes it when it is about to expire (new cookies via setAll).
  const { data } = await db.auth.getClaims();
  let signedIn = Boolean(data?.claims?.sub);
  const onLogin = request.nextUrl.pathname === ADMIN_LOGIN_PATH;

  // ?dil=1 ("sign out"): sent by lib/admin/auth.ts when a session exists but is not an admin
  // (e.g. removed from public.admins). Clearing it here stops a /admin ⇄ login redirect loop.
  if (onLogin && signedIn && request.nextUrl.searchParams.has("dil")) {
    await db.auth.signOut({ scope: "local" });
    signedIn = false;
  }

  if (!signedIn && !onLogin) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_LOGIN_PATH;
    url.search = "";
    return withCookies(NextResponse.redirect(url), response);
  }
  if (signedIn && onLogin) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_PATHS.home;
    url.search = "";
    return withCookies(NextResponse.redirect(url), response);
  }
  // Admin pages are per user: never store them in a shared cache.
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

/** A redirect must carry any refreshed session cookies, or the browser keeps the old ones. */
function withCookies(target: NextResponse, source: NextResponse): NextResponse {
  for (const cookie of source.cookies.getAll()) target.cookies.set(cookie);
  return target;
}

export const config = {
  matcher: ["/aksesoret/:slug", "/admin", "/admin/:path*"],
};
