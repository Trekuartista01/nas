-- Moto Shpati: initial schema (Phase 4).
-- Run once on a new Supabase project: Dashboard → SQL Editor → paste → Run
-- (or `npx supabase db push` with the Supabase CLI). See supabase/README.md.
--
-- Security model
--   * Row Level Security is ON for every table. Nothing is readable without a policy.
--   * Visitors (anon key) can only READ published catalog rows. They cannot write anything:
--     form leads and newsletter sign-ups are inserted by the website's server with the secret key.
--   * Admins = signed-in users listed in public.admins (email + password; 2FA not required,
--     decided with the client). Checked by is_admin().
--     There is no sign-up: admins are created in the dashboard and added to public.admins by hand.
--   * Every change to content or leads is written to audit_log by a trigger (cannot be skipped).

-- ─────────────────────────────────────────────────────────────── helpers

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- No policies: only the database owner / secret key can read or change who is an admin.

-- True only for a signed-in user listed in public.admins.
-- (To require 2FA later: add `coalesce(auth.jwt() ->> 'aal', '') = 'aal2' and` before exists.)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────── catalog

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 60),
  logo_path text check (logo_path is null or char_length(logo_path) <= 300),
  sort integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.models (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  brand text not null check (char_length(brand) between 1 and 60),
  name text not null check (char_length(name) between 1 and 80),
  type text not null check (type in ('sport', 'dirt', 'scooter', 'atv')),
  cc integer not null check (cc between 1 and 3000),
  licence text not null check (licence in ('AM', 'A1', 'A2', 'A')),
  price integer not null check (price between 0 and 1000000), -- whole euros
  is_new boolean not null default false,
  image_path text check (image_path is null or char_length(image_path) <= 300),
  sort integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accessories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  brand text not null check (char_length(brand) between 1 and 60),
  name text not null check (char_length(name) between 1 and 80),
  category text not null check (category in ('kaska', 'veshje', 'doreza-cizme', 'pjese')),
  price integer not null check (price between 0 and 1000000),
  is_new boolean not null default false,
  image_path text check (image_path is null or char_length(image_path) <= 300),
  cutout boolean not null default false,
  meta text not null default '' check (char_length(meta) <= 80),
  tags text[] not null default '{}' check (cardinality(tags) <= 30),
  -- [{ "value": "--", "unit": "g", "label": "PESHA" }, …]
  specs jsonb not null default '[]' check (jsonb_typeof(specs) = 'array' and jsonb_array_length(specs) <= 12),
  -- [{ "name": "E zezë mat", "hex": "#0a0a0a" }, …]
  colours jsonb not null default '[]' check (jsonb_typeof(colours) = 'array' and jsonb_array_length(colours) <= 12),
  sort integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Moto Shpati World: events, news, new models, tips.
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  kind text not null check (kind in ('event', 'lajme', 'model', 'keshilla')),
  tag text not null default '' check (char_length(tag) <= 40), -- label on the tile, e.g. "EVENT · 12 MAJ"
  title text not null check (char_length(title) between 1 and 140),
  excerpt text not null default '' check (char_length(excerpt) <= 300),
  body text not null default '' check (char_length(body) <= 20000),
  image_path text check (image_path is null or char_length(image_path) <= 300),
  event_date date,
  featured boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Homepage hero: one video (single row, id = 1) and its shots.
create table public.hero_video (
  id smallint primary key default 1 check (id = 1),
  video_path text not null check (char_length(video_path) <= 300),
  poster_path text not null check (char_length(poster_path) <= 300),
  duration numeric(6, 3) not null check (duration > 0 and duration <= 600),
  updated_at timestamptz not null default now()
);

create table public.banner_slides (
  id uuid primary key default gen_random_uuid(),
  start_seconds numeric(6, 3) not null check (start_seconds >= 0 and start_seconds <= 600),
  label text not null check (char_length(label) between 1 and 60),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────── leads

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('offer', 'testRide', 'service', 'finance', 'contact')),
  name text check (char_length(name) <= 80),
  email text check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 20),
  model_slug text check (char_length(model_slug) <= 80),
  data jsonb not null default '{}' check (jsonb_typeof(data) = 'object' and pg_column_size(data) <= 16384),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  note text not null default '' check (char_length(note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) <= 254),
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);
create unique index newsletter_subscribers_email_key on public.newsletter_subscribers (lower(email));

-- ─────────────────────────────────────────────────────────────── audit log

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid,                 -- auth user who made the change (null = server / SQL editor)
  action text not null,       -- INSERT / UPDATE / DELETE
  entity text not null,       -- table name
  entity_id text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_log_created_at_idx on public.audit_log (created_at desc);

-- Writes one row per change. Leads/newsletter rows inserted by the website are not logged
-- (that would copy personal data into the log); only admin changes to them are.
create or replace function public.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_id text;
  changed jsonb := '{}';
