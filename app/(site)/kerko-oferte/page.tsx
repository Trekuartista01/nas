import type { Metadata } from "next";
import { Suspense } from "react";
import type { SelectOption } from "@/components/forms/FormParts";
import OfferPage from "@/components/pages/OfferPage";
import { modelOption } from "@/data/models";
import { getModels } from "@/lib/data/catalog";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Kërko ofertë",
  description: "Kërko ofertë për motorin ose skuterin që të pëlqen: çmimi, ngjyrat në stok dhe pagesa me këste. NAS, Pejë.",
  path: "/kerko-oferte",
});

// The form prerenders without a model; ?model=<slug> (from a model page) streams in after.
export default async function Page({ searchParams }: PageProps<"/kerko-oferte">) {
  const models = (await getModels()).map(modelOption);
  return (
    <Suspense fallback={<OfferPage models={models} />}>
      <WithQuery models={models} searchParams={searchParams} />
    </Suspense>
  );
}

async function WithQuery({ models, searchParams }: Pick<PageProps<"/kerko-oferte">, "searchParams"> & { models: SelectOption[] }) {
  const { model } = await searchParams;
  return <OfferPage models={models} model={typeof model === "string" ? model : undefined} />;
}
