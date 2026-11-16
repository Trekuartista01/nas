import Link from "next/link";
import CategoryCards from "@/components/ui/CategoryCards";
import SectionHeading from "@/components/ui/SectionHeading";
import { accessoryCategories } from "@/data/home";

export default function GearUp() {
  return (
    <section id="aksesoret" className="container-moto pb-10 pt-36">
      <SectionHeading
        lines={["GEAR", "UP"]}
        aside={
          <div className="flex flex-wrap items-end gap-6">
            <p className="max-w-[320px] text-[15px] leading-normal text-muted">
              Kaska, veshje dhe aksesorë origjinalë — gjithçka që të duhet para se të ndezësh motorin.
            </p>
            <Link href="/aksesoret" className="whitespace-nowrap text-[13px] text-[#cfcfcf] hover:text-red">
              Shiko të gjitha aksesorët →
            </Link>
          </div>
        }
      />
      <CategoryCards items={accessoryCategories} height={480} />
    </section>
  );
}
