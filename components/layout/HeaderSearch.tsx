"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { TbArrowRight, TbSearch, TbX } from "react-icons/tb";
import { modelSearchIndex, TYPE_LABEL, type Model, type VehicleType } from "@/data/models";
import { eur } from "@/lib/format";
import { createCatalogSearch, normalize } from "@/lib/search";

/** The model fields the header needs (SiteShell sends only these to every page). */
export type SearchModel = Pick<Model, "slug" | "brand" | "name" | "type" | "cc" | "licence" | "price" | "isNew" | "image">;

/** Types link to /modelet pre-filtered (same ?kategoria= values the models page reads). Only types with models are offered. */
const CATEGORIES: { id: string; label: string; hint: string; types: VehicleType[] }[] = [
  { id: "motore", label: "MOTORË", hint: "Sport dhe enduro", types: ["sport", "dirt"] },
  { id: "skuter", label: "SKUTERË", hint: "Për qytetin", types: ["scooter"] },
];
const LICENCES = ["AM", "A1", "A2", "A"] as const;

type Item =
  | { kind: "category"; id: string; href: string; label: string; hint: string }
  | { kind: "licence"; id: string; href: string; label: string }
  | { kind: "model"; id: string; href: string; model: SearchModel }
  | { kind: "all"; id: string; href: string; label: string };

/**
 * Header search: a bar that grows across the navbar plus a suggestions panel under the header.
 * Empty: categories, licences and the new models. Typing: matching categories and models (same
 * forgiving search as /modelet). Enter with nothing highlighted shows every result on /modelet.
 */
