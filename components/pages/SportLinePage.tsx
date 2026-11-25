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
import { MOTION } from "@/lib/motion";


/**
 * SPORT LINE (design "NAS — Sport Line", Nov 2026): centred hero with the red-S logo, the idea,
 * "one letter, one signal", built from the wordmark, and Iron / Light / Concrete.
 * Copy is English, as in the design. (The "In the line" model cards and the photo pair above the footer were removed, Nov 2026.)
 */
export default function SportLinePage() {
  const P = NAS_PAGES.sportLine;

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
    </>
  );
}
