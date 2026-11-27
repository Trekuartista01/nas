/**
 * Transparent header requests (`data-nav-clear` on <html>, read by Header). Several scenes on one page
 * can ask for it (homepage: SportIntro, LogoFlashVideo); the attribute stays while any owner wants it,
 * so one scene switching off never clears another's request.
 */
const owners = new Set<string>();

export function setNavClear(owner: string, on: boolean) {
  if (on) owners.add(owner);
  else owners.delete(owner);
  const root = document.documentElement;
  if (owners.size) root.dataset.navClear = "";
  else delete root.dataset.navClear;
}
