"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { TbMenu2, TbSearch, TbX } from "react-icons/tb";
import Logo from "@/components/ui/Logo";
import { SlashButton } from "@/components/ui/Buttons";

const NAV = [
  { href: "/modelet", label: "MODELET" },
  { href: "/aksesoret", label: "AKSESORËT" },
  { href: "/#brendet", label: "BRENDET" },
  { href: "/moto-shpati-world", label: "MOTO SHPATI WORLD" },
  { href: "/servisi", label: "SERVISI" },
  { href: "/kontakti", label: "KONTAKTI" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink/70 backdrop-blur-md">
      <nav className="container-moto flex items-center gap-8 py-4" aria-label="Navigimi kryesor">
        <Logo />

        <ul className="hidden flex-1 flex-wrap justify-center gap-7 text-xs font-semibold tracking-widest lg:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`border-b pb-1 transition-colors hover:text-red ${isActive(item.href) ? "border-red" : "border-transparent"}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <button
            type="button"
            aria-label="Kërko"
            className="flex size-11 items-center justify-center rounded-full border border-[#2a2a2a] transition-colors hover:border-white"
          >
            <TbSearch size={18} aria-hidden />
          </button>
          <span className="hidden sm:block">
            <SlashButton href="/kerko-oferte" size="sm">
              KËRKO OFERTË
            </SlashButton>
          </span>
          <button
            type="button"
            className="flex size-11 items-center justify-center lg:hidden"
            aria-label={open ? "Mbyll menunë" : "Hap menunë"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <TbX size={24} aria-hidden /> : <TbMenu2 size={24} aria-hidden />}
          </button>
        </div>
      </nav>

      {open && (
        <ul id="mobile-nav" className="container-moto flex flex-col gap-1 border-t border-line pb-6 pt-2 lg:hidden">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="headline block py-3 text-2xl hover:text-red"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-3">
            <SlashButton href="/kerko-oferte" onClick={() => setOpen(false)}>
              KËRKO OFERTË
            </SlashButton>
          </li>
        </ul>
      )}
    </header>
  );
}
