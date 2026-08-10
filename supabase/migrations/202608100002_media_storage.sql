-- Private original videos; approved media is served only through authenticated policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('challenge-submissions', 'challenge-submissions', false, 83886080, array['video/mp4','video/quicktime','video/webm']),
  ('editorial-assets', 'editorial-assets', false, 104857600, array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict (id) do nothing;

create policy "users upload own challenge videos" on storage.objects for insert to authenticated
with check (bucket_id = 'challenge-submissions' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users read own challenge videos" on storage.objects for select to authenticated
using (bucket_id = 'challenge-submissions' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "admins manage editorial assets" on storage.objects for all to authenticated
using (bucket_id = 'editorial-assets' and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
with check (bucket_id = 'editorial-assets' and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
create policy "owners create media records" on public.media_assets for insert with check (owner_id = auth.uid());
create policy "owners view media records" on public.media_assets for select using (owner_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
create policy "admins review submissions" on public.challenge_submissions for update using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
