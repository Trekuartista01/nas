"use client";

import Link from "next/link";
import { TbHeartFilled } from "react-icons/tb";
import { useFavourite } from "@/lib/favourites";
import { eur } from "@/lib/format";

export interface CatalogCardProps {
  href: string;
  brand: string;
  name: string;
  /** Small grey line under the name (e.g. "350 cc", sizes). */
  meta: string;
  price: number;
  image?: string;
  isNew?: boolean;
  /** Transparent cut-out photo: shown whole instead of cropped to fill. */
  cutout?: boolean;
}

/** Compact grid card for /modelet and /aksesoret (design: Moto Shpati Modelet / Aksesoret Page.png). */
export default function CatalogCard({ href, brand, name, meta, price, image, isNew = false, cutout = false }: CatalogCardProps) {
  // Saved in this browser; the card's page path is its id.
  const [saved, toggleSaved] = useFavourite(href);

  return (
    // The whole card is one link: the name link stretches over the card (before:inset-0).
    // The heart sits above that layer (z-10) so it still toggles on its own.
    <article className="group relative flex h-full flex-col border border-[#1a1a1a] bg-[#0b0b0b] p-2.5 transition-colors duration-500 ease-moto hover:border-[#3a3a3a]">
      <div className="relative aspect-[1.38/1] overflow-hidden bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#111]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`${brand} ${name}`}
            className={`size-full transition-transform ${cutout ? "object-contain p-3" : "object-cover"} duration-700 ease-moto group-hover:scale-[1.05]`}
          />
        ) : (
          <span className="flex size-full items-center justify-center text-[11px] tracking-[0.14em] text-[#6f6f6f]">
            [FOTO · {name}]
          </span>
        )}
        {isNew && (
          <span className="absolute left-2.5 top-2.5 bg-highlight px-2 py-1 text-[10px] font-black tracking-[0.12em] text-ink">
            E RE
          </span>
        )}
        <button
          type="button"
          aria-label={saved ? `Hiq ${name} nga të preferuarat` : `Ruaj ${name} në të preferuarat`}
          aria-pressed={saved}
          onClick={toggleSaved}
          className="absolute right-1 top-1 z-10 flex size-11 items-center justify-center text-red drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] transition-transform hover:scale-110"
        >
          {/* Solid red heart as designed; saved state adds a white backing disc. */}
          <span className={`flex size-8 items-center justify-center rounded-full transition-colors ${saved ? "bg-white" : ""}`}>
            <TbHeartFilled size={22} aria-hidden />
          </span>
        </button>
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-4">
        <div className="text-[11px] uppercase tracking-[0.04em] text-faint">{brand}</div>
        <h3 className="mt-1 text-[21px] font-bold leading-tight tracking-[0.01em]">
          <Link
            href={href}
            className="before:absolute before:inset-0 before:content-[''] focus-visible:outline-none focus-visible:before:outline-2 focus-visible:before:outline-offset-2 focus-visible:before:outline-white"
          >
            {name}
          </Link>
        </h3>
        <div className="mt-2 text-[11px] text-[#7a7a7a]">{meta}</div>
        <div className="mt-auto flex items-baseline justify-between pt-4">
          <span className="text-[22px] font-bold">{eur(price)}</span>
          <span className="text-[10px] uppercase text-[#7a7a7a]">Çmim demo</span>
        </div>
        {/* Visual call to action; the click goes to the card link above. */}
        <span
          aria-hidden
          className="btn-sheen pointer-events-none mt-4 block bg-red py-3 text-center text-[11px] font-semibold tracking-[0.04em] text-white group-hover:after:animate-[sheen_0.7s_ease]"
        >
          SHIKO DETAJET
        </span>
      </div>
    </article>
  );
}
