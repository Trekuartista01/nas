import type { Metadata } from "next";
import { Suspense } from "react";
import AccessoriesPage from "@/components/pages/AccessoriesPage";
import type { Accessory } from "@/data/accessories";
import { getAccessories } from "@/lib/data/catalog";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Aksesorët",
  description:
    "Kaska, veshje, dorëza, çizme dhe pjesë për motorin tënd në NAS. Filtro sipas llojit, markës dhe çmimit.",
  path: "/aksesoret",
});

// The static shell (all products) prerenders; ?kategoria= from the homepage cards streams in after.
// The catalog is cached (lib/data/catalog.ts), so it is part of the prerendered shell.
export default async function Page({ searchParams }: PageProps<"/aksesoret">) {
  const accessories = await getAccessories();
  return (
    <Suspense fallback={<AccessoriesPage accessories={accessories} />}>
      <AccessoriesWithQuery accessories={accessories} searchParams={searchParams} />
    </Suspense>
  );
}

async function AccessoriesWithQuery({
  accessories,
  searchParams,
}: Pick<PageProps<"/aksesoret">, "searchParams"> & { accessories: Accessory[] }) {
  const { kategoria } = await searchParams;
  return <AccessoriesPage accessories={accessories} initialCategory={typeof kategoria === "string" ? kategoria : undefined} />;
}
