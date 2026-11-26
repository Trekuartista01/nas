"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { dbError, deleteRow, fieldErrors, INVALID, readFields, saveRow, setPublished, type ContentTable } from "@/lib/admin/crud";
import { uuid } from "@/lib/admin/fields";
import type { AdminFormState } from "@/lib/admin/form-state";
import { ADMIN_PATHS } from "@/lib/admin/paths";
import { bannerSlidesSchema, heroVideoSchema, leadUpdateSchema, modelSchema } from "@/lib/admin/schemas";
import { CACHE_TAGS, type CacheTag } from "@/lib/data/catalog";

/**
 * Admin Server Actions. Every one is a public POST endpoint, so each starts with requireAdmin()
 * (inside the helpers) and validates its arguments, including ids bound on the page.
 */

const BAD_ID: AdminFormState = { status: "error", message: "Element i panjohur." };
const validId = (id: unknown): id is string => uuid.safeParse(id).success;
const optionalId = (id: unknown) => (id === undefined || id === null || id === "" ? undefined : id);

// Accessories, brands and posts left the admin (Nov 2026): only models are edited here now.
type AdminTable = Extract<ContentTable, "models">;
const TABLE_TAG: Record<AdminTable, CacheTag> = { models: CACHE_TAGS.models };
const TABLE_LIST: Record<AdminTable, string> = { models: ADMIN_PATHS.models };
const isTable = (t: unknown): t is AdminTable => typeof t === "string" && Object.hasOwn(TABLE_TAG, t);

// ─────────────────────────────────────────── save (create when id is undefined)

export async function saveModel(id: string | undefined, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const rowId = optionalId(id);
  if (rowId !== undefined && !validId(rowId)) return BAD_ID;
  return saveRow({ table: "models", schema: modelSchema, formData, id: rowId, tag: CACHE_TAGS.models, editPath: (x) => `${ADMIN_PATHS.models}/${x}` });
}

// ─────────────────────────────────────────── delete + publish (shared by the lists)

export async function deleteContent(table: ContentTable, id: string): Promise<AdminFormState> {
  if (!isTable(table) || !validId(id)) return BAD_ID;
  return deleteRow(table, id, TABLE_TAG[table], TABLE_LIST[table]);
}

export async function togglePublished(table: ContentTable, id: string, published: boolean): Promise<AdminFormState> {
  if (!isTable(table) || !validId(id) || typeof published !== "boolean") return BAD_ID;
  return setPublished(table, id, published, TABLE_TAG[table]);
}

// ─────────────────────────────────────────── leads

export async function updateLead(id: string, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  if (!validId(id)) return BAD_ID;
  const admin = await requireAdmin();
  const { values } = readFields(leadUpdateSchema.shape, formData);
  const parsed = leadUpdateSchema.safeParse(values);
  if (!parsed.success) return { ...INVALID, errors: fieldErrors(parsed.error) };
  const { error } = await admin.db.from("leads").update(parsed.data).eq("id", id);
  if (error) return dbError(error, "update lead");
  return { status: "success", message: "U ruajt." };
}

export async function setLeadStatus(id: string, status: string): Promise<AdminFormState> {
  if (!validId(id)) return BAD_ID;
  const parsed = leadUpdateSchema.shape.status.safeParse(status);
  if (!parsed.success) return BAD_ID;
  const admin = await requireAdmin();
  const { error } = await admin.db.from("leads").update({ status: parsed.data }).eq("id", id);
  if (error) return dbError(error, "lead status");
  return { status: "success", message: "Statusi u ndryshua." };
}

export async function deleteLead(id: string): Promise<AdminFormState> {
  if (!validId(id)) return BAD_ID;
  const admin = await requireAdmin();
  const { error } = await admin.db.from("leads").delete().eq("id", id);
  if (error) return dbError(error, "delete lead");
  redirect(ADMIN_PATHS.leads);
}

// ─────────────────────────────────────────── hero banner (video + cut points)

export async function saveBanner(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const { values, hasFile } = readFields({ ...heroVideoSchema.shape, slides: true }, formData);
  if (hasFile) return INVALID;

  const video = heroVideoSchema.safeParse(values);
  const slides = bannerSlidesSchema.safeParse(values.slides);
  const errors = { ...(video.success ? {} : fieldErrors(video.error)), ...(slides.success ? {} : { slides: slides.error.issues[0]?.message ?? "Kontrollo pjesët." }) };
  if (!video.success || !slides.success) return { ...INVALID, errors };

  const sorted = [...slides.data].sort((a, b) => a.start_seconds - b.start_seconds);
  if (sorted[0].start_seconds !== 0) return { ...INVALID, errors: { slides: "Pjesa e parë duhet të fillojë në sekondën 0." } };
  if (sorted.some((s, i) => i > 0 && s.start_seconds === sorted[i - 1].start_seconds)) {
    return { ...INVALID, errors: { slides: "Dy pjesë nuk mund të fillojnë në të njëjtën sekondë." } };
  }
  if (sorted.at(-1)!.start_seconds >= video.data.duration) {
    return { ...INVALID, errors: { slides: "Çdo pjesë duhet të fillojë para fundit të videos." } };
  }

  const saved = await admin.db.from("hero_video").upsert({ id: 1, ...video.data });
  if (saved.error) return dbError(saved.error, "hero video");

  // Replace the cut points as a set. (The video row is already saved; if this fails the admin retries.)
  const removed = await admin.db.from("banner_slides").delete().gte("start_seconds", 0);
  if (removed.error) return dbError(removed.error, "banner slides delete");
  const inserted = await admin.db.from("banner_slides").insert(sorted.map((s, i) => ({ ...s, sort: i })));
  if (inserted.error) return dbError(inserted.error, "banner slides insert");

  updateTag(CACHE_TAGS.hero);
  return { status: "success", message: "Banneri u ruajt. Faqja kryesore tregon videon e re." };
}
