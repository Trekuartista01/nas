import Link from "next/link";
import { BUSINESS } from "@/data/business";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { getWorldTiles } from "@/lib/data/catalog";

const tileBase =
  "group relative overflow-hidden border border-line text-white transition-transform duration-500 ease-moto hover:scale-[.985] hover:text-white";
const zoom = "hatch absolute inset-0 transition-transform duration-[1200ms] ease-moto group-hover:scale-[1.07]";
const shade = "absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent";

function Photo({ src }: { src?: string }) {
  return (
    <div className={zoom}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      )}
    </div>
  );
}

function SmallTile({ tag, title, image }: { tag: string; title: string; image?: string }) {
  return (
    <Link href="/nas-world" className={`${tileBase} min-h-[240px]`}>
      <Photo src={image} />
      <div className={shade} />
      <div className="absolute inset-x-5 bottom-5">
        <span className="text-[11px] font-extrabold tracking-[0.14em] text-red">{tag}</span>
        <div className="mt-1.5 text-lg font-extrabold">{title}</div>
      </div>
    </Link>
  );
}

export default async function NasWorld() {
  const { feature, small } = await getWorldTiles();
  return (
    <section id="world" className="container-moto py-36">
      <SectionHeading
        lines={["NAS", "WORLD"]}
        aside={
          <div className="flex items-center gap-5 text-[13px] text-[#cfcfcf]">
            <span>Ngjarje · Lajme · Komuniteti</span>
            <Link href="/nas-world" className="hover:text-red">
              Shiko të gjitha →
            </Link>
          </div>
        }
      />
      <Reveal className="grid auto-rows-[240px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/nas-world" className={`${tileBase} sm:col-span-2 sm:row-span-2`}>
          <Photo src={feature.image} />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-8 pt-24">
            <span className="bg-highlight px-2.5 py-1.5 text-[11px] font-black tracking-[0.12em] text-ink">{feature.tag}</span>
            <div className="wide mt-4 text-[clamp(26px,2.4vw,34px)] font-black leading-none">{feature.title}</div>
            <div className="mt-2.5 text-sm text-[#d0d0d0]">{feature.text}</div>
          </div>
        </Link>
        <SmallTile {...small[0]} />
        <SmallTile {...small[1]} />
        <a href={BUSINESS.instagram} target="_blank" rel="noreferrer" className={`${tileBase} bg-red`}>
          <div className="absolute inset-6 flex flex-col justify-between">
            <span className="text-[11px] font-extrabold tracking-[0.14em]">INSTAGRAM</span>
            <div className="wide text-[26px] font-black leading-none">NA NDIQ NË INSTAGRAM →</div>
          </div>
        </a>
        <SmallTile {...small[2]} />
      </Reveal>
    </section>
  );
}
