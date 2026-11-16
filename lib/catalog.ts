/** Sorting shared by the catalog list pages (/modelet, /aksesoret). */
export type CatalogSort = "newest" | "price-asc" | "price-desc";

export const SORT_OPTIONS: { id: CatalogSort; label: string }[] = [
  { id: "newest", label: "Më të rejat" },
  { id: "price-asc", label: "Çmimi: nga më i ulëti" },
  { id: "price-desc", label: "Çmimi: nga më i larti" },
];

export function sortItems<T extends { price: number; isNew: boolean }>(list: T[], sort: CatalogSort): T[] {
  if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
  // Newest: "E RE" items first, then catalog order.
  return [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
}
