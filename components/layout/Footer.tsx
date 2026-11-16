import Link from "next/link";
import NewsletterForm from "@/components/layout/NewsletterForm";

const COLUMNS = [
  {
    title: "MODELET",
    links: [
      { href: "/modelet?kategoria=sport", label: "Sport bikes" },
      { href: "/modelet?kategoria=dirt", label: "Dirt bikes" },
      { href: "/modelet?kategoria=skuter", label: "Skuterë" },
      { href: "/modelet?kategoria=atv", label: "ATV" },
      { href: "/modelet?te-rejat=1", label: "Të rejat" },
    ],
  },
  {
    title: "SHËRBIME",
    links: [
      { href: "/servisi", label: "Servisi" },
      { href: "/aksesoret?kategoria=pjese", label: "Pjesë rezervë" },
      { href: "/financim", label: "Blej me këste" },
      { href: "/servisi#test-ride", label: "Test ride" },
    ],
  },
  {
    title: "KOMPANIA",
    links: [
      { href: "/rreth-nesh", label: "Rreth nesh" },
      { href: "/moto-shpati-world", label: "Moto Shpati World" },
      { href: "/moto-shpati-world?lloji=lajme", label: "Lajme" },
      { href: "/kontakti", label: "Kontakti" },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="kontakt" className="overflow-hidden border-t border-line">
      <div className="container-moto grid grid-cols-2 gap-10 pt-20 text-sm md:grid-cols-5">
        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <div className="mb-1.5 text-xs tracking-[0.14em] text-faint">{col.title}</div>
            {col.links.map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-red">
                {l.label}
              </Link>
            ))}
          </div>
        ))}
        <NewsletterForm />
      </div>

      {/* Static wordmark: MOTO SHPATI, fitted to the container width. */}
      <div aria-hidden className="container-moto mt-20 pb-4">
        <div className="wide whitespace-nowrap text-[clamp(34px,10vw,200px)] font-black italic leading-[0.85] tracking-[-0.04em]">
          MOTO <span className="text-red">SHPATI</span>
        </div>
      </div>

      <div className="container-moto flex flex-wrap justify-between gap-4 border-t border-line py-7 text-xs text-faint">
        <span>© 2026 Moto Shpati · Pejë, Kosovë</span>
        <span className="flex gap-4">
          <a href="https://www.instagram.com/moto.shpati/" target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a>
          <a href="[FACEBOOK URL]" className="hover:text-white">Facebook</a>
          <a href="[TIKTOK URL]" className="hover:text-white">TikTok</a>
        </span>
      </div>
    </footer>
  );
}
