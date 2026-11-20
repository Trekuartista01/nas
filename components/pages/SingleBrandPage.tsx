import { CatalogHero } from "@/components/catalog/CatalogParts";
import { GhostButton } from "@/components/ui/Buttons";
import ModelCard from "@/components/ui/ModelCard";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Brand } from "@/data/home";
import type { Model } from "@/data/models";

/**
 * /brendet/[slug]: brand story + that brand's models. No design yet.
 * `models`: the published models of this brand, loaded on the server.
 */
export default function SingleBrandPage({ brand, models }: { brand: Brand; models: Model[] }) {
  return (
    <>
      <CatalogHero title={brand.name} />
      <section className="container-moto pb-20">
        <Reveal className="max-w-[720px] space-y-4 text-[17px] leading-relaxed text-muted-2">
          {/* The brand story is not written yet: keep the placeholder visible until the client sends it. */}
          <p>[HISTORIA E BRENDIT · {brand.name}]</p>
          <p>Në NAS, Pejë: shitje, test ride, financim me këste dhe pjesë origjinale.</p>
        </Reveal>
      </section>
      <section className="border-t border-[#1c1c1c] bg-surface">
        <div className="container-moto py-20 lg:py-28">
          <SectionHeading
            lines={[`MODELET`, brand.name]}
            aside={<GhostButton href="/modelet">TË GJITHA MODELET</GhostButton>}
          />
          {models.length === 0 ? (
            <p className="border border-dashed border-line-2 px-6 py-12 text-center text-muted">Modelet e këtij brendi po vijnë së shpejti.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {models.map((m, i) => (
                <Reveal key={m.slug} delay={(i % 4) * 0.06} className="h-full">
                  <ModelCard model={m} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
