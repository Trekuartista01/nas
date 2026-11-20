import ProductDetail from "@/components/catalog/ProductDetail";
import JsonLd from "@/components/seo/JsonLd";
import { ACCESSORY_CATEGORY_LABEL, ACCESSORY_CATEGORY_WORD, accessoryDescription, relatedAccessories, type Accessory } from "@/data/accessories";
import { productSchema } from "@/lib/structured-data";

// Same photo for every view until the client sends per-angle product shots.
const VIEW_LABELS = ["Anash", "Përpara", "Prapa", "Detaj"];

/** `all`: every published product (for the "related" row), loaded on the server. */
export default function SingleAccessoryPage({ accessory: a, all }: { accessory: Accessory; all: Accessory[] }) {
  return (
    <>
      <JsonLd
        data={productSchema({
          name: a.name,
          brand: a.brand,
          path: `/aksesoret/${a.slug}`,
          description: accessoryDescription(a),
          category: ACCESSORY_CATEGORY_LABEL[a.category],
          image: a.image,
          price: a.price,
        })}
      />
      <ProductDetail
        brand={a.brand}
        name={a.name}
        word={ACCESSORY_CATEGORY_WORD[a.category]}
        views={VIEW_LABELS.map((label) => ({ label, image: a.image }))}
        isNew={a.isNew}
        cutout={a.cutout}
        colours={a.colours}
        specs={a.specs}
        price={a.price}
        related={relatedAccessories(a, all).map((r) => ({
          href: `/aksesoret/${r.slug}`,
          brand: r.brand,
          name: r.name,
          price: r.price,
          image: r.image,
          cutout: r.cutout,
        }))}
      />
    </>
  );
}
