import Banner from "@/components/home/Banner";
import Brands from "@/components/home/Brands";
import FinalCta from "@/components/home/FinalCta";
import FindYourVehicle from "@/components/home/FindYourVehicle";
import GearUp from "@/components/home/GearUp";
import Lineup from "@/components/home/Lineup";
import MotoShpatiWorld from "@/components/home/MotoShpatiWorld";
import ServiceShowroom from "@/components/home/ServiceShowroom";
import Ticker from "@/components/home/Ticker";
import BikeFinder from "@/components/finder/BikeFinder";
import FinanceCalculator from "@/components/finance/FinanceCalculator";
import JsonLd from "@/components/seo/JsonLd";
import { dealerSchema } from "@/lib/structured-data";

/** Stacked full-width sections, in the order of design/homepage-v2.dc.html. */
export default function HomePage() {
  return (
    <>
      <JsonLd data={dealerSchema()} />
      <Banner />
      <Ticker />
      <FindYourVehicle />
      <Lineup />
      <GearUp />
      <BikeFinder />
      <Brands />
      <FinanceCalculator />
      <MotoShpatiWorld />
      <ServiceShowroom />
      <FinalCta />
    </>
  );
}
