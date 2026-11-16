"use client";

import { useMemo, useState } from "react";
import CatalogCard from "@/components/catalog/CatalogCard";
import {
  CatalogGrid,
  CatalogHero,
  CatalogLayout,
  ClearFilters,
  FilterGroup,
  InlineSelect,
  PriceRange,
  ResultCount,
  SearchField,
  SortSelect,
  type Option,
} from "@/components/catalog/CatalogParts";
import { SORT_OPTIONS, sortItems, type CatalogSort } from "@/lib/catalog";
import { ACCESSORY_CATEGORY_LABEL, accessories, accessorySearchIndex, type AccessoryCategory } from "@/data/accessories";
import { createCatalogSearch } from "@/lib/search";

type CategoryFilter = "all" | AccessoryCategory;

const CATEGORY_OPTIONS: Option<CategoryFilter>[] = [
  { id: "all", label: "Të gjitha" },
  ...(Object.keys(ACCESSORY_CATEGORY_LABEL) as AccessoryCategory[]).map((id) => ({ id, label: ACCESSORY_CATEGORY_LABEL[id] })),
];

const BRAND_OPTIONS: Option<string>[] = [
  { id: "all", label: "Të gjitha" },
  ...Array.from(new Set(accessories.map((a) => a.brand)))
    .sort()
    .map((b) => ({ id: b, label: b })),
];

// Accessory prices are far below bike prices, so the slider gets its own ceiling.
const PRICE_STEP = 10;
// Built once: each product's own fields plus all synonyms of its tags.
const search = createCatalogSearch(accessories, (a) => a.slug, accessorySearchIndex);
const PRICE_MAX = Math.ceil(Math.max(...accessories.map((a) => a.price)) / 100) * 100;

/** Homepage "Gear up" cards and the footer link here with ?kategoria=kaska|veshje|doreza-cizme|pjese. */
function categoryFromQuery(q?: string): CategoryFilter {
  return q && Object.hasOwn(ACCESSORY_CATEGORY_LABEL, q) ? (q as AccessoryCategory) : "all";
}

export default function AccessoriesPage({ initialCategory }: { initialCategory?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>(() => categoryFromQuery(initialCategory));
  const [brand, setBrand] = useState("all");
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [sort, setSort] = useState<CatalogSort>("newest");

  const hits = useMemo(() => search(query), [query]);

  const shown = useMemo(() => {
    const list = accessories.filter(
      (a) =>
        (!hits || hits.has(a.slug)) &&
        (category === "all" || a.category === category) &&
        (brand === "all" || a.brand === brand) &&
        a.price <= maxPrice,
    );
    return sortItems(list, sort);
  }, [hits, category, brand, maxPrice, sort]);

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setBrand("all");
    setMaxPrice(PRICE_MAX);
  };

  return (
    <>
      <CatalogHero title="AKSESORËT" />
      <CatalogLayout
        filters={
          <>
            <SearchField value={query} onChange={setQuery} label="Kërko aksesorin" />
            <FilterGroup title="LLOJI">
              <InlineSelect options={CATEGORY_OPTIONS} value={category} onChange={setCategory} label="Lloji" />
            </FilterGroup>
            <FilterGroup title="BRANDS">
              <InlineSelect options={BRAND_OPTIONS} value={brand} onChange={setBrand} label="Marka" />
            </FilterGroup>
            <PriceRange value={maxPrice} max={PRICE_MAX} step={PRICE_STEP} onChange={setMaxPrice} />
            <ClearFilters onClick={clearFilters} />
          </>
        }
        toolbar={
          <>
            <ResultCount count={shown.length} noun="produkte" />
            <SortSelect options={SORT_OPTIONS} value={sort} onChange={setSort} />
          </>
        }
      >
        <CatalogGrid
          items={shown}
          getKey={(a) => a.slug}
          emptyTitle="ASNJË PRODUKT"
          onClear={clearFilters}
          render={(a) => (
            <CatalogCard
              href={`/aksesoret/${a.slug}`}
              brand={a.brand}
              name={a.name}
              meta={a.meta}
              price={a.price}
              image={a.image}
              isNew={a.isNew}
              cutout={a.cutout}
            />
          )}
        />
      </CatalogLayout>
    </>
  );
}
