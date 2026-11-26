/**
 * Uploads the site's photos and videos from public/ to Supabase Storage, keeping their paths:
 *   public/nas-images/web/x.webp  ->  media  bucket: site/nas-images/web/x.webp
 *   public/videos/hero.mp4        ->  videos bucket: site/videos/hero.mp4
 * The site then loads them from Supabase (lib/media.ts → siteMedia). Safe to re-run: existing files
 * are overwritten (upsert), so after changing a photo in public/, run it again.
 *
 *   node scripts/upload-media.mjs            upload everything
 *   node scripts/upload-media.mjs --dry-run  list what would be uploaded
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY from .env.local (the secret key is only
 * used here, on this computer). Files the buckets don't accept (SVG, or over the size limit) are
 * listed and skipped; they keep being served from public/.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

process.loadEnvFile(".env.local");
const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
const KEY = process.env.SUPABASE_SECRET_KEY?.trim();
if (!URL_BASE || !KEY) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local");
const DRY = process.argv.includes("--dry-run");

/** Same folder in both buckets; keep in sync with SITE_PREFIX in lib/media.ts. */
const PREFIX = "site";
/** Bucket limits (supabase/migrations: storage.buckets). */
const BUCKETS = {
  media: { max: 5 * 1024 * 1024, types: { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif" } },
  videos: { max: 50 * 1024 * 1024, types: { ".mp4": "video/mp4", ".webm": "video/webm" } },
};

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const done = [];
const skipped = [];
const failed = [];

for await (const file of walk("public")) {
  const rel = path.relative("public", file).split(path.sep).join("/");
  const ext = path.extname(file).toLowerCase();
  const bucket = Object.entries(BUCKETS).find(([, b]) => ext in b.types);
  if (!bucket) {
    skipped.push(`${rel} (type not accepted)`);
    continue;
  }
  const [name, { max, types }] = bucket;
  const size = (await stat(file)).size;
  if (size > max) {
    skipped.push(`${rel} (${(size / 1048576).toFixed(1)} MB, over the ${max / 1048576} MB limit of "${name}")`);
    continue;
  }
  const key = `${PREFIX}/${rel}`;
  if (DRY) {
    done.push(`${name}/${key}`);
    continue;
  }
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  const res = await fetch(`${URL_BASE}/storage/v1/object/${name}/${encoded}`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": types[ext],
      "x-upsert": "true",
      "cache-control": "max-age=86400",
    },
    body: await readFile(file),
  });
  if (res.ok) done.push(`${name}/${key}`);
  else failed.push(`${rel}: ${res.status} ${(await res.text()).slice(0, 160)}`);
}

console.log(`${DRY ? "Would upload" : "Uploaded"}: ${done.length}`);
if (skipped.length) console.log(`Skipped (stay in public/):\n  ${skipped.join("\n  ")}`);
if (failed.length) {
  console.log(`Failed:\n  ${failed.join("\n  ")}`);
  process.exitCode = 1;
}
