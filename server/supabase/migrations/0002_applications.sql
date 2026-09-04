-- Adds "log an application" support: login identifier + auto-fetched favicon on
-- opportunities, plus an encrypted credential vault (one row per opportunity).
-- Run this in the Supabase SQL editor for projects that already ran schema.sql.

alter table opportunities add column if not exists login_identifier text;
alter table opportunities add column if not exists logo_url text;

-- Passwords are never stored here in plain text — only AES-256-GCM ciphertext
-- plus the iv/auth tag needed to decrypt it, using a server-only key
-- (CREDENTIAL_ENCRYPTION_KEY) that never leaves the Express process.
create table if not exists credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  opportunity_id uuid not null unique references opportunities(id) on delete cascade,

  encrypted_secret text not null,
  iv text not null,
  auth_tag text not null,
  key_version int not null default 1,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger credentials_set_updated_at
  before update on credentials
  for each row execute function set_updated_at();
