"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import { LINEUP_EASE, useLineupReveal } from "@/components/catalog/LineupReveal";
import { TbSearch } from "react-icons/tb";
import Reveal from "@/components/ui/Reveal";
import { eur } from "@/lib/format";

/* Shared building blocks for the catalog list pages (/modelet, /aksesoret). */

/** Page title with the giant outlined word behind it. */
export function CatalogHero({ title }: { title: string }) {
  return (
    <section className="relative overflow-hidden">
      <div className="container-moto relative flex h-[200px] items-center sm:h-[260px] lg:h-[320px]">
        <span
          aria-hidden
          className="wide pointer-events-none absolute left-[22%] top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[96px] font-black italic uppercase leading-none tracking-[-0.03em] text-transparent [-webkit-text-stroke:1.5px_#2a2a2a] sm:text-[150px] lg:text-[250px]"
        >
          {title}
        </span>
        <h1 className="wide relative text-[40px] font-black italic uppercase leading-none tracking-[-0.03em] sm:text-[64px] lg:text-[84px]">
          {title}
        </h1>
      </div>
    </section>
  );
}

/** A fragment's children as a flat list (so each filter block can get its own entrance). */
function pieces(node: ReactNode): ReactNode[] {
  if (isValidElement(node) && node.type === Fragment) return Children.toArray((node as ReactElement<{ children?: ReactNode }>).props.children);
  return Children.toArray(node);
}

/**
 * Behind the /modelet shutter (LineupReveal is true/false): wait, then fade in while moving into
 * place, `order` steps after the door is half open. `from`: "below" rises 28px; "left" slides 24px in
 * (the filter column scrolls on its own, and an offset downwards would flash its scrollbar; one to
 * the left never overflows). Elsewhere (null) the piece renders as before, untouched.
 */
function Entrance({ order, from = "below", className, children }: { order: number; from?: "below" | "left"; className?: string; children: ReactNode }) {
  const reveal = useLineupReveal();
  if (reveal === null) return className ? <div className={className}>{children}</div> : <>{children}</>;
  const away = from === "left" ? { opacity: 0, x: -24 } : { opacity: 0, y: 28 };
  return (
    <motion.div
      className={className}
      initial={away}
      animate={reveal ? { opacity: 1, x: 0, y: 0 } : away}
      transition={{ duration: 0.7, ease: LINEUP_EASE, delay: reveal ? 0.05 + order * 0.06 : 0 }}
    >
      {children}
    </motion.div>
  );
}

/** Sidebar + results layout. */
export function CatalogLayout({ filters, toolbar, children }: { filters: ReactNode; toolbar: ReactNode; children: ReactNode }) {
  return (
    <section className="container-moto pb-28 pt-[44px]">
      <div className="grid gap-10 lg:grid-cols-[373px_1fr] lg:gap-12">
        {/* Desktop: the filters stay in view while the grid scrolls (top clears the sticky header).
            If they are taller than the screen they scroll on their own. The 72px top margin (the sort
            row: 48px + 24px) puts the search box level with the first row of cards. */}
        <aside
          aria-label="Filtrat"
          className="flex flex-col gap-10 lg:sticky lg:mt-[72px] lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pb-2 lg:pr-2 lg:[scrollbar-width:thin]"
        >
          {pieces(filters).map((piece, i) => (
            <Entrance key={i} order={i} from="left">
              {piece}
            </Entrance>
          ))}
        </aside>
        <div>
          <Entrance order={0} className="mb-6 flex flex-wrap items-center justify-between gap-4 lg:justify-end">
            {toolbar}
          </Entrance>
          {children}
          <Reveal className="mt-16 lg:mt-[100px]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-l-4 border-red bg-[#141414] px-6 py-4">
              <p className="text-[15px]">Nuk po e gjen modelin e duhur? Na trego si udhëton dhe të këshillojmë.</p>
              <Link
                href="/kontakti"
                className="border-b border-white pb-0.5 text-[15px] tracking-[0.02em] transition-colors hover:border-red hover:text-red"
              >
                KËRKO OFERTË
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function SearchField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Kërko"
        className="h-12 w-full border border-line-2 bg-transparent pl-6 pr-12 text-[15px] text-white placeholder:text-muted focus:border-[#555] focus:outline-none"
      />
      <TbSearch size={20} aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
    </label>
  );
}

export function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-4 text-[15px]">{title}</legend>
      {children}
    </fieldset>
  );
}

export interface Option<T extends string> {
  id: T;
  label: string;
}

