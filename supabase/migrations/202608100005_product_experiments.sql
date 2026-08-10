-- Minimal, privacy-preserving product signals for the MVP subscription test.
-- These events are behavioural counters, not wellness or journal content.
create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event text not null check (event in ('paywall_viewed', 'early_access_requested')),
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists product_events_user_event_idx on public.product_events(user_id, event, created_at desc);

alter table public.product_events enable row level security;
create policy "users record their own product events" on public.product_events
  for insert to authenticated with check (auth.uid() = user_id);
