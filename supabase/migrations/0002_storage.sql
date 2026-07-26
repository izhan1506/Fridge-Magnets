-- Storage bucket policies for magnet photos
-- Assumes the 'magnet-photos' bucket exists and is public

-- Anyone can GET files (public read)
create policy "magnet_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'magnet-photos');

-- Owner can upload to their own folder
create policy "magnet_photos_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'magnet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can delete from their own folder
create policy "magnet_photos_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'magnet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can update files in their own folder
create policy "magnet_photos_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'magnet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
