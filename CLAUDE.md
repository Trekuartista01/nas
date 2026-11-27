# NAS — website

Multi-page website for **NAS**, a motorcycle / scooter dealer (NAS and QJMOTOR; the earlier Pejë address was wrong, so the site shows no address until the client confirms one: `BUSINESS.street` / `city` / `mapsUrl` are null). The site carries the NAS name only (Nov 2026); the shop Instagram (`BUSINESS.instagram`) and the Google Maps listing still use the old shop name until the client sends NAS ones.
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

**Nov 2026: replaced by the NAS homepage** (design `Desktop/nas/NAS — Homepage.png`, client's choice): `HomeHero` (the hero video from `getHeroVideo`, Admin → Banneri, fallback `public/videos/hero.mp4`) → `Statement` → `VisionPanels` (Lifestyle/Speed/Freedom: three photo columns side by side, the hovered one widens and its photo zooms in, the others go grey; `components/nas/HoverColumns.tsx`, shared with `Materials`, Nov 2026; replaced the sticky stack) → `Range` (dark; desktop ≥1024 pins and scrolls the cards sideways, below that a snap carousel; tabs by `type`; `DarkModelCard` with `cut`, the cut-corner shape) → `SportLineIntro` (Nov 2026 brief, replaced the "diagonal opens" `SportIntro`, kept unused with its `.sl-*` CSS): `#sport`, 240vh with a sticky 100vh stage on #070707; "SPORT" (behind) and red-outlined "LINE." (in front) around a centre image of 9 strips, five tiles around it (helmet, headlight, glove, Lifestyle tank, wheel; headlight/glove/wheel are CSS crops of the night shot), red top glow; scroll (Framer `useScroll`, p = progress × 0.68, easeInOutCubic) pushes the words out, flies the tiles off, peels the strips, shrinks and fades the glow, so the screen is black at the end; no scroll cue; hand-off (≥768px, motion on): `SportLine` is pulled up 100vh under it (`md:motion-safe:-mt-[100vh]`), so at progress 1 the intro stage hides and the pinned logo screen is already there, the logo popping in (LogoFlashVideo `pop`, spring), reversed on scroll-back; <820px no tiles, centre 72vw; reduced motion: first frame, no pin; header transparent while the stage covers the screen (`setNavClear`, components/motion/navClear.ts, shared with LogoFlashVideo). Images: `public/nas-images/01-center-rider.jpg` + `02-helmet.png` → `node scripts/sport-intro-images.mjs` → `nas-images/web/sport-intro-*.webp`, then upload-media ) → `SportLine` (the pedestal shot that opened it was removed in Nov 2026, replaced by the night shot in `SportIntro`; now just logo → video in ONE pinned scene (`components/nas/LogoFlashVideo.tsx`, Nov 2026; replaced the "lights behind the logo" `LogoBacklight.tsx`, kept unused): white wordmark, one scroll past `SPORT_FLASH.steps.red` turns the S red and raises the caption, one more past `steps.video` punches the logo out in a white flash + red streak and the video takes the screen; scroll only picks the step, each step plays at a fixed speed and reverses on scroll-back; phones: timed run in a 4:3 box; reduced motion: red S + plain video below; settings `SPORT_FLASH` in lib/motion.ts. The detail video `public/videos/sport-line.mp4` (replaced the three labelled shots, Nov 2026), full bleed and full screen from 768px, held in the same pin for the rest of `SPORT_FLASH.pinScreens` (`SPORT_VIDEO_PIN` is unused now) with the header transparent while it covers the screen (`data-nav-clear` on <html>, read by `Header`); off on phones and with reduced motion. The earlier wheel-swallowing scroll stop `components/motion/useScrollStop.ts` (`SCROLL_STOP`) is unused, kept; the models block, "Explore Sport Line" and the logo under "THE PERFORMANCE LINE" were removed in Nov 2026; the /sport-line page no longer has the "In the line" model cards) → `DealerCta` ("Lead. Don't follow." on the #161616 panel: chrome lion `ChromeLion`, chrome "LEAD.", chrome-outline secondary button, 2px chrome edge where the footer comes out; chrome is used only here, on the footer lion and on the 1px outline of SHIKO DETAJET in `CatalogCard` (/modelet and /aksesoret, red fill on hover): `--chrome` / `chrome` / `chrome-text` / `glint` in app/globals.css; footer reveal progress is shared as `--footer-reveal`); `Materials` (Iron/Light/Concrete) is off the homepage, kept for a Sport Line page (dealer form → `submitDealer`, stored as a contact lead with subject "Kërkesë për dealer"). Footer slides up from under `<main>` (`FooterReveal`, settings `FOOTER_REVEAL` in `lib/motion.ts`, starts in the last 560px). Reduced motion: no pinning anywhere. Motion is Framer Motion (the brief asked for GSAP + Lenis; the client chose to keep this file's stack): timings in `lib/motion.ts`, shared pieces in `components/motion/` (`Lines`, `Rise`, `MaskRise`, `useParallaxScale`). Photos: the client's originals in `public/nas-images/`, served as WebP copies from `public/nas-images/web/` (`data/nas-home.ts`; the pedestal is `222222222.png`; the lion is still a TEMP crop of the design PNG); the copy is English as in the design. Mobile menu (Nov 2026): full screen under the bar, links and CTA centred both ways, links bold (700) not extra-bold, page scroll locked while open, Escape closes. Header follows that design too: always sticky, transparent over a hero marked `data-hero-under-nav` (the hero pulls itself up under the bar) until half a screen is scrolled; links MODELS / SPORT LINE (`/sport-line`) / THE BRAND (`/rreth-nesh`) / (CONTACT removed with the contact page), CTA "Shiko modelet" → `/modelet` (block button without marks); search button removed, `HeaderSearch.tsx` kept. New pages (Nov 2026): `/rreth-nesh` now renders `BrandPage` (design "NAS — The Brand"; the old `AboutPage` is unused) and `/sport-line` (`SportLinePage`, design "NAS — Sport Line", includes `Materials`); data in `data/nas-pages.ts`, shared parts in `components/nas/`. The favourites (wishlist heart) feature was removed from every card (Nov 2026). The Range cards’ arrow sits in a cut-corner box (no circles: not part of the brand). The Range uses `LineupCard`. CTAs use `BlockButton` / `BlockActionButton` (image 93). The list below is the previous (homepage-v2) order; those components are kept.


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

## Media (photos + videos) on Supabase Storage (Nov 2026)

- Every photo and video in `public/` is mirrored to Supabase Storage under `site/` with the same path (photos → bucket `media`, videos → `videos`) by `node scripts/upload-media.mjs` (reads `.env.local`, overwrites, `--dry-run` to preview). **After adding or changing a file in public/, run it again** (or the site shows the old / a missing file).
- The code still writes local paths; `siteMedia("/nas-images/web/x.webp")` (lib/supabase/config.ts) turns them into Supabase URLs when Supabase is configured, and `mediaUrl()` does the same for "/…" paths stored in the database. Without Supabase, `public/` is the fallback, so keep the files there.
- Not uploaded (stay in public/): `nas-images/nas-wordmark-letters.svg` (the footer's CSS mask; the bucket takes no SVG) and three Shutterstock originals over the 5 MB `media` limit (unused; the site uses their WebP copies).

## Copy and language

- **Two languages (Nov 2026): Albanian (default) and English**, switched by the SQ | EN toggle next to the header CTA (`components/i18n/LangToggle.tsx`). **Headings stay English in both languages** (client, Nov 2026: hero h1s, section headlines, card headings, SPECS group titles, feature captions, the MODELS shutter, 404); only the small text switches (nav, buttons, body copy, kickers, labels, filters, spec rows). Write visible copy as `<T sq="…" en="…" />` (components/i18n/T.tsx): both are in the HTML and CSS shows the one matching `<html data-lang>` (app/globals.css, "Language switch"), so it works in server components with no flash; a head script (`LANG_SCRIPT`, components/i18n/script.ts) applies the saved choice (localStorage `nas-lang`) before paint. Attributes (aria-label, placeholder, alt, <option>) use `useT()` / `useLang()` from components/i18n/lang.ts. Data copy is `{ sq, en }` (`Copy` in lib/i18n.ts; `Label` = string | Copy in components/i18n/label.tsx). Translated: header, footer, homepage, /modelet, model pages, Sport Line, The Brand, bike finder, 404. Not translated (not linked from the site): /aksesoret, /brendet, /nas-world; page metadata and the brochure PDF are unchanged. The Albanian body copy on the homepage / Brand / Sport Line is a translation of the design's English, and the catalog's English is a translation of its Albanian: have the client check both.
- **Financing was removed (Nov 2026):** /financim (redirects to /modelet), the calculator, monthly prices and the finance form are gone; `lib/finance.ts` and the finance schema stay only for old leads in Admin → Kërkesat.

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
- **Milestone 1 · pages done:** every sitemap page exists: `/modelet` (+ `[slug]`), `/aksesoret` (+ `[slug]`), `/kerko-oferte` (removed Nov 2026: redirects to `/kontakti`, and every "Kërko ofertë" link points there), `/gjej-motorin`, `/financim`, `/servisi` (`#servis`, `#test-ride`), `/nas-world` (+ `[slug]`), `/brendet/[slug]`, `/rreth-nesh`, `/kontakti`. None of the inner pages has a design yet: they reuse the homepage/catalog components and keep placeholders (`[ORARI]`, `[BANKA PARTNERE]`, `[HISTORIA E BRENDIT]`, `[HISTORIA E NAS]`, privacy-policy link). Show them to the client for a design pass.
- **Routing:** public pages live in `app/(site)/` (its layout adds Header/Footer via `SiteShell`); the admin panel lives in `app/admin/` with its own chrome. The root `not-found.tsx` wraps itself in `SiteShell`.
- **Milestone 2 · done (email pending):** all six forms are on pages (`components/forms/`: `FormParts`, `LeadForms`, `FormBlock`) and use the server actions in `lib/forms/` (validation, spam trap, rate limit, optional Turnstile). Leads are saved to `leads` / `newsletter_subscribers` and show in Admin → Kërkesat; tested end to end. Email sending needs the SMTP settings in `.env.local` / Vercel.
- **Milestone 3 · done:** schema in `supabase/migrations`, setup in `supabase/README.md`, seed from `data/*.ts` (`npm run db:seed-sql`). Public pages read the catalog, brands, hero video and World tiles through the cached getters in `lib/data/catalog.ts` (server components fetch, client components get the data as props). Admin saves refresh them via `updateTag`. `proxy.ts` gets published accessory slugs from Supabase (kept in memory, reloaded on an unknown slug) for real 404s. Without Supabase settings everything falls back to `data/*.ts`.
- **Milestone 4 · built; database live (migration + seed applied, admin account created):** `/admin` (login `/admin/hyr`, **password only**: one shared Supabase user whose email is in `ADMIN_EMAIL`, no 2FA, decided with the client). Dashboard, Leads (Kërkesat), Models, Banner (video + cut points), History (audit log). Accessories, Brands, Posts and Subscribers were removed from the admin (Nov 2026; the tables stay). Admin → Modelet lists only the public line (`inPublicCatalog`: NAS, no ATVs); the other brands stay in the database, hidden. Code: `lib/admin/` (auth, actions, queries, schemas) and `components/admin/`. Admin UI = site tokens, plain functional style. Models have card fields only (detail-page fields wait for that page's design).
- **Footer (Nov 2026, design `Nas footer.png`):** black; chrome lion (`ChromeLion`) left, columns Modelet (Motorë, Skuterë, Të rejat) / Sport line (The idea, The Red S, Specifics → `/sport-line#ideja|#s-e-kuqe|#specifikat`) / Brendi (The Lion, The vision, Trust → `/rreth-nesh#luani|#vizioni|#vlerat`) / Kontakti (Adresa and Email stay unlinked text until `BUSINESS.mapsUrl` / `email` are set; phone → tel:); big light-grey wordmark with "MOTORCYCLE / BORN IN ENGLAND", socials bottom right; no © row. `public/nas-images/nas-wordmark-letters.svg` (the old chrome-wordmark mask) is unused now. The newsletter sign-up was removed earlier. The "Çmim demo" labels are gone from the cards and the model page (prices are still DEMO: `PRICES_ARE_DEMO` keeps them out of structured data).
- **/kontakti removed (Nov 2026):** the contact page (and its key hero) is gone; `/kontakti` and `/kerko-oferte` redirect to `/modelet`. The header CTA is "Shiko modelet" → `/modelet`, CONTACT left the nav and the footer. Former contact links: dealer CTA → `/modelet`, Sport Line "Find a dealer" → Google Maps, catalog and bike-finder prompts → phone. `ContactForm` / `submitContact` are kept unused (old leads).
- **/modelet hero (Nov 2026):** `components/catalog/ModelsShutterHero.tsx` wraps the lineup (filters + grid) and replaces `CatalogHero` there (/aksesoret keeps it): a roller shutter with MODELET sprayed across its slats (fixed overlay) that rolls up by itself when the page opens (`duration` 1s; it waits for the browser to be idle after the page renders, then a 0.15s `delay`, so it never starts during hydration and stutters; no shake, no blend modes on the slats; not scroll-driven since Nov 2026): bottom first, slats ride into each other and squash into the drum under the header, uncovering the lineup in its normal place; the page scrolls normally throughout. At half open it flips `LineupReveal` (components/catalog/LineupReveal.tsx, a context read by `CatalogLayout` / `CatalogGrid`): filter blocks slide in from the left, the sort row and the cards rise in, staggered; without the shutter (null, /aksesoret) the catalog animates as before. The door resets to shut before paint on every visit, so it replays each time (also when Next shows a kept-alive copy of the page, e.g. from the homepage "See all models"). No showroom. Framer Motion `animate`, not GSAP. 16 / 10 slats, header clear while the door is down (`data-nav-clear`); reduced motion: no door. On both catalog pages the filter column starts 72px down on desktop so the search box lines up with the first row of cards; the layout's top padding is 44px.
- **Model detail page (Nov 2026, design `Frame 27764`):** `/modelet/[slug]` = `ProductDetail` (stage with the giant outlined brand+name, view tabs ANASH / PËRPARA / PRAPA / DETAJ / KOKPITI, E RE, colour swatches that switch the side photo, strip MOTORI / FUQIA / PATENTA / PESHA + red price) → `ModelIntro` (italic tagline + full-width media block) → `SpecsSection` → `ModelFeatures` (`components/catalog/ModelFeatures.tsx`: full-screen sticky panels stacked like the homepage `VisionPanels`, the next slides up over the one before, which shrinks and darkens; the ~4:1 strip photo shows whole from 768px over a blurred copy of itself, fills the panel on phones; reduced motion: no pinning) → You may also like (`ModelRelated` in ModelStory.tsx, as in the design: wide short black cards 390:280 with the top-left and bottom-right corners cut, photo on top, brand / name left, price right; TEMP photos `DEFAULT_RELATED_IMAGES` = the design's three Unsplash bikes, `public/detail-images/web/related-*.webp`; accessory pages keep their own related cards). The test-ride form was removed from the site (Nov 2026; "REZERVO TEST RIDE" in the bike finder goes to `/kontakti`; the schema stays for old leads). Until a model has its own features, every model shows the TEMP media block `DEFAULT_MEDIA` (`showcase.webp`, from `image 44.png`) and the four TEMP strips `DEFAULT_FEATURES` (`public/detail-images/web/`, WebP copies of the client's screenshots in `public/detail-images/`; they show a Zontes, not a NAS). Per-model tagline, view photos, media and features live in `data/model-details.ts` (not in Supabase yet); missing ones show [PLACEHOLDERS]. kW and kg read `powerKw` / `weightKg` from `MODEL_SPECS` in `data/models.ts` ("--" until filled). The ModelShowcase hero below is no longer used (kept).
- **Model page hero (Nov 2026, needs client sign-off):** `components/catalog/ModelShowcase.tsx` replaces the stage + specs strip on `/modelet/[slug]` (passed to `ProductDetail` as `hero`; accessories are unchanged). Cut-out bike on a lit stage, looping/parallax background word, callouts pinned to the bike, colour swatches, Studio/Showroom/360° views, monthly price in red with count-up, price + REZERVO TEST RIDE, intro curtain (1.5s, click to skip), staged entrance with headlight flash, light scan that switches the callouts on, then callouts take turns (hover picks one). Media lives in `data/model-showcase.ts` (not in Supabase yet; move to Admin → Modelet once approved). Only MAX-X 125 has one, and its cut-out is TEMP (made from the showroom photo; a second scooter is still behind it). Needed from the client: studio cut-outs, photos per colour + real colour names, 24–36 frame 360° sets, confirmed callout wording.
- **Homepage Find your vehicle + Lineup (Nov 2026, needs client sign-off):** `components/home/VehicleCards.tsx` (cut-out bikes that grow as a card opens, giant outlined word, other cards go grey, live model count / lowest price / licence range from the catalog, "SË SHPEJTI" when a category has no models, swipe row on phones). Gear up keeps `CategoryCards`. `Lineup.tsx` + `LineupCard.tsx`: featured 2×2 card (newest model), 3D tilt + light sweep + spec strip on hover, monthly price first, "Shiko të gjitha" tile closes the grid. Cut-outs are TEMP (made from the photos; the sport one has a faint background smudge behind the seat). The "sport" and "dirt" category photos show scooters: confirm with the client.
- **Find your vehicle → pinned scroll story (Nov 2026, replaces the VehicleCards row on the homepage):** `components/home/VehicleScroll.tsx`. Order 01 sport, 02 scooter, 03 dirt (`ORDER` in `FindYourVehicle.tsx`). Scrolling moves the bike right → left in the frame, then the next category takes over. Layout (Nov 2026, design "section i ri"): black side panel with the big grey number and the category name + red marks, a divider line that fills red with scroll, full-bleed media on the right. Each category takes `video` + `poster` in `data/home.ts`: scroll scrubs `video.currentTime`, so encode the Higgsfield clips all-keyframe (`ffmpeg -i in.mp4 -an -c:v libx264 -g 1 -crf 22 -preset veryfast -movflags +faststart out.mp4`) into `public/videos/`. Until then the cut-outs slide. `VehicleCards.tsx` is now unused (kept for its `CategoryStats` type).
