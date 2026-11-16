import type { Metadata } from "next";
import { Suspense } from "react";
import ModelsPage from "@/components/pages/ModelsPage";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Modelet",
  description:
    "Të gjitha modelet në Moto Shpati, Pejë: motorë, skuterë dhe ATV. Filtro sipas llojit, patentës, markës dhe çmimit.",
  path: "/modelet",
});

// The static shell (all models) prerenders; ?kategoria= from the homepage cards streams in after.
export default function Page({ searchParams }: PageProps<"/modelet">) {
  return (
    <Suspense fallback={<ModelsPage />}>
      <ModelsWithQuery searchParams={searchParams} />
    </Suspense>
  );
}

async function ModelsWithQuery({ searchParams }: Pick<PageProps<"/modelet">, "searchParams">) {
  const { kategoria } = await searchParams;
  return <ModelsPage initialCategory={typeof kategoria === "string" ? kategoria : undefined} />;
}
