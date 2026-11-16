import type { MetadataRoute } from "next";
import { accessories } from "@/data/accessories";
import { SITE_URL, STATIC_PAGES } from "@/lib/site";

// No lastModified yet: the local data has no dates. Supabase rows will provide updated_at.
// Model pages (/modelet/[slug]) get added here when that page is built.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_PAGES.map(({ path, priority }) => ({ url: `${SITE_URL}${path}`, priority })),
    ...accessories.map((a) => ({ url: `${SITE_URL}/aksesoret/${a.slug}`, priority: 0.6 })),
  ];
}
