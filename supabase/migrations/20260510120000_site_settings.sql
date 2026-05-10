-- kh.log — site_settings (key/value text storage for admin-editable copy)

create table if not exists public.site_settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_touch_updated on public.site_settings;
create trigger site_settings_touch_updated before update on public.site_settings
  for each row execute function public.touch_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "site_settings read all" on public.site_settings;
create policy "site_settings read all" on public.site_settings
  for select using (true);

drop policy if exists "site_settings admin write" on public.site_settings;
create policy "site_settings admin write" on public.site_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into public.site_settings (key, value) values
  ('about_intro', '어제 자취방 천장에서 작은 거미 한 마리를 발견했는데,
쫓아낼지 룸메로 받아들일지 아직 고민 중입니다.')
on conflict (key) do nothing;
