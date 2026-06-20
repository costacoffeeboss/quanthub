-- Accounts + entitlement schema for the paywall.
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- One row per auth user. Subscription fields are written only by the webhook
-- (service role); clients can read their own row and nothing else.
create table if not exists public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text,
  stripe_customer_id  text unique,
  subscription_status text,          -- active | trialing | past_due | canceled | ...
  current_period_end  timestamptz,   -- end of the current paid subscription period
  access_expires_at   timestamptz,   -- grants access for one-off week/month passes
  created_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A signed-in user may read ONLY their own profile.
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

-- No insert/update/delete policies are defined, so the anon/auth client cannot
-- write to this table at all. The webhook uses the service-role key, which
-- bypasses RLS, to set subscription fields. This is the security backbone:
-- the browser can never grant itself Pro.

-- Auto-create a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users who already exist.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;
