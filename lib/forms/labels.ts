import { SERVICE_TYPES } from "@/lib/forms/schemas";

/**
 * Albanian names and readable values for form fields. Shared by the shop email
 * (lib/forms/email.ts) and the admin Leads view, so both show a submission the same way.
 * Order = display order. Unknown keys are skipped.
 */
export const FIELD_LABELS: Record<string, string> = {
  name: "Emri",
  phone: "Telefoni",
  email: "Email",
  model: "Modeli",
  vehicle: "Mjeti",
  plate: "Targat",
  serviceType: "Lloji i servisit",
  date: "Data e preferuar",
  time: "Koha",
  licence: "Patenta",
  deposit: "Kapari",
  months: "Afati",
  monthly: "Kësti mujor (llogaritur)",
  company: "Kompania",
  reach: "Telefoni ose email-i",
  subject: "Tema",
  message: "Mesazhi",
};

const TIME_LABEL: Record<string, string> = { paradite: "Paradite", pasdite: "Pasdite" };

/** 2026-05-12 → 12.05.2026 */
export function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}.${m}.${y}` : iso;
}

/** Readable value for one field, or undefined when empty. (`model` and `monthly` are formatted by the caller.) */
export function formatFieldValue(key: string, v: unknown): string | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  switch (key) {
    case "date":
      return formatIsoDate(String(v));
    case "time":
      return TIME_LABEL[String(v)] ?? String(v);
    case "serviceType":
      return SERVICE_TYPES[v as keyof typeof SERVICE_TYPES] ?? String(v);
    case "licence":
      return v === "pa-patente" ? "Pa patentë" : String(v);
    case "deposit":
      return `${v}%`;
    case "months":
      return `${v} muaj`;
    default:
      return String(v);
  }
}