export function ChipGrid<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-2.5">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={`h-12 border text-[15px] transition-colors ${
              active ? "border-red bg-red text-white" : "border-line-2 text-white hover:border-[#555]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Full-width dropdown whose red caret follows the selected label (as designed). */
export function InlineSelect<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const current = options.find((o) => o.id === value)?.label ?? "";
  return (
    <div className="relative flex h-12 items-center gap-2.5 border border-line-2 pl-7 text-[15px] focus-within:border-[#555]">
      <span aria-hidden>{current}</span>
      <Caret />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={label}
        className="absolute inset-0 cursor-pointer appearance-none bg-ink opacity-0"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Handle width in px. The native thumb is the same width, so the drawn handle sits exactly where the browser's would. */
const THUMB = 18;

/**
 * Track, red fill and slanted handle are drawn as real elements from ONE position formula.
 * The native range input sits invisibly on top and handles drag, keyboard and screen readers.
 * (Styling the native track with a CSS variable lagged in Chrome and left stray red lines.)
 */
export function PriceRange({ value, max, onChange, step = 100 }: { value: number; max: number; onChange: (v: number) => void; step?: number }) {
  const min = step;
  const ratio = max > min ? (value - min) / (max - min) : 1;
  // Same maths the browser uses for the thumb centre: half a thumb in from each end.
  const centre = `calc(${THUMB / 2}px + ${ratio} * (100% - ${THUMB}px))`;

  return (
    <div>
      <div className="flex items-baseline justify-between text-[15px]">
        <span id="price-label">ÇMIMI DERI NË</span>
        <span>{eur(value)}</span>
      </div>
      <div className="relative mt-3 h-6 outline-offset-4 outline-red has-[:focus-visible]:outline-2">
        <div aria-hidden className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-line-2" />
        <div aria-hidden className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-red" style={{ width: centre }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-labelledby="price-label"
          aria-valuetext={eur(value)}
          className="price-range absolute inset-0 m-0 size-full cursor-pointer opacity-0"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 h-3.5 -translate-x-1/2 -translate-y-1/2 bg-red [clip-path:polygon(45%_0,100%_0,55%_100%,0_100%)]"
          style={{ left: centre, width: THUMB }}
        />
      </div>
    </div>
  );
}

export function ClearFilters({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start border-b border-white pb-0.5 text-[15px] transition-colors hover:border-red hover:text-red"
    >
      Pastro filtrat
    </button>
  );
}

export function SortSelect<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex items-center gap-4">
      <label htmlFor="sort" className="text-[15px] text-[#6a6a6a]">
        Rendit sipas
      </label>
      <div className="relative">
        <select
          id="sort"
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-12 w-[220px] cursor-pointer appearance-none border border-line-2 bg-ink pl-5 pr-10 text-[15px] focus:border-[#555] focus:outline-none"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <Caret className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}

export function ResultCount({ count, noun }: { count: number; noun: string }) {
  return (
    <p className="text-[13px] text-muted lg:hidden" aria-live="polite">
      {count} {noun}
    </p>
  );
}

/** Animated 3-column results grid with an empty state. */
export function CatalogGrid<T>({
  items,
  getKey,
  render,
  emptyTitle,
  onClear,
}: {
  items: T[];
  getKey: (item: T) => string;
  render: (item: T) => ReactNode;
  emptyTitle: string;
  onClear: () => void;
}) {
  // Behind the /modelet shutter: the cards wait for the door, then rise in one after another.
  const reveal = useLineupReveal();
  const gated = reveal !== null;
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 border border-line py-16 pl-8">
        <p className="headline text-2xl">
          {emptyTitle}
          <span className="text-red">.</span>
        </p>
        <p className="text-muted">Asgjë nuk përputhet me filtrat e zgjedhur.</p>
        <ClearFilters onClick={onClear} />
      </div>
    );
  }
  return (
    <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => (
          <motion.div
            key={getKey(item)}
            layout
            initial={{ opacity: 0, y: 40 }}
            animate={gated && !reveal ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={
              gated
                ? { duration: 0.75, ease: LINEUP_EASE, delay: reveal ? 0.15 + Math.min(i, 8) * 0.07 : 0 }
                : { duration: 0.5, ease: LINEUP_EASE, delay: Math.min(i, 8) * 0.04 }
            }
          >
            {render(item)}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export function Caret({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden width="10" height="6" viewBox="0 0 10 6" className={`fill-red ${className}`}>
      <path d="M0 0h10L5 6z" />
    </svg>
  );
}
