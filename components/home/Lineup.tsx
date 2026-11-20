"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { TbArrowRight } from "react-icons/tb";
import LineupCard from "@/components/home/LineupCard";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Model, VehicleType } from "@/data/models";

type Cat = "all" | "moto" | "scooter" | "atv";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Cards shown on the homepage; "Shiko më shumë" leads to the full catalog. */
const SHOWN = 3;

const IN_CAT: Record<Exclude<Cat, "all">, VehicleType[]> = {
  moto: ["sport", "dirt"],
  scooter: ["scooter"],
  atv: ["atv"],
};

/** Where "Shiko më shumë" goes for each tab (/modelet reads ?kategoria=sport|dirt|skuter). */
const MORE_HREF: Record<Cat, string> = { all: "/modelet", moto: "/modelet", scooter: "/modelet?kategoria=skuter", atv: "/modelet" };

/**
 * THE LINEUP (design: Frame 27756). Heading with filter tabs and "Shiko më shumë" on the right,
 * then three cut-corner cards centred. A tab only shows when the catalog has models for it
 * (the public catalog has no ATVs yet, so that tab stays hidden until it does).
 * `models`: the published models, loaded on the server (lib/data/catalog.ts).
 */
export default function Lineup({ models }: { models: Model[] }) {
  const [cat, setCat] = useState<Cat>("all");

  const tabs = useMemo(() => {
    const all: { id: Cat; label: string }[] = [
      { id: "all", label: "Të gjitha" },
      { id: "moto", label: "Motorë" },
      { id: "scooter", label: "Skuterë" },
      { id: "atv", label: "ATVs" },
    ];
    return all.filter((t) => t.id === "all" || models.some((m) => IN_CAT[t.id as Exclude<Cat, "all">].includes(m.type)));
  }, [models]);

  const list = (cat === "all" ? models : models.filter((m) => IN_CAT[cat].includes(m.type))).slice(0, SHOWN);

  return (
    <section id="lineup" className="bg-surface-3">
      <div className="container-moto pb-24 pt-20 lg:pb-[104px] lg:pt-[86px]">
        <SectionHeading
          lines={["THE", "LINEUP"]}
          aside={
            <div className="flex flex-wrap items-center gap-2.5">
              <div role="group" aria-label="Filtro modelet" className="flex flex-wrap gap-2.5">
                {tabs.map((t) => {
                  const active = t.id === cat;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCat(t.id)}
                      className={`h-12 min-w-[118px] cursor-pointer border px-5 text-[17px] transition-colors duration-200 ${
                        active ? "border-red bg-red text-white" : "border-[#222] text-white hover:border-[#555]"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <Link href={MORE_HREF[cat]} className="group ml-auto inline-flex h-12 items-center gap-2 pl-8 text-[17px] text-white hover:text-white">
                Shiko më shumë
                <TbArrowRight size={20} strokeWidth={1.5} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          }
        />

        <div className="mx-auto mt-10 grid max-w-[1139px] grid-cols-1 justify-items-center gap-10 sm:grid-cols-2 lg:mt-[54px] lg:w-fit lg:max-w-none lg:grid-cols-3 lg:gap-[clamp(82px,5.69vw,110px)]">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((m, i) => (
              <motion.div
                key={`${cat}-${m.slug}`}
                className="w-full max-w-[325px] lg:w-[clamp(325px,22.57vw,440px)] lg:max-w-none"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
              >
                <LineupCard model={m} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
