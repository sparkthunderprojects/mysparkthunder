# Moving Elixir Points to its own Supabase project

Elixir currently lives in the My Sparkthunder Supabase project, in an isolated `elixir`
schema. Everything is built so it can move without a rebuild. Nothing here needs doing
until you decide to move.

## What already makes it portable

- **All data is in one schema** (`elixir`), reached only through `public.elixir_*` functions.
  Nothing else in My Sparkthunder reads or writes it.
- **One database file creates everything**: `supabase/migrations/20261117120000_elixir_points_foundation.sql`
  (a copy of what was run). It only depends on `auth.users`
  and `auth.uid()`, which exist in every Supabase project.
- **The brand API (`elixir-api` Edge Function)** reads its own project URL and service key from
  the environment. Deploy it in the new project and it works there.
- **Brand servers only know an API URL and a key**, never the database. Moving means
  giving them the new URL and keys.
- **The website picks its project in one place**, `lib/elixir-client.ts`, driven by two
  environment variables (below).

## The move, when you want it

1. Create the new Supabase project.
2. Run the foundation SQL file in its SQL Editor.
3. Copy the data across (run from a computer with Postgres tools, using each project's
   database connection string):
   `pg_dump "<old connection string>" --data-only --schema=elixir --exclude-table=elixir.staff > elixir-data.sql`
   then run `elixir-data.sql` in the new project.
   Before importing, set `user_id` to null on every row of `elixir.members`
   (people get new user ids in a new project). Members re-link to their points the first
   time they sign in with the same verified email.
4. Re-add staff in the new project: `select elixir.add_staff('you@example.com','admin');`
5. Deploy the `elixir-api` Edge Function in the new project (JWT verification off).
6. Create new brand keys there (Brands & Keys) and give each brand its new API URL and key.
   Old keys do not move; they are stored only as hashes.
7. On the website host, set `NEXT_PUBLIC_ELIXIR_SUPABASE_URL` and
   `NEXT_PUBLIC_ELIXIR_SUPABASE_ANON_KEY` to the new project's values, and redeploy.
8. Add a sign-in screen for the new project's accounts. This is the one piece not built yet
   (small), because today Elixir reuses the My Sparkthunder login.

## Two things to know

- Fans would have a separate Elixir account after the move (their My Sparkthunder login would
  no longer be the same login). Plan the sign-in approach before moving.
- Points are never lost: the ledger and balances travel with the data dump.
