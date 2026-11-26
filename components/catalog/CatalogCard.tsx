"use client";

import Link from "next/link";
import { eur } from "@/lib/format";
import T from "@/components/i18n/T";

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

/** 1px rectangular ring (outer box minus inner box, evenodd) for the chrome outline of SHIKO DETAJET. */
const CHROME_OUTLINE =
  "polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 1px 1px, 1px calc(100% - 1px), calc(100% - 1px) calc(100% - 1px), calc(100% - 1px) 1px, 1px 1px)";

/** Compact grid card for /modelet and /aksesoret (design: NAS Modelet / Aksesoret Page.png). */
export default function CatalogCard({ href, brand, name, meta, price, image, isNew = false, cutout = false }: CatalogCardProps) {
  return (
    // The whole card is one link: the name link stretches over the card (before:inset-0).
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
            <T sq="E RE" en="NEW" />
          </span>
        )}
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
        </div>
        {/* Visual call to action; the click goes to the card link above. 1px chrome outline that turns
            into a red fill on card hover. */}
        <span aria-hidden className="pointer-events-none relative mt-4 block py-3 text-center text-[11px] font-semibold tracking-[0.04em] text-white">
          <span className="absolute inset-0 bg-red opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span style={{ clipPath: CHROME_OUTLINE }} className="chrome absolute inset-0 transition-opacity duration-300 group-hover:opacity-0" />
          <span className="relative">
            <T sq="SHIKO DETAJET" en="SEE DETAILS" />
          </span>
        </span>
      </div>
    </article>
  );
}
