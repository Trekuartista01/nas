import type { Copy } from "@/lib/i18n";

/** Sorting shared by the catalog list pages (/modelet, /aksesoret). */
export type CatalogSort = "newest" | "price-asc" | "price-desc";

export const SORT_OPTIONS: { id: CatalogSort; label: Copy }[] = [
  { id: "newest", label: { sq: "Më të rejat", en: "Newest" } },
  { id: "price-asc", label: { sq: "Çmimi: nga më i ulëti", en: "Price: low to high" } },
  { id: "price-desc", label: { sq: "Çmimi: nga më i larti", en: "Price: high to low" } },
];

export function sortItems<T extends { price: number; isNew: boolean }>(list: T[], sort: CatalogSort): T[] {
  if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
  // Newest: "E RE" items first, then catalog order.
  return [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
}
