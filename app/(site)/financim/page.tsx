import type { Metadata } from "next";
import { Suspense } from "react";
import FinancePage from "@/components/pages/FinancePage";
import type { Model } from "@/data/models";
import { getModels } from "@/lib/data/catalog";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Financim me këste",
  description: "Llogarit këstin mujor dhe apliko për financim për motorin ose skuterin tënd. Kapar nga 0%, afat deri në 48 muaj.",
  path: "/financim",
});

// The calculator and form prerender with the default model; ?model=<slug> streams in after.
export default async function Page({ searchParams }: PageProps<"/financim">) {
  const models = await getModels();
  return (
    <Suspense fallback={<FinancePage models={models} />}>
      <WithQuery models={models} searchParams={searchParams} />
    </Suspense>
  );
}

async function WithQuery({ models, searchParams }: Pick<PageProps<"/financim">, "searchParams"> & { models: Model[] }) {
  const { model } = await searchParams;
  return <FinancePage models={models} model={typeof model === "string" ? model : undefined} />;
}
