import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";
import type { Model, VehicleType } from "@/data/models";
import { eur } from "@/lib/format";

/** Card tag per vehicle type (NAS designs' wording). */
export const CATEGORY_TAG: Record<VehicleType, string> = { scooter: "SCOOTER", sport: "SPORT LINE", dirt: "OFF-ROAD", atv: "OFF-ROAD" };

/** Cut-corner shape (the earlier lineup card): top-left and bottom-right corners cut at 45°. */
const CARD_CUT = "polygon(55px 0, 100% 0, 100% calc(100% - 66px), calc(100% - 65px) 100%, 0 100%, 0 55px)";
/** The photo repeats the top-left cut, parallel to the card's at the 16px padding. */
const PHOTO_CUT = "polygon(46px 0, 100% 0, 100% 100%, 0 100%, 0 46px)";

/**
 * Dark model card (NAS designs): the bike photo leads, on a dark panel with a thin border.
 * Number top-left, category top-right, wide uppercase name with a short red underline, the price
 * small as "From €X", and a round outlined arrow. The whole card is the link.
 * Hover / keyboard focus: photo scales to 1.05, the underline grows to the name's width, the arrow
 * circle fills white and the arrow nudges right. Size comes from `className` (the parent decides).
 */
export default function DarkModelCard({
  model: m,
  index,
  className = "",
  accent = false,
  cut = false,
}: {
  model: Model;
  index: number;
  className?: string;
  /** Red number (Sport Line section). */
  accent?: boolean;
  /** Cut-corner black card (The Range): photo inset by 16px with its own cut corner, no border. */
  cut?: boolean;
}) {
  return (
    <Link
      href={`/modelet/${m.slug}`}
      style={cut ? { clipPath: CARD_CUT } : undefined}
      className={`group relative flex flex-col overflow-hidden text-white ${cut ? "bg-black p-4 focus-visible:outline-offset-[-6px]" : "border border-line-3 bg-panel-2 focus-visible:outline-offset-2"} hover:text-white focus-visible:outline-2 focus-visible:outline-white ${className}`}
    >
      <div style={cut ? { clipPath: PHOTO_CUT } : undefined} className="relative min-h-0 flex-1 overflow-hidden bg-[#0e0e0e]">
        {m.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.image}
            alt=""
            loading="lazy"
            draggable={false}
            className="absolute inset-0 size-full object-cover object-[50%_62%] brightness-[.82] transition-transform duration-[1.2s] ease-nas group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[11px] tracking-[0.14em] text-[#6f6f6f]">[FOTO · {m.name}]</span>
        )}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.55),transparent_28%,transparent_70%,rgba(22,22,22,.9))]" />
        <div className={`absolute flex justify-between text-[13px] tracking-[0.14em] ${cut ? "left-14 right-5 top-5" : "inset-x-6 top-6"}`}>
          <span className={accent ? "font-bold text-red" : "text-light"}>{String(index + 1).padStart(2, "0")}</span>
          <span className="text-light">{CATEGORY_TAG[m.type]}</span>
        </div>
      </div>

      {/* Cut card: the arrow keeps clear of the bottom-right cut. */}
      <div className={`flex items-end justify-between gap-4 ${cut ? "pb-2 pl-1 pr-12 pt-5" : "px-6 pb-6 pt-4"}`}>
        <div className="min-w-0">
          <h3 className="relative w-fit text-[clamp(24px,2.1vw,34px)] font-extrabold uppercase leading-none tracking-[-0.01em]">
            {m.name}
            <span
              aria-hidden
              className="absolute -bottom-3.5 left-0 h-[3px] w-14 max-w-full bg-red transition-[width] duration-500 ease-nas group-hover:w-full group-focus-visible:w-full"
            />
          </h3>
          <p className="mt-7 text-[14px] text-body">From {eur(m.price)}</p>
        </div>
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white/40 transition-colors duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black group-focus-visible:bg-white group-focus-visible:text-black">
          <TbArrowRight size={18} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

/** Closing card of a model row: "See all models" with the round arrow, to the catalog. */
export function SeeAllCard({ className = "", label = "See all models", cut = false }: { className?: string; label?: string; cut?: boolean }) {
  return (
    <Link
      href="/modelet"
      style={cut ? { clipPath: CARD_CUT } : undefined}
      className={`group relative flex flex-col justify-end overflow-hidden p-6 text-white hover:text-white focus-visible:outline-2 ${cut ? "bg-black pr-16 focus-visible:outline-offset-[-6px]" : "border border-line-3 bg-ink focus-visible:outline-offset-2"} focus-visible:outline-white ${className}`}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-[0.15] bg-red transition-transform duration-700 ease-nas group-hover:scale-x-100" />
      <div className="flex items-end justify-between gap-4">
        <span className="headline text-[clamp(28px,2.6vw,42px)]">{label}</span>
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white/40 transition-colors duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black group-focus-visible:bg-white group-focus-visible:text-black">
          <TbArrowRight size={18} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
