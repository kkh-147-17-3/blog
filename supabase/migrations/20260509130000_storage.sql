-- kh.log — Storage bucket for post images.
-- Public read, authenticated write.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  5242880,                                    -- 5 MiB
  array['image/png','image/jpeg','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "post-images public read" on storage.objects;
create policy "post-images public read" on storage.objects
  for select using (bucket_id = 'post-images');

drop policy if exists "post-images auth upload" on storage.objects;
create policy "post-images auth upload" on storage.objects
  for insert with check (bucket_id = 'post-images' and auth.role() = 'authenticated');

drop policy if exists "post-images auth update" on storage.objects;
create policy "post-images auth update" on storage.objects
  for update using (bucket_id = 'post-images' and auth.role() = 'authenticated');

drop policy if exists "post-images auth delete" on storage.objects;
create policy "post-images auth delete" on storage.objects
  for delete using (bucket_id = 'post-images' and auth.role() = 'authenticated');
