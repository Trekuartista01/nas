# NAS — website

Next.js (App Router) + TypeScript + Tailwind v4 + Framer Motion. See `CLAUDE.md` for the conventions and `design/homepage-v2.dc.html` for the approved homepage design.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build check
npm run lint
```

## Where things are

- `app/` — routes (route files only render a page component), `globals.css` (design tokens), `fonts/` (self-hosted Publica Sans)
- `components/pages/` — page compositions (`HomePage.tsx`)
- `components/home/` — homepage sections, in design order
- `components/ui/` — shared building blocks (SectionHeading, SlashButton, CategoryCards, ModelCard, Reveal, Marquee, FilterTabs)
- `components/finder/` — BikeFinder (`/gjej-motorin`)
- `components/i18n/` — the SQ | EN switch and `<T sq en>` for copy in both languages
- `components/layout/` — Header, Footer, ScrollToTop, MotionProvider
- `data/` — local catalog + homepage content (becomes Supabase tables in Milestone 3)
- `lib/` — formatting, bike-finder scoring, forms, admin, Supabase data getters
- `public/videos/` — hero video + poster

## Deploy (Vercel)

1. **Import the repo** in Vercel (Add New → Project → the GitHub repo). Next.js is detected automatically: keep the default build command (`next build`) and output. Node 24 is pinned in `package.json` (`engines`).
2. **Environment variables** (Project → Settings → Environment Variables). Same names as `.env.example`; copy the values from `.env.local`:

   | Name | Production | Preview | Notes |
   |---|---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | yes | yes | public |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | yes | public (Row Level Security limits it) |
   | `SUPABASE_SECRET_KEY` | yes | yes | **secret**: mark it Sensitive |
   | `ADMIN_EMAIL` | yes | yes | the one admin account |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO` | yes | optional | email for form submissions; `SMTP_PASS` is secret |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | optional | optional | set both or neither; the Turnstile widget must allow the Vercel / custom domain |
   | `SITE_URL` | once the domain is live | leave empty | e.g. `https://www.example.com`; empty = the Vercel production domain |

   `SUPABASE_DB_URL` is for local SQL scripts only: do **not** add it to Vercel.
   `NEXT_PUBLIC_*` values are built into the browser code: redeploy after changing them.
3. **Domain**: add it under Project → Settings → Domains, then set `SITE_URL` to it and redeploy (sitemap, robots and share previews use it).
4. **After the first deploy**, check `/`, `/modelet`, a model page and its brochure (`/modelet/<slug>/broshura.pdf`), `/admin/hyr` (log in), `/sitemap.xml` and `/robots.txt`. Turn on Vercel Firewall rate limiting for form posts (see `lib/forms/rate-limit.ts`).

Preview deployments (branch URLs on `*.vercel.app`) are kept out of search results by Vercel (`X-Robots-Tag: noindex`).
