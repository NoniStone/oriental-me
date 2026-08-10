-- Make MVP subscription signals suitable for analysis without collecting health content.
alter table public.product_events add column if not exists event_day date;
update public.product_events set event_day = created_at::date where event_day is null;
alter table public.product_events alter column event_day set default current_date;
alter table public.product_events alter column event_day set not null;

-- A person should have one recorded conversion intent per feature. Page views remain
-- available as a daily exposure signal, rather than an unbounded counter.
with ranked_interest as (
  select id, row_number() over (partition by user_id, event, properties ->> 'feature' order by created_at) as rank
  from public.product_events where event = 'early_access_requested'
)
delete from public.product_events events using ranked_interest ranked
where events.id = ranked.id and ranked.rank > 1;

create unique index if not exists product_events_unique_interest_idx
  on public.product_events (user_id, event, (properties ->> 'feature'))
  where event = 'early_access_requested';

with ranked_view as (
  select id, row_number() over (partition by user_id, event, event_day, properties ->> 'feature' order by created_at) as rank
  from public.product_events where event = 'paywall_viewed'
)
delete from public.product_events events using ranked_view ranked
where events.id = ranked.id and ranked.rank > 1;

create unique index if not exists product_events_unique_daily_view_idx
  on public.product_events (user_id, event, event_day, (properties ->> 'feature'))
  where event = 'paywall_viewed';
