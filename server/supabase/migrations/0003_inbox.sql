-- Inbox Brief: Gmail connection + AI email summaries.
-- Run this in the Supabase SQL editor for projects that already ran schema.sql.
--
-- Privacy: only AI-generated summaries and email metadata are stored — never
-- full email bodies. The Gmail refresh token is AES-256-GCM encrypted with the
-- same server-only CREDENTIAL_ENCRYPTION_KEY used by the credential vault.

create table if not exists gmail_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  email text not null,

  encrypted_refresh_token text not null,
  iv text not null,
  auth_tag text not null,

  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger gmail_accounts_set_updated_at
  before update on gmail_accounts
  for each row execute function set_updated_at();

create table if not exists email_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,

  gmail_message_id text not null,
  thread_id text,
  from_name text,
  from_email text,
  subject text,
  received_at timestamptz,

  summary text not null,
  category text not null default 'other',
  importance text not null default 'low',
  action_required boolean not null default false,
  action text,
  due_date timestamptz,
  event_date timestamptz,
  key_details text[] not null default '{}',

  status text not null default 'open',
  pinned boolean not null default false,
  task_id uuid references tasks(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, gmail_message_id)
);

create index if not exists email_insights_user_status_due_idx on email_insights (user_id, status, due_date);
create index if not exists email_insights_user_received_idx on email_insights (user_id, received_at desc);

create trigger email_insights_set_updated_at
  before update on email_insights
  for each row execute function set_updated_at();
