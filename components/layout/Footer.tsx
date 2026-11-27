import Link from "next/link";
import type { ReactNode } from "react";
import T from "@/components/i18n/T";
import FooterReveal from "@/components/layout/FooterReveal";
import MaskRise from "@/components/motion/MaskRise";
import Rise from "@/components/motion/Rise";
import ChromeLion from "@/components/nas/ChromeLion";
import { LogoMark } from "@/components/ui/Logo";
import { BUSINESS } from "@/data/business";

/**
 * Footer (design "Nas footer.png", Nov 2026): the chrome lion on the left, four link columns (Modelet,
 * Sport line, Brendi, Kontakti; the column head is a link too), then the big NAS wordmark with
 * "MOTORCYCLE / BORN IN ENGLAND" under it and the social links bottom right.
 * Kontakti: the address and email are not confirmed yet (BUSINESS.mapsUrl / email are null), so those two
 * entries show as plain text without a link until they are filled in.
 */
type Item = { label: ReactNode; href: string | null };
const COLUMNS: { key: string; head: Item; links: Item[] }[] = [
  {
    key: "models",
    head: { label: <T sq="Modelet" en="Models" />, href: "/modelet" },
    links: [
      { label: <T sq="Motorë" en="Motorcycles" />, href: "/modelet?kategoria=motore" },
      { label: <T sq="Skuterë" en="Scooters" />, href: "/modelet?kategoria=skuter" },
      // The catalog is sorted newest first by default.
      { label: <T sq="Të rejat" en="New arrivals" />, href: "/modelet" },
    ],
  },
  {
    key: "sport",
    head: { label: "Sport line", href: "/sport-line" },
    links: [
      { label: "The idea", href: "/sport-line#ideja" },
      { label: "The Red S", href: "/sport-line#s-e-kuqe" },
      { label: "Specifics", href: "/sport-line#specifikat" },
    ],
  },
  {
    key: "brand",
    head: { label: <T sq="Brendi" en="The Brand" />, href: "/rreth-nesh" },
    links: [
      { label: "The Lion", href: "/rreth-nesh#luani" },
      { label: "The vision", href: "/rreth-nesh#vizioni" },
      { label: "Trust", href: "/rreth-nesh#vlerat" },
    ],
  },
  {
    key: "contact",
    head: { label: <T sq="Kontakti" en="Contact" />, href: null },
    links: [
      { label: <T sq="Adresa" en="Address" />, href: BUSINESS.mapsUrl },
      { label: <T sq="Numri kontaktues" en="Phone number" />, href: `tel:${BUSINESS.phone}` },
      { label: "Email", href: BUSINESS.email ? `mailto:${BUSINESS.email}` : null },
    ],
  },
];

const SOCIAL = [
  { label: "Instagram", href: BUSINESS.instagram },
  { label: "Facebook", href: BUSINESS.facebook ?? "[FACEBOOK URL]" },
  { label: "Tiktok", href: "[TIKTOK URL]" },
];

function FooterLink({ item, className = "" }: { item: Item; className?: string }) {
  if (!item.href) return <span className={className}>{item.label}</span>;
  const cls = `${className} transition-colors hover:text-red`;
  if (item.href.startsWith("/")) {
    return (
      <Link href={item.href} className={cls}>
        {item.label}
      </Link>
    );
  }
  const external = item.href.startsWith("http");
  return (
    <a href={item.href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className={cls}>
      {item.label}
    </a>
  );
}

export default function Footer() {
  return (
    <FooterReveal id="kontakt" className="overflow-hidden bg-black text-[#f2f2f2]">
      <div className="container-moto grid gap-12 pt-[clamp(64px,8vw,112px)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,4fr)]">
        <Rise>
          <ChromeLion className="w-[clamp(96px,9vw,128px)]" />
        </Rise>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
          {COLUMNS.map((col, i) => (
            <Rise key={col.key} delay={i * 0.08}>
              <div className="flex flex-col items-start gap-[14px] text-[clamp(15px,1.2vw,18px)] leading-tight">
                <FooterLink item={col.head} className="mb-1.5" />
                {col.links.map((l, j) => (
                  <FooterLink key={j} item={l} />
                ))}
              </div>
            </Rise>
          ))}
        </div>
      </div>

      <div className="container-moto flex flex-wrap items-end justify-between gap-x-10 gap-y-8 pb-10 pt-[clamp(80px,10vw,140px)]">
        {/* Big wordmark; rises from a mask as the footer comes in. */}
        <MaskRise className="w-full max-w-[640px] md:w-[46%]">
          <div className="text-[#e3e3e3]">
            <LogoMark bare title="NAS" className="block h-auto w-full" />
            <p className="mt-[clamp(14px,1.6vw,24px)] text-[clamp(17px,1.85vw,27px)] font-extrabold uppercase leading-[1] tracking-[-0.01em]">
              Motorcycle
              <br />
              Born in England
            </p>
          </div>
        </MaskRise>
        {/* pr: keeps the links clear of the fixed back-to-top button at the bottom right. */}
        <div className="flex gap-5 pb-1 text-[clamp(15px,1.2vw,18px)] md:pr-16">
          {SOCIAL.map((s) => (
            <FooterLink key={s.label} item={s} />
          ))}
        </div>
      </div>
    </FooterReveal>
  );
}
