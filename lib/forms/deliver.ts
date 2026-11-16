import "server-only";
import { getModel } from "@/data/models";
import { monthlyPayment } from "@/lib/finance";
import { emailConfigured, sendSubmissionEmail } from "@/lib/forms/email";
import { FORM_LABEL, type FormKind, type FormValues } from "@/lib/forms/schemas";
import { createServiceClient, serviceConfigured } from "@/lib/supabase/service";

/** A validated submission plus details the server adds itself (never trusted from the form). */
export interface Submission<K extends FormKind = FormKind> {
  kind: K;
  label: string;
  receivedAt: string;
  data: FormValues<K>;
  /** Model name, catalog price and monthly payment, looked up on the server. */
  model?: { slug: string; name: string; price: number; monthly?: number };
}

export function buildSubmission<K extends FormKind>(kind: K, data: FormValues<K>): Submission<K> {
  const slug = "model" in data && typeof data.model === "string" ? data.model : undefined;
  const found = slug ? getModel(slug) : undefined;
  let model: Submission["model"];
  if (found) {
    model = { slug: found.slug, name: `${found.brand} ${found.name}`, price: found.price };
    if (kind === "finance" && "deposit" in data && "months" in data) {
      model.monthly = Math.round(monthlyPayment(found.price, data.deposit as number, data.months as number));
    }
  }
  return { kind, label: FORM_LABEL[kind], receivedAt: new Date().toISOString(), data, model };
}

/** Fields kept in their own lead columns, or never stored (spam trap, consent tick). */
const NOT_IN_LEAD_DATA = new Set(["name", "email", "phone", "model", "website", "consent"]);

/**
 * Save the submission for the admin panel: a row in `leads` (newsletter: `newsletter_subscribers`).
 * Written with the secret key: visitors have no write access to these tables at all.
 */
async function saveSubmission(s: Submission): Promise<void> {
  const db = createServiceClient();
  const data = s.data as Record<string, unknown>;

  if (s.kind === "newsletter") {
    const { error } = await db.from("newsletter_subscribers").insert({ email: String(data.email) });
    // Already subscribed (unique email): nothing to do, and the visitor still sees "thank you".
    if (error && error.code !== "23505") throw new Error(`newsletter insert: ${error.code} ${error.message}`);
    return;
  }

  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) if (!NOT_IN_LEAD_DATA.has(key) && value !== undefined && value !== "") extra[key] = value;
  if (s.model) {
    extra.model_name = s.model.name;
    extra.model_price = s.model.price;
    if (s.model.monthly !== undefined) extra.monthly = s.model.monthly;
  }
  const str = (v: unknown) => (typeof v === "string" && v ? v : null);
  const { error } = await db.from("leads").insert({
    kind: s.kind,
    name: str(data.name),
    email: str(data.email),
    phone: str(data.phone),
    model_slug: str(data.model),
    data: extra,
  });
  if (error) throw new Error(`lead insert: ${error.code} ${error.message}`);
}

/**
 * Where a submission goes: a row in the database (admin panel → Kërkesat) AND an email to the shop.
 * The visitor sees "sent" if at least one of the two worked, so a mail-server hiccup never loses
 * a lead that is already saved (the failure is logged for us).
 *
 * Without SMTP settings:
 *   - development: email is skipped and only the field NAMES are logged (no personal data);
 *   - production: sending throws (missing setting). With the database connected the lead is still
 *     saved; without it the visitor sees an error with the shop's phone number instead of a "sent"
 *     message for something nobody will ever read.
 */
export async function deliverSubmission(submission: Submission): Promise<void> {
  const tasks: { name: string; run: () => Promise<void> }[] = [];
  if (serviceConfigured()) tasks.push({ name: "database", run: () => saveSubmission(submission) });
  if (process.env.NODE_ENV === "production" || emailConfigured()) {
    tasks.push({ name: "email", run: async () => void (await sendSubmissionEmail(submission)) });
  } else {
    console.info(`[forms] ${submission.kind} received (email not configured yet). Fields: ${Object.keys(submission.data).join(", ")}`);
  }
  if (tasks.length === 0) return;

  const results = await Promise.allSettled(tasks.map((t) => t.run()));
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[forms] ${submission.kind} ${tasks[i].name} failed:`, r.reason instanceof Error ? r.reason.message : r.reason);
    }
  });
  if (results.every((r) => r.status === "rejected")) throw new Error("no delivery channel succeeded");
}
