/**
 * Database row shapes (supabase/migrations) and their mapping to the site's own types.
 * The mapping is the only place that knows column names, so the components keep using
 * the same Model / Accessory / Brand types as the local catalog in data/*.ts.
 */
import type { Accessory, AccessoryCategory, AccessoryColour, AccessorySpec } from "@/data/accessories";
import type { Brand, HeroSlide } from "@/data/home";
import type { Licence, Model, VehicleType } from "@/data/models";
import { mediaUrl } from "@/lib/supabase/config";

export interface BrandRow {
  id: string;
  name: string;
  logo_path: string | null;
  sort: number;
  published: boolean;
}

export interface ModelRow {
  id: string;
  slug: string;
  brand: string;
  name: string;
  type: VehicleType;
  cc: number;
  licence: Licence;
  price: number;
  is_new: boolean;
  image_path: string | null;
  sort: number;
  published: boolean;
  updated_at: string;
}

export interface AccessoryRow {
  id: string;
  slug: string;
  brand: string;
  name: string;
  category: AccessoryCategory;
  price: number;
  is_new: boolean;
  image_path: string | null;
  cutout: boolean;
  meta: string;
  tags: string[];
  specs: AccessorySpec[];
  colours: AccessoryColour[];
  sort: number;
  published: boolean;
  updated_at: string;
}

export type PostKind = "event" | "lajme" | "model" | "keshilla";

export interface PostRow {
  id: string;
  slug: string;
  kind: PostKind;
  tag: string;
  title: string;
  excerpt: string;
  body: string;
  image_path: string | null;
  event_date: string | null;
  featured: boolean;
  published: boolean;
  published_at: string | null;
  updated_at: string;
}

export interface HeroVideoRow {
  id: 1;
  video_path: string;
  poster_path: string;
  duration: number | string; // numeric comes back as a string from PostgREST
}

export interface BannerSlideRow {
  id: string;
  start_seconds: number | string;
  label: string;
  sort: number;
}

export type LeadStatus = "new" | "contacted" | "closed";

export interface LeadRow {
  id: string;
  kind: "offer" | "testRide" | "service" | "finance" | "contact";
  name: string | null;
  email: string | null;
  phone: string | null;
  model_slug: string | null;
  data: Record<string, unknown>;
  status: LeadStatus;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriberRow {
  id: string;
  email: string;
  created_at: string;
  unsubscribed_at: string | null;
}

export interface AuditRow {
  id: number;
  actor: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  entity: string;
  entity_id: string | null;
  details: { changed?: string[]; label?: string | null };
  created_at: string;
}

export const MODEL_COLUMNS = "id, slug, brand, name, type, cc, licence, price, is_new, image_path, sort, published, updated_at";
export const ACCESSORY_COLUMNS =
  "id, slug, brand, name, category, price, is_new, image_path, cutout, meta, tags, specs, colours, sort, published, updated_at";
export const POST_COLUMNS = "id, slug, kind, tag, title, excerpt, body, image_path, event_date, featured, published, published_at, updated_at";

export function toModel(r: ModelRow): Model {
  return {
    slug: r.slug,
    brand: r.brand,
    name: r.name,
    type: r.type,
    cc: r.cc,
    licence: r.licence,
    price: r.price,
    isNew: r.is_new,
    image: mediaUrl(r.image_path),
  };
}

const CATEGORY_TAGS: Record<AccessoryCategory, string[]> = {
  kaska: ["accessory", "helmet"],
  veshje: ["accessory", "apparel"],
  "doreza-cizme": ["accessory", "apparel"],
  pjese: ["accessory", "parts"],
};

export function toAccessory(r: AccessoryRow): Accessory {
  // Category and "new" search groups are added here, like item() does for the local catalog.
  const tags = Array.from(new Set([...CATEGORY_TAGS[r.category], ...r.tags, ...(r.is_new ? ["new"] : [])]));
  return {
    slug: r.slug,
    brand: r.brand,
    name: r.name,
    category: r.category,
    price: r.price,
    isNew: r.is_new,
    image: mediaUrl(r.image_path),
    cutout: r.cutout,
    meta: r.meta,
    tags,
    specs: Array.isArray(r.specs) ? r.specs : [],
    colours: Array.isArray(r.colours) ? r.colours : [],
  };
}

export function toBrand(r: BrandRow): Brand {
  return { name: r.name, logo: mediaUrl(r.logo_path) };
}

export function toSlide(r: BannerSlideRow): HeroSlide {
  return { start: Number(r.start_seconds), label: r.label };
}
