import { CatalogHero } from "@/components/catalog/CatalogParts";
import FinanceCalculator from "@/components/finance/FinanceCalculator";
import FormBlock from "@/components/forms/FormBlock";
import { FinanceForm } from "@/components/forms/LeadForms";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { modelOption, type Model } from "@/data/models";
import { DEPOSIT_STEPS, TERM_OPTIONS } from "@/lib/finance";

// Answers use only what the calculator already states; bank-specific details stay placeholders.
const FAQ = [
  {
    q: "Sa kapar duhet të paguaj?",
    a: `Nga ${DEPOSIT_STEPS[0]}% deri në ${DEPOSIT_STEPS[DEPOSIT_STEPS.length - 1]}% të çmimit. Sa më i madh kapari, aq më i ulët kësti mujor.`,
  },
  { q: "Për sa muaj mund ta paguaj?", a: `${TERM_OPTIONS.slice(0, -1).join(", ")} ose ${TERM_OPTIONS[TERM_OPTIONS.length - 1]} muaj.` },
  {
    q: "A është kësti në kalkulator përfundimtar?",
    a: "Jo. Kalkulatori jep një shembull pa interes. Norma, tarifat dhe kushtet përfundimtare i jep [BANKA PARTNERE].",
  },
  { q: "Çfarë dokumentesh duhen?", a: "[DOKUMENTET E KËRKUARA] — lista konfirmohet nga [BANKA PARTNERE]." },
];

/** /financim: calculator, FAQ and the application form. `model` preselects one (?model=<slug>). */
export default function FinancePage({ models, model }: { models: Model[]; model?: string }) {
  return (
    <>
      <CatalogHero title="FINANCIM" />
      <FinanceCalculator models={models} initialModelSlug={model} />
      <section className="container-moto py-20 lg:py-28">
        <SectionHeading
          lines={["PYETJE TË", "SHPESHTA"]}
          aside={<p className="max-w-[360px] text-[15px] leading-normal text-muted">Financimi bëhet në bashkëpunim me [BANKA PARTNERE].</p>}
        />
        <div className="grid gap-px border border-line bg-line md:grid-cols-2">
          {FAQ.map((item) => (
            <Reveal key={item.q} className="h-full bg-ink p-7">
              <h3 className="text-lg font-bold">{item.q}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-2">{item.a}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <FormBlock
        id="apliko"
        lines={["APLIKO PËR", "FINANCIM"]}
        intro={
          <p>
            Zgjidh modelin, kaparin dhe afatin, dhe të kontaktojmë me ofertën e bankës. Këtu nuk kërkojmë numër personal, të ardhura apo të
            dhëna bankare: këto i merr vetë banka.
          </p>
        }
      >
        <FinanceForm models={models.map(modelOption)} model={model} />
      </FormBlock>
    </>
  );
}
