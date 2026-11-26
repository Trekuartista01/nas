"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { TbBuildingSkyscraper, TbClock, TbPower, TbRoad, TbRotate } from "react-icons/tb";
import Gauge from "@/components/finder/Gauge";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { SlashButton, SlashFrame } from "@/components/ui/Buttons";
import { TYPE_LABEL, TYPE_LABEL_EN, type Licence, type Model } from "@/data/models";
import { eur } from "@/lib/format";
import { BUSINESS } from "@/data/business";
import { matchModels, type Use } from "@/lib/finder";
import T from "@/components/i18n/T";
import { useLang } from "@/components/i18n/lang";
import type { Copy } from "@/lib/i18n";

const EASE = [0.2, 0.8, 0.2, 1] as const;

const LICENCES: { id: Licence; sub: Copy }[] = [
  { id: "AM", sub: { sq: "deri 50cc · skuterë të vegjël", en: "up to 50cc · small scooters" } },
  { id: "A1", sub: { sq: "deri 125cc", en: "up to 125cc" } },
  { id: "A2", sub: { sq: "deri 35 kW (~400cc)", en: "up to 35 kW (~400cc)" } },
  { id: "A", sub: { sq: "pa kufi fuqie", en: "no power limit" } },
];

const USES: { id: Use; title: Copy; sub: Copy; short: Copy; Icon: typeof TbRoad }[] = [
  {
    id: "city",
    title: { sq: "QYTET", en: "CITY" },
    sub: { sq: "Trafik, parkim, çdo ditë në punë", en: "Traffic, parking, to work every day" },
    short: { sq: "Qytet", en: "City" },
    Icon: TbBuildingSkyscraper,
  },
  {
    id: "trip",
    title: { sq: "RRUGË & UDHËTIME", en: "ROADS & TRIPS" },
    sub: { sq: "Autostradë, mal, fundjavë", en: "Motorway, mountains, weekends" },
    short: { sq: "Udhëtime", en: "Trips" },
    Icon: TbRoad,
  },
  {
    id: "daily",
    title: { sq: "PAK NGA TË GJITHA", en: "A BIT OF EVERYTHING" },
    sub: { sq: "Një motor për gjithçka", en: "One bike for everything" },
    short: { sq: "Të gjitha", en: "Everything" },
    Icon: TbClock,
  },
];

const STEP_LABELS: Copy[] = [
  { sq: "HAPI 1 / 3", en: "STEP 1 / 3" },
  { sq: "HAPI 2 / 3", en: "STEP 2 / 3" },
  { sq: "HAPI 3 / 3", en: "STEP 3 / 3" },
  { sq: "GATI", en: "READY" },
];

const tileBase =
  "flex min-h-[150px] flex-col justify-between border-2 p-5 text-left text-white transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-red";
const tileOn = "border-red bg-[#1a0605]";
const tileOff = "border-line-2 bg-ink";

function Swap({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      className="flex flex-1 flex-col gap-6"
    >
      {children}
    </motion.div>
  );
}

function StepTitle({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-extrabold tracking-[0.16em] text-red">{n}</div>
      <h3 className="wide mt-2 text-[clamp(28px,2.6vw,40px)] font-black leading-none">{children}</h3>
    </div>
  );
}

