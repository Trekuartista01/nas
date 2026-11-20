import { BUSINESS } from "@/data/business";
import Link from "next/link";
import NewsletterForm from "@/components/layout/NewsletterForm";
import FooterReveal from "@/components/layout/FooterReveal";
import MaskRise from "@/components/motion/MaskRise";
import Rise from "@/components/motion/Rise";
import { LogoMark } from "@/components/ui/Logo";

const COLUMNS = [
  {
    title: "MODELET",
    links: [
      { href: "/modelet?kategoria=sport", label: "Sport bikes" },
      { href: "/modelet?kategoria=dirt", label: "Dirt bikes" },
      { href: "/modelet?kategoria=skuter", label: "Skuterë" },
      { href: "/modelet?te-rejat=1", label: "Të rejat" },
    ],
  },
  {
    title: "SHËRBIME",
    links: [
      { href: "/aksesoret?kategoria=pjese", label: "Pjesë rezervë" },
      { href: "/financim", label: "Blej me këste" },
      { href: "/modelet", label: "Test ride" },
    ],
  },
  {
    title: "KOMPANIA",
    links: [
      { href: "/rreth-nesh", label: "Rreth nesh" },
      { href: "/nas-world", label: "NAS World" },
      { href: "/nas-world?lloji=lajme", label: "Lajme" },
      { href: "/kontakti", label: "Kontakti" },
    ],
  },
];

export default function Footer() {
  return (
    <FooterReveal id="kontakt" className="overflow-hidden border-t border-line bg-ink">
      <div className="container-moto grid grid-cols-2 gap-10 pt-20 text-sm md:grid-cols-5">
        {COLUMNS.map((col, i) => (
          <Rise key={col.title} delay={i * 0.08}>
            <div className="flex flex-col gap-3">
              <div className="mb-1.5 text-xs tracking-[0.14em] text-faint">{col.title}</div>
              {col.links.map((l) => (
                <Link key={l.label} href={l.href} className="hover:text-red">
                  {l.label}
                </Link>
              ))}
            </div>
          </Rise>
        ))}
        <Rise delay={0.24} className="col-span-2">
          <NewsletterForm />
        </Rise>
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
        <span>© 2026 NAS · Pejë, Kosovë</span>
        <span className="flex gap-4">
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
