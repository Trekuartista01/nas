import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetailSkeleton } from "@/components/catalog/ProductDetail";
import SingleModelPage, { modelDescription } from "@/components/pages/SingleModelPage";
import { getModels } from "@/lib/data/catalog";
import { pageMetadata } from "@/lib/site";

export async function generateStaticParams() {
  return (await getModels()).map((m) => ({ slug: m.slug }));
}

async function findModel(slug: string) {
  const all = await getModels();
  return { all, model: all.find((m) => m.slug === slug) };
}

export async function generateMetadata({ params }: PageProps<"/modelet/[slug]">): Promise<Metadata> {
  const { model: m } = await findModel((await params).slug);
  if (!m) return {};
  return pageMetadata({
    title: `${m.brand} ${m.name}`,
    description: modelDescription(m),
    path: `/modelet/${m.slug}`,
    image: m.image ? { url: m.image, alt: `${m.brand} ${m.name}` } : undefined,
  });
}

// Same pattern as /aksesoret/[slug]: params are read inside <Suspense>; known slugs are prerendered,
// unknown ones get a real 404 from proxy.ts.
export default function Page({ params }: PageProps<"/modelet/[slug]">) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ModelContent params={params} />
    </Suspense>
  );
}

async function ModelContent({ params }: Pick<PageProps<"/modelet/[slug]">, "params">) {
  const { all, model } = await findModel((await params).slug);
  if (!model) notFound();
  return <SingleModelPage model={model} all={all} />;
}
