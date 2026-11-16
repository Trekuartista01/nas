# Supabase setup (database, file storage, admin login)

Do this once per environment. Until it's done, the public site runs on the local catalog in `data/*.ts` and `/admin` shows a "not connected" screen.

## 1. Create the project

1. Create a project at supabase.com. Pick the **EU (Frankfurt)** region, the closest one to Kosovo.
2. **Authentication → Sign In / Providers → Email:** keep Email on, and turn **"Allow new users to sign up" OFF**. Admins are created by hand (step 4); nobody can register themselves.

## 2. Create the tables

**SQL Editor → New query:** paste `migrations/20261113000000_init.sql` and click **Run**.

This creates the tables, the Row Level Security rules, the audit log, the form rate-limit counter and the two storage buckets (`media` for photos, `videos` for the hero video).

## 3. Load the current catalog

Run `npm run db:seed-sql`, then paste the generated `supabase/seed.sql` into the SQL Editor and click **Run**.

It inserts the brands, models, accessories and hero video the site shows today, all published. It is safe to run again, because rows that already exist are skipped.

## 4. Create an admin

1. **Authentication → Users → Add user → Create new user:** enter an email and a strong password, and tick **Auto Confirm User**.
2. **SQL Editor:** give that user admin rights:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'staff@example.com';
   ```

To remove an admin, delete their row from `public.admins` (or delete the user). Their open session stops working immediately.
To reset a forgotten password: **Authentication → Users → … → Send password recovery**, or set a new one there.

## 5. Connect the website

**Project Settings → API Keys.** Copy these values into `.env.local` (local) and into Vercel → Project → Settings → Environment Variables (production):

| Variable | Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL, `https://<project>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_…`) |
| `SUPABASE_SECRET_KEY` | Secret key (`sb_secret_…`). **Server only.** Never give it a `NEXT_PUBLIC_` prefix and never commit it |

Restart `npm run dev` (or redeploy). Then open `/admin`: you get the login page.

The security headers (`security-headers.ts`) allow the project URL automatically once `NEXT_PUBLIC_SUPABASE_URL` is set, for logins, uploads, images and the hero video.

## What uses what

| Key | Used by | Can do |
|---|---|---|
| Publishable | public pages (cached reads), the admin's browser (uploads), admin pages | whatever Row Level Security allows the signed-in user: visitors read published rows only, admins manage content |
| Secret | `lib/supabase/service.ts` only | saves form leads and newsletter sign-ups, and the shared form rate limit. Never used for admin actions, so the audit log always records the actual admin |
