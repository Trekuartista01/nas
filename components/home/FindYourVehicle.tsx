import type { CategoryStats } from "@/components/home/VehicleCards";
import VehicleScroll from "@/components/home/VehicleScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import { vehicleCategories } from "@/data/home";
import { LICENCE_RANK, type Model, type VehicleType } from "@/data/models";

/** Story order of the scroll section: 01 sport, 02 scooter, 03 dirt. */
const ORDER: VehicleType[] = ["sport", "scooter", "dirt"];

/** Models, lowest price and licence range per category, from the published catalog. */
function categoryStats(models: Model[]): Record<string, CategoryStats> {
  const out: Record<string, CategoryStats> = {};
  for (const c of vehicleCategories) {
    const list = models.filter((m) => m.type === c.type);
    const lic = [...new Set(list.map((m) => m.licence))].sort((a, b) => LICENCE_RANK[a] - LICENCE_RANK[b]);
    out[c.type] = {
      count: list.length,
      from: list.length ? Math.min(...list.map((m) => m.price)) : 0,
      licences: lic.length > 1 ? `${lic[0]}–${lic[lic.length - 1]}` : (lic[0] ?? ""),
    };
  }
  return out;
}

/** `models`: the published models, loaded on the server (lib/data/catalog.ts). */
export default function FindYourVehicle({ models }: { models: Model[] }) {
  const items = [...vehicleCategories].sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type));
  return (
    <section className="pt-36">
      <div className="container-moto">
        <SectionHeading
          lines={["FIND YOUR", "VEHICLE"]}
          aside={
            <p className="max-w-[320px] text-[15px] leading-normal text-muted">
              Tre kategori, një showroom. Lëviz poshtë për t&apos;i parë të gjitha.
            </p>
          }
        />
      </div>
      <VehicleScroll items={items} stats={categoryStats(models)} />
    </section>
  );
}
