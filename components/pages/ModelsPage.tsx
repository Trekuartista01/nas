"use client";

import T from "@/components/i18n/T";
import { useMemo, useState } from "react";
import CatalogCard from "@/components/catalog/CatalogCard";
import ModelsShutterHero from "@/components/catalog/ModelsShutterHero";
import {
  CatalogGrid,
  CatalogLayout,
  ChipGrid,
  ClearFilters,
  FilterGroup,
  PriceRange,
  ResultCount,
  SearchField,
  SortSelect,
  type Option,
} from "@/components/catalog/CatalogParts";
import { modelSearchIndex, type Licence, type Model } from "@/data/models";
import { createCatalogSearch } from "@/lib/search";
import { SORT_OPTIONS, sortItems, type CatalogSort } from "@/lib/catalog";

type TypeFilter = "all" | "motore" | "skuter";
type LicenceFilter = "all" | Licence;

const TYPE_OPTIONS: Option<TypeFilter>[] = [
  { id: "all", label: { sq: "Të gjitha", en: "All" } },
  { id: "motore", label: { sq: "Motorë", en: "Motorcycles" } },
  { id: "skuter", label: { sq: "Skuterë", en: "Scooters" } },
];

const LICENCE_OPTIONS: Option<LicenceFilter>[] = [
  { id: "all", label: { sq: "Të gjitha", en: "All" } },
  { id: "AM", label: "AM" },
  { id: "A1", label: "A1" },
  { id: "A2", label: "A2" },
  { id: "A", label: "A" },
];

const priceMax = (models: Model[]) => Math.max(9000, Math.ceil(Math.max(0, ...models.map((m) => m.price)) / 1000) * 1000);

/** Header search links use ?patenta=AM|A1|A2|A. */
function licenceFromQuery(q?: string): LicenceFilter {
  const up = q?.toUpperCase();
  return LICENCE_OPTIONS.some((o) => o.id === up) ? (up as LicenceFilter) : "all";
}

/** Homepage category links use ?kategoria=sport|dirt|skuter (ATVs are not in the catalog). */
function typeFromQuery(q?: string): TypeFilter {
  if (q === "sport" || q === "dirt" || q === "motore") return "motore";
  if (q === "skuter") return "skuter";
  return "all";
}

function matchesType(m: Model, t: TypeFilter) {
  if (t === "all") return true;
  if (t === "motore") return m.type === "sport" || m.type === "dirt";
  return m.type === "scooter";
}

/** `models`: the published models, loaded on the server (lib/data/catalog.ts). */
export default function ModelsPage({
  models,
  initialCategory,
  initialQuery = "",
  initialLicence,
}: {
  models: Model[];
  initialCategory?: string;
  /** ?kerko= from the header search. */
  initialQuery?: string;
  /** ?patenta= from the header search (AM, A1, A2, A). */
  initialLicence?: string;
}) {
  const PRICE_MAX = useMemo(() => priceMax(models), [models]);
  // Built once per catalog: each model's own fields plus all synonyms of its type, licence and brand.
  const search = useMemo(() => createCatalogSearch(models, (m) => m.slug, modelSearchIndex), [models]);
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<TypeFilter>(() => typeFromQuery(initialCategory));
  const [licence, setLicence] = useState<LicenceFilter>(() => licenceFromQuery(initialLicence));
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [sort, setSort] = useState<CatalogSort>("newest");

  const hits = useMemo(() => search(query), [search, query]);

  const shown = useMemo(() => {
    const list = models.filter(
      (m) =>
        (!hits || hits.has(m.slug)) &&
        matchesType(m, type) &&
        (licence === "all" || m.licence === licence) &&
        m.price <= maxPrice,
    );
    return sortItems(list, sort);
  }, [models, hits, type, licence, maxPrice, sort]);

  const clearFilters = () => {
    setQuery("");
    setType("all");
    setLicence("all");
    setMaxPrice(PRICE_MAX);
  };

  return (
    <ModelsShutterHero title="MODELS">
      <CatalogLayout
        filters={
          <>
            <SearchField value={query} onChange={setQuery} label={{ sq: "Kërko modelin", en: "Search the models" }} />
            <FilterGroup title={<T sq="LLOJI" en="TYPE" />}>
              <ChipGrid options={TYPE_OPTIONS} value={type} onChange={setType} label={{ sq: "Lloji", en: "Type" }} />
            </FilterGroup>
            <FilterGroup title={<T sq="PATENTA" en="LICENCE" />}>
              <ChipGrid options={LICENCE_OPTIONS} value={licence} onChange={setLicence} label={{ sq: "Patenta", en: "Licence" }} />
            </FilterGroup>
            <PriceRange value={maxPrice} max={PRICE_MAX} onChange={setMaxPrice} />
            <ClearFilters onClick={clearFilters} />
          </>
        }
        toolbar={
          <>
            <ResultCount count={shown.length} noun={{ sq: "modele", en: "models" }} />
            <SortSelect options={SORT_OPTIONS} value={sort} onChange={setSort} />
          </>
        }
      >
        <CatalogGrid
          items={shown}
          getKey={(m) => m.slug}
          emptyTitle={<T sq="ASNJË MODEL" en="NO MODELS" />}
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
    </ModelsShutterHero>
  );
}