/** `models`: the published models, loaded on the server (lib/data/catalog.ts). */
export default function BikeFinder({ models, headingAs = "h2" }: { models: Model[]; headingAs?: "h1" | "h2" }) {
  const lang = useLang();
  const [step, setStep] = useState(0);
  const [licence, setLicence] = useState<Licence>("A2");
  const [use, setUse] = useState<Use>("city");
  const [budget, setBudget] = useState(5000);
  const [noLimit, setNoLimit] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const matches = useMemo(() => matchModels(models, { licence, use, budget, noLimit }), [models, licence, use, budget, noLimit]);
  const top = matches[0];
  const others = matches.slice(1, 4);
  const useShort = USES.find((u) => u.id === use)!.short[lang];
  const budgetText = noLimit ? (lang === "en" ? "No limit" : "Pa limit") : `≤ ${eur(budget)}`;

  const advance = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStep((s) => Math.min(2, s + 1)), 320);
  };

  const summarySteps = [
    { n: "01", title: <T sq="PATENTA" en="LICENCE" />, value: licence },
    { n: "02", title: <T sq="PËRDORIMI" en="RIDING" />, value: useShort },
    { n: "03", title: <T sq="BUXHETI" en="BUDGET" />, value: budgetText },
  ];

  return (
    <section className="container-moto py-36">
      <SectionHeading
        as={headingAs}
        lines={["WHICH BIKE", "CAN I RIDE"]}
        mark="?"
        aside={
          <p className="max-w-[380px] text-base leading-relaxed text-muted-2">
            <T
              sq="Tri pyetje, një përgjigje. Shiko gjilpërën — çdo zgjedhje ndryshon sa modele të përshtaten."
              en="Three questions, one answer. Watch the needle — every choice changes how many models fit."
            />
          </p>
        }
      />

      <Reveal className="flex flex-wrap items-stretch gap-4">
        {/* Instrument cluster */}
        <div className="relative flex min-w-0 flex-[1_1_380px] flex-col gap-6 overflow-hidden border border-[#222] bg-panel p-8">
          <div className="flex justify-between text-[11px] tracking-[0.16em] text-faint">
            <span>NAS · FINDER</span>
            <span>
              <T {...STEP_LABELS[step]} />
            </span>
          </div>
          <Gauge value={matches.length} max={models.length} />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {summarySteps.map((s, i) => (
              <button
                key={s.n}
                type="button"
                onClick={() => setStep(i)}
                aria-current={step === i ? "step" : undefined}
                className={`min-h-16 border px-3 py-2.5 text-left transition-colors ${
                  step === i ? "border-red text-red" : "border-line-2 text-muted hover:border-white"
                }`}
              >
                <div className="text-[10px] tracking-[0.16em] opacity-80">
                  {s.n} · {s.title}
                </div>
                <div className="mt-1 text-sm font-extrabold text-white">{s.value}</div>
              </button>
            ))}
          </div>
          <div className="h-1 bg-[#1f1f1f]">
            <motion.div
              className="h-full bg-red"
              animate={{ width: `${(Math.min(step, 3) / 3) * 100}%` }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          </div>
        </div>

        {/* Question / results stage */}
        <div className="flex min-h-[560px] min-w-0 flex-[1.4_1_520px] flex-col border border-[#222] bg-surface-2 p-[clamp(24px,3vw,44px)]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <Swap id="s0">
                <StepTitle n="01 / 03">
                  WHICH LICENCE DO YOU HAVE?
                </StepTitle>
                <div className="grid grid-cols-2 gap-3">
                  {LICENCES.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      aria-pressed={licence === l.id}
                      onClick={() => {
                        setLicence(l.id);
                        advance();
                      }}
                      className={`${tileBase} ${licence === l.id ? tileOn : tileOff}`}
                    >
                      <span className="inline-flex items-center gap-2 self-start border-2 border-current py-1 pl-1 pr-2.5 text-[11px] font-extrabold tracking-[0.1em]">
                        <span className="bg-[#1d4ed8] px-1.5 py-0.5 text-[9px] text-white">RKS</span>
                        <T sq="PATENTA" en="LICENCE" />
                      </span>
                      <span className="wide text-[52px] font-black leading-none">{l.id}</span>
                      <span className="text-[13px] text-[#bdbdbd]">
                        <T {...l.sub} />
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-faint">
                  <T sq="Shtyp një kartë — kalon vetë te pyetja tjetër." en="Tap a card — you move on to the next question by yourself." />
                </p>
              </Swap>
            )}

            {step === 1 && (
              <Swap id="s1">
                <StepTitle n="02 / 03">
                  WHERE WILL YOU RIDE?
                </StepTitle>
                <div className="grid gap-3 sm:grid-cols-3">
                  {USES.map(({ id, title, sub, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={use === id}
                      onClick={() => {
                        setUse(id);
                        advance();
                      }}
                      className={`${tileBase} ${use === id ? tileOn : tileOff}`}
                    >
                      <span className="flex size-12 items-center justify-center border border-[#2c2c2c] bg-ink">
                        <Icon size={26} aria-hidden />
                      </span>
                      <span>
                        <span className="wide block text-[clamp(17px,1.6vw,22px)] font-black">
                          <T {...title} />
                        </span>
                        <span className="mt-1 block text-[13px] text-[#bdbdbd]">
                          <T {...sub} />
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setStep(0)} className="min-h-11 self-start text-[13px] text-[#cfcfcf] hover:text-white">
                  ← <T sq="Mbrapa" en="Back" />
                </button>
              </Swap>
            )}

            {step === 2 && (
              <Swap id="s2">
                <StepTitle n="03 / 03">
                  HOW MUCH DO YOU WANT TO SPEND?
                </StepTitle>
                <div className="flex flex-wrap items-baseline gap-3.5">
                  <div className="wide text-[clamp(64px,7vw,104px)] font-black leading-[0.9] tracking-[-0.03em] tabular-nums">
                    {noLimit ? <T sq="PA LIMIT" en="NO LIMIT" /> : eur(budget)}
                  </div>
                  <div className="text-sm text-muted">
                    {matches.length}{" "}
                    <T sq={`${matches.length === 1 ? "model" : "modele"} brenda kësaj shume`} en={`${matches.length === 1 ? "model" : "models"} within this budget`} />
                  </div>
                </div>
                <div>
                  <label htmlFor="finder-budget" className="text-[13px] text-[#cfcfcf]">
                    <T sq="Lëviz rrëshqitësin — gjilpëra reagon menjëherë" en="Move the slider — the needle reacts straight away" />
                  </label>
                  <input
                    id="finder-budget"
                    type="range"
                    min={1000}
                    max={10000}
                    step={250}
                    value={budget}
                    onChange={(e) => {
                      setBudget(Number(e.target.value));
                      setNoLimit(false);
                    }}
                    className="mt-2.5"
                  />
                  <div className="flex justify-between text-[11px] tracking-[0.1em] text-[#777]">
                    <span>€1.000</span>
                    <span>€5.000</span>
                    <span>€10.000</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    aria-pressed={noLimit}
                    onClick={() => setNoLimit((v) => !v)}
                    className={`min-h-11 border px-4.5 text-[13px] font-bold transition-colors ${
                      noLimit ? "border-white bg-white text-ink" : "border-[#333] text-[#cfcfcf] hover:border-white"
                    }`}
                  >
                    <T sq="Pa limit buxheti" en="No budget limit" />
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                  <button type="button" onClick={() => setStep(1)} className="min-h-11 text-[13px] text-[#cfcfcf] hover:text-white">
                    ← <T sq="Mbrapa" en="Back" />
                  </button>
                  <SlashFrame>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="slant-lg btn-sheen flex min-h-16 animate-glow items-center gap-3 bg-red px-11 text-[15px] font-black italic tracking-[0.12em] text-white"
                    >
                      <TbPower size={20} aria-hidden />
                      <T sq="NDIZE MOTORIN" en="START THE ENGINE" />
                    </button>
                  </SlashFrame>
                </div>
              </Swap>
            )}

            {step === 3 && (
              <Swap id="s3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-extrabold tracking-[0.16em] text-red">
                    <T sq="REZULTATI" en="RESULT" /> · {licence} · {useShort.toUpperCase()} · {budgetText.toUpperCase()}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="flex min-h-10 items-center gap-1.5 border border-[#333] px-3.5 text-xs text-[#cfcfcf] hover:border-white"
                  >
                    <TbRotate size={14} aria-hidden /> <T sq="Fillo nga e para" en="Start over" />
                  </button>
                </div>

                {top ? (
                  <>
                    <div className="flex flex-wrap border border-red bg-ink">
                      <div className="hatch relative flex min-h-[220px] flex-[1_1_240px] items-center justify-center overflow-hidden text-[11px] tracking-[0.14em] text-[#6f6f6f]">
                        {top.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={top.image} alt={`${top.brand} ${top.name}`} className="absolute inset-0 size-full object-cover" />
                        ) : (
                          <>[FOTO · {top.name}]</>
                        )}
                        <span className="absolute left-3.5 top-3.5 bg-highlight px-2.5 py-1.5 text-[11px] font-black tracking-[0.12em] text-ink">
                          <T sq="ZGJEDHJA JONË" en="OUR PICK" />
                        </span>
                      </div>
                      <div className="flex flex-[1_1_260px] flex-col gap-3 p-6">
                        <div className="flex items-center gap-3.5">
                          <MatchRing score={top.score} />
                          <div className="text-xs leading-snug text-muted">
                            <T
                              sq={
                                <>
                                  përputhje me
                                  <br />
                                  përgjigjet e tua
                                </>
                              }
                              en={
                                <>
                                  match with
                                  <br />
                                  your answers
                                </>
                              }
                            />
                          </div>
                        </div>
                        <div className="text-[11px] tracking-[0.14em] text-faint">
                          {top.brand} · <T sq={TYPE_LABEL[top.type]} en={TYPE_LABEL_EN[top.type]} />
                        </div>
                        <div className="wide text-[32px] font-black leading-none">{top.name}</div>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="border border-[#2c2c2c] px-2 py-1 text-[11px] font-bold">{top.cc}cc</span>
                          <span className="border border-[#2c2c2c] px-2 py-1 text-[11px] font-bold">
                            <T sq="PATENTA" en="LICENCE" /> {top.licence}
                          </span>
                        </div>
                        <div className="mt-auto flex items-baseline gap-3">
                          <span className="text-[28px] font-black">{eur(top.price)}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-3">
                          <SlashButton href={`/modelet/${top.slug}`} size="sm">
                            <T sq="SHIKO MODELIN" en="SEE THE MODEL" />
                          </SlashButton>
                        </div>
                      </div>
                    </div>

                    {others.length > 0 && (
                      <>
                        <div className="text-xs tracking-[0.14em] text-faint">
                          <T sq="EDHE KËTO TË PËRSHTATEN" en="THESE FIT TOO" />
                        </div>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
                          {others.map((m, i) => (
                            <motion.div
                              key={m.slug}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.08 }}
                            >
                              <Link
                                href={`/modelet/${m.slug}`}
                                className="flex flex-col gap-1.5 border border-line-2 bg-ink p-3.5 text-white transition-[transform,border-color] duration-500 hover:-translate-y-1.5 hover:border-red hover:text-white"
                              >
                                <div className="flex justify-between text-[11px] tracking-[0.1em] text-faint">
                                  <span>{m.brand}</span>
                                  <span className="font-extrabold text-highlight">{m.score}%</span>
                                </div>
                                <div className="wide text-[17px] font-extrabold">{m.name}</div>
                                <div className="h-[3px] bg-[#222]">
                                  <motion.div
                                    className="h-full bg-red"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${m.score}%` }}
                                    transition={{ duration: 0.9, ease: EASE, delay: 0.2 + i * 0.08 }}
                                  />
                                </div>
                                <div className="text-sm font-bold">{eur(m.price)}</div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="border border-dashed border-[#333] p-8 text-[15px] leading-relaxed text-[#bdbdbd]">
                    <T
                      sq={
                        <>
                          Asnjë model nuk përshtatet me këtë kombinim. Rrit buxhetin, ndrysho përdorimin — ose{" "}
                          <a href={`tel:${BUSINESS.phone}`} className="text-highlight hover:underline">
                            na telefono
                          </a>
                          , sjellim edhe me porosi.
                        </>
                      }
                      en={
                        <>
                          No model fits this combination. Raise the budget, change how you ride — or{" "}
                          <a href={`tel:${BUSINESS.phone}`} className="text-highlight hover:underline">
                            call us
                          </a>
                          , we can also order one in.
                        </>
                      }
                    />
                  </div>
                )}
              </Swap>
            )}
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}

function MatchRing({ score }: { score: number }) {
  return (
    <div className="relative size-16 flex-none">
      <svg viewBox="0 0 36 36" className="size-16 -rotate-90" aria-hidden>
        <circle cx={18} cy={18} r={15.9} fill="none" stroke="#222" strokeWidth={3} />
        <motion.circle
          cx={18}
          cy={18}
          r={15.9}
          fill="none"
          stroke="var(--color-highlight)"
          strokeWidth={3}
          strokeDasharray={100}
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 100 - score }}
          transition={{ type: "spring", stiffness: 60, damping: 14 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[15px] font-black">{score}%</span>
    </div>
  );
}
