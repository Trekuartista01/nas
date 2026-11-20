import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";
import Materials from "@/components/home/Materials";
import Lines from "@/components/motion/Lines";
import Rise from "@/components/motion/Rise";
import { SectionLine } from "@/components/motion/SectionIntro";
import HeroMedia from "@/components/nas/HeroMedia";
import { IdeaSection, Kicker, SectionHead } from "@/components/nas/Parts";
import RedSLogo from "@/components/nas/RedSLogo";
import { BlockButton, OutlineBlockButton } from "@/components/ui/Buttons";
import { LogoMark } from "@/components/ui/Logo";
import { NAS_PAGES } from "@/data/nas-pages";
import { getModels } from "@/lib/data/catalog";
import { MOTION } from "@/lib/motion";


/**
 * SPORT LINE (design "NAS — Sport Line", Nov 2026): centred hero with the red-S logo, the idea,
 * "one letter, one signal", built from the wordmark, Iron / Light / Concrete, the models in the
 * line, and a photo pair. Copy is English, as in the design.
 * Models come from the published catalog. Which ones carry the Sport Line badge is still to be
 * confirmed, so the first NAS models are shown for now.
 */
export default async function SportLinePage() {
  const P = NAS_PAGES.sportLine;
  const models = await getModels();
  const line = models.filter((m) => m.brand.toUpperCase() === "NAS").slice(0, 2);

  return (
    <>
      {/* ───── Hero ───── */}
      <section data-hero-under-nav className="relative -mt-[76px] flex h-svh max-h-[1000px] min-h-[640px] items-center overflow-hidden bg-ink lg:-mt-20">
        <HeroMedia src={P.hero} position="60% 50%" overlay="rgba(10,10,10,.62)" />
        <div className="container-moto relative flex flex-col items-center pt-20 text-center">
          <Rise onLoad delay={0.2}>
            <Kicker>THE PERFORMANCE LINE</Kicker>
          </Rise>
          <Rise onLoad mask delay={0.35} duration={MOTION.image} className="mt-7 w-[min(760px,80vw)]">
            <h1>
              <LogoMark bare accent title="NAS Sport Line" className="h-auto w-full text-white" />
            </h1>
          </Rise>
          <Rise onLoad delay={0.7} className="mt-9 max-w-[500px]">
            <p className="text-[clamp(16px,1.3vw,19px)] leading-[1.6] text-light">
              Built on motion, strength and mechanical precision. Red is the signal of performance.
            </p>
          </Rise>
          <Rise onLoad delay={0.85} className="mt-9">
            <div className="flex flex-wrap justify-center gap-4">
              <BlockButton href="/modelet">See the models</BlockButton>
              <OutlineBlockButton href="/kontakti">Find a dealer</OutlineBlockButton>
            </div>
          </Rise>
        </div>
      </section>

      {/* ───── The idea ───── */}
      <IdeaSection kicker="THE IDEA" lines={["CONTROL.", "PERFORMANCE.", "ADRENALINE."]}>
        The Sport Line identity is drawn from everything around the ride: iron for strength and engineering, light for focus and speed, concrete for the
        street and the raw character of riding. Together they express not just a motorcycle, but the feeling of control in motion.
      </IdeaSection>

      {/* ───── The red S ───── */}
      <section className="bg-ink">
        <div className="container-moto grid items-center gap-12 pb-[clamp(90px,10vw,150px)] md:grid-cols-[1.15fr_1fr] md:gap-16">
          <Rise duration={MOTION.image}>
            <div className="flex aspect-[732/520] items-center justify-center bg-light">
              <RedSLogo className="w-[58%]" />
            </div>
          </Rise>
          <div>
            <Rise>
              <Kicker>THE RED S</Kicker>
            </Rise>
            <Lines className="headline mt-5 text-[clamp(36px,3.8vw,62px)]" lines={["ONE LETTER.", "ONE SIGNAL."]} />
            <Rise delay={0.3} className="mt-7 max-w-[420px]">
              <p className="text-[17px] leading-[1.65] text-body">
                On Sport Line models the S of NAS is set in red, on the logo and on the bike&apos;s graphics alike. It marks the sportier character and the
                line built for performance.
              </p>
            </Rise>
          </div>
        </div>
      </section>

      {/* ───── Built from the wordmark ───── */}
      <section className="bg-surface-3">
        <SectionLine />
        <div className="container-moto py-[clamp(90px,10vw,150px)]">
          <SectionHead lines={["BUILT FROM", "THE WORDMARK."]} />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {P.wordmark.map((c, i) => (
              <Rise key={c.title} delay={i * MOTION.cardStagger}>
                <div className="h-full border border-line-3 p-8 transition-colors duration-300 hover:border-red/60">
                  <span className="text-[13px] font-bold tracking-[0.2em] text-red">
                    {String(i + 1).padStart(2, "0")} / {String(P.wordmark.length).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-[22px] font-extrabold uppercase leading-[1.15] tracking-[-0.01em]">{c.title}</h3>
                  <p className="mt-4 text-[15px] leading-[1.6] text-body">{c.text}</p>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Iron / Light / Concrete ───── */}
      <Materials />

      {/* ───── In the line ───── */}
      <section className="bg-ink">
        <div className="container-moto py-[clamp(90px,10vw,150px)]">
          <SectionHead lines={["IN THE", "LINE."]} aside="[Confirm which models carry the Sport Line badge.]" />
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {line.map((m, i) => (
              <Rise key={m.slug} delay={i * MOTION.cardStagger} duration={MOTION.image}>
                <Link
                  href={`/modelet/${m.slug}`}
                  className="group relative block aspect-[656/560] overflow-hidden border border-line-3 bg-[#111] text-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {m.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover brightness-[.6] transition-transform duration-[1.2s] ease-nas group-hover:scale-[1.06] group-focus-visible:scale-[1.06]"
                    />
                  )}
                  <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.5),transparent_25%,transparent_55%,rgba(10,10,10,.9))]" />
                  <div className="absolute inset-x-8 top-8 flex justify-between text-[13px] tracking-[0.14em] text-light">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span>SPORT LINE</span>
                  </div>
                  <div className="absolute inset-x-8 bottom-8 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="relative w-fit text-[clamp(28px,2.6vw,40px)] font-extrabold uppercase leading-none tracking-[-0.02em]">
                        {m.name}
                        <span
                          aria-hidden
                          className="absolute -bottom-4 left-0 h-[3px] w-14 bg-red transition-[width] duration-500 ease-nas group-hover:w-full group-focus-visible:w-full"
                        />
                      </h3>
                      <p className="mt-8 text-[14px] text-body">
                        {m.cc} cc · {m.type === "scooter" ? "scooter" : m.type}
                      </p>
                    </div>
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white/40 transition-colors duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black group-focus-visible:bg-white group-focus-visible:text-black">
                      <TbArrowRight size={18} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Rise>
            ))}
          </div>

          {/* Photo pair */}
          <div className="mt-[clamp(80px,9vw,140px)] grid items-start gap-4 md:grid-cols-[2fr_1fr]">
            {P.gallery.map((src, i) => (
              <Rise key={src} delay={i * 0.15} duration={MOTION.image}>
                <div className={`overflow-hidden bg-black ${i === 0 ? "aspect-[880/640]" : "aspect-[432/312]"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" className="size-full object-cover transition-transform duration-[1.2s] ease-nas hover:scale-[1.04]" />
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
