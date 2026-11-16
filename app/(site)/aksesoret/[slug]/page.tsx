import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetailSkeleton } from "@/components/catalog/ProductDetail";
import SingleAccessoryPage from "@/components/pages/SingleAccessoryPage";
import { ACCESSORY_CATEGORY_LABEL, accessories, accessoryDescription, getAccessory } from "@/data/accessories";
import { pageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return accessories.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/aksesoret/[slug]">): Promise<Metadata> {
  const a = getAccessory((await params).slug);
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
  const a = getAccessory((await params).slug);
  if (!a) notFound();
  return <SingleAccessoryPage accessory={a} />;
}