export default function HeaderSearch({ models, onClose }: { models: SearchModel[]; onClose: (restoreFocus: boolean) => void }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);

  const search = useMemo(() => createCatalogSearch(models, (m) => m.slug, modelSearchIndex), [models]);
  const q = query.trim();

  const items = useMemo<Item[]>(() => {
    const hits = search(q);
    const found = hits ? models.filter((m) => hits.has(m.slug)) : [];
    const tokens = normalize(q).split(" ").filter(Boolean);

    const categories = CATEGORIES.filter((c) => models.some((m) => c.types.includes(m.type))).filter(
      (c) => !q || found.some((m) => c.types.includes(m.type)) || normalize(c.label).startsWith(normalize(q)),
    ).map<Item>((c) => ({ kind: "category", id: `c-${c.id}`, href: `/modelet?kategoria=${c.id}`, label: c.label, hint: c.hint }));

    const licences = LICENCES.filter((l) => !q || tokens.includes(l.toLowerCase())).map<Item>((l) => ({
      kind: "licence",
      id: `l-${l}`,
      href: `/modelet?patenta=${l}`,
      label: `PATENTA ${l}`,
    }));

    const shownModels = (q ? found : [...models.filter((m) => m.isNew), ...models.filter((m) => !m.isNew)]).slice(0, q ? 6 : 4);
    const modelItems = shownModels.map<Item>((m) => ({ kind: "model", id: `m-${m.slug}`, href: `/modelet/${m.slug}`, model: m }));

    const all: Item = q
      ? { kind: "all", id: "all", href: `/modelet?kerko=${encodeURIComponent(q)}`, label: `Shiko të gjitha rezultatet për “${q}”` }
      : { kind: "all", id: "all", href: "/modelet", label: "Shiko të gjitha modelet" };

    return [...categories, ...licences, ...modelItems, all];
  }, [search, models, q]);

  // Focus once the bar has started to grow; close on a click outside the bar or the panel.
  useEffect(() => {
    input.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) onClose(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [onClose]);

  const go = (href: string) => {
    onClose(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => {
        const next = i + step;
        if (next < -1) return items.length - 1;
        if (next >= items.length) return -1;
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[active] ?? items[items.length - 1];
      go(item.href);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose(true);
    }
  };

  const optionProps = (item: Item) => {
    const index = items.indexOf(item);
    return {
      id: `${listId}-${item.id}`,
      role: "option" as const,
      "aria-selected": index === active,
      href: item.href,
      onClick: () => onClose(false),
      onMouseEnter: () => setActive(index),
      "data-active": index === active || undefined,
    };
  };

  const categories = items.filter((i) => i.kind === "category");
  const licences = items.filter((i) => i.kind === "licence");
  const modelItems = items.filter((i) => i.kind === "model");
  const all = items[items.length - 1];

  return (
    <div ref={root} className="contents">
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "100%", opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative flex h-11 min-w-0 items-center overflow-hidden border border-line-2 bg-surface focus-within:border-[#555]"
      >
        <TbSearch size={18} aria-hidden className="pointer-events-none absolute left-4 shrink-0 text-muted" />
        <input
          ref={input}
          type="search"
          role="combobox"
          aria-label="Kërko modelin"
          aria-expanded
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${items[active].id}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1); // new typing: nothing highlighted until the arrows are used
          }}
          onKeyDown={onKeyDown}
          placeholder="Kërko modelin, p.sh. MAX-X 125…"
          maxLength={80}
          className="h-full min-w-0 flex-1 bg-transparent pl-11 pr-2 text-[15px] text-white placeholder:text-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd className="mr-2 hidden shrink-0 border border-line-2 px-1.5 py-0.5 text-[10px] font-semibold text-faint lg:block">ESC</kbd>
        <button
          type="button"
          onClick={() => onClose(true)}
          aria-label="Mbyll kërkimin"
          className="flex size-11 shrink-0 items-center justify-center text-muted transition-colors hover:text-white"
        >
          <TbX size={18} aria-hidden />
        </button>
      </motion.div>

      {/* Suggestions: positioned against the sticky header, full width under it. */}
      <motion.div
        id={listId}
        role="listbox"
        aria-label="Sugjerime"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1], delay: 0.08 }}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-80px)] overflow-y-auto border-b border-line bg-ink shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
      >
        <div className="container-moto grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-14">
          <div className="flex flex-col gap-8">
            {categories.length > 0 && (
              <Group title="KATEGORITË">
                <div className="flex flex-col">
                  {categories.map((item) =>
                    item.kind === "category" ? (
                      <Link
                        key={item.id}
                        {...optionProps(item)}
                        className="group/opt flex items-center justify-between gap-4 border-b border-line py-3.5 transition-colors data-[active]:text-red"
                      >
                        <span>
                          <span className="wide block text-xl font-black italic">{item.label}</span>
                          <span className="text-[13px] text-muted">{item.hint}</span>
                        </span>
                        <TbArrowRight
                          size={20}
                          aria-hidden
                          className="shrink-0 text-red transition-transform duration-300 group-data-[active]/opt:translate-x-1.5"
                        />
                      </Link>
                    ) : null,
                  )}
                </div>
              </Group>
            )}
            {licences.length > 0 && (
              <Group title="SIPAS PATENTËS">
                <div className="flex flex-wrap gap-2">
                  {licences.map((item) => (
                    <Link
                      key={item.id}
                      {...optionProps(item)}
                      className="flex min-h-11 items-center border border-line-2 px-4 text-xs font-bold tracking-[0.08em] text-[#cfcfcf] transition-colors data-[active]:border-red data-[active]:bg-red data-[active]:text-white"
                    >
                      {item.kind === "licence" && item.label}
                    </Link>
                  ))}
                </div>
              </Group>
            )}
          </div>

          <div>
            <Group title={q ? "MODELET" : "MODELE TË SUGJERUARA"}>
              {modelItems.length === 0 ? (
                <p className="py-3 text-[15px] text-muted">
                  Asnjë model për “{q}”. Provo emrin e modelit (MAX-X), llojin (skuter) ose cc (125).
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {modelItems.map((item) =>
                    item.kind === "model" ? (
                      <Link
                        key={item.id}
                        {...optionProps(item)}
                        className="flex items-center gap-4 border border-line bg-[#0b0b0b] p-2 pr-4 transition-colors data-[active]:border-red"
                      >
                        <span className="hatch relative block aspect-[4/3] w-20 shrink-0 overflow-hidden">
                          {item.model.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.model.image} alt="" loading="lazy" className="size-full object-cover" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[11px] tracking-[0.12em] text-faint">
                            {item.model.brand} · {TYPE_LABEL[item.model.type]} · {item.model.cc}cc
                          </span>
                          <span className="block truncate text-[15px] font-bold">{item.model.name}</span>
                          <span className="block text-[13px] text-muted">{eur(item.model.price)}</span>
                        </span>
                        {item.model.isNew && (
                          <span className="shrink-0 bg-highlight px-1.5 py-0.5 text-[10px] font-black tracking-[0.12em] text-ink">E RE</span>
                        )}
                      </Link>
                    ) : null,
                  )}
                </div>
              )}
            </Group>
            <Link
              {...optionProps(all)}
              className="group/opt mt-5 inline-flex min-h-11 items-center gap-2 text-[13px] font-bold tracking-[0.04em] transition-colors hover:text-red data-[active]:text-red"
            >
              {all.kind === "all" && all.label}
              <TbArrowRight size={16} aria-hidden className="transition-transform group-data-[active]/opt:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={title}>
      <p className="mb-3 text-[11px] font-extrabold tracking-[0.16em] text-red">{title}</p>
      {children}
    </div>
  );
}
