import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import SingleBrandPage from "@/components/pages/SingleBrandPage";
import { brandSlug } from "@/data/home";
import { getBrands, getModels } from "@/lib/data/catalog";
import { pageMetadata } from "@/lib/site";

export async function generateStaticParams() {
  return (await getBrands()).map((b) => ({ slug: brandSlug(b.name) }));
}

async function findBrand(slug: string) {
  const brand = (await getBrands()).find((b) => brandSlug(b.name) === slug);
  if (!brand) return { brand, models: [] };
  const models = (await getModels()).filter((m) => m.brand.toLowerCase() === brand.name.toLowerCase());
  return { brand, models };
}

export async function generateMetadata({ params }: PageProps<"/brendet/[slug]">): Promise<Metadata> {
  const { brand } = await findBrand((await params).slug);
  if (!brand) return {};
  return pageMetadata({
    title: brand.name,
    description: `${brand.name} në NAS: modelet dhe test ride.`,
    path: `/brendet/${brandSlug(brand.name)}`,
  });
}

export default function Page({ params }: PageProps<"/brendet/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-hidden />}>
      <BrandContent params={params} />
    </Suspense>
  );
}

async function BrandContent({ params }: Pick<PageProps<"/brendet/[slug]">, "params">) {
  const { brand, models } = await findBrand((await params).slug);
  if (!brand) notFound();
  return <SingleBrandPage brand={brand} models={models} />;
}
