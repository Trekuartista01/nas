"use server";

import { BUSINESS } from "@/data/business";
import { getModel } from "@/lib/data/catalog";
import { buildSubmission, deliverSubmission, pickedModelSlug } from "@/lib/forms/deliver";
import { MODEL_NOT_FOUND } from "@/lib/forms/fields";
import { checkRateLimit, visitorId } from "@/lib/forms/rate-limit";
import { TURNSTILE_FIELD, verifyTurnstile } from "@/lib/forms/turnstile";
import { FORM_SCHEMAS, validateForm, type FormKind } from "@/lib/forms/schemas";
import type { FormState } from "@/lib/forms/state";

/**
 * Server Actions for the six site forms (use with useActionState in the form component).
 *
 * Each one is a public POST endpoint, so nothing from the browser is trusted:
 *   1. only the schema's own fields are read, files are refused, values are capped;
 *   2. a filled spam trap gets a fake "sent" and is dropped (bots learn nothing);
 *   3. every field is validated on the server (lib/forms/schemas.ts);
 *   4. per-visitor rate limit (lib/forms/rate-limit.ts), counting valid submissions;
 *   5. Cloudflare Turnstile token verified, only if its keys are set (optional; after validation,
 *      so a typo doesn't burn the token);
 *   6. extra details (model name, price) are looked up on the server, not taken from the form.
 * Next.js adds the same-origin (CSRF) check and the body size limit (next.config.ts).
 */

const SUCCESS: Record<FormKind, string> = {
  offer: "Faleminderit! Kërkesa për ofertë u dërgua. Do të të kontaktojmë së shpejti.",
  testRide: "Faleminderit! Kërkesa për test ride u dërgua. Do të të telefonojmë për ta konfirmuar orarin.",
  service: "Faleminderit! Kërkesa për servis u dërgua. Do të të telefonojmë për ta konfirmuar terminin.",
  finance: "Faleminderit! Aplikimi u dërgua. Do të të kontaktojmë me detajet e financimit.",
  contact: "Faleminderit! Mesazhi u dërgua. Do të përgjigjemi sa më shpejt.",
  dealer: "Faleminderit! Kërkesa u dërgua. Ekipi ynë do të të kontaktojë me gamën dhe kushtet e partneritetit.",
  newsletter: "Faleminderit! U regjistrove për ofertat tona.",
};

const FAILED = `Dërgimi dështoi. Provo përsëri pak më vonë, ose na telefono në ${BUSINESS.phoneDisplay}.`;
const INVALID = "Kontrollo fushat e shënuara më poshtë.";
const NOT_HUMAN = "Verifikimi i sigurisë nuk kaloi. Provo përsëri.";
const tooMany = (minutes: number) =>
  `Ke dërguar shumë kërkesa. Provo përsëri pas ${minutes} ${minutes === 1 ? "minute" : "minutash"}, ose na telefono në ${BUSINESS.phoneDisplay}.`;

/** Longest value kept from any single field (the schemas set tighter limits per field). */
const MAX_VALUE_LENGTH = 4000;

/** Read only the fields this form defines. Anything else in the request is ignored. */
function readFields(kind: FormKind, formData: FormData): { values: Record<string, string>; hasFile: boolean } {
  const values: Record<string, string> = {};
  let hasFile = false;
  for (const key of Object.keys(FORM_SCHEMAS[kind].shape)) {
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

/** Values sent back so the form can refill itself; the spam trap is never echoed. */
function echo(values: Record<string, string>): Record<string, string> {
  const rest = { ...values };
  delete rest.website;
  return rest;
}

async function handle(kind: FormKind, formData: FormData): Promise<FormState> {
  const { values, hasFile } = readFields(kind, formData);
  if (hasFile) return { status: "error", message: INVALID, values: echo(values) };

  // Spam trap filled: pretend it worked, store and send nothing.
  if (values.website) return { status: "success", message: SUCCESS[kind] };

  const result = validateForm(kind, values);
  if (!result.ok) return { status: "error", message: INVALID, errors: result.errors, values: echo(values) };

  // The picked model must be in the live (published) catalog; its price is taken from there, never from the form.
  const slug = pickedModelSlug(result.data);
  const model = slug ? await getModel(slug) : undefined;
  if (slug && !model) return { status: "error", message: INVALID, errors: { model: MODEL_NOT_FOUND }, values: echo(values) };

  // Counted only for valid submissions (the ones that would send an email), so a visitor
  // fixing a typo is never locked out.
  const waitMinutes = await checkRateLimit(await visitorId(), kind);
  if (waitMinutes > 0) return { status: "error", message: tooMany(waitMinutes), values: echo(values) };

  try {
    const token = formData.get(TURNSTILE_FIELD);
    const human = await verifyTurnstile(typeof token === "string" ? token : null);
    if (human === "failed") return { status: "error", message: NOT_HUMAN, values: echo(values) };
    if (human === "unavailable") return { status: "error", message: FAILED, values: echo(values) };
  } catch (error) {
    // Unexpected failure while the check is switched on: refuse rather than let it through.
    console.error(`[forms] ${kind} human check unavailable:`, error instanceof Error ? error.message : error);
    return { status: "error", message: FAILED, values: echo(values) };
  }

  try {
    await deliverSubmission(buildSubmission(kind, result.data, model));
  } catch (error) {
    // Log the reason for us, never the visitor's personal data.
    console.error(`[forms] ${kind} delivery failed:`, error instanceof Error ? error.message : error);
    return { status: "error", message: FAILED, values: echo(values) };
  }
  return { status: "success", message: SUCCESS[kind] };
}

export async function submitService(_prev: FormState, formData: FormData): Promise<FormState> {
  return handle("service", formData);
}

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  return handle("contact", formData);
}

export async function submitDealer(_prev: FormState, formData: FormData): Promise<FormState> {
  return handle("dealer", formData);
}

export async function submitNewsletter(_prev: FormState, formData: FormData): Promise<FormState> {
  return handle("newsletter", formData);
}
