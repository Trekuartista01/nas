import { z } from "zod";

/**
 * Zod building blocks for admin forms. FormData only holds strings, so each helper turns the
 * raw string into the database type (checkbox → boolean, "" → null, JSON text → array...).
 * Limits match the CHECK constraints in supabase/migrations, so the database never has to refuse.
 */

const trimmed = (v: unknown) => (typeof v === "string" ? v.trim() : v);
const blankToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : trimmed(v));

export const text = (label: string, max: number, min = 1) =>
  z.preprocess(
    trimmed,
    z
      .string({ error: `Plotëso ${label}.` })
      .min(min, { error: min > 0 ? `Plotëso ${label}.` : undefined })
      .max(max, { error: `Deri në ${max} shenja.` }),
  );

export const optionalText = (label: string, max: number) =>
  z.preprocess(
    (v) => (v == null ? "" : trimmed(v)),
    z.string().max(max, { error: `Deri në ${max} shenja.` }),
  );

export const slug = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
  z
    .string({ error: "Plotëso slug-un." })
    .min(1, { error: "Plotëso slug-un." })
    .max(80, { error: "Slug-u mund të ketë deri në 80 shenja." })
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: "Vetëm shkronja të vogla, numra dhe viza (p.sh. nas-max-x-125)." }),
);

export const int = (label: string, min: number, max: number) =>
  z.preprocess(
    blankToNull,
    z.coerce
      .number({ error: `Shkruaj ${label}.` })
      .int({ error: "Duhet të jetë numër i plotë." })
      .min(min, { error: `Minimumi është ${min}.` })
      .max(max, { error: `Maksimumi është ${max}.` }),
  );

export const decimal = (label: string, min: number, max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim().replace(",", ".") : v),
    z.coerce.number({ error: `Shkruaj ${label}.` }).min(min, { error: `Minimumi është ${min}.` }).max(max, { error: `Maksimumi është ${max}.` }),
  );

/** Unchecked checkboxes are absent from FormData. */
export const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export const choice = <const T extends readonly [string, ...string[]]>(values: T, message: string) => z.enum(values, { error: message });

/**
 * A stored file: either a Storage path written by the upload field ("models/3f2a….jpg")
 * or a file in /public ("/images/…", the photos seeded from the local catalog). Empty = no file.
 */
export const mediaPath = z.preprocess(
  blankToNull,
  z
    .string()
    .max(300)
    .regex(/^(\/[\w\-./]+|[\w-]+(\/[\w\-.]+)+)$/, { error: "Skedari nuk është i vlefshëm. Ngarkoje përsëri." })
    .refine((p) => !p.includes(".."), { error: "Skedari nuk është i vlefshëm. Ngarkoje përsëri." })
    .nullable(),
);

export const requiredMediaPath = (message: string) =>
  z.preprocess(blankToNull, z.string({ error: message }).max(300).regex(/^(\/[\w\-./]+|[\w-]+(\/[\w\-.]+)+)$/, { error: message }));

/** ISO date from <input type="date">, or null. */
export const optionalDate = z.preprocess(
  blankToNull,
  z.iso.date({ error: "Data nuk është e vlefshme." }).nullable(),
);

/** A JSON array written by a repeater field (hidden input). */
export const jsonArray = <T extends z.ZodType>(item: T, max: number, label: string) =>
  z.preprocess(
    (v) => {
      if (typeof v !== "string" || v.trim() === "") return [];
      try {
        return JSON.parse(v);
      } catch {
        return null;
      }
    },
    z.array(item, { error: `${label}: të dhëna të pavlefshme.` }).max(max, { error: `${label}: deri në ${max} rreshta.` }),
  );

/** "a, b, c" → ["a", "b", "c"] (trimmed, lower case, no duplicates). */
export const tagList = z.preprocess(
  (v) =>
    typeof v === "string"
      ? Array.from(new Set(v.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)))
      : [],
  z.array(z.string().max(40, { error: "Çdo etiketë deri në 40 shenja." })).max(30, { error: "Deri në 30 etiketa." }),
);

export const uuid = z.uuid();
