import DealerCta from "@/components/home/DealerCta";
import HomeHero from "@/components/home/HomeHero";
import Range from "@/components/home/Range";
import SportLineIntro from "@/components/home/SportLineIntro";
import SportLine from "@/components/home/SportLine";
import Statement from "@/components/home/Statement";
import VisionPanels from "@/components/home/VisionPanels";
import JsonLd from "@/components/seo/JsonLd";
import { getHeroVideo, getModels } from "@/lib/data/catalog";
import { dealerSchema } from "@/lib/structured-data";

/**
 * NAS homepage (design "NAS — Homepage", Nov 2026; replaced the old homepage-v2 sections,
 * whose components stay in components/home/). Motion timings: lib/motion.ts.
 */
export default async function HomePage() {
  const [models, heroVideo] = await Promise.all([getModels(), getHeroVideo()]);
  return (
    <>
      <JsonLd data={dealerSchema()} />
      <HomeHero heroVideo={heroVideo} />
      <Statement />
      <VisionPanels />
      <Range models={models} />
      <SportLineIntro />
      <SportLine />
      <DealerCta />
    </>
  );
}
