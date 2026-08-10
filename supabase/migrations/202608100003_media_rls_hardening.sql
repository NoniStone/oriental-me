-- Media records and private originals must never be broadly readable.
alter table public.media_assets enable row level security;

create policy "view approved submission assets" on public.media_assets for select using (
  exists (
    select 1 from public.challenge_submissions s
    where s.media_asset_id = media_assets.id and s.status in ('approved', 'featured')
  )
);

create policy "view approved challenge videos" on storage.objects for select to authenticated using (
  bucket_id = 'challenge-submissions' and exists (
    select 1 from public.media_assets a
    join public.challenge_submissions s on s.media_asset_id = a.id
    where a.bucket = storage.objects.bucket_id and a.path = storage.objects.name
      and s.status in ('approved', 'featured')
  )
);