begin
  if (tg_op = 'INSERT' and tg_table_name in ('leads', 'newsletter_subscribers') and auth.uid() is null) then
    return new;
  end if;

  row_id := coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id');

  if tg_op = 'UPDATE' then
    -- Names of the columns that changed (values are not copied: leads hold personal data).
    select coalesce(jsonb_agg(n.key), '[]') into changed
    from jsonb_each(to_jsonb(new)) n
    join jsonb_each(to_jsonb(old)) o using (key)
    where n.value is distinct from o.value and n.key <> 'updated_at';
    changed := jsonb_build_object('changed', changed);
  end if;

  if tg_table_name not in ('leads', 'newsletter_subscribers') then
    changed := changed || jsonb_build_object(
      'label', coalesce(to_jsonb(new) ->> 'name', to_jsonb(new) ->> 'title', to_jsonb(new) ->> 'label',
                        to_jsonb(old) ->> 'name', to_jsonb(old) ->> 'title', to_jsonb(old) ->> 'label')
    );
  end if;

  insert into public.audit_log (actor, action, entity, entity_id, details)
  values (auth.uid(), tg_op, tg_table_name, row_id, changed);
  return coalesce(new, old);
end;
$$;

-- updated_at + audit triggers on every content table
do $$
declare
  t text;
begin
  foreach t in array array['brands', 'models', 'accessories', 'posts', 'hero_video', 'banner_slides', 'leads', 'newsletter_subscribers'] loop
    if t <> 'newsletter_subscribers' then
      execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', t || '_updated_at', t);
    end if;
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.audit_row()', t || '_audit', t);
  end loop;
end;
$$;

-- ─────────────────────────────────────────────────────────────── row level security

alter table public.brands enable row level security;
alter table public.models enable row level security;
alter table public.accessories enable row level security;
alter table public.posts enable row level security;
alter table public.hero_video enable row level security;
alter table public.banner_slides enable row level security;
alter table public.leads enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.audit_log enable row level security;

-- Visitors: published catalog rows only.
create policy "public reads published brands" on public.brands for select to anon, authenticated using (published);
create policy "public reads published models" on public.models for select to anon, authenticated using (published);
create policy "public reads published accessories" on public.accessories for select to anon, authenticated using (published);
create policy "public reads published posts" on public.posts for select to anon, authenticated using (published);
create policy "public reads hero video" on public.hero_video for select to anon, authenticated using (true);
create policy "public reads banner slides" on public.banner_slides for select to anon, authenticated using (true);

-- Admins: everything on content.
create policy "admin manages brands" on public.brands for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manages models" on public.models for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manages accessories" on public.accessories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manages posts" on public.posts for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manages hero video" on public.hero_video for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manages banner slides" on public.banner_slides for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Leads and newsletter: no visitor access at all (the website inserts them with the secret key).
-- Admins read, update status/notes and delete; they never insert.
create policy "admin reads leads" on public.leads for select to authenticated using (public.is_admin());
create policy "admin updates leads" on public.leads for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes leads" on public.leads for delete to authenticated using (public.is_admin());
create policy "admin reads subscribers" on public.newsletter_subscribers for select to authenticated using (public.is_admin());
create policy "admin updates subscribers" on public.newsletter_subscribers for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes subscribers" on public.newsletter_subscribers for delete to authenticated using (public.is_admin());

-- Audit log: read-only for admins; written only by the trigger above.
create policy "admin reads audit log" on public.audit_log for select to authenticated using (public.is_admin());

-- Column-level: an admin may change a lead's status and note, not what the customer sent.
revoke update on public.leads from authenticated;
grant update (status, note) on public.leads to authenticated;
revoke update on public.newsletter_subscribers from authenticated;
grant update (unsubscribed_at) on public.newsletter_subscribers to authenticated;

-- ─────────────────────────────────────────────────────────────── rate limit (forms)

-- Sliding-window counter shared by all server instances. Only the server (secret key) can call it.
create table public.rate_limit_hits (
  key text not null check (char_length(key) <= 200),
  hit_at timestamptz not null default clock_timestamp()
);
create index rate_limit_hits_key_idx on public.rate_limit_hits (key, hit_at);
alter table public.rate_limit_hits enable row level security; -- no policies: secret key only

-- Records one hit and returns every hit still inside the window, oldest first (epoch ms).
create or replace function public.rate_limit_hit(p_key text, p_window_ms integer)
returns setof bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  since timestamptz := clock_timestamp() - make_interval(secs => p_window_ms / 1000.0);
begin
  delete from public.rate_limit_hits where key = p_key and hit_at < since;
  -- Occasionally clear out old keys from other visitors.
  if random() < 0.01 then
    delete from public.rate_limit_hits where hit_at < clock_timestamp() - interval '1 day';
  end if;
  insert into public.rate_limit_hits (key) values (p_key);
  return query
    select (extract(epoch from hit_at) * 1000)::bigint
    from public.rate_limit_hits
    where key = p_key
    order by hit_at;
end;
$$;
revoke all on function public.rate_limit_hit(text, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer) to service_role;

-- ─────────────────────────────────────────────────────────────── storage

-- media: photos (public read). videos: hero video (public read). Uploads by admins only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('videos', 'videos', true, 52428800, array['video/mp4', 'video/webm'])
on conflict (id) do nothing;

create policy "admin uploads media" on storage.objects for insert to authenticated
  with check (bucket_id in ('media', 'videos') and public.is_admin());
create policy "admin updates media" on storage.objects for update to authenticated
  using (bucket_id in ('media', 'videos') and public.is_admin())
  with check (bucket_id in ('media', 'videos') and public.is_admin());
create policy "admin deletes media" on storage.objects for delete to authenticated
  using (bucket_id in ('media', 'videos') and public.is_admin());
-- Public buckets serve files by URL without a select policy; listing stays admin-only:
create policy "admin lists media" on storage.objects for select to authenticated
  using (bucket_id in ('media', 'videos') and public.is_admin());
