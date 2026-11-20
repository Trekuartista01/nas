import type { ReactNode } from "react";
import { TbBrandInstagram, TbClock, TbMapPin, TbPhone } from "react-icons/tb";
import { CatalogHero } from "@/components/catalog/CatalogParts";
import MapEmbed from "@/components/contact/MapEmbed";
import FormBlock from "@/components/forms/FormBlock";
import { ContactForm } from "@/components/forms/LeadForms";
import Reveal from "@/components/ui/Reveal";
import { BUSINESS } from "@/data/business";

const ROWS: { icon: typeof TbMapPin; label: string; value: ReactNode }[] = [
  {
    icon: TbMapPin,
    label: "SHOWROOM",
    value: (
      <a href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-red">
        {BUSINESS.street}, {BUSINESS.city} {BUSINESS.postalCode}
      </a>
    ),
  },
  {
    icon: TbPhone,
    label: "TELEFONI",
    value: (
      <a href={`tel:${BUSINESS.phone}`} className="hover:text-red">
        {BUSINESS.phoneDisplay}
      </a>
    ),
  },
  // [ORARI]: opening hours not confirmed yet (data/business.ts → openingHours).
  { icon: TbClock, label: "ORARI", value: "Hën–Sht [ORARI]" },
  {
    icon: TbBrandInstagram,
    label: "INSTAGRAM",
    value: (
      <a href={BUSINESS.instagram} target="_blank" rel="noreferrer" className="hover:text-red">
        Na ndiq në Instagram
      </a>
    ),
  },
];

/** /kontakti: showroom details, map and the contact form. */
export default function ContactPage() {
  return (
    <>
      <CatalogHero title="KONTAKTI" />
      <section className="container-moto pb-20">
        <div className="grid border border-line-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <Reveal className="flex flex-col divide-y divide-line-2">
            {ROWS.map((r) => (
              <div key={r.label} className="flex items-start gap-4 p-7">
                <r.icon size={26} className="mt-0.5 shrink-0 text-red" aria-hidden />
                <div>
                  <p className="text-xs tracking-[0.14em] text-faint">{r.label}</p>
                  <p className="mt-1 text-lg font-bold">{r.value}</p>
                </div>
              </div>
            ))}
          </Reveal>
          <div className="border-t border-line-2 lg:border-l lg:border-t-0">
            <MapEmbed />
          </div>
        </div>
      </section>
      <FormBlock lines={["NA", "SHKRUAJ"]} intro={<p>Pyetje për një model, pjesë, servis apo diçka tjetër? Na shkruaj dhe të përgjigjemi sa më shpejt.</p>}>
        <ContactForm />
      </FormBlock>
    </>
  );
}
