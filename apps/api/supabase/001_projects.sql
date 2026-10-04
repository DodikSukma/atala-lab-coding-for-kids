-- Run in the Supabase SQL editor. Enable Anonymous Sign-ins under Authentication.
create table if not exists public.projects (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  lesson_id text not null check (lesson_id in ('1-1','1-2','1-3','1-4','1-p','2-1','2-2','2-3','2-4','2-p')),
  blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(blocks) = 'array'),
  scene jsonb not null default '{"backdrop":"space","sprite":"bot"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_owner_updated_idx on public.projects(owner_id,updated_at desc);
alter table public.projects enable row level security;
create policy "owner reads projects" on public.projects for select to authenticated using (owner_id = (select auth.uid()));
create policy "owner creates projects" on public.projects for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "owner updates projects" on public.projects for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "owner deletes projects" on public.projects for delete to authenticated using (owner_id = (select auth.uid()));

-- Safe for a database created with the earlier MVP schema.
alter table public.projects add column if not exists scene jsonb not null default '{"backdrop":"space","sprite":"bot"}'::jsonb;
