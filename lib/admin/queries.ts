import "server-only";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { uuid } from "@/lib/admin/fields";
import { LEAD_KINDS, LEAD_STATUSES } from "@/lib/admin/schemas";
import { inPublicCatalog } from "@/data/models";
import { MODEL_COLUMNS, type AuditRow, type BannerSlideRow, type BrandRow, type HeroVideoRow, type LeadRow, type LeadStatus, type ModelRow } from "@/lib/data/rows";

/**
 * Admin reads. Each starts with requireAdmin() and runs as the admin (Row Level Security),
 * so drafts are visible here but never on the public site. Not cached: admins always see
 * the current data.
 */

function fail(what: string, error: { message: string }): never {
  throw new Error(`[admin] could not load ${what}: ${error.message}`);
}

/** Unknown or malformed id in the URL → 404 (never a database error). */
async function byId<T>(table: string, columns: string, id: string): Promise<T> {
  if (!uuid.safeParse(id).success) notFound();
  const { db } = await requireAdmin();
  const { data, error } = await db.from(table).select(columns).eq("id", id).maybeSingle();
  if (error) fail(table, error);
  if (!data) notFound();
  return data as T;
}

export async function listModels(): Promise<ModelRow[]> {
  const { db } = await requireAdmin();
  const { data, error } = await db.from("models").select(MODEL_COLUMNS).order("sort").order("created_at");
  if (error) fail("models", error);
  // Only the NAS line (CATALOG_BRANDS, no ATVs), as on the site. The other brands stay in the database, hidden.
  return (data as ModelRow[]).filter(inPublicCatalog);
}
export const getModelRow = (id: string) => byId<ModelRow>("models", MODEL_COLUMNS, id);


const BRAND_COLUMNS = "id, name, logo_path, sort, published";
export async function listBrands(): Promise<BrandRow[]> {
  const { db } = await requireAdmin();
  const { data, error } = await db.from("brands").select(BRAND_COLUMNS).order("sort").order("name");
  if (error) fail("brands", error);
  return data as BrandRow[];
}


export async function getBanner(): Promise<{ video: HeroVideoRow | null; slides: BannerSlideRow[] }> {
  const { db } = await requireAdmin();
  const [video, slides] = await Promise.all([
    db.from("hero_video").select("id, video_path, poster_path, duration").maybeSingle(),
    db.from("banner_slides").select("id, start_seconds, label, sort").order("start_seconds"),
  ]);
  if (video.error) fail("hero video", video.error);
  if (slides.error) fail("banner slides", slides.error);
  return { video: video.data as HeroVideoRow | null, slides: slides.data as BannerSlideRow[] };
}

// ─────────────────────────────────────────── leads

const LEAD_COLUMNS = "id, kind, name, email, phone, model_slug, data, status, note, created_at, updated_at";
export const LEADS_PAGE_SIZE = 50;

export interface LeadFilters {
  kind?: (typeof LEAD_KINDS)[number];
  status?: LeadStatus;
  page: number;
}

/** Read the list filters from the URL, ignoring anything unknown. */
export function parseLeadFilters(params: Record<string, string | string[] | undefined>): LeadFilters {
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const kind = one(params.lloji);
  const status = one(params.statusi);
  const page = Number.parseInt(one(params.faqja) ?? "1", 10);
  return {
    kind: (LEAD_KINDS as readonly string[]).includes(kind ?? "") ? (kind as LeadFilters["kind"]) : undefined,
    status: (LEAD_STATUSES as readonly string[]).includes(status ?? "") ? (status as LeadStatus) : undefined,
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 1000) : 1,
  };
}

export async function listLeads(filters: LeadFilters): Promise<{ rows: LeadRow[]; total: number }> {
  const { db } = await requireAdmin();
  const from = (filters.page - 1) * LEADS_PAGE_SIZE;
  let query = db.from("leads").select(LEAD_COLUMNS, { count: "exact" }).order("created_at", { ascending: false });
  if (filters.kind) query = query.eq("kind", filters.kind);
  if (filters.status) query = query.eq("status", filters.status);
  const { data, error, count } = await query.range(from, from + LEADS_PAGE_SIZE - 1);
  if (error) fail("leads", error);
  return { rows: data as LeadRow[], total: count ?? 0 };
}
export const getLeadRow = (id: string) => byId<LeadRow>("leads", LEAD_COLUMNS, id);

// ─────────────────────────────────────────── dashboard, history

export async function getDashboard() {
  const { db } = await requireAdmin();
  const head = { count: "exact" as const, head: true };
  const [newLeads, models, latest] = await Promise.all([
    db.from("leads").select("id", head).eq("status", "new"),
    db.from("models").select("brand, type"),
    db.from("leads").select(LEAD_COLUMNS).order("created_at", { ascending: false }).limit(8),
  ]);
  for (const r of [newLeads, models, latest]) if (r.error) fail("dashboard", r.error);
  return {
    newLeads: newLeads.count ?? 0,
    models: ((models.data ?? []) as Pick<ModelRow, "brand" | "type">[]).filter(inPublicCatalog).length,
    latest: latest.data as LeadRow[],
  };
}

export async function listHistory(): Promise<AuditRow[]> {
  const { db } = await requireAdmin();
  const { data, error } = await db.from("audit_log").select("id, actor, action, entity, entity_id, details, created_at").order("created_at", { ascending: false }).limit(200);
  if (error) fail("audit log", error);
  return data as AuditRow[];
}
