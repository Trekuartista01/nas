import type { Metadata } from "next";
import type { Model } from "@/data/models";
import { Suspense } from "react";
import ModelsPage from "@/components/pages/ModelsPage";
import { getModels } from "@/lib/data/catalog";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Modelet",
  description:
    "Të gjitha modelet në NAS: motorë dhe skuterë. Filtro sipas llojit, patentës dhe çmimit.",
  path: "/modelet",
});

// The static shell (all models) prerenders; ?kategoria= (homepage cards) and ?kerko= / ?patenta=
// (header search) stream in after.
// The catalog is cached (lib/data/catalog.ts), so it is part of the prerendered shell.
export default async function Page({ searchParams }: PageProps<"/modelet">) {
  const models = await getModels();
  return (
    <Suspense fallback={<ModelsPage models={models} />}>
      <ModelsWithQuery models={models} searchParams={searchParams} />
    </Suspense>
  );
}

async function ModelsWithQuery({ models, searchParams }: Pick<PageProps<"/modelet">, "searchParams"> & { models: Model[] }) {
  const { kategoria, kerko, patenta } = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const category = one(kategoria);
  const query = one(kerko)?.slice(0, 80);
  const licence = one(patenta);
  // The key resets the filters when the header search links here while /modelet is already open.
  return (
    <ModelsPage
      key={`${category}|${query}|${licence}`}
      models={models}
      initialCategory={category}
      initialQuery={query}
      initialLicence={licence}
    />
  );
}
