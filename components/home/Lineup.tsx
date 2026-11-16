"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import FilterTabs, { type FilterTab } from "@/components/ui/FilterTabs";
import ModelCard from "@/components/ui/ModelCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { models, type VehicleType } from "@/data/models";

type Cat = "all" | VehicleType;

export default function Lineup() {
  const [cat, setCat] = useState<Cat>("all");

  const tabs: FilterTab<Cat>[] = useMemo(
    () => [
      { id: "all", label: "Të gjitha", count: models.length },
      { id: "sport", label: "Sport", count: models.filter((m) => m.type === "sport").length },
      { id: "dirt", label: "Dirt", count: models.filter((m) => m.type === "dirt").length },
      { id: "scooter", label: "Skuterë", count: models.filter((m) => m.type === "scooter").length },
      { id: "atv", label: "ATV", count: models.filter((m) => m.type === "atv").length },
    ],
    [],
  );

  // Two rows of five on desktop.
  const shown = (cat === "all" ? models : models.filter((m) => m.type === cat)).slice(0, 10);

  return (
    <section id="lineup" className="border-t border-[#1c1c1c] bg-surface">
      <div className="container-moto py-28">
        <SectionHeading
          lines={["THE", "LINEUP"]}
          aside={
            <div className="flex flex-wrap items-center gap-3">
              <FilterTabs tabs={tabs} value={cat} onChange={setCat} label="Filtro modelet" />
              <Link href="/modelet" className="ml-3 text-[13px] text-[#cfcfcf] hover:text-red">
                Shiko të gjitha →
              </Link>
            </div>
          }
        />
        <motion.div layout className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {shown.map((m, i) => (
              <motion.div
                key={m.slug}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1], delay: i * 0.05 }}
              >
                <ModelCard model={m} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        <p className="mt-5 text-xs text-[#777]">Çmimet janë demo — zëvendësohen me çmimet reale nga stoku.</p>
      </div>
    </section>
  );
}
