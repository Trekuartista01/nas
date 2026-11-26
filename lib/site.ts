/**
 * Public address of the site, used for absolute URLs (sitemap, robots, social previews).
 *
 * Set SITE_URL (e.g. https://www.example.com) once the domain is chosen. It is not a secret.
 * On Vercel the production domain is picked up automatically until then; locally it is localhost.
 */
export const SITE_URL = resolveSiteUrl();

function resolveSiteUrl(): string {
  // An empty `SITE_URL=` line (as copied from .env.example) counts as not set.
  const configured = process.env.SITE_URL?.trim();
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const url = (configured || (vercel ? `https://${vercel}` : "http://localhost:3000")).replace(/\/$/, "");
  if (!URL.canParse(url)) {
    throw new Error(`SITE_URL must be a full address like https://www.example.com (got "${url}"). Check .env.local or the Vercel settings.`);
  }
  return url;
}

/**
 * Public pages that exist today. Add each inner page here when it is built,
 * so the sitemap never lists a URL that returns 404.
 */
export const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/modelet", priority: 0.9 },
  { path: "/aksesoret", priority: 0.8 },
  { path: "/gjej-motorin", priority: 0.7 },
  { path: "/nas-world", priority: 0.6 },
  { path: "/rreth-nesh", priority: 0.6 },
  { path: "/sport-line", priority: 0.7 },
];

export const SITE_NAME = "NAS";
export const SITE_TITLE = "NAS — Motorë dhe skuterë";
export const SITE_DESCRIPTION =
  "NAS: motorë dhe skuterë NAS. Test ride falas dhe pjesë origjinale.";

/** Link-preview defaults (home page and layout). */
export const OPEN_GRAPH_DEFAULTS = {
  type: "website" as const,
  siteName: SITE_NAME,
  locale: "sq_AL",
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

const DEFAULT_SHARE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: SITE_TITLE };

interface PageMetaInput {
  /** Short page title; the layout adds " — NAS". */
  title: string;
  description: string;
  /** Path of the page, e.g. "/modelet". Becomes the canonical URL (query strings like ?kategoria= are dropped). */
  path: string;
  /** Page-specific share image (e.g. the product photo). Without it, app/opengraph-image.tsx is used. */
  image?: { url: string; alt: string };
}

/**
 * Metadata for one page: title, description, canonical URL and link-preview tags.
 * Next.js merges `openGraph` shallowly, so the shared fields are repeated here on purpose.
 */
export function pageMetadata({ title, description, path, image }: PageMetaInput) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...OPEN_GRAPH_DEFAULTS,
      title: `${title} — ${SITE_NAME}`,
      description,
      url: path,
      // A page-level openGraph hides the inherited app/opengraph-image, so it is linked explicitly.
      images: [image ?? DEFAULT_SHARE_IMAGE],
    },
  };
}
