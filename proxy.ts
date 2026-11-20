import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { accessories } from "@/data/accessories";
import { brands, brandSlug } from "@/data/home";
import { inPublicCatalog, models, type Model } from "@/data/models";
import { ADMIN_PATHS } from "@/lib/admin/paths";
import { supabasePublicConfig } from "@/lib/supabase/config";

/**
 * Runs before rendering, for two jobs:
 *
 * 1. Real 404 status for unknown product URLs.
 *    Detail pages read the slug inside <Suspense>, so a page-level notFound() would stream with a 200.
 *    Checking the slug here, before rendering starts, lets an unknown URL return a true 404.
 *    The lists of published slugs are kept in memory (see isKnownSlug below), so most requests
 *    are a set lookup with no database call.
 *
 * 2. Admin panel (/admin/*): refreshes the Supabase session cookie and sends signed-out
 *    visitors to the login page. This is only a fast, optimistic check; the real one
 *    (valid session AND listed admin) runs on the server in lib/admin/auth.ts.
 */
/**
 * Detail-page sections checked here: URL section → table, the column that makes the URL
 * (brands have no slug: their URL comes from the name), plus the local fallback list.
 */
const CATALOGS: Record<string, { table: string; column: "slug" | "name"; local: Set<string> }> = {
  aksesoret: { table: "accessories", column: "slug", local: new Set(accessories.map((a) => a.slug)) },
  modelet: { table: "models", column: "slug", local: new Set(models.filter(inPublicCatalog).map((m) => m.slug)) },
  brendet: { table: "brands", column: "name", local: new Set(brands.map((b) => brandSlug(b.name))) },
  // Posts exist only in the database; without it the list is empty.
  "nas-world": { table: "posts", column: "slug", local: new Set() },
};
type Section = string;
const isCatalogSection = (s: string): s is Section => Object.hasOwn(CATALOGS, s);

const SLUGS_MAX_AGE_MS = 5 * 60_000;
/** An unknown slug triggers a reload (a product just added in the admin), but at most this often. */
const SLUGS_MIN_RELOAD_MS = 10_000;

const slugCache = new Map<Section, { slugs: Set<string>; loadedAt: number }>();
const slugLoads = new Map<Section, Promise<void>>();

async function loadSlugs(section: Section): Promise<void> {
  const { table, column, local } = CATALOGS[section];
  const config = supabasePublicConfig();
  if (!config) {
    slugCache.set(section, { slugs: local, loadedAt: Date.now() });
    return;
  }
  // Models: only the brands/types the public catalog shows (inPublicCatalog), so hidden ones 404.
  const select = table === "models" ? "slug,brand,type" : column;
  const res = await fetch(`${config.url}/rest/v1/${table}?select=${select}&published=eq.true`, {
    headers: { apikey: config.key },
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) throw new Error(`status ${res.status}`);
  let rows = (await res.json()) as Record<string, string>[];
  if (table === "models") rows = rows.filter((r) => inPublicCatalog({ brand: r.brand ?? "", type: r.type as Model["type"] }));
  const slugs = rows.map((r) => (column === "name" ? brandSlug(r.name) : r.slug));
  slugCache.set(section, { slugs: new Set(slugs), loadedAt: Date.now() });
}

/**
 * Is this a published product? `null` = could not tell (database unreachable): the page then
 * renders and shows "not found" itself if needed, so a hiccup never hides real products.
 */
async function isKnownSlug(section: Section, slug: string): Promise<boolean | null> {
  const cached = slugCache.get(section);
  const age = cached ? Date.now() - cached.loadedAt : Infinity;
  const stale = age > SLUGS_MAX_AGE_MS;
  const missing = cached !== undefined && !cached.slugs.has(slug) && age > SLUGS_MIN_RELOAD_MS;
  if (stale || missing) {
    let load = slugLoads.get(section);
    if (!load) {
      load = loadSlugs(section)
        .catch((error) => console.error(`[proxy] ${section} slugs unavailable:`, error instanceof Error ? error.message : error))
        .finally(() => slugLoads.delete(section));
      slugLoads.set(section, load);
    }
    await load;
  }
  const current = slugCache.get(section);
  return current ? current.slugs.has(slug) : null;
}

// Any path no route matches renders app/not-found.tsx with a 404 status.
const NOT_FOUND_PATH = "/__nuk-u-gjet";
const ADMIN_LOGIN_PATH = ADMIN_PATHS.login;

export async function proxy(request: NextRequest) {
  const [, section, slug, ...rest] = request.nextUrl.pathname.split("/");

  if (section === "admin") return adminSession(request);

  if (isCatalogSection(section) && slug && rest.length === 0) {
    let decoded = slug;
    try {
      decoded = decodeURIComponent(slug);
    } catch {
      // malformed escape sequence: treat as unknown
    }
    if ((await isKnownSlug(section, decoded)) === false) {
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
  matcher: ["/aksesoret/:slug", "/modelet/:slug", "/brendet/:slug", "/nas-world/:slug", "/admin", "/admin/:path*"],
};
