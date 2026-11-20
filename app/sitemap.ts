import type { MetadataRoute } from "next";
import { brandSlug } from "@/data/home";
import { getAccessories, getBrands, getModels, getPosts } from "@/lib/data/catalog";
import { SITE_URL, STATIC_PAGES } from "@/lib/site";

// Only published content is listed (the getters filter drafts). No lastModified yet: the
// public getters don't carry dates; add them from the rows' updated_at when needed.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [models, accessories, brands, posts] = await Promise.all([getModels(), getAccessories(), getBrands(), getPosts()]);
  return [
    ...STATIC_PAGES.map(({ path, priority }) => ({ url: `${SITE_URL}${path}`, priority })),
    ...models.map((m) => ({ url: `${SITE_URL}/modelet/${m.slug}`, priority: 0.8 })),
    ...accessories.map((a) => ({ url: `${SITE_URL}/aksesoret/${a.slug}`, priority: 0.6 })),
    ...brands.map((b) => ({ url: `${SITE_URL}/brendet/${brandSlug(b.name)}`, priority: 0.5 })),
    ...posts.map((p) => ({ url: `${SITE_URL}/nas-world/${p.slug}`, priority: 0.5 })),
  ];
}
