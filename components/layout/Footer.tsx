import { BUSINESS } from "@/data/business";
import Link from "next/link";
import type { ReactNode } from "react";
import T from "@/components/i18n/T";
import FooterReveal from "@/components/layout/FooterReveal";
import MaskRise from "@/components/motion/MaskRise";
import Rise from "@/components/motion/Rise";
import { LogoMark } from "@/components/ui/Logo";

/**
 * Footer links = the pages the site has now (Nov 2026): the NAS lineup, the bike finder, Sport Line and
 * The Brand. No newsletter, accessories, financing or contact page any more; the last column is the shop
 * phone (the address waits for the client: the old Pejë one was wrong). Copy in both languages (<T>).
 */
const COLUMNS: { key: string; title: ReactNode; links: { href: string; label: ReactNode; external?: boolean }[] }[] = [
  {
    key: "models",
    title: <T sq="MODELET" en="MODELS" />,
    links: [
      { href: "/modelet", label: <T sq="Të gjitha modelet" en="All models" /> },
      { href: "/modelet?kategoria=skuter", label: <T sq="Skuterë" en="Scooters" /> },
      { href: "/modelet?kategoria=motore", label: <T sq="Motorë" en="Motorcycles" /> },
    ],
  },
  {
    key: "services",
    title: <T sq="SHËRBIME" en="SERVICES" />,
    links: [{ href: "/gjej-motorin", label: <T sq="Gjej motorin tënd" en="Find your bike" /> }],
  },
  {
    key: "nas",
    title: "NAS",
    links: [
      { href: "/rreth-nesh", label: <T sq="Brendi" en="The Brand" /> },
      { href: "/sport-line", label: "Sport Line" },
    ],
  },
  {
    key: "showroom",
    title: <T sq="NA TELEFONO" en="CALL US" />,
    links: [{ href: `tel:${BUSINESS.phone}`, label: BUSINESS.phoneDisplay, external: true }],
  },
];

export default function Footer() {
  return (
    <FooterReveal id="kontakt" className="overflow-hidden border-t border-line bg-ink">
      <div className="container-moto grid grid-cols-2 gap-10 pt-20 text-sm md:grid-cols-4">
        {COLUMNS.map((col, i) => (
          <Rise key={col.key} delay={i * 0.08}>
            <div className="flex flex-col gap-3">
              <div className="mb-1.5 text-xs tracking-[0.14em] text-faint">{col.title}</div>
              {col.links.map((l) =>
                l.external ? (
                  <a
                    key={l.href}
                    href={l.href}
                    {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="hover:text-red"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link key={l.href} href={l.href} className="hover:text-red">
                    {l.label}
                  </Link>
                ),
              )}
            </div>
          </Rise>
        ))}
      </div>

      {/* Giant logo, fitted to the container width; rises from a mask as the footer comes in. */}
      <div aria-hidden className="container-moto mt-20 pb-8">
        <MaskRise>
          <div className="relative">
            <LogoMark className="block h-auto w-full text-white" />
            {/* Chrome copy of the letters (the ® stays white), faded in with the footer reveal (--footer-reveal from
                FooterReveal); one glint when the footer settles at the bottom. */}
            <div
              className="chrome absolute inset-0 [mask-image:url(/nas-images/nas-wordmark-letters.svg)] [mask-repeat:no-repeat] [mask-size:100%_100%] [opacity:var(--footer-reveal,0)]"
            >
              <div className="glint absolute inset-0 in-data-[settled=true]:animate-[glint-sweep_1.2s_cubic-bezier(.7,0,.2,1)_0.15s_both]" />
            </div>
          </div>
        </MaskRise>
      </div>

      <div className="container-moto flex flex-wrap justify-between gap-4 border-t border-line py-7 text-xs text-faint">
        <span>© 2026 NAS</span>
        {/* pr: keeps the links clear of the fixed back-to-top button at the bottom right. */}
        <span className="flex gap-4 pr-16">
          <a href={BUSINESS.instagram} target="_blank" rel="noreferrer" className="hover:text-white">
            Instagram
          </a>
          <a href="[FACEBOOK URL]" className="hover:text-white">
            Facebook
          </a>
          <a href="[TIKTOK URL]" className="hover:text-white">
            TikTok
          </a>
        </span>
      </div>
    </FooterReveal>
  );
}
