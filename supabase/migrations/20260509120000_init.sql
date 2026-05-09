-- kh.log — initial schema
-- Applied via `supabase db push` / `supabase db reset --linked`.

create extension if not exists "pgcrypto";

-- ───── enums ─────
do $$ begin
  if not exists (select 1 from pg_type where typname = 'post_category') then
    create type public.post_category as enum ('TECH', 'DIARY', 'MEMO');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'post_status') then
    create type public.post_status as enum ('DRAFT', 'PUBLISHED', 'PRIVATE');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'comment_status') then
    create type public.comment_status as enum ('VISIBLE', 'HIDDEN', 'DELETED');
  end if;
end $$;

-- ───── posts ─────
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  excerpt       text,
  content_html  text,
  content_md    text,
  category      public.post_category not null,
  status        public.post_status   not null default 'DRAFT',
  thumbnail_url text,
  read_minutes  integer not null default 1,
  likes         integer not null default 0,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists posts_category_status_idx on public.posts (category, status, published_at desc);
create index if not exists posts_slug_idx on public.posts (slug);

-- ───── tags / post_tags ─────
create table if not exists public.tags (
  id   uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id  uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ───── post_views (separate table to avoid write contention on posts) ─────
create table if not exists public.post_views (
  post_id    uuid primary key references public.posts(id) on delete cascade,
  view_count integer not null default 0,
  updated_at timestamptz not null default now()
);

-- ───── comments ─────
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  author_name text,
  content     text not null,
  status      public.comment_status not null default 'VISIBLE',
  created_at  timestamptz not null default now()
);

create index if not exists comments_post_idx on public.comments (post_id, created_at desc);

-- ───── helpers ─────
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists posts_touch_updated on public.posts;
create trigger posts_touch_updated before update on public.posts
  for each row execute function public.touch_updated_at();

create or replace function public.increment_post_view(p_slug text)
returns void as $$
declare
  pid uuid;
begin
  select id into pid from public.posts where slug = p_slug;
  if pid is null then return; end if;
  insert into public.post_views (post_id, view_count) values (pid, 1)
    on conflict (post_id) do update
      set view_count = post_views.view_count + 1, updated_at = now();
end;
$$ language plpgsql;

-- ───── RLS ─────
alter table public.posts        enable row level security;
alter table public.tags         enable row level security;
alter table public.post_tags    enable row level security;
alter table public.post_views   enable row level security;
alter table public.comments     enable row level security;

drop policy if exists "posts read published" on public.posts;
create policy "posts read published" on public.posts
  for select using (status = 'PUBLISHED');

drop policy if exists "tags read all" on public.tags;
create policy "tags read all" on public.tags for select using (true);

drop policy if exists "post_tags read all" on public.post_tags;
create policy "post_tags read all" on public.post_tags for select using (true);

drop policy if exists "post_views read all" on public.post_views;
create policy "post_views read all" on public.post_views for select using (true);

drop policy if exists "posts admin write" on public.posts;
create policy "posts admin write" on public.posts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "tags admin write" on public.tags;
create policy "tags admin write" on public.tags
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "post_tags admin write" on public.post_tags;
create policy "post_tags admin write" on public.post_tags
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "comments read visible" on public.comments;
create policy "comments read visible" on public.comments
  for select using (status = 'VISIBLE' or auth.role() = 'authenticated');

drop policy if exists "comments insert public" on public.comments;
create policy "comments insert public" on public.comments
  for insert with check (status = 'VISIBLE');

drop policy if exists "comments admin update" on public.comments;
create policy "comments admin update" on public.comments
  for update using (auth.role() = 'authenticated');

revoke insert, update, delete on public.post_views from anon, authenticated;
grant execute on function public.increment_post_view(text) to anon, authenticated;
