import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { DEFAULT_RELATED_IMAGES, type ModelDetails } from "@/data/model-details";
import type { Model } from "@/data/models";
import { eur } from "@/lib/format";
import { MOTION } from "@/lib/motion";
import T from "@/components/i18n/T";

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
            {tagline ? <T {...tagline} /> : <T sq="[SLOGANI I MODELIT]." en="[MODEL TAGLINE]." />}
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

/** Card outline (design: Frame 27764, "You may also like"): top-left and bottom-right corners cut at 45°. */
const RELATED_CUT = "polygon(60px 0, 100% 0, 100% calc(100% - 60px), calc(100% - 60px) 100%, 0 100%, 0 60px)";
/** The photo repeats both cuts, parallel to the card's at the 7px inset. */
const RELATED_PHOTO_CUT = "polygon(54px 0, 100% 0, 100% calc(100% - 52px), calc(100% - 52px) 100%, 0 100%, 0 54px)";

/**
 * "You may also like" on a model page (design: Frame 27764): three wide, short black cards with cut
 * corners, the photo on top, brand / name on the left and the price on the right. Until each model
 * has its own lifestyle photo, the cards use the design's three photos in order (DEFAULT_RELATED_IMAGES).
 * Phones: a swipe row.
 */
export function ModelRelated({ models }: { models: Model[] }) {
  if (models.length === 0) return null;
  return (
    <section className="bg-[#161616]">
      <div className="container-moto pb-24 pt-14 lg:pb-28">
        <Reveal>
          <h2 className="text-[clamp(40px,4.4vw,58px)] font-bold uppercase leading-[1.05]">
            <span className="block">YOU MAY</span>
            <span className="block">
              ALSO LIKE<span className="text-red">.</span>
            </span>
          </h2>
        </Reveal>
        <div className="-mx-4 mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-[92px] lg:grid lg:grid-cols-3 lg:gap-[clamp(32px,4.3vw,62px)] lg:overflow-visible lg:px-[30px] [&::-webkit-scrollbar]:hidden">
          {models.map((m, i) => (
            <Reveal key={m.slug} delay={i * MOTION.rangeStagger} className="w-[85%] max-w-[420px] shrink-0 snap-start sm:w-[48%] lg:w-full lg:max-w-none">
              <RelatedCard model={m} image={DEFAULT_RELATED_IMAGES[i % DEFAULT_RELATED_IMAGES.length]} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedCard({ model: m, image }: { model: Model; image: string }) {
  return (
    <Link
      href={`/modelet/${m.slug}`}
      style={{ clipPath: RELATED_CUT }}
      className="group flex aspect-[390/280] flex-col bg-black p-[7px] text-white shadow-[0_10px_30px_rgba(0,0,0,.35)] hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
    >
      <div style={{ clipPath: RELATED_PHOTO_CUT }} className="relative min-h-0 flex-[0_0_69%] overflow-hidden bg-[#111]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={`${m.brand} ${m.name}`}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 ease-moto group-hover:scale-[1.05]"
        />
      </div>
      <div className="flex flex-1 items-center justify-between gap-4 pl-[1px] pr-[58px]">
        <div className="min-w-0">
          <div className="text-[13px] leading-tight text-[#8a8a8a]">{m.brand}</div>
          <div className="truncate text-[clamp(17px,1.45vw,21px)] font-bold uppercase leading-tight transition-colors group-hover:text-red">{m.name}</div>
        </div>
        <div className="shrink-0 -translate-y-1 text-[clamp(17px,1.45vw,21px)] font-bold">{eur(m.price)}</div>
      </div>
    </Link>
  );
}
