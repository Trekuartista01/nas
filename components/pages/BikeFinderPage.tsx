import BikeFinder from "@/components/finder/BikeFinder";
import type { Model } from "@/data/models";

/** /gjej-motorin: the homepage bike finder on its own page (its headline is the page's h1). */
export default function BikeFinderPage({ models }: { models: Model[] }) {
  return <BikeFinder models={models} headingAs="h1" />;
}
