import { z } from "zod";
import { DEPOSIT_STEPS, TERM_OPTIONS } from "@/lib/finance";
import {
  appointmentDate,
  consent,
  email,
  honeypot,
  message,
  modelSlug,
  name,
  optional,
  phone,
  shortText,
} from "@/lib/forms/fields";

/**
 * The six site forms. Fields are a first proposal: the form designs aren't final yet, so adjust
 * here when they arrive (one place for the server check, the email and the future `leads` table).
 *
 * Every form: honeypot `website` (spam trap) + privacy `consent`, except the newsletter's
 * single-field footer form, where signing up is itself the consent.
 */

const base = { website: honeypot };

/** A blank select must fail as "not chosen", not turn into 0. */
const blankToUndefined = (v: unknown) => (v === "" || v == null ? undefined : v);

/** /kerko-oferte: price offer for a model. */
export const offerSchema = z.object({
  ...base,
  name,
  phone,
  email: optional(email),
  model: optional(modelSlug),
  message: optional(message),
  consent,
});

/** Test-ride form on each model page. No date, time or licence (removed Nov 2026): the shop calls to set the time. */
export const testRideSchema = z.object({
  ...base,
  name,
  phone,
  email: optional(email),
  model: modelSlug,
  message: optional(message),
  consent,
});

export const SERVICE_TYPES = {
  "servis-i-rregullt": "Servis i rregullt",
  riparim: "Riparim",
  goma: "Goma",
  garanci: "Garanci",
  tjeter: "Tjetër",
} as const;

/** /servisi#servis: book a service appointment. */
export const serviceSchema = z.object({
  ...base,
  name,
  phone,
  email: optional(email),
  vehicle: shortText("markën dhe modelin e mjetit"),
  plate: optional(shortText("targat", 15)),
  serviceType: z.enum(Object.keys(SERVICE_TYPES) as [keyof typeof SERVICE_TYPES], { error: "Zgjidh llojin e servisit." }),
  date: appointmentDate,
  message: optional(message),
  consent,
});

/**
 * /financim: finance application. Deposit and term must be calculator options; the price is
 * NOT taken from the form: the server looks it up from the model, so it can't be tampered with.
 * Deliberately no ID numbers, income or bank details: the partner bank collects those itself.
 */
export const financeSchema = z.object({
  ...base,
  name,
  phone,
  email,
  model: modelSlug,
  deposit: z.preprocess(blankToUndefined, z.coerce
    .number({ error: "Zgjidh kaparin." })
    .refine((v) => DEPOSIT_STEPS.includes(v), { error: "Zgjidh kaparin nga lista." })),
  months: z.preprocess(blankToUndefined, z.coerce
    .number({ error: "Zgjidh afatin." })
    .refine((v) => (TERM_OPTIONS as readonly number[]).includes(v), { error: "Zgjidh afatin nga lista." })),
  message: optional(message),
  consent,
});

/** /kontakti: general message. */
export const contactSchema = z.object({
  ...base,
  name,
  email,
  phone: optional(phone),
  subject: optional(shortText("temën", 120)),
  message: message.min(10, { error: "Mesazhi duhet të ketë të paktën 10 shkronja." }),
  consent,
});

/** Phone number or email in one field (dealer form): either format is accepted. */
const phoneOrEmail = z
  .string({ error: "Shkruaj telefonin ose email-in." })
  .trim()
  .min(1, { error: "Shkruaj telefonin ose email-in." })
  .max(254, { error: "Kjo fushë është shumë e gjatë." })
  .refine((v) => email.safeParse(v).success || phone.safeParse(v).success, {
    error: "Shkruaj një numër telefoni (p.sh. 044 123 456) ose një email të saktë.",
  });

/** Homepage "Lead. Don't follow.": a business asking to become a NAS dealer. */
export const dealerSchema = z.object({
  ...base,
  name,
  company: shortText("emrin e biznesit"),
  reach: phoneOrEmail,
  consent,
});

/** Footer: newsletter sign-up. */
export const newsletterSchema = z.object({
  ...base,
  email,
});

export const FORM_SCHEMAS = {
  offer: offerSchema,
  testRide: testRideSchema,
  service: serviceSchema,
  finance: financeSchema,
  contact: contactSchema,
  dealer: dealerSchema,
  newsletter: newsletterSchema,
} as const;

export type FormKind = keyof typeof FORM_SCHEMAS;
export type FormValues<K extends FormKind> = z.output<(typeof FORM_SCHEMAS)[K]>;

/** Albanian names for emails and the admin Leads list. */
export const FORM_LABEL: Record<FormKind, string> = {
  offer: "Kërkesë për ofertë",
  testRide: "Test ride",
  service: "Termin servisi",
  finance: "Aplikim për financim",
  contact: "Mesazh kontakti",
  dealer: "Kërkesë për dealer",
  newsletter: "Regjistrim në newsletter",
};

/** Field-by-field result the form UI can show next to each input. */
export type FieldErrors = Partial<Record<string, string>>;

/** Validate raw input (FormData entries or an object). First error per field, in Albanian. */
export function validateForm<K extends FormKind>(kind: K, input: unknown) {
  const parsed = FORM_SCHEMAS[kind].safeParse(input);
  if (parsed.success) return { ok: true as const, data: parsed.data as FormValues<K> };
  const errors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }
  return { ok: false as const, errors };
}
