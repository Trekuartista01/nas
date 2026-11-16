"use client";

import { useMemo, useState } from "react";
import CatalogCard from "@/components/catalog/CatalogCard";
import {
  CatalogGrid,
  CatalogHero,
  CatalogLayout,
  ChipGrid,
  ClearFilters,
  FilterGroup,
  InlineSelect,
  PriceRange,
  ResultCount,
  SearchField,
  SortSelect,
  type Option,
} from "@/components/catalog/CatalogParts";
import { modelSearchIndex, models, type Licence, type Model } from "@/data/models";
import { createCatalogSearch } from "@/lib/search";
import { SORT_OPTIONS, sortItems, type CatalogSort } from "@/lib/catalog";

type TypeFilter = "all" | "motore" | "skuter" | "atv";
type LicenceFilter = "all" | Licence;

const TYPE_OPTIONS: Option<TypeFilter>[] = [
  { id: "all", label: "Të gjitha" },
  { id: "motore", label: "Motorë" },
  { id: "skuter", label: "Skuterë" },
  { id: "atv", label: "ATVs" },
];

const LICENCE_OPTIONS: Option<LicenceFilter>[] = [
  { id: "all", label: "Të gjitha" },
  { id: "AM", label: "AM" },
  { id: "A1", label: "A1" },
  { id: "A2", label: "A2" },
  { id: "A", label: "A" },
];

const BRAND_OPTIONS: Option<string>[] = [
  { id: "all", label: "Të gjitha" },
  ...Array.from(new Set(models.map((m) => m.brand)))
    .sort()
    .map((b) => ({ id: b, label: b })),
];
// Built once: each model's own fields plus all synonyms of its type, licence and brand.
const search = createCatalogSearch(models, (m) => m.slug, modelSearchIndex);
const PRICE_MAX = Math.max(9000, Math.ceil(Math.max(...models.map((m) => m.price)) / 1000) * 1000);

/** Homepage category links use ?kategoria=sport|dirt|skuter|atv. */
function typeFromQuery(q?: string): TypeFilter {
  if (q === "sport" || q === "dirt" || q === "motore") return "motore";
  if (q === "skuter") return "skuter";
  if (q === "atv") return "atv";
  return "all";
}

function matchesType(m: Model, t: TypeFilter) {
  if (t === "all") return true;
  if (t === "motore") return m.type === "sport" || m.type === "dirt";
  if (t === "skuter") return m.type === "scooter";
  return m.type === "atv";
}

export default function ModelsPage({ initialCategory }: { initialCategory?: string }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>(() => typeFromQuery(initialCategory));
  const [licence, setLicence] = useState<LicenceFilter>("all");
  const [brand, setBrand] = useState("all");
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [sort, setSort] = useState<CatalogSort>("newest");

  const hits = useMemo(() => search(query), [query]);

  const shown = useMemo(() => {
    const list = models.filter(
      (m) =>
        (!hits || hits.has(m.slug)) &&
        matchesType(m, type) &&
        (licence === "all" || m.licence === licence) &&
        (brand === "all" || m.brand === brand) &&
        m.price <= maxPrice,
    );
    return sortItems(list, sort);
  }, [hits, type, licence, brand, maxPrice, sort]);

  const clearFilters = () => {
    setQuery("");
    setType("all");
    setLicence("all");
    setBrand("all");
    setMaxPrice(PRICE_MAX);
  };

  return (
    <>
      <CatalogHero title="MODELET" />
      <CatalogLayout
        filters={
          <>
            <SearchField value={query} onChange={setQuery} label="Kërko modelin" />
            <FilterGroup title="LLOJI">
              <ChipGrid options={TYPE_OPTIONS} value={type} onChange={setType} label="Lloji" />
            </FilterGroup>
            <FilterGroup title="PATENTA">
              <ChipGrid options={LICENCE_OPTIONS} value={licence} onChange={setLicence} label="Patenta" />
            </FilterGroup>
            <FilterGroup title="BRANDS">
              <InlineSelect options={BRAND_OPTIONS} value={brand} onChange={setBrand} label="Marka" />
            </FilterGroup>
            <PriceRange value={maxPrice} max={PRICE_MAX} onChange={setMaxPrice} />
            <ClearFilters onClick={clearFilters} />
          </>
        }
        toolbar={
          <>
            <ResultCount count={shown.length} noun="modele" />
            <SortSelect options={SORT_OPTIONS} value={sort} onChange={setSort} />
          </>
        }
      >
        <CatalogGrid
          items={shown}
          getKey={(m) => m.slug}
          emptyTitle="ASNJË MODEL"
          onClear={clearFilters}
          render={(m) => (
            <CatalogCard
              href={`/modelet/${m.slug}`}
              brand={m.brand}
              name={m.name}
              meta={`${m.cc} cc`}
              price={m.price}
              image={m.image}
              isNew={m.isNew}
            />
          )}
        />
      </CatalogLayout>
    </>
  );
}
