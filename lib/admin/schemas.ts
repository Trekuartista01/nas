import { z } from "zod";
import {
  checkbox,
  choice,
  decimal,
  int,
  jsonArray,
  mediaPath,
  optionalDate,
  optionalText,
  requiredMediaPath,
  slug,
  tagList,
  text,
} from "@/lib/admin/fields";

/**
 * Server-side validation for each admin form. Keys are database column names, so a parsed
 * result can be written as-is. Limits mirror the CHECK constraints in supabase/migrations.
 */

export const VEHICLE_TYPES = ["sport", "dirt", "scooter", "atv"] as const;
export const LICENCES = ["AM", "A1", "A2", "A"] as const;
export const ACCESSORY_CATEGORIES = ["kaska", "veshje", "doreza-cizme", "pjese"] as const;
export const POST_KINDS = ["event", "lajme", "model", "keshilla"] as const;
export const LEAD_KINDS = ["offer", "testRide", "service", "finance", "contact"] as const;
export const LEAD_STATUSES = ["new", "contacted", "closed"] as const;

const price = int("çmimin", 0, 1_000_000);
const sort = int("renditjen", -10_000, 10_000);

export const modelSchema = z.object({
  slug,
  brand: text("markën", 60),
  name: text("emrin", 80),
  type: choice(VEHICLE_TYPES, "Zgjidh llojin."),
  cc: int("kubikazhin", 1, 3000),
  licence: choice(LICENCES, "Zgjidh patentën."),
  price,
  is_new: checkbox,
  image_path: mediaPath,
  sort,
  published: checkbox,
});

const spec = z.object({
  value: z.string().trim().min(1, { error: "Specifikimet: plotëso vlerën." }).max(30),
  unit: z.string().trim().max(15),
  label: z.string().trim().min(1, { error: "Specifikimet: plotëso emërtimin." }).max(30),
});

const colour = z.object({
  name: z.string().trim().min(1, { error: "Ngjyrat: plotëso emrin." }).max(40),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: "Ngjyrat: kodi duhet të jetë si #0a0a0a." }),
});

export const accessorySchema = z.object({
  slug,
  brand: text("markën", 60),
  name: text("emrin", 80),
  category: choice(ACCESSORY_CATEGORIES, "Zgjidh kategorinë."),
  price,
  is_new: checkbox,
  image_path: mediaPath,
  cutout: checkbox,
  meta: optionalText("përshkrimin e shkurtër", 80),
  tags: tagList,
  specs: jsonArray(spec, 12, "Specifikimet"),
  colours: jsonArray(colour, 12, "Ngjyrat"),
  sort,
  published: checkbox,
});

export const brandSchema = z.object({
  name: text("emrin", 60),
  logo_path: mediaPath,
  sort,
  published: checkbox,
});

export const postSchema = z.object({
  slug: slug.pipe(z.string().max(100)),
  kind: choice(POST_KINDS, "Zgjidh llojin."),
  tag: optionalText("etiketën", 40),
  title: text("titullin", 140),
  excerpt: optionalText("përmbledhjen", 300),
  body: optionalText("tekstin", 20_000),
  image_path: mediaPath,
  event_date: optionalDate,
  featured: checkbox,
  published: checkbox,
});

export const leadUpdateSchema = z.object({
  status: choice(LEAD_STATUSES, "Zgjidh statusin."),
  note: optionalText("shënimin", 2000),
});

export const heroVideoSchema = z.object({
  video_path: requiredMediaPath("Ngarko videon."),
  poster_path: requiredMediaPath("Ngarko foton e posterit."),
  duration: decimal("kohëzgjatjen", 0.1, 600),
});

export const bannerSlideSchema = z.object({
  start_seconds: z.number({ error: "Sekonda e fillimit mungon." }).min(0).max(600),
  label: z.string().trim().min(1, { error: "Çdo pjesë ka nevojë për një emërtim." }).max(60, { error: "Emërtimi: deri në 60 shenja." }),
});

export const bannerSlidesSchema = jsonArray(bannerSlideSchema, 12, "Pjesët e videos").pipe(
  z.array(bannerSlideSchema).min(1, { error: "Shto të paktën një pjesë." }),
);
