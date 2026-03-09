-- Math Obby 3D baseline schema (Supabase Postgres)

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists private_rooms (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null,
  host_id uuid not null references profiles(id) on delete cascade,
  mode text not null check (mode in ('coop','race')),
  created_at timestamptz default now()
);

create table if not exists room_members (
  room_id uuid not null references private_rooms(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);

create table if not exists run_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  room_id uuid references private_rooms(id) on delete set null,
  mode text not null check (mode in ('single','coop','race')),
  progress_checkpoint int not null default 0,
  completed boolean not null default false,
  elapsed_ms int,
  created_at timestamptz default now()
);

create table if not exists subscription_state (
  user_id uuid primary key references profiles(id) on delete cascade,
  status text not null check (status in ('active','past_due','canceled','trial')),
  current_period_end timestamptz,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table private_rooms enable row level security;
alter table room_members enable row level security;
alter table run_attempts enable row level security;
alter table subscription_state enable row level security;

-- Minimal policies
create policy "profiles own row" on profiles for all using (auth.uid() = id);
create policy "run_attempts own row" on run_attempts for all using (auth.uid() = user_id);
create policy "subscription_state own row" on subscription_state for select using (auth.uid() = user_id);
