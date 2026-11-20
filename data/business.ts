/**
 * NAS business details: one source for the page and for Google (structured data).
 * Values come from the approved design. Missing ones stay null and are left out of the
 * structured data until the client confirms them (the page keeps showing the [PLACEHOLDER]).
 */
export const BUSINESS = {
  name: "NAS",
  street: "Konferenca e Bujanit",
  city: "Pejë",
  postalCode: "30000",
  /** ISO code used for Kosovo. */
  country: "XK",
  phone: "+38344155662",
  phoneDisplay: "044 155 662",
  mapsUrl: "https://maps.app.goo.gl/5tpdRcF7HA4sv7718",
  /** What the embedded map searches for (the address; the Google listing still carries the old shop name). */
  mapsQuery: "Konferenca e Bujanit, Pejë",
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
