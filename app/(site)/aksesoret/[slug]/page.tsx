import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetailSkeleton } from "@/components/catalog/ProductDetail";
import SingleAccessoryPage from "@/components/pages/SingleAccessoryPage";
import { ACCESSORY_CATEGORY_LABEL, accessoryDescription } from "@/data/accessories";
import { getAccessories } from "@/lib/data/catalog";
import { pageMetadata } from "@/lib/site";

export async function generateStaticParams() {
  return (await getAccessories()).map((a) => ({ slug: a.slug }));
}

async function findAccessory(slug: string) {
  const all = await getAccessories();
  return { all, accessory: all.find((a) => a.slug === slug) };
}

export async function generateMetadata({ params }: PageProps<"/aksesoret/[slug]">): Promise<Metadata> {
  const { accessory: a } = await findAccessory((await params).slug);
  if (!a) return {};
  return pageMetadata({
    title: `${a.name} · ${ACCESSORY_CATEGORY_LABEL[a.category]}`,
    description: accessoryDescription(a),
    path: `/aksesoret/${a.slug}`,
    image: a.image ? { url: a.image, alt: `${a.brand} ${a.name}` } : undefined,
  });
}

// Reading the URL (`params`) happens inside <Suspense>, so navigation stays instant (Next 16 Cache Components).
// Every known slug is still prerendered via generateStaticParams; the skeleton only shows for unknown URLs.
export default function Page({ params }: PageProps<"/aksesoret/[slug]">) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <AccessoryContent params={params} />
    </Suspense>
  );
}

async function AccessoryContent({ params }: Pick<PageProps<"/aksesoret/[slug]">, "params">) {
  const { all, accessory } = await findAccessory((await params).slug);
  if (!accessory) notFound();
  return <SingleAccessoryPage accessory={accessory} all={all} />;
}
