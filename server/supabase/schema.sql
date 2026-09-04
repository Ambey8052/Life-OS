-- LifeOS schema for Supabase (Postgres)
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
--
-- Auth model: LifeOS uses its own bcrypt + JWT cookie auth (not Supabase Auth), so
-- these tables are accessed exclusively from the server via the service_role key.
-- Row Level Security is left disabled here on purpose — the Express API is the only
-- client, it always scopes queries by user_id itself, and the service_role key
-- bypasses RLS anyway. Never expose the service_role key to the browser.

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── users ────────────────────────────────────────────────────────────────
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_set_updated_at
  before update on users
  for each row execute function set_updated_at();

-- ── opportunities ────────────────────────────────────────────────────────
create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,

  title text not null,
  organization text,
  category text not null default 'other',

  website text,
  application_url text,

  status text not null default 'saved',
  priority text not null default 'medium',

  deadline timestamptz,
  applied_at timestamptz,

  interview jsonb not null default '{"scheduled": false}'::jsonb,

  salary text,
  location text,

  skills text[] not null default '{}',
  notes text,

  follow_up_date timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists opportunities_user_deadline_idx on opportunities (user_id, deadline);
create index if not exists opportunities_user_status_idx on opportunities (user_id, status);

create trigger opportunities_set_updated_at
  before update on opportunities
  for each row execute function set_updated_at();

-- ── tasks ────────────────────────────────────────────────────────────────
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,

  title text not null,
  description text,

  due_date timestamptz,
  priority text not null default 'medium',
  status text not null default 'todo',

  linked_opportunity_id uuid references opportunities(id) on delete set null,
  tags text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_due_date_idx on tasks (user_id, due_date);
create index if not exists tasks_user_status_idx on tasks (user_id, status);

create trigger tasks_set_updated_at
  before update on tasks
  for each row execute function set_updated_at();

-- ── notes ────────────────────────────────────────────────────────────────
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,

  title text not null,
  content text,
  tags text[] not null default '{}',

  linked_opportunity_id uuid references opportunities(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_created_idx on notes (user_id, created_at desc);

create trigger notes_set_updated_at
  before update on notes
  for each row execute function set_updated_at();
