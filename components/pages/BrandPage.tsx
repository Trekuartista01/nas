import T from "@/components/i18n/T";
import Lines from "@/components/motion/Lines";
import Rise from "@/components/motion/Rise";
import { SectionLine, WipeIn } from "@/components/motion/SectionIntro";
import HeroMedia from "@/components/nas/HeroMedia";
import { headingLines, IdeaSection, Kicker, SectionHead } from "@/components/nas/Parts";
import { NAS_PAGES } from "@/data/nas-pages";
import { MOTION } from "@/lib/motion";


/**
 * THE BRAND (design "NAS — The Brand", Nov 2026): hero, the idea, the lion (light section),
 * the vision cards and the four values. Headings are English only (the design's); the body text is in Albanian and English (<T>). (The closing call to action
 * over the tunnel photo was removed, Nov 2026.)
 */
export default function BrandPage() {
  const P = NAS_PAGES.brand;
  return (
    <>
      {/* ───── Hero ───── */}
      <section data-hero-under-nav className="relative -mt-[76px] flex h-svh max-h-[1000px] min-h-[640px] items-end overflow-hidden bg-ink lg:-mt-20">
        <HeroMedia
          src={P.hero}
          position="50% 35%"
          overlay="linear-gradient(0deg, rgba(10,10,10,.85), transparent 45%), linear-gradient(90deg, rgba(10,10,10,.45), transparent 60%)"
        />
        <div className="container-moto relative flex w-full flex-wrap items-end justify-between gap-x-10 gap-y-8 pb-16 lg:pb-24">
          <div>
            <Rise onLoad delay={0.2}>
              <Kicker>
                <T sq="BRENDI" en="THE BRAND" />
              </Kicker>
            </Rise>
            <Lines as="h1" onLoad delay={0.3} className="headline mt-5 text-[clamp(48px,7.6vw,140px)] leading-[0.92]" lines={headingLines([
                "BORN IN",
                "ENGLAND.",
              ])}
            />
          </div>
          <Rise onLoad delay={0.8} className="max-w-[370px] pb-2">
            <p className="text-[17px] leading-[1.6] text-light">
              <T
                sq="Një markë moderne motorësh me pozicion premium dhe identitet britanik, e ndërtuar për të përcjellë besim, karakter dhe performancë."
                en="A modern motorcycle brand with a premium position and a British identity, built to communicate trust, character and performance."
              />
            </p>
          </Rise>
        </div>
      </section>

      {/* ───── The idea ───── */}
      <IdeaSection
        kicker={<T sq="IDEJA" en="THE IDEA" />}
        lines={[
          "PERCEPTION IS",
          "PART OF THE",
          "MACHINE.",
        ]}
      >
        <T
          sq="Te motorët, mënyra si perceptohet një markë ka po aq rëndësi sa vetë produkti. Çdo pjesë e identitetit NAS u ndërtua për të krijuar ndjesinë e forcës, sigurisë dhe cilësisë afatgjatë, dhe për të funksionuar njësoj në motor, në komunikim, në merch dhe në showroom."
          en="In motorcycles, how a brand is perceived matters as much as the product itself. Every part of the NAS identity was built to create a feeling of strength, safety and long-term quality, and to work the same way on the bike, in communication, on merchandise and in the showroom."
        />
      </IdeaSection>

      {/* ───── The lion (light) ───── */}
      <section className="bg-ink text-ink">
        <WipeIn layerClassName="bg-light">
          <div className="container-moto grid items-center gap-12 py-[clamp(90px,10vw,150px)] md:grid-cols-2 md:gap-16">
            <Rise from="left" duration={MOTION.image} className="mx-auto w-[min(380px,70%)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={P.lion} alt="NAS" width={760} height={922} className="h-auto w-full" />
            </Rise>
            <div>
              <Rise>
                <Kicker>
                  <T sq="LUANI" en="THE LION" />
                </Kicker>
              </Rise>
              <Lines className="headline mt-5 text-[clamp(48px,5.6vw,96px)]" lines={headingLines([
                  "LEAD.",
                  "DON’T",
                  "FOLLOW.",
                ])}
              />
              <Rise delay={0.3} className="mt-8 max-w-[460px]">
                <p className="text-[17px] leading-[1.65] text-[#444]">
                  <T
                    sq="E frymëzuar nga luani, NAS përfaqëson guximin, fuqinë dhe autoritetin. Një markë për ata që prijnë, jo për ata që ndjekin."
                    en="Inspired by the lion, NAS stands for courage, power and authority. A brand for those who lead, not those who follow."
                  />
                </p>
              </Rise>
            </div>
          </div>
        </WipeIn>
      </section>

      {/* ───── The vision ───── */}
      <section className="bg-ink">
        <div className="container-moto py-[clamp(90px,10vw,150px)]">
          <SectionHead
            lines={[
              "THE",
              "VISION.",
            ]}
          />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {P.vision.map((v, i) => (
              <Rise key={v.title} delay={i * MOTION.cardStagger} duration={MOTION.image}>
                <article className="group relative flex aspect-[431/640] flex-col justify-between overflow-hidden border border-line-3 bg-[#111] p-[clamp(24px,2.6vw,38px)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover brightness-[.75] transition-transform duration-[1.2s] ease-nas group-hover:scale-[1.06]"
                  />
                  <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.4),transparent_30%,rgba(10,10,10,.92)_80%)]" />
                  <span className="relative text-[13px] font-bold tracking-[0.2em] text-red">
                    {String(i + 1).padStart(2, "0")} / {String(P.vision.length).padStart(2, "0")}
                  </span>
                  <div className="relative">
                    <h3 className="headline text-[clamp(32px,3vw,46px)]">
                      {v.title}
                    </h3>
                    <span aria-hidden className="mt-4 block h-[3px] w-14 bg-red transition-[width] duration-500 ease-nas group-hover:w-28" />
                    <p className="mt-5 text-[16px] leading-[1.6] text-light">
                      <T {...v.text} />
                    </p>
                  </div>
                </article>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Built on four things ───── */}
      <section className="bg-surface-3">
        <SectionLine />
        <div className="container-moto py-[clamp(90px,10vw,150px)]">
          <SectionHead
            lines={[
              "BUILT ON",
              "FOUR THINGS.",
            ]}
            aside={
              <T
                sq="Një shkronjë e krijuar posaçërisht mbi një sistem gjeometrik të kontrolluar, ku çdo vijë, kënd dhe kthesë ka një detyrë."
                en="A custom typeface on a controlled geometric system, where every line, angle and curve has a job."
              />
            }
          />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4">
            {P.values.map((v, i) => (
              <Rise key={v.title} delay={i * MOTION.cardStagger}>
                <div className="h-full border-l border-line-3 px-[clamp(20px,2.3vw,34px)] py-6">
                  <h3 className="headline text-[clamp(26px,2.2vw,34px)]">
                    {v.title}
                    <span className="text-red">.</span>
                  </h3>
                  <p className="mt-5 max-w-[260px] text-[16px] leading-[1.55] text-body">
                    <T {...v.text} />
                  </p>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
