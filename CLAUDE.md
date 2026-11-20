# NAS — website

Multi-page website for **NAS**, a motorcycle / scooter / ATV dealer in Pejë, Kosovo (NAS and QJMOTOR). The site carries the NAS name only (Nov 2026); the shop Instagram (`BUSINESS.instagram`) and the Google Maps listing still use the old shop name until the client sends NAS ones.
Built by **Trekuartista**. Follow the Trekuartista starter-pack conventions below. They are fixed defaults, not suggestions.

## Source of truth for the design

- `design/homepage-v2.dc.html` is the **approved homepage design**. Match it closely: layout, copy, colors, type, spacing and motion.
- That file was exported from a design canvas and is **not production code**. Read it as a spec:
  - The markup lives inside `<x-dc>`. Page-wide CSS (keyframes, hover rules) is in `<helmet><style>`.
  - `{{name}}` holes are filled by `renderVals()` in the `<script type="text/x-dc">` block at the bottom.
  - `<sc-for list=… as=…>` is a loop and `<sc-if value=…>` is a condition.
  - The logic class at the bottom holds the real behaviour: lineup filter, bike finder scoring, finance maths, hero video sync. Port that logic; do not port the runtime.
- Do NOT copy the inline-style approach. Rebuild with Tailwind classes plus a small set of shared components.
- Bracketed text like `[ADRESA]`, `[BANKA PARTNERE]`, `[MODELI] 125` or `[XX] PRODUKTE` is a placeholder. Keep it visible until real content arrives; never invent it.
- Pages beyond the homepage have **no design yet**. Build them by reusing the homepage's components and visual language, and flag anything that needs a design decision.

## Stack (Trekuartista defaults)

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript only |
| Styling | Tailwind CSS v4 (wired by create-next-app through `@tailwindcss/turbopack` in `next.config.ts`), no second styling system. Tokens live in `app/globals.css` `@theme` |
| Animation | Framer Motion + react-intersection-observer. No GSAP |
| Icons | react-icons. The only exceptions are the custom shapes in the design (slashes, gauge) |
| Data | **Supabase** (recommended: auth + storage for the admin panel). Confirm before Milestone 2. Never mix with Mongoose |
| Email | nodemailer (offer, test-ride, finance and contact forms) |
| Images / video | Pick ONE at kickoff (Cloudinary recommended for model photos + hero video). Confirm |
| Deploy | Vercel |
| Lint | eslint + eslint-config-next |

## Design tokens (put them in Tailwind theme / CSS variables, not hard-coded)

- `ink` #0A0A0A (page background)
- `surface` #111111, `surface-2` #121212, `panel` #0E0E0E
- `line` #1E1E1E, `line-2` #262626
- `muted` #9A9A9A, `muted-2` #A8A8A8, `faint` #8A8A8A
- `red` #E10600 (brand accent: CTAs, punctuation, active states)
- `highlight` #FFB21A (amber). Use it sparingly: "E RE" (new) badges, live dots, event tags, financing label
- `bone` #ECE8E1 (light background for the financing section only)
- Font: **Publica Sans** (Light 300, Regular 400, Medium 500, Bold 700, ExtraBold 800; no italics), **self-hosted** in `app/fonts/` via `next/font/local` (builds never depend on a font service). Chosen by the client in Nov 2026, replacing Archivo. It has no width axis, so the `wide` utility no longer widens text. Use `headline` for section titles.
  - Headlines: weight 800 (heaviest Publica Sans), tracking about -0.03em, uppercase, and a red full stop or question mark at the end.
  - Body: Publica Sans.
- Signature shapes: slanted red buttons (`clip-path` parallelogram) and the red `///` slash marks next to the main CTA.

## Shared components (build these first; inner pages reuse them)

