import "server-only";
import type { PostgrestError } from "@supabase/supabase-js";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { requireAdmin, type Admin } from "@/lib/admin/auth";
import type { AdminFormState } from "@/lib/admin/form-state";
import type { CacheTag } from "@/lib/data/catalog";

/**
 * Shared steps for every admin save / delete. Each one:
 *   1. checks the admin again (never trusts that the page was protected),
 *   2. reads only the schema's own fields from FormData and refuses files,
 *   3. validates on the server,
 *   4. writes with the admin's own session (Row Level Security + audit log apply),
 *   5. refreshes the public pages that show this data (updateTag).
 */

/** Tables the admin may write to. Server actions only ever pass one of these constants. */
export type ContentTable = "models" | "accessories" | "brands" | "posts";

const MAX_VALUE_LENGTH = 25_000;

export function readFields(shape: Record<string, unknown>, formData: FormData): { values: Record<string, string>; hasFile: boolean } {
  const values: Record<string, string> = {};
  let hasFile = false;
  for (const key of Object.keys(shape)) {
    const raw = formData.get(key);
    if (raw === null) continue;
    if (typeof raw !== "string") {
      hasFile = true;
      continue;
    }
    values[key] = raw.slice(0, MAX_VALUE_LENGTH);
  }
  return { values, hasFile };
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }
  return errors;
}

export const INVALID: AdminFormState = { status: "error", message: "Kontrollo fushat e shënuara." };

/** Turn a database error into something the admin can act on. Details go to the server log only. */
export function dbError(error: PostgrestError, what: string): AdminFormState {
  if (error.code === "23505") {
    // unique violation: slug (models, accessories, posts) or name (brands)
    const field = error.message.includes("name") ? "name" : "slug";
    return {
      status: "error",
      message: "Kontrollo fushat e shënuara.",
      errors: { [field]: field === "slug" ? "Ky slug përdoret tashmë nga një element tjetër." : "Ky emër ekziston tashmë." },
    };
  }
  if (error.code === "42501" || error.code === "PGRST301") {
    return { status: "error", message: "Nuk ke leje për këtë veprim. Hyr përsëri." };
  }
  console.error(`[admin] ${what} failed:`, error.code, error.message);
  return { status: "error", message: "Ruajtja dështoi. Provo përsëri; nëse vazhdon, na kontakto." };
}

interface SaveOptions<S extends z.ZodObject> {
  table: ContentTable;
  schema: S;
  formData: FormData;
  /** Existing row id, or undefined to create. */
  id?: string;
  tag: CacheTag;
  /** Where to go after creating (gets the new id). */
  editPath: (id: string) => string;
  /** Extra columns derived on the server (e.g. published_at). */
  prepare?: (data: z.output<S>, ctx: { admin: Admin; id?: string }) => Promise<Record<string, unknown>> | Record<string, unknown>;
}

export async function saveRow<S extends z.ZodObject>({ table, schema, formData, id, tag, editPath, prepare }: SaveOptions<S>): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const { values, hasFile } = readFields(schema.shape, formData);
  if (hasFile) return INVALID;
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { ...INVALID, errors: fieldErrors(parsed.error) };

  const row = { ...(parsed.data as Record<string, unknown>), ...(prepare ? await prepare(parsed.data, { admin, id }) : {}) };

  if (id) {
    const { error, count } = await admin.db.from(table).update(row, { count: "exact" }).eq("id", id);
    if (error) return dbError(error, `update ${table}`);
    if (count === 0) return { status: "error", message: "Ky element nuk ekziston më (mund të jetë fshirë)." };
    updateTag(tag);
    return { status: "success", message: "Ndryshimet u ruajtën." };
  }

  const { data, error } = await admin.db.from(table).insert(row).select("id").single();
  if (error) return dbError(error, `insert ${table}`);
  updateTag(tag);
  redirect(editPath((data as { id: string }).id));
}

export async function deleteRow(table: ContentTable, id: string, tag: CacheTag, listPath: string): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const { error } = await admin.db.from(table).delete().eq("id", id);
  if (error) return dbError(error, `delete ${table}`);
  updateTag(tag);
  redirect(listPath);
}

export async function setPublished(table: ContentTable, id: string, published: boolean, tag: CacheTag): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const extra = table === "posts" && published ? await firstPublishedAt(admin, id) : {};
  const { error } = await admin.db.from(table).update({ published, ...extra }).eq("id", id);
  if (error) return dbError(error, `publish ${table}`);
  updateTag(tag);
  return { status: "success", message: published ? "U publikua." : "U kthye në draft." };
}

/** A post keeps the date it was FIRST published (used for ordering); set it once. */
export async function firstPublishedAt(admin: Admin, id: string | undefined): Promise<{ published_at?: string }> {
  if (!id) return { published_at: new Date().toISOString() };
  const { data } = await admin.db.from("posts").select("published_at").eq("id", id).maybeSingle();
  return data?.published_at ? {} : { published_at: new Date().toISOString() };
}
