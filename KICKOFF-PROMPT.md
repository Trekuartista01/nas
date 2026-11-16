# Paste this as your first message in Claude Code

---

You're building the **Moto Shpati** website (a motorcycle / scooter / ATV dealer in Pejë, Kosovo) for Trekuartista.

Read `CLAUDE.md` first. It holds the stack, design tokens, component list and rules. Then read `design/homepage-v2.dc.html`, the approved homepage design. It's a design-canvas export: treat it as a spec, not code to copy.

## Discovery: already answered (only ask about the items marked TBD)

- **Business:** authorized dealer of NAS and QJMOTOR motorcycles, scooters and ATVs, plus helmets, apparel, accessories, service and parts. One showroom in Pejë.
- **Audience:** riders in Kosovo, from first-time scooter buyers (AM/A1 licence) to experienced riders and ATV buyers for work and adventure.
- **Brand:** black / grey / red with an amber highlight. Bold, fast, wide type. Everything is in `CLAUDE.md` and the design file.
- **Pages:** see the sitemap below.
- **Catalog:** yes. Models (about 10–30) and accessories (number TBD), each with a list page and a detail page.
- **Languages:** Albanian. English only in the big headlines. TBD: whether a full English version is needed later (if unsure, build it i18n-ready).
- **Client edits content:** yes, through a custom admin panel (Milestone 4).
- **Assets:** hero video + poster are in `public/videos/`. Logo, model photos and accessory photos are TBD; keep the placeholders.
- **Forms:** offer request, test-ride booking, service booking, finance application, contact and newsletter. They go by email (nodemailer) AND are stored as leads in the database.
- **Data layer:** Supabase (TBD: confirm). **Image storage:** Cloudinary (TBD: confirm).
- **Accounts:** admin only, for now. No public user accounts.
- **Deadline / domain:** TBD.

## Sitemap

| Route | Page component | Notes |
|---|---|---|
| `/` | `HomePage` | Exactly as the design |
| `/modelet` | `ModelsPage` | Lineup grid with filters: category, brand, licence, price |
| `/modelet/[slug]` | `SinglePageOfModel` | Gallery, specs, licence class, `FinanceCalculator` preselected, test-ride CTA, related models |
| `/aksesoret` | `AccessoriesPage` | Categories: helmets, apparel, gloves & boots, bike parts |
| `/aksesoret/[slug]` | `SinglePageOfAccessory` | |
| `/gjej-motorin` | `BikeFinderPage` | Full-page `BikeFinder` |
| `/financim` | `FinancePage` | `FinanceCalculator` + bank partner info + FAQ + application form |
| `/servisi` | `ServicePage` | Service + test-ride booking forms |
| `/moto-shpati-world` | `WorldPage` | Events + news list |
| `/moto-shpati-world/[slug]` | `SinglePageOfPost` | |
| `/brendet/[slug]` | `SinglePageOfBrand` | Brand story + that brand's models |
| `/rreth-nesh` | `AboutPage` | |
| `/kontakti` | `ContactPage` | `ContactForm` + `Map` + showroom hours |

## How to work

1. **Plan first.** Before writing code, show me the folder structure, the shared component list and the Milestone 1 checklist. Wait for my OK.
2. **Milestone 1: Frontend, in this order:**
   1. Scaffold (create-next-app with TypeScript, Tailwind, ESLint, App Router). If it refuses because the folder isn't empty, scaffold into `./_tmp` and move the files up, keeping `CLAUDE.md`, `design/` and `public/videos/`.
   2. Tokens + font + layout shell + Header / Footer / ScrollToTop.
   3. Shared components (`CLAUDE.md` → "Shared components").
   4. The homepage, section by section, matching the design. After each section, tell me what to check in the browser.
   5. Inner pages from the sitemap, built ONLY from the shared components. Where a page needs a layout decision the homepage doesn't answer, stop and ask.
   6. Motion pass, responsive pass, metadata on every page.
   Keep the catalog data in typed local files (`data/models.ts` and so on) during Milestone 1, shaped like the future database tables.
3. **Milestone 2: Backend:** form endpoints + nodemailer + validation + rate limiting.
4. **Milestone 3: Database:** Supabase tables for models, accessories, brands, posts, banner slides (video + cut points) and leads. Replace the local data files.
5. **Milestone 4: Admin:** ModelManager, AccessoryManager, BrandManager, PostManager, BannerManager and LeadManager (incoming offer, test-ride and finance requests), behind auth.

Don't move to the next milestone until I confirm the current one is done.
