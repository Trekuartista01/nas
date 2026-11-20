import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";
import Reveal from "@/components/ui/Reveal";
import type { VehicleCategory } from "@/data/home";
import { eur } from "@/lib/format";

/** Live numbers for one category, worked out from the published catalog (FindYourVehicle). */
export interface CategoryStats {
  count: number;
  /** Lowest price, € (0 when there are no models). */
  from: number;
  /** "A1" or "A1–A2". */
  licences: string;
}

/**
 * Find your vehicle cards. Like CategoryCards (the card you hover widens), plus:
 * - a cut-out bike that slides in and grows as its card opens, over a red stage glow;
 * - a giant outlined category word behind it (the same language as the model page);
 * - the other cards fade to grey so the open one leads;
 * - live numbers (models, lowest price, licence range) from the catalog, never made up;
 * - on phones, a swipeable row of full-width cards instead of a stack.
 * Gear up (accessories) keeps the plain CategoryCards.
 */
export default function VehicleCards({ items, stats }: { items: VehicleCategory[]; stats: Record<string, CategoryStats> }) {
  return (
    <Reveal>
      <div className="group/row -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:h-[600px] md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const st = stats[item.type];
          const has = (st?.count ?? 0) > 0;
          return (
            <Link
              key={item.num}
              href={item.href}
              className="group relative flex h-[480px] w-[85%] flex-none snap-center flex-col justify-between overflow-hidden border border-line bg-[#0c0c0c] p-7 text-white transition-[flex-grow,filter,opacity,border-color] duration-700 ease-moto hover:border-red/60 hover:text-white md:h-auto md:w-auto md:flex-1 md:hover:grow-[2.2] md:group-hover/row:opacity-55 md:group-hover/row:grayscale md:hover:!opacity-100 md:hover:!grayscale-0"
            >
              {/* Stage: hatch + red glow that rises on hover */}
              <div aria-hidden className="hatch absolute inset-0 opacity-60" />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(60%_60%_at_50%_75%,rgba(225,6,0,0.28),transparent)] opacity-40 transition-opacity duration-700 group-hover:opacity-100"
              />

              {/* Giant outlined word */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-5 top-[64px] select-none whitespace-nowrap text-[clamp(90px,9vw,150px)] font-extrabold uppercase italic leading-none tracking-[-0.03em] text-transparent transition-[transform,-webkit-text-stroke-color] duration-700 ease-moto [-webkit-text-stroke:1px_#2e2e2e] group-hover:translate-x-3 group-hover:[-webkit-text-stroke-color:rgba(225,6,0,0.55)]"
              >
                {item.word}
              </span>

              {/* Bike: cut-out slides in and grows as the card opens; photo fallback */}
              {item.cutout ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-[26%] top-[22%] flex items-end justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.cutout}
                    alt=""
                    className="h-full max-w-[92%] translate-x-[6%] scale-[0.86] object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.75)] transition-transform duration-700 ease-moto group-hover:translate-x-0 group-hover:scale-100"
                  />
                  <span aria-hidden className="absolute -bottom-3 left-1/2 h-6 w-[55%] -translate-x-1/2 rounded-[50%] bg-black/80 blur-lg" />
                </div>
              ) : item.image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" className="absolute inset-0 size-full object-cover opacity-70" />
                  <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.5),rgba(10,10,10,.1)_40%,rgba(10,10,10,.92))]" />
                </>
              ) : (
                <span className="relative self-center text-[11px] tracking-[0.14em] text-[#6f6f6f]">{item.photoLabel}</span>
              )}

              <div className="relative flex justify-between text-xs tracking-[0.14em] text-faint">
                <span>{item.num}</span>
                <span className={has ? "" : "text-highlight"}>{has ? `${st.count} ${st.count === 1 ? "MODEL" : "MODELE"}` : "SË SHPEJTI"}</span>
              </div>

              <div className="relative">
                <p className="mb-3.5 max-w-[300px] translate-y-3 text-sm text-[#bdbdbd] opacity-0 transition-all delay-100 duration-500 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
                  {item.description}
                </p>
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[26px] font-extrabold uppercase leading-none tracking-[-0.02em] md:text-3xl">{item.title}</h3>
                    <div className="mt-2.5 h-[3px] w-full origin-left scale-x-25 bg-red transition-transform duration-600 group-hover:scale-x-100" />
                    <p className="mt-3 text-[12px] uppercase leading-snug tracking-[0.08em] text-muted">
                      {has ? (
                        <>
                          nga <span className="font-bold text-white">{eur(st.from)}</span> · Patenta {st.licences}
                        </>
                      ) : (
                        "Modelet vijnë së shpejti në showroom"
                      )}
                    </p>
                  </div>
                  <span className="flex size-12 flex-none items-center justify-center rounded-full border border-[#333] transition-all duration-400 group-hover:translate-x-2 group-hover:border-red group-hover:bg-red">
                    <TbArrowRight size={18} aria-hidden />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Reveal>
  );
}
