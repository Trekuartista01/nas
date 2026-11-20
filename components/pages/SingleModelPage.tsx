import Link from "next/link";
import ModelShowcase from "@/components/catalog/ModelShowcase";
import ProductDetail from "@/components/catalog/ProductDetail";
import SpecsSection from "@/components/catalog/SpecsSection";
import FormBlock from "@/components/forms/FormBlock";
import { TestRideForm } from "@/components/forms/LeadForms";
import JsonLd from "@/components/seo/JsonLd";
import { GhostButton, SlashButton } from "@/components/ui/Buttons";
import Reveal from "@/components/ui/Reveal";
import { brandSlug } from "@/data/home";
import { getShowcase } from "@/data/model-showcase";
import { modelOption, modelSpecs, TYPE_LABEL, type Model } from "@/data/models";
import { fromMonthly } from "@/lib/finance";
import { eur } from "@/lib/format";
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
 * /modelet/[slug]. No design yet: ModelShowcase hero (cut-out stage, callouts, colours, 360) inside the
 * accessory detail layout (ProductDetail) for specs + related, then the
 * test-ride / offer / finance actions and the test-ride form (#test-ride) with this model preselected.
 * `all`: every published model (related row + calculator), loaded on the server.
 */
export default function SingleModelPage({ model: m, all }: { model: Model; all: Model[] }) {
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
        word={TYPE_LABEL[m.type]}
        // One photo per model for now; more angles come with the model gallery.
        views={[{ label: "Anash", image: m.image }]}
        isNew={m.isNew}
        specs={[
          { value: String(m.cc), unit: "cc", label: "Kubikazhi" },
          { value: m.licence, label: "Patenta" },
          { value: TYPE_LABEL[m.type], label: "Lloji" },
          { value: eur(fromMonthly(m.price)), unit: "/muaj", label: "Me këste, nga" },
        ]}
        price={m.price}
        related={related(m, all).map((r) => ({
          href: `/modelet/${r.slug}`,
          brand: r.brand,
          name: r.name,
          price: r.price,
          image: r.image,
        }))}
        details={<SpecsSection groups={modelSpecs(m)} sheetUrl={`/modelet/${m.slug}/broshura.pdf`} />}
        hero={
          <ModelShowcase
            brand={m.brand}
            name={m.name}
            word={m.name}
            isNew={m.isNew}
            photo={m.image}
            showcase={getShowcase(m.slug)}
            specs={[
              { value: String(m.cc), unit: "cc", label: "Kubikazhi" },
              { value: m.licence, label: "Patenta" },
              { value: TYPE_LABEL[m.type], label: "Lloji" },
            ]}
            monthly={fromMonthly(m.price)}
            price={m.price}
            ctaHref="#test-ride"
          />
        }
      />

      <section className="border-t border-[#1c1c1c] bg-surface">
        <Reveal className="container-moto flex flex-wrap items-center justify-between gap-8 py-14">
          <div>
            <p className="text-xs tracking-[0.14em] text-faint">
              <Link href={`/brendet/${brandSlug(m.brand)}`} className="hover:text-red">
                {m.brand}
              </Link>{" "}
              · {TYPE_LABEL[m.type]}
            </p>
            <h2 className="wide mt-2 text-[clamp(26px,3vw,40px)] font-black uppercase leading-none">
              Provoje. Pastaj vendos<span className="text-red">.</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <SlashButton href="#test-ride">REZERVO TEST RIDE</SlashButton>
            <GhostButton href={`/kerko-oferte?model=${m.slug}`}>KËRKO OFERTË</GhostButton>
            <GhostButton href={`/financim?model=${m.slug}#apliko`}>APLIKO PËR FINANCIM</GhostButton>
          </div>
        </Reveal>
      </section>

      <FormBlock
        id="test-ride"
        lines={["REZERVO", "TEST RIDE"]}
        intro={
          <>
            <p>Provo {m.brand} {m.name} para se të vendosësh. Zgjidh ditën, ne të telefonojmë për orarin e saktë.</p>
            <p>Sill patentën e kategorisë {m.licence}.</p>
          </>
        }
      >
        <TestRideForm models={all.map(modelOption)} model={m.slug} />
      </FormBlock>
    </>
  );
}
