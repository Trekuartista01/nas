import ModelFeatures from "@/components/catalog/ModelFeatures";
import { ModelIntro, ModelRelated } from "@/components/catalog/ModelStory";
import ProductDetail from "@/components/catalog/ProductDetail";
import SpecsSection from "@/components/catalog/SpecsSection";
import JsonLd from "@/components/seo/JsonLd";
import { DEFAULT_FEATURES, DEFAULT_MEDIA, getModelDetails, MODEL_VIEWS } from "@/data/model-details";
import { getShowcase } from "@/data/model-showcase";
import { modelSpecs, modelSpecValue, TYPE_LABEL, type Model } from "@/data/models";
import { productSchema } from "@/lib/structured-data";

/** One-line description for search results, link previews and structured data. */
export function modelDescription(m: Model): string {
  return `${m.brand} ${m.name}: ${TYPE_LABEL[m.type].toLowerCase()} ${m.cc} cc, patenta ${m.licence}. Test ride dhe financim me këste në NAS, Pejë.`;
}

/** Same type first, then the rest. */
function related(m: Model, all: Model[], count = 3): Model[] {
  const others = all.filter((x) => x.slug !== m.slug);
  return [...others.filter((x) => x.type === m.type), ...others.filter((x) => x.type !== m.type)].slice(0, count);
}

/**
 * /modelet/[slug] (design: Frame 27764, Nov 2026). Stage with the view tabs, name + colours, the
 * specs strip with the price, the tagline and the big media block, SPECS, the feature strips and
 * "You may also like" with the homepage Range cards (ProductDetail + ModelStory + ModelFeatures). Per-model copy and media: data/model-details.ts;
 * cut-out and colours: data/model-showcase.ts. The earlier ModelShowcase hero is unused, kept.
 * `all`: every published model (related row), loaded on the server.
 */
export default function SingleModelPage({ model: m, all }: { model: Model; all: Model[] }) {
  const d = getModelDetails(m.slug);
  const show = getShowcase(m.slug);
  const side = d.views?.ANASH ?? show?.cutout ?? m.image;

  return (
    <>
      <JsonLd
        data={productSchema({
          name: `${m.brand} ${m.name}`,
          brand: m.brand,
          path: `/modelet/${m.slug}`,
          description: modelDescription(m),
          category: TYPE_LABEL[m.type],
          image: m.image,
          price: m.price,
        })}
      />
      <ProductDetail
        brand={m.brand}
        name={m.name}
        word={`${m.brand} ${m.name}`}
        views={MODEL_VIEWS.map((label) => ({ label, image: label === "ANASH" ? side : d.views?.[label] }))}
        cutout={!d.views?.ANASH && Boolean(show?.cutout)}
        colours={show?.colours}
        isNew={m.isNew}
        specs={[
          { value: String(m.cc), unit: "cc", label: "Motori" },
          { value: modelSpecValue(m.slug, "powerKw", "--"), unit: "kW", label: "Fuqia" },
          { value: m.licence, label: "Patenta" },
          { value: modelSpecValue(m.slug, "weightKg", "--"), unit: "kg", label: "Pesha" },
        ]}
        price={m.price}
        related={[]}
        details={
          <>
            <ModelIntro name={`${m.brand} ${m.name}`} tagline={d.tagline} media={d.media ?? DEFAULT_MEDIA} />
            <SpecsSection groups={modelSpecs(m)} sheetUrl={`/modelet/${m.slug}/broshura.pdf`} />
            <ModelFeatures features={d.features ?? DEFAULT_FEATURES} />
          </>
        }
      />
      <ModelRelated models={related(m, all)} />
    </>
  );
}
