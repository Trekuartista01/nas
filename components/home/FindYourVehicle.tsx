import CategoryCards from "@/components/ui/CategoryCards";
import SectionHeading from "@/components/ui/SectionHeading";
import { vehicleCategories } from "@/data/home";

export default function FindYourVehicle() {
  return (
    <section className="container-moto pb-28 pt-36">
      <SectionHeading
        lines={["FIND YOUR", "VEHICLE"]}
        aside={
          <p className="max-w-[320px] text-[15px] leading-normal text-muted">
            Katër kategori, një showroom. Kalo mbi një kartë për ta hapur.
          </p>
        }
      />
      <CategoryCards items={vehicleCategories} height={560} />
    </section>
  );
}