- `Header` (sticky, blurred), `Footer` (columns + newsletter + giant wordmark), `ScrollToTop`
- `SectionHeading` (two-line headline with a red full stop, optional right-side text or link)
- `SlashButton` (red parallelogram, optional `///` marks), `GhostButton`
- `Reveal` (Framer Motion + react-intersection-observer fade-up wrapper)
- `CategoryCards` (cards that widen on hover). Used by **Find your vehicle** AND **Gear up** (accessories), with the same component and different data
- `ModelCard`, `FilterTabs`, `Marquee`
- `BikeFinder` (step flow + rev-counter gauge). Used on home and on its own page
- `FinanceCalculator` (model picker, deposit bars, road-style term picker, animated monthly figure). Used on home, on `/financim`, and on each model page with that model preselected

## Homepage section order (stacked full-width sections, `components/home/`, composed by `HomePage.tsx`)

**Nov 2026: replaced by the NAS homepage** (design `Desktop/nas/NAS — Homepage.png`, client's choice): `HomeHero` (the hero video from `getHeroVideo`, Admin → Banneri, fallback `public/videos/hero.mp4`) → `Statement` → `VisionPanels` (Lifestyle/Speed/Freedom, sticky stack) → `Range` (dark; desktop ≥1024 pins and scrolls the cards sideways, below that a snap carousel; tabs by `type`; `DarkModelCard` with `cut`, the cut-corner shape) → `SportLine` (scroll story: pedestal wipe, "lights behind the logo" (`components/nas/LogoBacklight.tsx`: sportsbike front = LED eyes + DRL slashes, time-based double flash at `lightsOn`, off again on scroll-back; pinned ≥768px, timed run on phones; timeline/colours in `SPORT_BACKLIGHT`, lib/motion.ts), labelled shots, sport models + "Explore Sport Line") → `DealerCta` ("Lead. Don't follow." on the #161616 panel: chrome lion `ChromeLion`, chrome "LEAD.", chrome-outline secondary button, 2px chrome edge where the footer comes out; chrome is used only here and on the footer wordmark: `--chrome` / `chrome` / `chrome-text` / `glint` in app/globals.css; footer reveal progress is shared as `--footer-reveal`); `Materials` (Iron/Light/Concrete) is off the homepage, kept for a Sport Line page (dealer form → `submitDealer`, stored as a contact lead with subject "Kërkesë për dealer"). Footer slides up from under `<main>` (`FooterReveal`, settings `FOOTER_REVEAL` in `lib/motion.ts`, starts in the last 560px). Reduced motion: no pinning anywhere. Motion is Framer Motion (the brief asked for GSAP + Lenis; the client chose to keep this file's stack): timings in `lib/motion.ts`, shared pieces in `components/motion/` (`Lines`, `Rise`, `MaskRise`, `useParallaxScale`). Photos: the client's originals in `public/nas-images/`, served as WebP copies from `public/nas-images/web/` (`data/nas-home.ts`; the pedestal is `222222222.png`; the lion is still a TEMP crop of the design PNG); the copy is English as in the design. Header follows that design too: always sticky, transparent over a hero marked `data-hero-under-nav` (the hero pulls itself up under the bar) until half a screen is scrolled; links MODELS / SPORT LINE (`/sport-line`) / THE BRAND (`/rreth-nesh`) / CONTACT (`/kontakti`), CTA "Kërko ofertë" (block button without marks); search button removed, `HeaderSearch.tsx` kept. New pages (Nov 2026): `/rreth-nesh` now renders `BrandPage` (design "NAS — The Brand"; the old `AboutPage` is unused) and `/sport-line` (`SportLinePage`, design "NAS — Sport Line", includes `Materials`); data in `data/nas-pages.ts`, shared parts in `components/nas/`. The Range cards have no favourite heart for now. The Range uses `LineupCard`. CTAs use `BlockButton` / `BlockActionButton` (image 93). The list below is the previous (homepage-v2) order; those components are kept.


1. `Banner` (hero video + headline + `///` CTA + progress bars synced to the video shots)
2. ~~`Ticker` (red slanted marquee)~~ removed from the homepage at the client's request (Nov 2026); `components/home/Ticker.tsx` kept in case it comes back
3. `FindYourVehicle`
4. `Lineup`
5. `GearUp` (accessories)
6. `BikeFinder`
7. `Brands`
8. `FinanceCalculator` (light section)
9. `NasWorld` (events + news + Instagram tiles)
10. `ServiceShowroom` (test ride / service & parts / showroom Pejë)
11. `FinalCta`

The starter pack wants an `AboutUsOnHomePage` teaser on the homepage. The design has none; `ServiceShowroom` partly covers it. **Ask before adding one.**

## Hero video behaviour

- File: `public/videos/hero.mp4` (1080p, no audio) and poster `public/videos/hero-poster.jpg`. Muted, autoplay, loop, playsInline.
- Shot cut points (seconds): `[0, 2.875, 5.0, 7.0, 10.05]`, which is scooter in the city, adventure bike on the road, sport bike on the mountain road, ATV in the forest.
- Each progress bar fills for its shot's duration. A requestAnimationFrame loop reads `video.currentTime` to switch the active bar. Clicking a bar seeks the video to that shot.
- When this moves to the admin panel, the cut points and labels must be data (`BannerManager`), not hard-coded.
- The design applies an optional grayscale grade to the video. Keep it as a prop with a default of mono.

## Motion translation (from the design's CSS to Framer Motion)

- Scroll reveals (`.rv`) → `Reveal`: fade + y 48px → 0 on entering the viewport, once.
- Hero headline lines (`.ln`) → each line slides up from 105% under an overflow mask, staggered 0.15s.
- Brand rows sliding as you scroll (`.xs/.xs2`) → `useScroll` + `useTransform` on x.
- Final CTA wipe → `clipPath` driven by scroll progress.
- Marquee, speed lines, stripes, pulse dot → plain CSS keyframes in the Tailwind config (no JavaScript needed).
- Gauge needle, match rings, deposit and term changes → Framer `animate` with a spring. The monthly figure counts up/down with `useSpring` or `animate()`.
- Wrap the app in `<MotionConfig reducedMotion="user">` and respect `prefers-reduced-motion` in the CSS animations too.

## Copy and language

- The site is Albanian (`lang="sq"`). English is used only in the big brand headlines ("BORN TO ROAR.", "THE LINEUP.").
- Prices are in € and use the de-DE number format (€3.990).
- Prices in the design are DEMO prices. Model names with `[MODELI]` are placeholders.

## Rules carried over from the starter pack (do not break)

- Every page is wrapped in the shared Header/Footer. No per-page chrome.
- Route files only render the page component (`app/page.tsx` → `<HomePage />`).
- Catalog content uses a list page plus a `SinglePageOfX` detail page.
- Contact page = `ContactForm` + embedded `Map`.
- Fill in the Metadata title and description for every page.
- Secrets live only in `.env.local`, with no fallback values. Server-side validation and rate limiting on every form. No debug, test or seed routes reachable in production.
- Run `npm audit` before launch.

## Build status

- **Milestone 1 · done:** scaffold, tokens, font, layout shell (Header with mobile menu, Footer, ScrollToTop, MotionProvider), shared components, and the full homepage matching the design. Builds, lints and type-checks clean, and works at 390px (no sideways scroll).
- **Milestone 1 · pages done:** every sitemap page exists: `/modelet` (+ `[slug]`), `/aksesoret` (+ `[slug]`), `/kerko-oferte`, `/gjej-motorin`, `/financim`, `/servisi` (`#servis`, `#test-ride`), `/nas-world` (+ `[slug]`), `/brendet/[slug]`, `/rreth-nesh`, `/kontakti`. None of the inner pages has a design yet: they reuse the homepage/catalog components and keep placeholders (`[ORARI]`, `[BANKA PARTNERE]`, `[HISTORIA E BRENDIT]`, `[HISTORIA E NAS]`, privacy-policy link). Show them to the client for a design pass.
- **Routing:** public pages live in `app/(site)/` (its layout adds Header/Footer via `SiteShell`); the admin panel lives in `app/admin/` with its own chrome. The root `not-found.tsx` wraps itself in `SiteShell`.
- **Milestone 2 · done (email pending):** all six forms are on pages (`components/forms/`: `FormParts`, `LeadForms`, `FormBlock`) and use the server actions in `lib/forms/` (validation, spam trap, rate limit, optional Turnstile). Leads are saved to `leads` / `newsletter_subscribers` and show in Admin → Kërkesat; tested end to end. Email sending needs the SMTP settings in `.env.local` / Vercel.
- **Milestone 3 · done:** schema in `supabase/migrations`, setup in `supabase/README.md`, seed from `data/*.ts` (`npm run db:seed-sql`). Public pages read the catalog, brands, hero video and World tiles through the cached getters in `lib/data/catalog.ts` (server components fetch, client components get the data as props). Admin saves refresh them via `updateTag`. `proxy.ts` gets published accessory slugs from Supabase (kept in memory, reloaded on an unknown slug) for real 404s. Without Supabase settings everything falls back to `data/*.ts`.
- **Milestone 4 · built; database live (migration + seed applied, admin account created):** `/admin` (login `/admin/hyr`, **password only**: one shared Supabase user whose email is in `ADMIN_EMAIL`, no 2FA, decided with the client). Dashboard, Leads (Kërkesat), Models, Accessories, Brands, Posts, Banner (video + cut points), Subscribers (+ CSV), History (audit log). Code: `lib/admin/` (auth, actions, queries, schemas) and `components/admin/`. Admin UI = site tokens, plain functional style. Models have card fields only (detail-page fields wait for that page's design).
- **Model page hero (Nov 2026, needs client sign-off):** `components/catalog/ModelShowcase.tsx` replaces the stage + specs strip on `/modelet/[slug]` (passed to `ProductDetail` as `hero`; accessories are unchanged). Cut-out bike on a lit stage, looping/parallax background word, callouts pinned to the bike, colour swatches, Studio/Showroom/360° views, monthly price in red with count-up, price + REZERVO TEST RIDE, intro curtain (1.5s, click to skip), staged entrance with headlight flash, light scan that switches the callouts on, then callouts take turns (hover picks one). Media lives in `data/model-showcase.ts` (not in Supabase yet; move to Admin → Modelet once approved). Only MAX-X 125 has one, and its cut-out is TEMP (made from the showroom photo; a second scooter is still behind it). Needed from the client: studio cut-outs, photos per colour + real colour names, 24–36 frame 360° sets, confirmed callout wording.
- **Homepage Find your vehicle + Lineup (Nov 2026, needs client sign-off):** `components/home/VehicleCards.tsx` (cut-out bikes that grow as a card opens, giant outlined word, other cards go grey, live model count / lowest price / licence range from the catalog, "SË SHPEJTI" when a category has no models, swipe row on phones). Gear up keeps `CategoryCards`. `Lineup.tsx` + `LineupCard.tsx`: featured 2×2 card (newest model), 3D tilt + light sweep + spec strip on hover, monthly price first, "Shiko të gjitha" tile closes the grid. Cut-outs are TEMP (made from the photos; the sport one has a faint background smudge behind the seat). The "sport" and "dirt" category photos show scooters: confirm with the client.
- **Find your vehicle → pinned scroll story (Nov 2026, replaces the VehicleCards row on the homepage):** `components/home/VehicleScroll.tsx`. Order 01 sport, 02 scooter, 03 dirt (`ORDER` in `FindYourVehicle.tsx`). Scrolling moves the bike right → left in the frame, then the next category takes over. Layout (Nov 2026, design "section i ri"): black side panel with the big grey number and the category name + red marks, a divider line that fills red with scroll, full-bleed media on the right. Each category takes `video` + `poster` in `data/home.ts`: scroll scrubs `video.currentTime`, so encode the Higgsfield clips all-keyframe (`ffmpeg -i in.mp4 -an -c:v libx264 -g 1 -crf 22 -preset veryfast -movflags +faststart out.mp4`) into `public/videos/`. Until then the cut-outs slide. `VehicleCards.tsx` is now unused (kept for its `CategoryStats` type).
