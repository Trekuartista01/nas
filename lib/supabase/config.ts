/**
 * Supabase connection settings that are NOT secret (safe in the browser):
 *   NEXT_PUBLIC_SUPABASE_URL              https://<project>.supabase.co
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  sb_publishable_… (Row Level Security decides what it can do)
 * The secret key (SUPABASE_SECRET_KEY) is read only in lib/supabase/service.ts.
 *
 * Until these are set, the public site runs on the local catalog in data/*.ts and the admin
 * panel shows a "not connected" screen. Nothing else changes.
 */
export interface SupabasePublicConfig {
  url: string;
  key: string;
}

export function supabasePublicConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

export function supabaseConfigured(): boolean {
  return supabasePublicConfig() !== null;
}

export const STORAGE_BUCKETS = {
  /** Photos: models, accessories, brands, posts. 5 MB, jpeg/png/webp/avif. */
  media: "media",
  /** Hero video + poster. 50 MB, mp4/webm. */
  videos: "videos",
} as const;
export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

/**
 * Public URL for a stored file.
 * Paths starting with "/" are files in /public (the current photos, seeded as-is) and are returned unchanged.
 * Anything else is a path inside a Supabase Storage bucket.
 */
export function mediaUrl(path: string | null | undefined, bucket: StorageBucket = "media"): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("/")) return path;
  const config = supabasePublicConfig();
  if (!config) return undefined;
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${config.url}/storage/v1/object/public/${bucket}/${encoded}`;
}
