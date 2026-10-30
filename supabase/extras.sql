-- Run once in the MySparkthunder Supabase project (SQL Editor > New query > Run).
-- Adds the two tables used by the sign-up and contact forms. Anyone can add a
-- row; nobody can read rows with the public key (you read them in the Supabase
-- dashboard).

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 5 and 254 and email like '%_@_%._%'),
  topic text not null default 'newsletter' check (char_length(topic) between 2 and 60),
  created_at timestamptz not null default now(),
  unique (email, topic)
);
alter table public.newsletter_subscribers enable row level security;
drop policy if exists "anyone can subscribe" on public.newsletter_subscribers;
create policy "anyone can subscribe" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text check (name is null or char_length(name) <= 120),
  email text not null check (char_length(email) between 5 and 254 and email like '%_@_%._%'),
  message text not null check (char_length(message) between 5 and 4000),
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
drop policy if exists "anyone can send a message" on public.contact_messages;
create policy "anyone can send a message" on public.contact_messages
  for insert to anon, authenticated with check (true);
