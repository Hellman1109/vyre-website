-- Vyre public highscores snapshot, synced by a trusted game-server process.
create table if not exists public.vyre_highscores (
  username text primary key,
  gamemode text not null default 'Normal',
  combat_level integer not null default 3,
  overall_level integer not null default 32,
  overall_exp bigint not null default 0,
  skill_xp jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists vyre_highscores_overall_idx
  on public.vyre_highscores (overall_exp desc);

alter table public.vyre_highscores enable row level security;

create policy "Public can read Vyre highscores"
  on public.vyre_highscores for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies for anonymous or authenticated users.
-- Sync with a trusted server-side service-role credential, never in client code.
