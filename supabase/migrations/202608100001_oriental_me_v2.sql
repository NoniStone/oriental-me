-- Oriental Me V2: versioned personalization foundation.
-- Apply after the original project schema. All user data is private by RLS.

create table if not exists public.profile_intakes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birth_date date, birth_time time, birth_place text,
  interests jsonb not null default '[]'::jsonb,
  wake_time time, sleep_time time, work_rhythm text,
  consent_given_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.ai_memory_items (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('profile','pattern','preference','reflection','completion')),
  content text not null, source text not null, confidence numeric not null default 0.7,
  expires_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists ai_memory_items_user_updated_idx on public.ai_memory_items(user_id, updated_at desc);

create table if not exists public.daily_recommendations (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  date date not null, headline text not null, observation text not null, recommendation text not null,
  gentle_humour text, tasks jsonb not null default '[]'::jsonb, context_version text, created_at timestamptz not null default now(),
  unique(user_id, date)
);
create table if not exists public.journey_task_completions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null, date date not null, completed boolean not null default false, completed_at timestamptz,
  unique(user_id, task_id, date)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(), owner_id uuid references auth.users(id) on delete set null,
  bucket text not null, path text not null, media_type text not null check (media_type in ('image','video','template')),
  alt_text text, created_at timestamptz not null default now()
);
create table if not exists public.challenge_submissions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id text not null references public.challenges(id) on delete cascade, media_asset_id uuid references public.media_assets(id) on delete set null,
  caption text, status text not null default 'pending' check (status in ('pending','approved','rejected','featured')),
  submitted_at timestamptz not null default now(), reviewed_at timestamptz, reviewed_by uuid references auth.users(id)
);
create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.challenge_submissions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, body text not null check (char_length(body) between 1 and 500), created_at timestamptz not null default now()
);

alter table public.profile_intakes enable row level security;
alter table public.ai_memory_items enable row level security;
alter table public.daily_recommendations enable row level security;
alter table public.journey_task_completions enable row level security;
alter table public.challenge_submissions enable row level security;
alter table public.community_comments enable row level security;

create policy "intake private" on public.profile_intakes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "memory private" on public.ai_memory_items for select using (auth.uid() = user_id);
create policy "recommendations private" on public.daily_recommendations for select using (auth.uid() = user_id);
create policy "task completion private" on public.journey_task_completions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "submit own challenge video" on public.challenge_submissions for insert with check (auth.uid() = user_id);
create policy "view approved submissions" on public.challenge_submissions for select using (auth.uid() = user_id or status in ('approved','featured'));
create policy "view comments on visible submissions" on public.community_comments for select using (exists (select 1 from public.challenge_submissions s where s.id = submission_id and (s.status in ('approved','featured') or s.user_id = auth.uid())));
create policy "comment as self" on public.community_comments for insert with check (auth.uid() = user_id);
