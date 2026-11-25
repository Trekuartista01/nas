import DarkModelCard from "@/components/nas/DarkModelCard";
import Reveal from "@/components/ui/Reveal";
import type { ModelDetails } from "@/data/model-details";
import type { Model } from "@/data/models";
import { MOTION } from "@/lib/motion";

/**
 * Model page sections (design: Frame 27764): the italic tagline with the large media block under it,
 * and "You may also like". The feature strips are in ModelFeatures.tsx (client, scroll-driven).
 */

/** Tagline + the full-width media block (muted loop or photo; a placeholder until one arrives). */
export function ModelIntro({ name, tagline, media }: { name: string } & Pick<ModelDetails, "tagline" | "media">) {
  return (
    <section className="bg-ink">
      <div className="container-moto pb-16 pt-[clamp(24px,8vw,120px)] lg:pb-[72px]">
        <Reveal>
          <p className="text-[clamp(22px,2.6vw,38px)] font-extrabold italic uppercase leading-[1.1] tracking-[-0.01em]">
            {tagline ?? "[SLOGANI I MODELIT]."}
          </p>
        </Reveal>
      </div>
      <Reveal className="relative aspect-[1440/637] min-h-[260px] w-full overflow-hidden bg-[linear-gradient(135deg,#242424,#0f0f0f)]">
        {media?.video ? (
          <video
            src={media.video}
            poster={media.poster}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            aria-hidden
            className="absolute inset-0 size-full object-cover"
          />
        ) : media?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs tracking-[0.14em] text-[#5f5f5f]">[VIDEO · {name}]</span>
        )}
      </Reveal>
    </section>
  );
}

/**
 * "You may also like" on a model page: the homepage Range cards (DarkModelCard, cut corners),
 * rising in one after another like the Range.
 */
export function ModelRelated({ models }: { models: Model[] }) {
  if (models.length === 0) return null;
  return (
    <section className="bg-[#171717]">
      <div className="container-moto pb-24 pt-14">
        <Reveal>
          <h2 className="text-[clamp(40px,4.4vw,58px)] font-bold uppercase leading-[1.05]">
            <span className="block">YOU MAY</span>
            <span className="block">
              ALSO LIKE<span className="text-red">.</span>
            </span>
          </h2>
        </Reveal>
        <div className="-mx-4 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
          {models.map((m, i) => (
            <Reveal key={m.slug} delay={i * MOTION.rangeStagger} className="flex aspect-[520/620] w-[85%] shrink-0 snap-start sm:w-[48%] lg:w-full">
              <DarkModelCard model={m} index={i} cut className="size-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
