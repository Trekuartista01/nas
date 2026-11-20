import { z } from "zod";

/**
 * Field rules shared by every form. Checked on the SERVER (a browser check can be bypassed);
 * the same schemas can also give instant feedback in the browser.
 * Error messages are Albanian because they are shown to visitors.
 */

/** Empty optional inputs arrive as "" from the form; treat them as "not given". */
const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
export const optional = <T extends z.ZodType>(schema: T) => z.preprocess(emptyToUndefined, schema.optional());

/**
 * One-line fields must not contain line breaks or other control characters: they end up in
 * email headers (subject), where a line break could inject extra headers.
 */
const SINGLE_LINE = /^[^\p{Cc}]*$/u;
const singleLineError = { error: "Kjo fushë duhet të jetë në një rresht." };

export const name = z
  .string({ error: "Shkruaj emrin." })
  .trim()
  .min(2, { error: "Emri duhet të ketë të paktën 2 shkronja." })
  .max(80, { error: "Emri është shumë i gjatë." })
  .regex(SINGLE_LINE, singleLineError);

export const email = z
  .string({ error: "Shkruaj email-in." })
  .trim()
  .toLowerCase()
  .min(1, { error: "Shkruaj email-in." })
  .max(254, { error: "Email-i është shumë i gjatë." })
  .pipe(z.email({ error: "Email-i nuk duket i saktë." }));

/**
 * Kosovo numbers (044 123 456, +383 44 123 456) and foreign ones for the diaspora (+49…, 0041…).
 * Spaces, dashes, dots and brackets are removed; the result is stored without them.
 */
export const phone = z
  .string({ error: "Shkruaj numrin e telefonit." })
  .trim()
  .min(1, { error: "Shkruaj numrin e telefonit." })
  .transform((v) => v.replace(/[\s\-./()]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^(\+\d{7,15}|00\d{7,15}|0\d{7,10})$/, { error: "Numri i telefonit nuk duket i saktë (p.sh. 044 123 456)." }),
  );

export const message = z.string().trim().max(2000, { error: "Mesazhi mund të ketë deri në 2000 shkronja." });

/** Free-text short line (vehicle, plate, subject). */
export const shortText = (label: string, max = 120) =>
  z
    .string({ error: `Shkruaj ${label}.` })
    .trim()
    .min(1, { error: `Shkruaj ${label}.` })
    .max(max, { error: `${label[0].toUpperCase()}${label.slice(1)} është shumë i gjatë.` })
    .regex(SINGLE_LINE, singleLineError);

/** A model from our catalog (checked against the real list, so made-up slugs are refused). */
export const MODEL_NOT_FOUND = "Zgjidh një model nga lista.";

/**
 * Model picker value. Only the format is checked here (this file also runs in the browser);
 * the server action then checks the slug against the live catalog (lib/forms/actions.ts).
 */
export const modelSlug = z
  .string({ error: "Zgjidh modelin." })
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: MODEL_NOT_FOUND })
  .max(120, { error: MODEL_NOT_FOUND });

/** Privacy consent checkbox: must be ticked. HTML checkboxes send "on". */
export const consent = z.preprocess(
  (v) => v === true || v === "on" || v === "true",
  z.literal(true, { error: "Duhet të pranosh politikën e privatësisë për të vazhduar." }),
);

/**
 * Spam trap: a field hidden from people (step 14). Real visitors leave it empty; bots fill it.
 * Any value fails validation and the submission is dropped.
 */
export const honeypot = z.preprocess((v) => (v == null ? "" : v), z.string().max(0, { error: "Dërgimi nuk u pranua." }));

/* ───── Dates (showroom time zone, open Monday–Saturday) ───── */

const TIME_ZONE = "Europe/Belgrade"; // same as Kosovo
const MAX_DAYS_AHEAD = 90;

/** Today's date in Kosovo as YYYY-MM-DD (the server may run in another time zone). */
export function todayInKosovo(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Preferred appointment day: today up to 90 days ahead, not on Sunday. */
export const appointmentDate = z
  .string({ error: "Zgjidh datën." })
  .pipe(z.iso.date({ error: "Zgjidh një datë të saktë." }))
  .refine((d) => d >= todayInKosovo(), { error: "Data nuk mund të jetë në të kaluarën." })
  .refine((d) => d <= addDays(todayInKosovo(), MAX_DAYS_AHEAD), { error: "Zgjidh një datë brenda 3 muajve." })
  .refine((d) => new Date(`${d}T12:00:00Z`).getUTCDay() !== 0, { error: "Të dielën jemi të mbyllur. Zgjidh një ditë tjetër." });

