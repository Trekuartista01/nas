import { CatalogHero } from "@/components/catalog/CatalogParts";
import FormBlock from "@/components/forms/FormBlock";
import type { SelectOption } from "@/components/forms/FormParts";
import { OfferForm } from "@/components/forms/LeadForms";

/** /kerko-oferte: price offer request. `model` preselects one (?model=<slug>). */
export default function OfferPage({ models, model }: { models: SelectOption[]; model?: string }) {
  return (
    <>
      <CatalogHero title="OFERTË" />
      <FormBlock
        lines={["KËRKO", "OFERTË"]}
        intro={
          <>
            <p>Na trego cilin model po mendon dhe si do ta paguash. Të kthehemi me çmimin, ngjyrat në stok dhe kushtet e pagesës me këste.</p>
            <p>Nuk e di ende cilin model? Lëre bosh dhe shkruaj si do ta përdorësh: qytet, rrugë e gjatë apo terren.</p>
          </>
        }
      >
        <OfferForm models={models} model={model} />
      </FormBlock>
    </>
  );
}
