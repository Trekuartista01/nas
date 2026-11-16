"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { ADMIN_PATHS } from "@/lib/admin/paths";

const LINKS: { href: string; label: string; group?: string }[] = [
  { href: ADMIN_PATHS.home, label: "Paneli" },
  { href: ADMIN_PATHS.leads, label: "Kërkesat" },
  { href: ADMIN_PATHS.models, label: "Modelet", group: "Katalogu" },
  { href: ADMIN_PATHS.accessories, label: "Aksesorët" },
  { href: ADMIN_PATHS.brands, label: "Brendet" },
  { href: ADMIN_PATHS.posts, label: "Postimet", group: "Përmbajtja" },
  { href: ADMIN_PATHS.banner, label: "Banneri (video)" },
  { href: ADMIN_PATHS.subscribers, label: "Abonentët", group: "Tjera" },
  { href: ADMIN_PATHS.history, label: "Historiku" },
];

function isActive(pathname: string, href: string) {
  return href === ADMIN_PATHS.home ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Admin sidebar (wide screens) / top bar with a menu button (phones).
 * `account` is the signed-in admin + sign-out button, rendered on the server.
 *
 * The current URL is only known at request time on pages like /admin/modelet/[id], so the
 * prerendered shell shows the nav without a highlighted link and the live one streams in.
 */
export default function AdminNav({ account }: { account: ReactNode }) {
  return (
    <Suspense fallback={<NavView pathname="" account={account} />}>
      <LiveNav account={account} />
    </Suspense>
  );
}

function LiveNav({ account }: { account: ReactNode }) {
  return <NavView pathname={usePathname()} account={account} />;
}

function NavView({ pathname, account }: { pathname: string; account: ReactNode }) {
  // The phone menu remembers the page it was opened on, so it closes by itself after navigating.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  const links = (
    <nav aria-label="Paneli i administrimit" className="flex flex-col gap-0.5">
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <div key={link.href}>
            {link.group && <p className="mb-1 mt-4 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">{link.group}</p>}
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`block border-l-2 px-3 py-2 text-sm transition-colors ${
                active ? "border-red bg-surface font-semibold text-white" : "border-transparent text-muted-2 hover:bg-surface hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Phones */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink/95 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button
          type="button"
          aria-expanded={open}
          aria-controls="admin-menu"
          onClick={() => setOpenOn(open ? null : pathname)}
          className="min-h-10 border border-line-2 px-3 text-sm font-semibold"
        >
          {open ? "Mbyll" : "Menyja"}
        </button>
      </div>
      {open && (
        <div id="admin-menu" className="border-b border-line bg-panel px-2 pb-4 lg:hidden">
          {links}
          <div className="mt-4 border-t border-line px-3 pt-4">{account}</div>
        </div>
      )}

      {/* Wide screens */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-panel lg:flex">
        <div className="border-b border-line px-5 py-4">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-3">{links}</div>
        <div className="border-t border-line px-5 py-4">{account}</div>
      </aside>
    </>
  );
}

function Brand() {
  return (
    <Link href={ADMIN_PATHS.home} className="flex items-baseline gap-2">
      <span className="wide text-[15px] font-black italic tracking-tight">
        MOTO SHPATI<span className="text-red">.</span>
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Admin</span>
    </Link>
  );
}
