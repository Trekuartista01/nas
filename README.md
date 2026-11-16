# Moto Shpati — website

Next.js (App Router) + TypeScript + Tailwind v4 + Framer Motion. See `CLAUDE.md` for the conventions and `design/homepage-v2.dc.html` for the approved homepage design.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build check
npm run lint
```

## Where things are

- `app/` — routes (route files only render a page component), `globals.css` (design tokens), `fonts/` (self-hosted Archivo variable incl. width axis)
- `components/pages/` — page compositions (`HomePage.tsx`)
- `components/home/` — homepage sections, in design order
- `components/ui/` — shared building blocks (SectionHeading, SlashButton, CategoryCards, ModelCard, Reveal, Marquee, FilterTabs)
- `components/finder/`, `components/finance/` — BikeFinder and FinanceCalculator (reused on inner pages)
- `components/layout/` — Header, Footer, ScrollToTop, MotionProvider
- `data/` — local catalog + homepage content (becomes Supabase tables in Milestone 3)
- `lib/` — formatting, finance maths, bike-finder scoring
- `public/videos/` — hero video + poster
