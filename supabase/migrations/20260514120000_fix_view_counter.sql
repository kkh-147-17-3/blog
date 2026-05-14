-- Fix view counter: increment_post_view ran as the calling role (anon),
-- but anon has no insert/update privilege on post_views and there is no
-- RLS write policy, so the INSERT/UPDATE inside the function silently failed.
-- Re-create it as SECURITY DEFINER so it bypasses caller privileges + RLS,
-- pinned to a fixed search_path for safety.

create or replace function public.increment_post_view(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
begin
  select id into pid from public.posts where slug = p_slug;
  if pid is null then return; end if;
  insert into public.post_views (post_id, view_count) values (pid, 1)
    on conflict (post_id) do update
      set view_count = post_views.view_count + 1, updated_at = now();
end;
$$;

grant execute on function public.increment_post_view(text) to anon, authenticated;
