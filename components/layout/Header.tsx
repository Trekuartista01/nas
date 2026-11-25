"use client";

import { AnimatePresence, motion } from "framer-motion";
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

// TODO(client): this says "Kërko ofertë" while the homepage dealer section says "Become a dealer"; both go to
// /kontakti. Decide one wording for both CTAs.
const CTA = { href: "/kontakti", label: "Kërko ofertë" };

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

  // Full-screen mobile menu: lock the page behind it, close with Escape or when the screen grows to desktop.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onWide = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    // Also transparent while a full-screen pinned video sets `data-nav-clear` on <html> (Sport Line), unless the menu is open.
    <header
      data-solid={solid || open}
      data-open={open}
      className="sticky top-0 z-50 border-b border-line-3 bg-[rgba(12,12,12,.85)] backdrop-blur-md transition-[background-color,border-color,backdrop-filter] duration-500 ease-nas [html:has([data-hero-under-nav])_&]:data-[solid=false]:border-transparent [html:has([data-hero-under-nav])_&]:data-[solid=false]:bg-transparent [html:has([data-hero-under-nav])_&]:data-[solid=false]:backdrop-blur-none [html[data-nav-clear]_&]:data-[open=false]:border-transparent [html[data-nav-clear]_&]:data-[open=false]:bg-transparent [html[data-nav-clear]_&]:data-[open=false]:backdrop-blur-none"
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

      {/* Mobile menu: fills the screen under the bar (top-full: the header's backdrop-filter makes it the containing block). */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-x-0 top-full h-[calc(100dvh-76px)] overflow-y-auto border-t border-line bg-ink lg:hidden"
          >
            {/* Links and CTA centred on the screen, both ways. */}
            <div className="container-moto flex min-h-full flex-col items-center justify-center gap-12 py-10 text-center">
              <ul className="flex flex-col items-center gap-2">
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.05 + i * 0.05,
                      ease: [0.2, 0.8, 0.2, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-4 text-[28px] font-bold uppercase leading-none tracking-[0.02em] hover:text-red"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <BlockButton href={CTA.href} marks={false} onClick={() => setOpen(false)}>
                {CTA.label}
              </BlockButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
