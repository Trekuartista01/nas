import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { accessories as localAccessories, type Accessory } from "@/data/accessories";
import { brands as localBrands, heroVideo as localHero, worldTiles as localWorld, type Brand, type HeroSlide } from "@/data/home";
import { inPublicCatalog, models as localModels, type Model } from "@/data/models";
import {
  ACCESSORY_COLUMNS,
  MODEL_COLUMNS,
  POST_COLUMNS,
  toAccessory,
  toBrand,
  toModel,
  toSlide,
  type AccessoryRow,
  type BannerSlideRow,
  type BrandRow,
  type HeroVideoRow,
  type ModelRow,
  type PostRow,
} from "@/lib/data/rows";
import { mediaUrl } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Public site data (step 21). Every getter is cached ('use cache') and tagged, so pages stay
 * prerendered and fast; an admin save calls updateTag(<tag>) and the next visit gets fresh data.
 *
 * Without Supabase settings (local development today) the getters return the local catalog in
 * data/*.ts, so the site works the same before and after the database is connected.
 * Drafts are filtered here AND by Row Level Security (belt and braces).
 * With Supabase, a failed query throws: the visitor sees the error page instead of an empty catalog.
 */
export const CACHE_TAGS = {
  models: "models",
  accessories: "accessories",
  brands: "brands",
  posts: "posts",
  hero: "hero",
} as const;
export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

function fail(what: string, error: { message: string }): never {
  throw new Error(`[data] could not load ${what}: ${error.message}`);
}

export async function getModels(): Promise<Model[]> {
  "use cache";
  cacheTag(CACHE_TAGS.models);
  cacheLife("hours");
  const db = createPublicClient();
  if (!db) return localModels.filter(inPublicCatalog);
  const { data, error } = await db.from("models").select(MODEL_COLUMNS).eq("published", true).order("sort").order("created_at");
  if (error) fail("models", error);
  return (data as ModelRow[]).map(toModel).filter(inPublicCatalog);
}

export async function getModel(slug: string): Promise<Model | undefined> {
  return (await getModels()).find((m) => m.slug === slug);
}

export async function getAccessories(): Promise<Accessory[]> {
  "use cache";
  cacheTag(CACHE_TAGS.accessories);
  cacheLife("hours");
  const db = createPublicClient();
  if (!db) return localAccessories;
  const { data, error } = await db.from("accessories").select(ACCESSORY_COLUMNS).eq("published", true).order("sort").order("created_at");
  if (error) fail("accessories", error);
  return (data as AccessoryRow[]).map(toAccessory);
}

export async function getAccessory(slug: string): Promise<Accessory | undefined> {
  return (await getAccessories()).find((a) => a.slug === slug);
}

export async function getBrands(): Promise<Brand[]> {
  "use cache";
  cacheTag(CACHE_TAGS.brands);
  cacheLife("hours");
  const db = createPublicClient();
  if (!db) return localBrands;
  const { data, error } = await db.from("brands").select("id, name, logo_path, sort, published").eq("published", true).order("sort").order("name");
  if (error) fail("brands", error);
  return (data as BrandRow[]).map(toBrand);
}

export interface HeroVideo {
  src: string;
  poster: string;
  duration: number;
  slides: HeroSlide[];
}

export async function getHeroVideo(): Promise<HeroVideo> {
  "use cache";
  cacheTag(CACHE_TAGS.hero);
  cacheLife("hours");
  const db = createPublicClient();
  if (!db) return localHero;
  const [video, slides] = await Promise.all([
    db.from("hero_video").select("id, video_path, poster_path, duration").maybeSingle(),
    db.from("banner_slides").select("id, start_seconds, label, sort").order("start_seconds"),
  ]);
  if (video.error) fail("hero video", video.error);
  if (slides.error) fail("banner slides", slides.error);
  const row = video.data as HeroVideoRow | null;
  const slideList = (slides.data as BannerSlideRow[]).map(toSlide);
  // Not set up in the admin yet: keep the current video rather than show an empty hero.
  if (!row || slideList.length === 0) return localHero;
  return {
    src: mediaUrl(row.video_path, "videos") ?? localHero.src,
    // The poster is a photo, so it lives in the media bucket (the videos bucket only accepts video files).
    poster: mediaUrl(row.poster_path) ?? localHero.poster,
    duration: Number(row.duration),
    slides: slideList,
  };
}

export interface WorldTile {
  tag: string;
  title: string;
  text?: string;
  image?: string;
}

/**
 * Homepage "NAS World" tiles: one feature + three small.
 * Featured posts first, then the newest. While fewer than 4 posts are published, the remaining
 * tiles keep the current placeholders so the grid never has holes.
 */
export async function getWorldTiles(): Promise<{ feature: WorldTile; small: [WorldTile, WorldTile, WorldTile] }> {
  "use cache";
  cacheTag(CACHE_TAGS.posts);
  cacheLife("hours");
  const db = createPublicClient();
  if (!db) return localWorld as { feature: WorldTile; small: [WorldTile, WorldTile, WorldTile] };
  const { data, error } = await db
    .from("posts")
    .select(POST_COLUMNS)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(4);
  if (error) fail("posts", error);
  const tiles: WorldTile[] = (data as PostRow[]).map((p) => ({
    tag: p.tag,
    title: p.title,
    text: p.excerpt,
    image: mediaUrl(p.image_path),
  }));
  const feature = tiles[0] ?? localWorld.feature;
  const rest = tiles.slice(1);
  const small = [0, 1, 2].map((i) => rest[i] ?? localWorld.small[i]) as [WorldTile, WorldTile, WorldTile];
  return { feature, small };
}

export interface Post {
  slug: string;
  kind: PostRow["kind"];
  tag: string;
  title: string;
  excerpt: string;
  /** Plain text; blank lines separate paragraphs. */
  body: string;
  image?: string;
  eventDate?: string;
  publishedAt?: string;
}

const toPost = (p: PostRow): Post => ({
  slug: p.slug,
  kind: p.kind,
  tag: p.tag,
  title: p.title,
  excerpt: p.excerpt,
  body: p.body,
  image: mediaUrl(p.image_path),
  eventDate: p.event_date ?? undefined,
  publishedAt: p.published_at ?? undefined,
});

/** Published NAS World posts, newest first. No local fallback: posts only exist in the database. */
export async function getPosts(): Promise<Post[]> {
  "use cache";
  cacheTag(CACHE_TAGS.posts);
  cacheLife("hours");
  const db = createPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("posts")
    .select(POST_COLUMNS)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) fail("posts", error);
  return (data as PostRow[]).map(toPost);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getPosts()).find((p) => p.slug === slug);
}
