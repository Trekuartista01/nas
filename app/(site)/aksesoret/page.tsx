import type { Metadata } from "next";
import { Suspense } from "react";
import AccessoriesPage from "@/components/pages/AccessoriesPage";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Aksesorët",
  description:
    "Kaska, veshje, dorëza, çizme dhe pjesë për motorin tënd në Moto Shpati, Pejë. Filtro sipas llojit, markës dhe çmimit.",
  path: "/aksesoret",
});

// The static shell (all products) prerenders; ?kategoria= from the homepage cards streams in after.
export default function Page({ searchParams }: PageProps<"/aksesoret">) {
  return (
    <Suspense fallback={<AccessoriesPage />}>
      <AccessoriesWithQuery searchParams={searchParams} />
    </Suspense>
  );
}

async function AccessoriesWithQuery({ searchParams }: Pick<PageProps<"/aksesoret">, "searchParams">) {
  const { kategoria } = await searchParams;
  return <AccessoriesPage initialCategory={typeof kategoria === "string" ? kategoria : undefined} />;
}
