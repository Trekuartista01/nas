"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { TbMenu2, TbX } from "react-icons/tb";
import Logo from "@/components/ui/Logo";
import { BlockButton } from "@/components/ui/Buttons";

/**
 * Navigation as in the NAS designs (Nov 2026): logo, links in the middle, the offer CTA on the right.
 * Sticky. Over a full-screen hero (a section with `data-hero-under-nav`, pulled up under the bar) it starts transparent and
 * takes its solid background once half the screen height has been scrolled.
 * The search button that was here went with this design (components/layout/HeaderSearch.tsx is kept).
 */
const NAV = [
  { href: "/modelet", label: "MODELS" },
  { href: "/sport-line", label: "SPORT LINE" },
  { href: "/rreth-nesh", label: "THE BRAND" },
  { href: "/kontakti", label: "CONTACT" },
];

// TODO(client): this says "Kërko ofertë" (→ /kerko-oferte) while the homepage dealer section says "Become a dealer"
// (→ /kontakti). Decide one wording and action for both CTAs.
const CTA = { href: "/kerko-oferte", label: "Kërko ofertë" };

/**
 * Desktop links with the current page underlined. The URL isn't known while prerendering pages
 * like /nas-world/[slug], so the shell shows the links without an underline and the
 * live version streams in (same as the admin sidebar).
 */
function NavLinks({ pathname }: { pathname: string }) {
  const isActive = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));
  return (
    <ul className="hidden flex-1 justify-center gap-9 text-[13px] font-normal tracking-[0.14em] lg:flex">
      {NAV.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={`transition-colors duration-300 hover:text-red ${isActive(item.href) ? "text-red" : "text-white"}`}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function LiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  // Past half a screen: solid background (only visible as a change over a hero, see HeroUnderNav).
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const update = () => setSolid(window.scrollY > window.innerHeight * 0.5);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <header
      data-solid={solid || open}
      className="sticky top-0 z-50 border-b border-line-3 bg-[rgba(12,12,12,.85)] backdrop-blur-md transition-[background-color,border-color,backdrop-filter] duration-500 ease-nas [html:has([data-hero-under-nav])_&]:data-[solid=false]:border-transparent [html:has([data-hero-under-nav])_&]:data-[solid=false]:bg-transparent [html:has([data-hero-under-nav])_&]:data-[solid=false]:backdrop-blur-none"
    >
      <nav className="container-moto flex h-[76px] items-center gap-6 lg:h-20" aria-label="Navigimi kryesor">
        <Logo />

        <Suspense fallback={<NavLinks pathname="" />}>
          <LiveNavLinks />
        </Suspense>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <span className="hidden sm:block">
            <BlockButton href={CTA.href} marks={false}>
              {CTA.label}
            </BlockButton>
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
              <Link href={item.href} onClick={() => setOpen(false)} className="headline block py-3 text-2xl hover:text-red">
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-3">
            <BlockButton href={CTA.href} marks={false} onClick={() => setOpen(false)}>
              {CTA.label}
            </BlockButton>
          </li>
        </ul>
      )}
    </header>
  );
}
