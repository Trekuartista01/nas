/** Dates in the admin panel: Kosovo time, dd.mm.yyyy HH:mm. */
const dateTime = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Belgrade",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const dateOnly = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Belgrade", day: "2-digit", month: "2-digit", year: "numeric" });

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatDate = (iso: string) => dateOnly.format(new Date(iso));

export { slugify } from "@/lib/format";

export const LEAD_KIND_LABEL: Record<string, string> = {
  offer: "Ofertë",
  testRide: "Test ride",
  service: "Servis",
  finance: "Financim",
  contact: "Kontakt",
};

export const LEAD_STATUS_LABEL: Record<string, string> = {
  new: "E re",
  contacted: "Kontaktuar",
  closed: "Mbyllur",
};

export const VEHICLE_TYPE_LABEL: Record<string, string> = { sport: "Sport", dirt: "Dirt / enduro", scooter: "Skuter", atv: "ATV" };
export const ACCESSORY_CATEGORY_ADMIN_LABEL: Record<string, string> = { kaska: "Kaska", veshje: "Veshje", "doreza-cizme": "Doreza & çizme", pjese: "Pjesë" };
export const POST_KIND_LABEL: Record<string, string> = { event: "Event", lajme: "Lajme", model: "Model i ri", keshilla: "Këshilla" };
