import { CatalogHero } from "@/components/catalog/CatalogParts";
import { GhostButton, SlashButton } from "@/components/ui/Buttons";
import Reveal from "@/components/ui/Reveal";

const WHAT_WE_DO = [
  { title: "SHITJE", text: "Motorë dhe skuterë, me garanci." },
  { title: "TEST RIDE", text: "Provo modelin para se të vendosësh." },
  { title: "FINANCIM", text: "Pagesë me këste me [BANKA PARTNERE]." },
];

/**
 * /rreth-nesh. No design and no story text yet: the facts already on the site, plus a visible
 * placeholder for the company story (founding year, team, photos) until the client sends it.
 */
export default function AboutPage() {
  return (
    <>
      <CatalogHero title="RRETH NESH" />
      <section className="container-moto pb-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <Reveal className="space-y-5 text-[17px] leading-relaxed text-muted-2">
            <p className="text-2xl font-bold leading-snug text-white">
              NAS është showroom-i i motorëve dhe skuterëve në Pejë, përfaqësues [ZYRTAR] i NAS dhe QJMOTOR në Kosovë.
            </p>
            <p>[HISTORIA E NAS: viti i themelimit, ekipi, çfarë na dallon]</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <SlashButton href="/modelet">SHIKO MODELET</SlashButton>
              <GhostButton href="/kontakti">NA KONTAKTO</GhostButton>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="hatch flex aspect-[4/3] items-center justify-center border border-line text-xs tracking-[0.14em] text-[#6f6f6f]">
            [FOTO · SHOWROOM PEJË]
          </Reveal>
        </div>
        <div className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-3">
          {WHAT_WE_DO.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.06} className="h-full bg-ink p-7">
              <h2 className="wide text-lg font-black">{w.title}</h2>
              <p className="mt-2 text-[15px] leading-normal text-muted-2">{w.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
