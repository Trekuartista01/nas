"use client";

import Link from "next/link";
import { TbHeartFilled } from "react-icons/tb";
import type { Model } from "@/data/models";
import { useFavourite } from "@/lib/favourites";
import { eur } from "@/lib/format";

/** Card outline: top-left and bottom-right corners cut at 45° (design: Frame 27756). */
const CARD_CUT = "polygon(55px 0, 100% 0, 100% calc(100% - 66px), calc(100% - 65px) 100%, 0 100%, 0 55px)";
/** The photo repeats the top-left cut, parallel to the card's at the 16px padding (55 - 16 × (2 - √2) ≈ 46). */
const PHOTO_CUT = "polygon(46px 0, 100% 0, 100% 100%, 0 100%, 0 46px)";
/** VIEW DETAILS: box of height --h whose right side leans at 45° (top-right corner to --h in at the bottom). */
const DETAILS_FILL = "polygon(0 0, 100% 0, calc(100% - var(--h)) 100%, 0 100%)";
const DETAILS_OUTLINE =
  "polygon(evenodd, 0 0, 100% 0, calc(100% - var(--h)) 100%, 0 100%, 0 0, 1px 1px, 1px calc(100% - 1px), calc(100% - var(--h) - 0.4px) calc(100% - 1px), calc(100% - 2.4px) 1px, 1px 1px)";

/**
 * Homepage lineup card (design: Frame 27756). Black card with two cut corners, photo with the red
 * heart (saves to favourites, same as the catalog cards), brand, name, cc, price, and an outlined
 * VIEW DETAILS button. The whole card links to the model page.
 */
/** `favourite`: show the heart that saves to favourites (off on the homepage Range for now). */
export default function LineupCard({ model: m, favourite = true }: { model: Model; favourite?: boolean }) {
  const href = `/modelet/${m.slug}`;
  const [saved, toggleSaved] = useFavourite(href);
  const name = `${m.brand} ${m.name}`;

  return (
    <article
      style={{ clipPath: CARD_CUT }}
      className="group relative flex h-full flex-col bg-black p-4 text-white transition-transform duration-500 ease-moto hover:-translate-y-1.5"
    >
      <div style={{ clipPath: PHOTO_CUT }} className="relative aspect-[302/221] overflow-hidden bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#111]">
        {m.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.image} alt={name} className="size-full object-cover transition-transform duration-700 ease-moto group-hover:scale-[1.05]" />
        ) : (
          <span className="flex size-full items-center justify-center text-[11px] tracking-[0.14em] text-[#6f6f6f]">[FOTO · {m.name}]</span>
        )}
        {favourite && (
          <button
            type="button"
            aria-label={saved ? `Hiq ${name} nga të preferuarat` : `Ruaj ${name} në të preferuarat`}
            aria-pressed={saved}
            onClick={toggleSaved}
            className="absolute right-0 top-0 z-10 flex size-11 items-center justify-center text-red transition-transform hover:scale-110"
          >
            {/* Solid red heart as designed; saved state adds a white backing disc. */}
            <span className={`flex size-7 items-center justify-center rounded-full transition-colors ${saved ? "bg-white" : ""}`}>
              <TbHeartFilled size={22} aria-hidden />
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-4">
        <div className="text-[13px] uppercase leading-tight text-[#8a8a8a] lg:text-[clamp(13px,0.9vw,17px)]">{m.brand}</div>
        <h3 className="mt-1.5 text-[21px] font-bold uppercase leading-tight lg:text-[clamp(21px,1.46vw,28px)]">
          <Link
            href={href}
            className="before:absolute before:inset-0 before:content-[''] focus-visible:outline-none focus-visible:before:outline-2 focus-visible:before:-outline-offset-4 focus-visible:before:outline-white"
          >
            {m.name}
          </Link>
        </h3>
        <div className="mt-2 text-[13px] text-[#8a8a8a] lg:text-[clamp(13px,0.9vw,17px)]">{m.cc} cc</div>
        <div className="mt-auto pt-7 text-[22px] font-bold leading-none lg:text-[clamp(22px,1.53vw,30px)]">{eur(m.price)}</div>
        <DetailsButton />
      </div>
    </article>
  );
}

/** Visual call to action (the click goes to the card link): red 1px outline, right side slanted 45°. */
function DetailsButton() {
  return (
    <span
      aria-hidden
      className="relative mt-[26px] flex h-(--h) items-center justify-center text-[13px] uppercase text-white [--h:42px] lg:text-[clamp(13px,0.9vw,17px)] lg:[--h:clamp(42px,2.92vw,56px)]"
    >
      {/* Fills red on card hover. */}
      <span style={{ clipPath: DETAILS_FILL }} className="absolute inset-0 bg-red opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {/* The 1px outline: outer shape minus the inner one (evenodd). */}
      <span style={{ clipPath: DETAILS_OUTLINE }} className="absolute inset-0 bg-red" />
      <span className="relative">View details</span>
    </span>
  );
}
