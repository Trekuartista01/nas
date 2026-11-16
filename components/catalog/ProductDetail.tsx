"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { eur } from "@/lib/format";

export interface ProductView {
  label: string;
  image?: string;
}

export interface ProductSpec {
  value: string;
  unit?: string;
  label: string;
}

export interface ProductColour {
  name: string;
  hex: string;
}

export interface RelatedProduct {
  href: string;
  brand: string;
  name: string;
  price: number;
  image?: string;
  cutout?: boolean;
}

interface ProductDetailProps {
  brand: string;
  name: string;
  /** Giant outlined word repeated behind the product (e.g. "HELMET"). */
  word: string;
  views: ProductView[];
  isNew?: boolean;
  /** Transparent cut-out photo: shown whole on the stage, without the edge-fade mask. */
  cutout?: boolean;
  colours?: ProductColour[];
  specs: ProductSpec[];
  price: number;
  related: RelatedProduct[];
}

/**
 * Product detail layout (design: Moto Shpati Aksesoret Detail Page.png).
 * Built generic so /modelet/[slug] can reuse it with bike views and specs.
 */
export default function ProductDetail({ brand, name, word, views, isNew = false, cutout = false, colours = [], specs, price, related }: ProductDetailProps) {
  const [view, setView] = useState(0);
  const [colour, setColour] = useState(0);
  const current = views[view];

  return (
    <>
      {/* ───── Stage ───── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="wide pointer-events-none absolute inset-x-0 top-[70px] select-none whitespace-nowrap pl-4 text-[90px] font-black italic uppercase leading-none tracking-[-0.02em] text-transparent [-webkit-text-stroke:1.5px_#2c2c2c] sm:top-[80px] sm:pl-6 sm:text-[150px] lg:top-[90px] lg:pl-10 lg:text-[200px]"
        >
          {word}&nbsp;&nbsp;{word}&nbsp;&nbsp;{word}
        </div>

        <div className="container-moto relative grid min-h-[420px] grid-rows-[1fr_auto] pb-6 pt-10 sm:min-h-[520px] lg:min-h-[600px] lg:pt-16">
          {/* Product photo, edges faded into the page */}
          <div className="relative mx-auto flex w-full max-w-[560px] items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                className={`aspect-[0.9/1] w-full lg:aspect-[1.05/1] ${cutout ? "" : "[mask-image:radial-gradient(ellipse_at_center,#000_45%,transparent_72%)]"}`}
              >
                {current?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={current.image} alt={`${brand} ${name}, pamja ${current.label.toLowerCase()}`} className={`size-full ${cutout ? "object-contain" : "object-cover"}`} />
                ) : (
                  <span className="flex size-full items-center justify-center text-xs tracking-[0.14em] text-[#6f6f6f]">
                    [FOTO · {name} · {current?.label}]
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* View tabs (left on desktop, a row under the photo on mobile) */}
          {views.length > 1 && (
            <div
              role="tablist"
              aria-label="Pamjet e produktit"
              className="mt-6 flex flex-wrap gap-2 lg:absolute lg:left-14 lg:top-[190px] lg:mt-0 lg:flex-col lg:gap-3"
            >
              {views.map((v, i) => (
                <button
                  key={v.label}
                  type="button"
                  role="tab"
                  aria-selected={i === view}
                  onClick={() => setView(i)}
                  className={`min-h-11 min-w-[100px] border px-3 text-[13px] uppercase transition-colors lg:min-h-9 ${
                    i === view ? "border-red bg-red text-white" : "border-[#3a3a3a] bg-ink/60 text-white hover:border-white"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}

          {isNew && (
            <span className="absolute right-4 top-[150px] bg-red px-3 py-1 text-[11px] font-semibold sm:right-6 lg:right-14 lg:top-[190px]">
              E RE
            </span>
          )}
          <span className="absolute bottom-6 right-4 hidden text-[15px] text-muted sm:right-6 sm:block lg:right-14">360 pamje</span>
        </div>
      </section>

      {/* ───── Name, colour, specs ───── */}
      <section className="container-moto pb-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-lg uppercase text-muted">{brand}</div>
            <h1 className="mt-1 text-[clamp(34px,4vw,48px)] font-bold uppercase leading-none">
              {name}
              <span className="text-red">.</span>
            </h1>
          </div>
          {colours.length > 0 && (
            <div>
              <p className="mb-3 text-[13px] text-muted">
                Ngjyra: <span className="text-white/90">{colours[colour].name}</span>
              </p>
              <div role="radiogroup" aria-label="Ngjyra" className="flex gap-7">
                {colours.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    role="radio"
                    aria-checked={i === colour}
                    aria-label={c.name}
                    onClick={() => setColour(i)}
                    className={`size-11 rounded-full border transition-shadow ${
                      i === colour ? "border-white shadow-[0_0_0_3px_var(--color-ink),0_0_0_4px_#fff]" : "border-[#555]"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1} className="mt-10 grid grid-cols-2 border border-line md:grid-cols-[repeat(4,1fr)_1.05fr]">
          {specs.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col justify-center gap-1 border-line px-6 py-5 lg:px-8 ${i % 2 === 0 ? "border-r" : "md:border-r"} ${
                i < 2 ? "border-b md:border-b-0" : ""
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[clamp(26px,2.6vw,40px)] font-bold leading-none">{s.value}</span>
                {s.unit && <span className="text-lg font-semibold text-muted">{s.unit}</span>}
              </div>
              <span className="text-[11px] uppercase text-muted">{s.label}</span>
            </div>
          ))}
          <div className="col-span-2 flex flex-col items-center justify-center bg-red py-6 md:col-span-1">
            <span className="text-[clamp(34px,3.4vw,48px)] font-bold leading-none">{eur(price)}</span>
            <span className="mt-1.5 text-[10px] uppercase text-white/75">Çmim demo</span>
          </div>
        </Reveal>
      </section>

      {/* ───── You may also like ───── */}
      {related.length > 0 && (
        <section className="bg-[#171717]">
          <div className="container-moto pb-24 pt-14">
            <Reveal>
              <h2 className="text-[clamp(40px,4.4vw,58px)] font-bold uppercase leading-[1.05]">
                <span className="block">YOU MAY</span>
                <span className="block">
                  ALSO LIKE<span className="text-red">.</span>
                </span>
              </h2>
            </Reveal>
            <div className="mx-auto mt-16 grid max-w-[1300px] gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12 lg:px-11">
              {related.map((r, i) => (
                <Reveal key={r.href} delay={i * 0.08}>
                  <Link href={r.href} className="group block border-[6px] border-black bg-black">
                    <div className="aspect-[1.97/1] overflow-hidden bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#111]">
                      {r.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.image}
                          alt={`${r.brand} ${r.name}`}
                          className={`size-full transition-transform duration-700 ease-moto group-hover:scale-[1.05] ${r.cutout ? "object-contain p-2" : "object-cover"}`}
                        />
                      )}
                    </div>
                    <div className="flex items-end justify-between gap-4 px-0.5 pb-2 pt-4">
                      <div>
                        <div className="text-[11px] text-faint">{r.brand}</div>
                        <div className="mt-0.5 text-lg font-bold uppercase transition-colors group-hover:text-red">{r.name}</div>
                      </div>
                      <div className="text-lg font-bold">{eur(r.price)}</div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/** Same-height placeholder for the stage while the product streams in (avoids a layout jump). */
export function ProductDetailSkeleton() {
  return (
    <div aria-hidden className="container-moto">
      <div className="min-h-[420px] sm:min-h-[520px] lg:min-h-[600px]" />
      <div className="h-10 w-48 bg-surface" />
      <div className="mt-10 h-[104px] border border-line" />
    </div>
  );
}
