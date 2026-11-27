/**
 * Responsive copies of the Sport Line night shot for the homepage intro (components/home/SportIntro.tsx):
 *   public/nas-images/sport-line-night.jpg  ->  public/nas-images/web/sport-line-night-{960,1280,1672}.{avif,webp,jpg}
 * Never enlarges (a smaller original caps the widths). Run it after replacing the photo, then upload the
 * copies with `node scripts/upload-media.mjs`.
 *
 *   node scripts/sport-night-images.mjs [path/to/source.jpg]
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = process.argv[2] ?? "public/nas-images/sport-line-night.jpg";
const OUT = "public/nas-images/web";
/** Keep in sync with WIDTHS in components/home/SportIntro.tsx. */
const WIDTHS = [960, 1280, 1672];

await mkdir(OUT, { recursive: true });
const { width: original } = await sharp(SRC).metadata();
for (const w of WIDTHS) {
  const base = sharp(SRC).rotate().resize({ width: Math.min(w, original), withoutEnlargement: true });
  const name = `${OUT}/sport-line-night-${w}`;
  await Promise.all([
    base.clone().avif({ quality: 52, effort: 6 }).toFile(`${name}.avif`),
    base.clone().webp({ quality: 74 }).toFile(`${name}.webp`),
    base.clone().jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(`${name}.jpg`),
  ]);
  console.log(`${name}.{avif,webp,jpg}`);
}
