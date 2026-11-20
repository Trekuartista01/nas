"use client";

import { AnimatePresence, motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";
import { TbGasStation, TbMotorbike } from "react-icons/tb";
import Reveal from "@/components/ui/Reveal";
import { SlashButton } from "@/components/ui/Buttons";
import type { Model } from "@/data/models";
import { DEPOSIT_STEPS, monthlyPayment, TERM_OPTIONS, type Term } from "@/lib/finance";
import { eur, eurCents, monthYearSq } from "@/lib/format";

const ANCHOR = "financim";
const EASE = [0.2, 0.8, 0.2, 1] as const;

const noopSubscribe = () => () => {};

function lastPaymentMonth(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return monthYearSq(d);
}

interface Props {
  /** Published models (loaded on the server: lib/data/catalog.ts). */
  models: Model[];
  /** Preselect a model (model detail pages). */
  initialModelSlug?: string;
  /** Show the big section heading (on /financim). */
  withHeading?: boolean;
}

export default function FinanceCalculator(props: Props) {
  // Nothing published (everything hidden in the admin): leave the section out rather than show an empty calculator.
  if (props.models.length === 0) return null;
  return <Calculator {...props} />;
}

function Calculator({ models, initialModelSlug, withHeading = true }: Props) {
  const getModel = (slug: string) => models.find((m) => m.slug === slug);
  const initial = (initialModelSlug && getModel(initialModelSlug)) || models[0];
  const [modelSlug, setModelSlug] = useState<string | "custom">(initial.slug);
  const [price, setPrice] = useState(initial.price);
  const [deposit, setDeposit] = useState(20);
  const [months, setMonths] = useState<Term>(24);

  const monthly = monthlyPayment(price, deposit, months);
  const depositAmount = (price * deposit) / 100;

  // Animated monthly figure.
  const spring = useSpring(monthly, { stiffness: 110, damping: 20 });
  useEffect(() => spring.set(monthly), [monthly, spring]);
  const monthlyText = useTransform(spring, (v) => eur(v));

  // Last payment month — client only, so the server render never bakes in a stale date.
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const lastPay = isClient ? lastPaymentMonth(months) : "";

  const roadPct = (months / 48) * 100;
  const chips = models;

  return (
    <section id={ANCHOR} className="scroll-mt-20 bg-bone text-ink">
      <div className="container-moto py-32">
        {withHeading && (
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-8">
            <div>
              <div className="mb-6 inline-block bg-ink px-3 py-2 text-xs font-extrabold tracking-[0.14em] text-highlight">
                FINANCIM
              </div>
              <h2 className="headline text-[clamp(44px,5vw,80px)]">
                <span className="block">
                  RIDE NOW<span className="text-red">.</span>
                </span>
                <span className="block">
                  PAY MONTHLY<span className="text-red">.</span>
                </span>
              </h2>
            </div>
            <p className="max-w-[400px] text-base leading-relaxed text-[#3a3a3a]">
              Ndërto ofertën tënde në tre hapa. Aplikimi bëhet në showroom ose online me [BANKA PARTNERE].
            </p>
          </Reveal>
        )}

        <Reveal className="flex flex-col gap-4">
          {/* 01 — pick a bike */}
          <div className="border border-[#d8d3ca] bg-white p-7">
            <div className="mb-4.5 flex flex-wrap items-baseline justify-between gap-3">
              <div className="text-[13px] font-extrabold tracking-[0.12em]">
                <span className="text-red">01</span>&nbsp; ZGJIDH MOTORIN
              </div>
              <div className="text-[13px] text-[#5a5a5a]">
                Çmimi: <strong className="text-lg text-ink">{eur(price)}</strong>
              </div>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1.5" role="group" aria-label="Zgjidh motorin">
              {chips.map((m) => {
                const on = modelSlug === m.slug;
                return (
                  <button
                    key={m.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setModelSlug(m.slug);
                      setPrice(m.price);
                    }}
                    className={`min-h-[76px] min-w-[168px] flex-none border-2 px-4 py-3 text-left transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 ${
                      on ? "border-ink bg-ink text-white" : "border-[#d8d3ca] bg-white text-ink hover:border-ink"
                    }`}
                  >
                    <div className="text-[10px] tracking-[0.14em] opacity-70">{m.brand}</div>
                    <div className="wide mt-0.5 text-[15px] font-black">{m.name}</div>
                    <div className="mt-1 text-[13px] font-semibold">{eur(m.price)}</div>
                  </button>
                );
              })}
              <button
                type="button"
                aria-pressed={modelSlug === "custom"}
                onClick={() => setModelSlug("custom")}
                className={`min-h-[76px] min-w-[168px] flex-none border-2 px-4 py-3 text-left transition-colors ${
                  modelSlug === "custom" ? "border-ink bg-ink text-white" : "border-[#d8d3ca] bg-white text-ink hover:border-ink"
                }`}
              >
                <div className="text-[10px] tracking-[0.14em] opacity-70">TJETËR</div>
                <div className="wide mt-0.5 text-[15px] font-black">Çmim tjetër</div>
                <div className="mt-1 text-[13px] font-semibold">vendos vetë</div>
              </button>
            </div>
            <AnimatePresence>
              {modelSlug === "custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4.5">
                    <label htmlFor="fin-price" className="text-[13px] text-[#3a3a3a]">
                      Vendos çmimin e motorit
                    </label>
                    <input
                      id="fin-price"
                      type="range"
                      min={1000}
                      max={10000}
                      step={100}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* 02 — deposit as fuel cells */}
            <div className="min-w-0 flex-[1_1_420px] border border-[#d8d3ca] bg-white p-7">
              <div className="mb-4.5 flex items-baseline justify-between gap-3">
                <div className="text-[13px] font-extrabold tracking-[0.12em]">
                  <span className="text-red">02</span>&nbsp; KAPARI
                </div>
                <div className="text-[13px] text-[#5a5a5a]">
                  <strong className="text-lg text-ink">{deposit}%</strong> · {eur(depositAmount)}
                </div>
              </div>
              <div role="group" aria-label="Zgjidh kaparin" className="grid h-24 grid-cols-11 items-end gap-1.5">
                {DEPOSIT_STEPS.map((v, i) => {
                  const fill = v === deposit ? "bg-ink" : v < deposit ? "bg-red" : "bg-[#e6e1d8] hover:bg-[#d8d3ca]";
                  return (
                    <button
                      key={v}
                      type="button"
                      aria-label={`Kapar ${v}%`}
                      aria-pressed={v === deposit}
                      onClick={() => setDeposit(v)}
                      className={`min-h-11 origin-bottom transition-[background-color,transform] duration-200 hover:scale-y-105 ${fill}`}
                      style={{ height: `${34 + i * 6.6}%` }}
                    />
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-[11px] tracking-[0.1em] text-[#6a6a6a]">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
              <div className="mt-3.5 flex items-center gap-2 text-xs text-[#5a5a5a]">
                <TbGasStation size={16} aria-hidden />
                Mbush rezervuarin: më shumë kapar, këst më i ulët.
              </div>
            </div>

            {/* 03 — term as a road */}
            <div className="min-w-0 flex-[1_1_420px] border border-[#d8d3ca] bg-white p-7">
              <div className="mb-4.5 flex items-baseline justify-between gap-3">
                <div className="text-[13px] font-extrabold tracking-[0.12em]">
                  <span className="text-red">03</span>&nbsp; PERIUDHA
                </div>
                <div className="text-[13px] text-[#5a5a5a]">
                  <strong className="text-lg text-ink">{months} muaj</strong>
                </div>
              </div>
              <div className="relative h-24">
                <div className="absolute inset-x-0 top-10 h-[22px] bg-[#1a1a1a]" />
                <div
                  className="absolute inset-x-0 top-[50px] h-0.5"
                  style={{ background: "repeating-linear-gradient(90deg,#fff 0 18px,transparent 18px 34px)" }}
                />
                <motion.div
                  className="absolute left-0 top-10 h-[22px] bg-red/90"
                  animate={{ width: `${roadPct}%` }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
                <motion.div
                  className="absolute top-1.5 flex h-8 w-11 -translate-x-1/2 items-center justify-center text-ink"
                  animate={{ left: `${roadPct}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 12 }}
                  style={{ marginLeft: roadPct === 100 ? -22 : 0 }}
                >
                  <TbMotorbike size={36} aria-hidden />
                </motion.div>
                <div className="absolute inset-x-0 top-[66px] grid grid-cols-4" role="group" aria-label="Zgjidh periudhën">
                  {TERM_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={months === m}
                      onClick={() => setMonths(m)}
                      className={`min-h-11 text-right text-sm font-extrabold transition-colors ${
                        months === m ? "text-red" : "text-[#6a6a6a] hover:text-ink"
                      }`}
                    >
                      {m} m
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-2.5 text-xs text-[#5a5a5a]">
                Pagesa e fundit: <strong className="text-ink">{lastPay || "—"}</strong>
              </div>
            </div>
          </div>

          {/* Result slab */}
          <div className="relative flex flex-wrap items-center gap-10 overflow-hidden bg-ink p-[clamp(24px,3vw,40px)] text-white">
            <div
              aria-hidden
              className="stripes absolute -right-10 inset-y-0 hidden w-[180px] opacity-90 md:block"
              style={{ clipPath: "polygon(40% 0,100% 0,100% 100%,0 100%)" }}
            />
            <div className="relative min-w-0 flex-[1_1_320px]">
              <div className="text-xs tracking-[0.14em] text-muted">KËSTI YT MUJOR</div>
              <div
                className="wide text-[clamp(72px,8vw,128px)] font-black leading-[0.9] tracking-[-0.03em] tabular-nums"
                aria-live="polite"
              >
                <motion.span>{monthlyText}</motion.span>
                <span className="text-lg font-medium tracking-normal text-muted"> /muaj</span>
              </div>
              <div className="mt-3 text-[15px] text-[#cfcfcf]">
                ≈ <strong className="text-highlight">{eurCents(monthly / 30)} në ditë</strong> — sa një kafe në Pejë.
              </div>
            </div>
            <div className="relative flex min-w-0 flex-[1_1_360px] flex-col gap-3.5 md:pr-[120px]">
              <div className="flex h-3.5 overflow-hidden bg-[#222]">
                <motion.div className="h-full bg-white" animate={{ width: `${deposit}%` }} transition={{ duration: 0.8, ease: EASE }} />
                <motion.div className="h-full bg-red" animate={{ width: `${100 - deposit}%` }} transition={{ duration: 0.8, ease: EASE }} />
              </div>
              <div className="flex flex-wrap justify-between gap-3 text-[13px]">
                <span>
                  <span className="mr-2 inline-block size-2.5 bg-white" />
                  Kapar sot · <strong>{eur(depositAmount)}</strong>
                </span>
                <span>
                  <span className="mr-2 inline-block size-2.5 bg-red" />
                  Me këste · <strong>{eur(price - depositAmount)}</strong>
                </span>
              </div>
              <p className="text-[11px] text-faint">Shembull pa interes — norma reale dhe kushtet nga [BANKA PARTNERE].</p>
              <SlashButton href={`/financim?model=${modelSlug}#apliko`} className="self-start">
                APLIKO PËR KËTË OFERTË →
              </SlashButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
