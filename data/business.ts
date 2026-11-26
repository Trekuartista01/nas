/**
 * NAS business details: one source for the page and for Google (structured data).
 * Values come from the approved design. Missing ones stay null and are left out of the
 * structured data until the client confirms them (the page keeps showing the [PLACEHOLDER]).
 */
export const BUSINESS = {
  name: "NAS",
  /** [ADRESA]: the earlier Pejë address was wrong (Nov 2026). Null = no address on the site or in structured data. */
  street: null as string | null,
  city: null as string | null,
  postalCode: null as string | null,
  /** ISO code used for Kosovo. */
  country: "XK",
  phone: "+38344155662",
  phoneDisplay: "044 155 662",
  /** [EMAIL]: the shop's address is not confirmed yet. While null the contact hero shows "[EMAIL]" (no link). */
  email: null as string | null,
  /** TODO(client): confirm WhatsApp is on this number (assumed the shop phone, Nov 2026). Digits for wa.me. */
  whatsapp: "38344155662",
  /** Google Maps link: null until the real address is confirmed (the old listing was the Pejë shop). */
  mapsUrl: null as string | null,
  /** Still the old shop account; swap for the NAS account when the client sends it. */
  instagram: "https://www.instagram.com/moto.shpati/",
  /** [FACEBOOK URL] — not confirmed yet. */
  facebook: null as string | null,
  /** [ORARI] — opening hours not confirmed yet, e.g. ["Mo-Fr 09:00-18:00", "Sa 09:00-14:00"]. */
  openingHours: null as string[] | null,
  brands: ["NAS", "QJMOTOR"],
};

/**
 * Catalog prices are DEMO prices from the design. While true, prices are kept out of
 * structured data so Google never shows a fake price in search results.
 */
export const PRICES_ARE_DEMO = true;

/** True for "[MARKA]"-style placeholders and "--" (unknown spec). */
export function isPlaceholder(value: string): boolean {
  return /^\[.*\]$/.test(value.trim()) || value.trim() === "--";
}
