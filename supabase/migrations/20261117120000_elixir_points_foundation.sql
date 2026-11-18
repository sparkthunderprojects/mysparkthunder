/*
  # Elixir Points — Phase 1 foundation

  One central, brand-agnostic points service. Every brand (sparkthunder.shop,
  Miss Petty, Funky, future partners) is just a row in elixir.brands.

  ## Isolation model
  - All tables live in the `elixir` schema. That schema is NOT exposed to the
    Supabase API and has no grants for anon / authenticated / service_role.
  - Row Level Security is enabled on every table with no policies (defence in
    depth: even if the schema were ever exposed, nothing is readable).
  - The ONLY entry points are `public.elixir_*` SECURITY DEFINER functions:
      * brand servers  -> service_role only (earn, refund, check/consume code)
      * members        -> authenticated (own data only)
      * staff          -> authenticated + row in elixir.staff (agent / admin)
  - The ledger is append-only (triggers block UPDATE / DELETE / TRUNCATE).
    Balances are always the SUM of ledger rows; nothing stores a balance.
  - Earning is idempotent: unique (brand_id, kind, source_ref).

  ## Where it runs
  The shared My Sparkthunder (Sparkthunder ID) Supabase project, so one login works
  on every site. It depends only on auth.users, so it is safe in any Supabase project.

  ## After running
  Make yourself the first admin (run once in the SQL editor):
      select elixir.add_staff('you@example.com', 'admin');
*/

create schema if not exists elixir;
revoke all on schema elixir from public;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table elixir.config (
  id boolean primary key default true check (id),            -- singleton row
  earn_points_per_gbp   numeric(8,3) not null default 1   check (earn_points_per_gbp >= 0),
  redeem_points_per_gbp integer      not null default 200 check (redeem_points_per_gbp > 0), -- 200 points = £1
  tier_window_months    integer      not null default 12  check (tier_window_months between 1 and 60),
  code_valid_days       integer      not null default 30  check (code_valid_days between 1 and 365),
  agent_adjust_limit    integer      not null default 1000 check (agent_adjust_limit >= 0),
  updated_at timestamptz not null default now()
);
insert into elixir.config default values;

create table elixir.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (length(btrim(name)) > 0),
  brand_type text not null default 'owned' check (brand_type in ('owned', 'partner')),
  earn_points_per_gbp numeric(8,3) check (earn_points_per_gbp >= 0),   -- null = use global default
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table elixir.brand_keys (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references elixir.brands(id) on delete cascade,
  label text not null default 'default',
  key_prefix text not null,                       -- first chars, for display only
  key_hash text not null unique,                  -- sha256 hex; plaintext is never stored
  created_by uuid,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table elixir.tiers (
  id text primary key check (id ~ '^[a-z0-9_]+$'),
  name text not null,
  min_spend_gbp numeric(12,2) not null unique check (min_spend_gbp >= 0),   -- rolling-window spend
  earn_multiplier numeric(4,2) not null default 1 check (earn_multiplier >= 1),
  color text not null default '#64748b',
  perks jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0
);

create table elixir.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,   -- null = guest, claimable later by verified email
  email text not null,
  display_name text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  joined_at timestamptz not null default now()
);
create unique index members_email_key on elixir.members (lower(email));

create table elixir.earn_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand_id uuid references elixir.brands(id) on delete cascade,       -- null = all brands
  multiplier numeric(4,2) not null check (multiplier >= 1 and multiplier <= 10),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  active boolean not null default true
);

create table elixir.ledger (
  id bigint generated always as identity primary key,
  member_id uuid not null references elixir.members(id) on delete restrict,
  kind text not null check (kind in ('earn', 'redeem', 'adjust', 'reversal', 'expire')),
  delta integer not null,
  spend_gbp numeric(12,2),                                   -- set on earn / reversal; drives tiers
  brand_id uuid references elixir.brands(id),                -- where it happened
  liable_brand_id uuid references elixir.brands(id),         -- who funds the points (partner settlement later)
  source_ref text,                                           -- order id etc; idempotency key
  reverses_id bigint references elixir.ledger(id),
  description text,
  reason text,
  note text,
  staff_id uuid,                                             -- deliberately no FK: audit survives user deletion
  staff_email text,
  expires_at timestamptz,                                    -- reserved; expiry not enforced in Phase 1
  created_at timestamptz not null default now(),
  check ((kind = 'earn' and delta >= 0) or (kind in ('redeem', 'expire') and delta <= 0) or kind in ('adjust', 'reversal')),
  check (kind <> 'adjust' or (staff_id is not null and note is not null and length(btrim(note)) > 0))
);
create unique index ledger_idempotency on elixir.ledger (brand_id, kind, source_ref)
  where source_ref is not null and brand_id is not null;
create index ledger_member_time on elixir.ledger (member_id, created_at desc);
create index ledger_time on elixir.ledger (created_at desc);

create function elixir.block_ledger_changes() returns trigger
language plpgsql as $$
begin
  raise exception 'elixir.ledger is append-only' using errcode = '42501';
end $$;
create trigger ledger_no_update_delete before update or delete on elixir.ledger
  for each row execute function elixir.block_ledger_changes();
create trigger ledger_no_truncate before truncate on elixir.ledger
  for each statement execute function elixir.block_ledger_changes();

create table elixir.rewards (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  description text not null default '',
  category text not null check (category in ('ecommerce', 'media_content')),
  reward_type text not null check (reward_type in ('fixed_discount', 'percent_discount', 'free_shipping', 'digital_access')),
  value numeric(10,2) check (value > 0),                     -- £ for fixed, % for percent
  point_cost integer not null check (point_cost > 0),
  brand_id uuid references elixir.brands(id),                -- null = redeemable at any brand
  active boolean not null default true,
  stock integer check (stock >= 0),
  per_member_limit integer check (per_member_limit > 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table elixir.redemptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references elixir.members(id),
  reward_id uuid not null references elixir.rewards(id),
  ledger_id bigint not null references elixir.ledger(id),
  code text not null unique,
  status text not null default 'issued' check (status in ('issued', 'used', 'expired', 'void')),
  brand_id uuid references elixir.brands(id),                -- where it can be used (null = any)
  reward_snapshot jsonb not null,                            -- terms frozen at issue time
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_brand_id uuid references elixir.brands(id),
  used_order_ref text
);
create index redemptions_member on elixir.redemptions (member_id, issued_at desc);

create table elixir.staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null check (role in ('admin', 'agent')),
  created_at timestamptz not null default now()
);

create table elixir.admin_log (
  id bigint generated always as identity primary key,
  staff_id uuid,
  staff_email text,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Defence in depth: RLS on, no policies, no grants.
alter table elixir.config         enable row level security;
alter table elixir.brands         enable row level security;
alter table elixir.brand_keys     enable row level security;
alter table elixir.tiers          enable row level security;
alter table elixir.members        enable row level security;
alter table elixir.earn_campaigns enable row level security;
alter table elixir.ledger         enable row level security;
alter table elixir.rewards        enable row level security;
alter table elixir.redemptions    enable row level security;
alter table elixir.staff          enable row level security;
alter table elixir.admin_log      enable row level security;

-- ---------------------------------------------------------------------------
-- Seed data (all editable from the dashboard)
-- ---------------------------------------------------------------------------

insert into elixir.brands (slug, name, brand_type, active) values
  ('sparkthunder-shop', 'Sparkthunder Shop', 'owned', true),
  ('miss-petty',        'Miss Petty',        'owned', false),
  ('funky',             'Funky',             'owned', false);

insert into elixir.tiers (id, name, min_spend_gbp, earn_multiplier, color, perks, sort_order) values
  ('bronze',   'Bronze',   0,    1.00, '#b45309', '["1 point per £1 spent","Birthday bonus","Early access to sales"]', 1),
  ('silver',   'Silver',   500,  1.25, '#64748b', '["1.25x points","Free standard shipping","Silver-only drops"]', 2),
  ('gold',     'Gold',     2000, 1.50, '#d97706', '["1.5x points","Free express shipping","Monthly bonus points"]', 3),
  ('platinum', 'Platinum', 5000, 2.00, '#7c3aed', '["2x points","Free next-day delivery","First access to every drop"]', 4);

-- 200 points = £1, so £5 = 1,000 pts.
insert into elixir.rewards (title, description, category, reward_type, value, point_cost) values
  ('£5 off your order',  'Redeem at checkout on any Sparkthunder brand', 'ecommerce', 'fixed_discount', 5,  1000),
  ('£10 off your order', 'Redeem at checkout on any Sparkthunder brand', 'ecommerce', 'fixed_discount', 10, 2000),
  ('£25 off your order', 'Redeem at checkout on any Sparkthunder brand', 'ecommerce', 'fixed_discount', 25, 5000),
  ('Free standard shipping', 'Free standard shipping on your next order', 'ecommerce', 'free_shipping', null, 600);

-- ---------------------------------------------------------------------------
-- Internal helpers (schema elixir; not callable from the API)
-- ---------------------------------------------------------------------------

create function elixir.require_staff(p_role text default 'agent') returns elixir.staff
language plpgsql stable security definer set search_path = elixir, pg_temp as $$
declare v_staff elixir.staff;
begin
  select * into v_staff from elixir.staff where user_id = auth.uid();
  if not found or (p_role = 'admin' and v_staff.role <> 'admin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return v_staff;
end $$;

create function elixir.log_admin(p_staff elixir.staff, p_action text, p_detail jsonb) returns void
language sql security definer set search_path = elixir, pg_temp as $$
  insert into elixir.admin_log (staff_id, staff_email, action, detail)
  values (p_staff.user_id, p_staff.email, p_action, coalesce(p_detail, '{}'::jsonb));
$$;

create function elixir.add_staff(p_email text, p_role text default 'agent') returns void
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare v_user auth.users;
begin
  select * into v_user from auth.users where lower(email) = lower(p_email);
  if not found then raise exception 'No auth user with email %', p_email; end if;
  insert into elixir.staff (user_id, email, role) values (v_user.id, v_user.email, p_role)
  on conflict (user_id) do update set role = excluded.role;
end $$;

create function elixir.balance_of(p_member uuid) returns integer
language sql stable security definer set search_path = elixir, pg_temp as $$
  select coalesce(sum(delta), 0)::integer from elixir.ledger where member_id = p_member;
$$;

create function elixir.window_spend_of(p_member uuid) returns numeric
language sql stable security definer set search_path = elixir, pg_temp as $$
  select coalesce(sum(l.spend_gbp), 0)
  from elixir.ledger l, elixir.config c
  where l.member_id = p_member
    and l.created_at >= now() - make_interval(months => c.tier_window_months);
$$;

create function elixir.tier_for_spend(p_spend numeric) returns elixir.tiers
language sql stable security definer set search_path = elixir, pg_temp as $$
  select t from elixir.tiers t where t.min_spend_gbp <= greatest(p_spend, 0)
  order by t.min_spend_gbp desc limit 1;
$$;

create function elixir.brand_from_key(p_key text) returns uuid
language sql stable security definer set search_path = elixir, pg_temp as $$
  select b.id from elixir.brand_keys k join elixir.brands b on b.id = k.brand_id
  where k.key_hash = encode(sha256(convert_to(coalesce(p_key, ''), 'utf8')), 'hex')
    and k.revoked_at is null and b.active;
$$;

-- Find or create a member. Guests (email only) can be claimed later.
create function elixir.upsert_member(p_user_id uuid, p_email text) returns uuid
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare v_id uuid; v_by_email elixir.members; v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if p_user_id is not null then
    select id into v_id from elixir.members where user_id = p_user_id;
    if found then return v_id; end if;
  end if;
  if v_email = '' and p_user_id is not null then
    select lower(email) into v_email from auth.users where id = p_user_id;
  end if;
  if v_email is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'valid email or user_id required' using errcode = '22023';
  end if;
  select * into v_by_email from elixir.members where lower(email) = v_email;
  if found then
    if p_user_id is not null and v_by_email.user_id is null then
      update elixir.members set user_id = p_user_id where id = v_by_email.id;
    elsif p_user_id is not null and v_by_email.user_id is distinct from p_user_id then
      raise exception 'email belongs to another member' using errcode = '23505';
    end if;
    return v_by_email.id;
  end if;
  insert into elixir.members (user_id, email) values (p_user_id, v_email) returning id into v_id;
  return v_id;
end $$;

create function elixir.tier_json(p_tier elixir.tiers) returns jsonb
language sql immutable as $$
  select jsonb_build_object('id', p_tier.id, 'name', p_tier.name, 'color', p_tier.color,
    'earn_multiplier', p_tier.earn_multiplier, 'min_spend_gbp', p_tier.min_spend_gbp, 'perks', p_tier.perks);
$$;

-- ---------------------------------------------------------------------------
-- Brand-server API (service_role only; called by the elixir-api Edge Function)
-- ---------------------------------------------------------------------------

create function public.elixir_record_earn(
  p_api_key text, p_source_ref text, p_spend_gbp numeric,
  p_email text default null, p_user_id uuid default null, p_description text default null
) returns jsonb
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare
  v_brand elixir.brands; v_brand_id uuid; v_cfg elixir.config; v_member uuid; v_status text;
  v_tier elixir.tiers; v_base numeric; v_campaign numeric; v_points integer; v_id bigint; v_existing elixir.ledger;
begin
  v_brand_id := elixir.brand_from_key(p_api_key);
  if v_brand_id is null then raise exception 'invalid_api_key' using errcode = '28000'; end if;
  select * into v_brand from elixir.brands where id = v_brand_id;
  if p_source_ref is null or length(btrim(p_source_ref)) = 0 then raise exception 'source_ref required' using errcode = '22023'; end if;
  if p_spend_gbp is null or p_spend_gbp <= 0 or p_spend_gbp > 1000000 then raise exception 'spend_gbp must be between 0 and 1,000,000' using errcode = '22023'; end if;

  v_member := elixir.upsert_member(p_user_id, p_email);
  select status into v_status from elixir.members where id = v_member;
  if v_status <> 'active' then raise exception 'member_suspended' using errcode = '42501'; end if;

  select * into v_existing from elixir.ledger where brand_id = v_brand_id and kind = 'earn' and source_ref = p_source_ref;
  if found then
    return jsonb_build_object('duplicate', true, 'points', v_existing.delta, 'balance', elixir.balance_of(v_member), 'member_id', v_member);
  end if;

  select * into v_cfg from elixir.config;
  v_tier := elixir.tier_for_spend(elixir.window_spend_of(v_member));
  v_base := coalesce(v_brand.earn_points_per_gbp, v_cfg.earn_points_per_gbp);
  select coalesce(max(multiplier), 1) into v_campaign from elixir.earn_campaigns
   where active and starts_at <= now() and (ends_at is null or ends_at > now())
     and (brand_id is null or brand_id = v_brand_id);
  v_points := floor(p_spend_gbp * v_base * coalesce(v_tier.earn_multiplier, 1) * v_campaign)::integer;

  insert into elixir.ledger (member_id, kind, delta, spend_gbp, brand_id, liable_brand_id, source_ref, description)
  values (v_member, 'earn', v_points, round(p_spend_gbp, 2), v_brand_id, v_brand_id, p_source_ref, p_description)
  on conflict (brand_id, kind, source_ref) where source_ref is not null and brand_id is not null do nothing
  returning id into v_id;

  if v_id is null then  -- lost a race with an identical retry
    select * into v_existing from elixir.ledger where brand_id = v_brand_id and kind = 'earn' and source_ref = p_source_ref;
    return jsonb_build_object('duplicate', true, 'points', v_existing.delta, 'balance', elixir.balance_of(v_member), 'member_id', v_member);
  end if;

  return jsonb_build_object('duplicate', false, 'points', v_points, 'balance', elixir.balance_of(v_member),
    'member_id', v_member, 'tier', elixir.tier_json(elixir.tier_for_spend(elixir.window_spend_of(v_member))));
end $$;

create function public.elixir_record_reversal(
  p_api_key text, p_order_ref text, p_refund_ref text, p_refund_gbp numeric
) returns jsonb
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare
  v_brand_id uuid; v_orig elixir.ledger; v_done_spend numeric; v_done_points integer;
  v_refund numeric; v_points integer; v_id bigint; v_existing elixir.ledger;
begin
  v_brand_id := elixir.brand_from_key(p_api_key);
  if v_brand_id is null then raise exception 'invalid_api_key' using errcode = '28000'; end if;
  if p_refund_ref is null or length(btrim(p_refund_ref)) = 0 then raise exception 'refund_ref required' using errcode = '22023'; end if;
  if p_refund_gbp is null or p_refund_gbp <= 0 then raise exception 'refund_gbp must be positive' using errcode = '22023'; end if;

  select * into v_existing from elixir.ledger where brand_id = v_brand_id and kind = 'reversal' and source_ref = p_refund_ref;
  if found then return jsonb_build_object('status', 'duplicate', 'points', v_existing.delta); end if;

  select * into v_orig from elixir.ledger where brand_id = v_brand_id and kind = 'earn' and source_ref = p_order_ref;
  if not found then return jsonb_build_object('status', 'no_original_earn', 'points', 0); end if;

  select coalesce(sum(-spend_gbp), 0), coalesce(sum(-delta), 0) into v_done_spend, v_done_points
    from elixir.ledger where reverses_id = v_orig.id;
  v_refund := least(p_refund_gbp, v_orig.spend_gbp - v_done_spend);
  if v_refund <= 0 then return jsonb_build_object('status', 'already_fully_reversed', 'points', 0); end if;
  v_points := least(round(v_orig.delta * v_refund / v_orig.spend_gbp)::integer, v_orig.delta - v_done_points);

  insert into elixir.ledger (member_id, kind, delta, spend_gbp, brand_id, liable_brand_id, source_ref, reverses_id, description)
  values (v_orig.member_id, 'reversal', -v_points, -v_refund, v_brand_id, v_orig.liable_brand_id, p_refund_ref, v_orig.id,
          'Refund on order ' || p_order_ref)
  on conflict (brand_id, kind, source_ref) where source_ref is not null and brand_id is not null do nothing
  returning id into v_id;
  if v_id is null then return jsonb_build_object('status', 'duplicate', 'points', 0); end if;

  return jsonb_build_object('status', 'reversed', 'points', -v_points, 'balance', elixir.balance_of(v_orig.member_id));
end $$;

create function public.elixir_check_code(p_api_key text, p_code text) returns jsonb
language plpgsql stable security definer set search_path = elixir, pg_temp as $$
declare v_brand_id uuid; r elixir.redemptions;
begin
  v_brand_id := elixir.brand_from_key(p_api_key);
  if v_brand_id is null then raise exception 'invalid_api_key' using errcode = '28000'; end if;
  select * into r from elixir.redemptions where code = upper(btrim(coalesce(p_code, '')));
  if not found then return jsonb_build_object('valid', false, 'reason', 'not_found'); end if;
  if r.status <> 'issued' then return jsonb_build_object('valid', false, 'reason', r.status); end if;
  if r.expires_at <= now() then return jsonb_build_object('valid', false, 'reason', 'expired'); end if;
  if r.brand_id is not null and r.brand_id <> v_brand_id then return jsonb_build_object('valid', false, 'reason', 'wrong_brand'); end if;
  return jsonb_build_object('valid', true, 'reward', r.reward_snapshot, 'expires_at', r.expires_at);
end $$;

create function public.elixir_consume_code(p_api_key text, p_code text, p_order_ref text) returns jsonb
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare v_brand_id uuid; r elixir.redemptions;
begin
  v_brand_id := elixir.brand_from_key(p_api_key);
  if v_brand_id is null then raise exception 'invalid_api_key' using errcode = '28000'; end if;
  if p_order_ref is null or length(btrim(p_order_ref)) = 0 then raise exception 'order_ref required' using errcode = '22023'; end if;
  select * into r from elixir.redemptions where code = upper(btrim(coalesce(p_code, ''))) for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'not_found'); end if;
  if r.status = 'used' and r.used_order_ref = p_order_ref and r.used_brand_id = v_brand_id then
    return jsonb_build_object('ok', true, 'duplicate', true, 'reward', r.reward_snapshot);   -- idempotent retry
  end if;
  if r.status <> 'issued' then return jsonb_build_object('ok', false, 'reason', r.status); end if;
  if r.expires_at <= now() then
    update elixir.redemptions set status = 'expired' where id = r.id;
    return jsonb_build_object('ok', false, 'reason', 'expired');
  end if;
  if r.brand_id is not null and r.brand_id <> v_brand_id then return jsonb_build_object('ok', false, 'reason', 'wrong_brand'); end if;
  update elixir.redemptions set status = 'used', used_at = now(), used_brand_id = v_brand_id, used_order_ref = p_order_ref where id = r.id;
  return jsonb_build_object('ok', true, 'duplicate', false, 'reward', r.reward_snapshot);
end $$;

-- ---------------------------------------------------------------------------
-- Member API (authenticated; own data only)
-- ---------------------------------------------------------------------------

-- Enrol the signed-in user, or claim a guest membership that matches their VERIFIED email.
create function public.elixir_join() returns jsonb
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare v_uid uuid := auth.uid(); v_user auth.users; v_member uuid;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select id into v_member from elixir.members where user_id = v_uid;
  if not found then
    select * into v_user from auth.users where id = v_uid;
    if v_user.email is null or v_user.email_confirmed_at is null then
      raise exception 'verify your email before joining Elixir' using errcode = '42501';
    end if;
    v_member := elixir.upsert_member(v_uid, v_user.email);
  end if;
  return jsonb_build_object('member_id', v_member, 'balance', elixir.balance_of(v_member));
end $$;

create function public.elixir_me() returns jsonb
language plpgsql stable security definer set search_path = elixir, pg_temp as $$
declare
  v_uid uuid := auth.uid(); v_member elixir.members; v_spend numeric; v_tier elixir.tiers; v_next elixir.tiers; v_cfg elixir.config;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into v_member from elixir.members where user_id = v_uid;
  if not found then return jsonb_build_object('enrolled', false); end if;
  select * into v_cfg from elixir.config;
  v_spend := elixir.window_spend_of(v_member.id);
  v_tier := elixir.tier_for_spend(v_spend);
  select * into v_next from elixir.tiers where min_spend_gbp > coalesce(v_tier.min_spend_gbp, 0) order by min_spend_gbp limit 1;
  return jsonb_build_object(
    'enrolled', true,
    'balance', elixir.balance_of(v_member.id),
    'balance_gbp', round(elixir.balance_of(v_member.id)::numeric / v_cfg.redeem_points_per_gbp, 2),
    'tier', elixir.tier_json(v_tier),
    'window_spend_gbp', v_spend,
    'next_tier', case when v_next.id is null then null
                 else jsonb_build_object('name', v_next.name, 'spend_needed_gbp', v_next.min_spend_gbp - v_spend) end,
    'history', coalesce((select jsonb_agg(h order by h.created_at desc) from (
        select l.created_at, l.kind, l.delta, l.description, b.name as brand
        from elixir.ledger l left join elixir.brands b on b.id = l.brand_id
        where l.member_id = v_member.id order by l.created_at desc, l.id desc limit 50) h), '[]'::jsonb),
    'codes', coalesce((select jsonb_agg(c order by c.issued_at desc) from (
        select code, status, expires_at, issued_at, reward_snapshot->>'title' as title
        from elixir.redemptions where member_id = v_member.id and status = 'issued' and expires_at > now()) c), '[]'::jsonb));
end $$;

create function public.elixir_rewards_available() returns jsonb
language plpgsql stable security definer set search_path = elixir, pg_temp as $$
declare v_uid uuid := auth.uid(); v_balance integer := 0; v_member uuid;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select id into v_member from elixir.members where user_id = v_uid;
  if v_member is not null then v_balance := elixir.balance_of(v_member); end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', r.id, 'title', r.title, 'description', r.description, 'category', r.category,
      'reward_type', r.reward_type, 'value', r.value, 'point_cost', r.point_cost,
      'brand', b.name, 'can_afford', v_balance >= r.point_cost) order by r.point_cost)
    from elixir.rewards r left join elixir.brands b on b.id = r.brand_id
    where r.active and r.archived_at is null and (r.stock is null or r.stock > 0)), '[]'::jsonb);
end $$;

create function public.elixir_redeem(p_reward_id uuid) returns jsonb
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare
  v_uid uuid := auth.uid(); v_member elixir.members; v_reward elixir.rewards; v_cfg elixir.config;
  v_ledger bigint; v_red uuid := gen_random_uuid(); v_code text; v_used integer;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into v_member from elixir.members where user_id = v_uid for update;      -- serialises this member's redemptions
  if not found then raise exception 'not_a_member' using errcode = '42501'; end if;
  if v_member.status <> 'active' then raise exception 'member_suspended' using errcode = '42501'; end if;

  select * into v_reward from elixir.rewards where id = p_reward_id for update;
  if not found or not v_reward.active or v_reward.archived_at is not null then raise exception 'reward_unavailable' using errcode = '22023'; end if;
  if v_reward.stock is not null and v_reward.stock <= 0 then raise exception 'out_of_stock' using errcode = '22023'; end if;
  if v_reward.per_member_limit is not null then
    select count(*) into v_used from elixir.redemptions where member_id = v_member.id and reward_id = v_reward.id and status <> 'void';
    if v_used >= v_reward.per_member_limit then raise exception 'limit_reached' using errcode = '22023'; end if;
  end if;
  if elixir.balance_of(v_member.id) < v_reward.point_cost then raise exception 'insufficient_points' using errcode = '22023'; end if;

  select * into v_cfg from elixir.config;
  v_code := 'ELX-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)) || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));

  insert into elixir.ledger (member_id, kind, delta, brand_id, source_ref, description)
  values (v_member.id, 'redeem', -v_reward.point_cost, v_reward.brand_id, 'redeem:' || v_red, v_reward.title)
  returning id into v_ledger;

  insert into elixir.redemptions (id, member_id, reward_id, ledger_id, code, brand_id, reward_snapshot, expires_at)
  values (v_red, v_member.id, v_reward.id, v_ledger, v_code, v_reward.brand_id,
          jsonb_build_object('title', v_reward.title, 'reward_type', v_reward.reward_type, 'value', v_reward.value, 'point_cost', v_reward.point_cost),
          now() + make_interval(days => v_cfg.code_valid_days));

  if v_reward.stock is not null then update elixir.rewards set stock = stock - 1, updated_at = now() where id = v_reward.id; end if;

  return jsonb_build_object('code', v_code, 'title', v_reward.title, 'balance', elixir.balance_of(v_member.id),
                            'expires_at', now() + make_interval(days => v_cfg.code_valid_days));
end $$;

-- ---------------------------------------------------------------------------
-- Staff API (authenticated + elixir.staff)
-- ---------------------------------------------------------------------------

create function public.elixir_whoami() returns jsonb
language sql stable security definer set search_path = elixir, pg_temp as $$
  select coalesce((select jsonb_build_object('role', s.role, 'email', s.email) from elixir.staff s where s.user_id = auth.uid()), 'null'::jsonb);
$$;

create function public.elixir_admin_overview() returns jsonb
language plpgsql stable security definer set search_path = elixir, pg_temp as $$
declare v_cfg elixir.config; v_totals record; v_members integer; v_spend_all numeric; v_tiers jsonb; v_brands jsonb;
begin
  perform elixir.require_staff('agent');
  select * into v_cfg from elixir.config;
  select coalesce(sum(delta), 0) as outstanding,
         coalesce(sum(delta) filter (where delta > 0), 0) as issued,
         coalesce(-sum(delta) filter (where kind = 'redeem'), 0) as redeemed,
         coalesce(sum(spend_gbp), 0) as spend
    into v_totals from elixir.ledger;
  select count(*) into v_members from elixir.members;
  v_spend_all := v_totals.spend;

  select coalesce(jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color, 'members', coalesce(c.n, 0)) order by t.sort_order), '[]'::jsonb)
    into v_tiers
    from elixir.tiers t
    left join (
      select x.tier_id, count(*) n from (
        select m.id,
               (select t2.id from elixir.tiers t2
                 where t2.min_spend_gbp <= greatest(coalesce((select sum(l.spend_gbp) from elixir.ledger l
                        where l.member_id = m.id and l.created_at >= now() - make_interval(months => v_cfg.tier_window_months)), 0), 0)
                 order by t2.min_spend_gbp desc limit 1) as tier_id
        from elixir.members m) x
      group by x.tier_id) c on c.tier_id = t.id;

  select coalesce(jsonb_agg(jsonb_build_object('slug', b.slug, 'name', b.name, 'points', coalesce(s.points, 0), 'spend_gbp', coalesce(s.spend, 0))), '[]'::jsonb)
    into v_brands
    from elixir.brands b
    left join (select brand_id, sum(delta) filter (where kind in ('earn', 'reversal')) points, sum(spend_gbp) spend
               from elixir.ledger where created_at >= now() - interval '30 days' group by brand_id) s on s.brand_id = b.id
    where b.active;

  return jsonb_build_object(
    'members', v_members,
    'points_outstanding', v_totals.outstanding,
    'points_issued', v_totals.issued,
    'points_redeemed', v_totals.redeemed,
    'redeemed_value_gbp', round(v_totals.redeemed::numeric / v_cfg.redeem_points_per_gbp, 2),
    'liability_gbp', round(v_totals.outstanding::numeric / v_cfg.redeem_points_per_gbp, 2),
    'avg_lifetime_spend_gbp', case when v_members = 0 then 0 else round(v_spend_all / v_members, 2) end,
    'redeem_points_per_gbp', v_cfg.redeem_points_per_gbp,
    'tiers', v_tiers,
    'brands_30d', v_brands);
end $$;

create function public.elixir_admin_members(p_search text default null, p_limit integer default 50, p_offset integer default 0) returns jsonb
language plpgsql stable security definer set search_path = elixir, pg_temp as $$
declare v_cfg elixir.config; v_q text := lower(btrim(coalesce(p_search, '')));
begin
  perform elixir.require_staff('agent');
  select * into v_cfg from elixir.config;
  return coalesce((select jsonb_agg(row_to_json(z)::jsonb order by z.lifetime_spend_gbp desc, z.joined_at desc) from (
    select m.id as member_id, m.email, m.display_name, m.status, m.joined_at,
           coalesce(a.balance, 0) as balance, coalesce(a.lifetime_points, 0) as lifetime_points,
           coalesce(a.orders, 0) as orders, coalesce(a.lifetime_spend, 0) as lifetime_spend_gbp,
           coalesce(a.window_spend, 0) as window_spend_gbp,
           t.id as tier_id, t.name as tier_name, t.color as tier_color
    from elixir.members m
    left join lateral (
      select sum(l.delta) balance, sum(l.delta) filter (where l.delta > 0) lifetime_points,
             count(*) filter (where l.kind = 'earn') orders, sum(l.spend_gbp) lifetime_spend,
             sum(l.spend_gbp) filter (where l.created_at >= now() - make_interval(months => v_cfg.tier_window_months)) window_spend
      from elixir.ledger l where l.member_id = m.id) a on true
    left join lateral (select t2.* from elixir.tiers t2 where t2.min_spend_gbp <= greatest(coalesce(a.window_spend, 0), 0)
                       order by t2.min_spend_gbp desc limit 1) t on true
    where v_q = '' or position(v_q in lower(m.email)) > 0 or position(v_q in lower(coalesce(m.display_name, ''))) > 0
    order by coalesce(a.lifetime_spend, 0) desc, m.joined_at desc
    limit least(greatest(p_limit, 1), 200) offset greatest(p_offset, 0)) z), '[]'::jsonb);
end $$;

create function public.elixir_admin_member_history(p_member uuid, p_limit integer default 100) returns jsonb
language plpgsql stable security definer set search_path = elixir, pg_temp as $$
begin
  perform elixir.require_staff('agent');
  return coalesce((select jsonb_agg(h order by h.created_at desc, h.id desc) from (
    select l.id, l.created_at, l.kind, l.delta, l.description, l.reason, l.note, l.staff_email, b.name as brand
    from elixir.ledger l left join elixir.brands b on b.id = l.brand_id
    where l.member_id = p_member order by l.created_at desc, l.id desc limit least(greatest(p_limit, 1), 500)) h), '[]'::jsonb);
end $$;

create function public.elixir_admin_adjust(p_member uuid, p_delta integer, p_reason text, p_note text) returns jsonb
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare v_staff elixir.staff; v_cfg elixir.config; v_balance integer;
begin
  v_staff := elixir.require_staff('agent');
  select * into v_cfg from elixir.config;
  if p_delta is null or p_delta = 0 then raise exception 'delta must be non-zero' using errcode = '22023'; end if;
  if abs(p_delta) > 1000000 then raise exception 'adjustment too large' using errcode = '22023'; end if;
  if v_staff.role = 'agent' and abs(p_delta) > v_cfg.agent_adjust_limit then
    raise exception 'agents may adjust at most % points; ask an admin', v_cfg.agent_adjust_limit using errcode = '42501';
  end if;
  if p_reason not in ('cs_escalation', 'birthday_gift', 'manual_correction', 'lost_order_compensation', 'vip_bonus') then
    raise exception 'invalid reason' using errcode = '22023';
  end if;
  if p_note is null or length(btrim(p_note)) = 0 then raise exception 'note required for audit' using errcode = '22023'; end if;
  perform 1 from elixir.members where id = p_member for update;
  if not found then raise exception 'member not found' using errcode = '22023'; end if;
  v_balance := elixir.balance_of(p_member);
  if p_delta < 0 and v_balance + p_delta < 0 then raise exception 'cannot deduct more than the balance (%)', v_balance using errcode = '22023'; end if;

  insert into elixir.ledger (member_id, kind, delta, reason, note, staff_id, staff_email, description)
  values (p_member, 'adjust', p_delta, p_reason, btrim(p_note), v_staff.user_id, v_staff.email,
          case when p_delta > 0 then 'Points awarded by staff' else 'Points deducted by staff' end);
  return jsonb_build_object('balance', elixir.balance_of(p_member));
end $$;

create function public.elixir_admin_adjustments(p_limit integer default 100) returns jsonb
language plpgsql stable security definer set search_path = elixir, pg_temp as $$
begin
  perform elixir.require_staff('agent');
  return coalesce((select jsonb_agg(a order by a.created_at desc) from (
    select l.id, l.created_at, m.email as member_email, m.display_name as member_name, l.delta, l.reason, l.note, l.staff_email
    from elixir.ledger l join elixir.members m on m.id = l.member_id
    where l.kind = 'adjust' order by l.created_at desc, l.id desc limit least(greatest(p_limit, 1), 500)) a), '[]'::jsonb);
end $$;

create function public.elixir_admin_rewards() returns jsonb
language plpgsql stable security definer set search_path = elixir, pg_temp as $$
begin
  perform elixir.require_staff('agent');
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', r.id, 'title', r.title, 'description', r.description, 'category', r.category, 'reward_type', r.reward_type,
      'value', r.value, 'point_cost', r.point_cost, 'brand_id', r.brand_id, 'brand', b.name, 'active', r.active,
      'stock', r.stock, 'per_member_limit', r.per_member_limit,
      'redeemed', (select count(*) from elixir.redemptions x where x.reward_id = r.id and x.status <> 'void'))
      order by r.point_cost)
    from elixir.rewards r left join elixir.brands b on b.id = r.brand_id where r.archived_at is null), '[]'::jsonb);
end $$;

create function public.elixir_admin_save_reward(p jsonb) returns jsonb
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare v_staff elixir.staff; v_id uuid := nullif(p->>'id', '')::uuid;
begin
  v_staff := elixir.require_staff('admin');
  if v_id is null then
    insert into elixir.rewards (title, description, category, reward_type, value, point_cost, brand_id, active, stock, per_member_limit)
    values (btrim(p->>'title'), coalesce(p->>'description', ''), p->>'category', p->>'reward_type', nullif(p->>'value', '')::numeric,
            (p->>'point_cost')::integer, nullif(p->>'brand_id', '')::uuid, coalesce((p->>'active')::boolean, true),
            nullif(p->>'stock', '')::integer, nullif(p->>'per_member_limit', '')::integer)
    returning id into v_id;
  else
    update elixir.rewards set title = btrim(p->>'title'), description = coalesce(p->>'description', ''), category = p->>'category',
      reward_type = p->>'reward_type', value = nullif(p->>'value', '')::numeric, point_cost = (p->>'point_cost')::integer,
      brand_id = nullif(p->>'brand_id', '')::uuid, active = coalesce((p->>'active')::boolean, active),
      stock = nullif(p->>'stock', '')::integer, per_member_limit = nullif(p->>'per_member_limit', '')::integer, updated_at = now()
    where id = v_id and archived_at is null;
    if not found then raise exception 'reward not found' using errcode = '22023'; end if;
  end if;
  perform elixir.log_admin(v_staff, 'reward.save', jsonb_build_object('reward_id', v_id, 'title', p->>'title', 'point_cost', p->>'point_cost'));
  return jsonb_build_object('id', v_id);
end $$;

create function public.elixir_admin_set_reward_active(p_id uuid, p_active boolean) returns void
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare v_staff elixir.staff;
begin
  v_staff := elixir.require_staff('admin');
  update elixir.rewards set active = p_active, updated_at = now() where id = p_id and archived_at is null;
  perform elixir.log_admin(v_staff, 'reward.set_active', jsonb_build_object('reward_id', p_id, 'active', p_active));
end $$;

create function public.elixir_admin_archive_reward(p_id uuid) returns void
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare v_staff elixir.staff;
begin
  v_staff := elixir.require_staff('admin');
  update elixir.rewards set archived_at = now(), active = false, updated_at = now() where id = p_id;
  perform elixir.log_admin(v_staff, 'reward.archive', jsonb_build_object('reward_id', p_id));
end $$;

create function public.elixir_admin_tiers() returns jsonb
language plpgsql stable security definer set search_path = elixir, pg_temp as $$
begin
  perform elixir.require_staff('agent');
  return coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'min_spend_gbp', t.min_spend_gbp,
      'earn_multiplier', t.earn_multiplier, 'color', t.color, 'perks', t.perks) order by t.sort_order) from elixir.tiers t), '[]'::jsonb);
end $$;

create function public.elixir_admin_save_tier(p jsonb) returns void
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare v_staff elixir.staff;
begin
  v_staff := elixir.require_staff('admin');
  update elixir.tiers set name = btrim(p->>'name'), min_spend_gbp = (p->>'min_spend_gbp')::numeric,
    earn_multiplier = (p->>'earn_multiplier')::numeric, color = coalesce(p->>'color', color), perks = coalesce(p->'perks', perks)
  where id = p->>'id';
  if not found then raise exception 'tier not found' using errcode = '22023'; end if;
  perform elixir.log_admin(v_staff, 'tier.save', p);
end $$;

create function public.elixir_admin_brands() returns jsonb
language plpgsql stable security definer set search_path = elixir, pg_temp as $$
begin
  perform elixir.require_staff('admin');
  return coalesce((select jsonb_agg(jsonb_build_object('id', b.id, 'slug', b.slug, 'name', b.name, 'brand_type', b.brand_type,
      'earn_points_per_gbp', b.earn_points_per_gbp, 'active', b.active,
      'keys', coalesce((select jsonb_agg(jsonb_build_object('id', k.id, 'label', k.label, 'prefix', k.key_prefix,
                 'created_at', k.created_at, 'revoked_at', k.revoked_at) order by k.created_at) from elixir.brand_keys k where k.brand_id = b.id), '[]'::jsonb))
      order by b.created_at) from elixir.brands b), '[]'::jsonb);
end $$;

create function public.elixir_admin_save_brand(p jsonb) returns jsonb
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare v_staff elixir.staff; v_id uuid := nullif(p->>'id', '')::uuid;
begin
  v_staff := elixir.require_staff('admin');
  if v_id is null then
    insert into elixir.brands (slug, name, brand_type, earn_points_per_gbp, active)
    values (lower(btrim(p->>'slug')), btrim(p->>'name'), coalesce(p->>'brand_type', 'owned'),
            nullif(p->>'earn_points_per_gbp', '')::numeric, coalesce((p->>'active')::boolean, true)) returning id into v_id;
  else
    update elixir.brands set name = btrim(p->>'name'), brand_type = coalesce(p->>'brand_type', brand_type),
      earn_points_per_gbp = nullif(p->>'earn_points_per_gbp', '')::numeric, active = coalesce((p->>'active')::boolean, active)
    where id = v_id;
    if not found then raise exception 'brand not found' using errcode = '22023'; end if;
  end if;
  perform elixir.log_admin(v_staff, 'brand.save', jsonb_build_object('brand_id', v_id, 'name', p->>'name', 'active', p->>'active'));
  return jsonb_build_object('id', v_id);
end $$;

-- Returns the plaintext key ONCE; only its hash is stored.
create function public.elixir_admin_create_key(p_brand uuid, p_label text default 'default') returns jsonb
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare v_staff elixir.staff; v_key text; v_id uuid;
begin
  v_staff := elixir.require_staff('admin');
  perform 1 from elixir.brands where id = p_brand;
  if not found then raise exception 'brand not found' using errcode = '22023'; end if;
  v_key := 'elx_' || replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into elixir.brand_keys (brand_id, label, key_prefix, key_hash, created_by)
  values (p_brand, coalesce(nullif(btrim(p_label), ''), 'default'), substr(v_key, 1, 8),
          encode(sha256(convert_to(v_key, 'utf8')), 'hex'), v_staff.user_id) returning id into v_id;
  perform elixir.log_admin(v_staff, 'key.create', jsonb_build_object('brand_id', p_brand, 'key_id', v_id));
  return jsonb_build_object('id', v_id, 'key', v_key);
end $$;

create function public.elixir_admin_revoke_key(p_key uuid) returns void
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare v_staff elixir.staff;
begin
  v_staff := elixir.require_staff('admin');
  update elixir.brand_keys set revoked_at = now() where id = p_key and revoked_at is null;
  perform elixir.log_admin(v_staff, 'key.revoke', jsonb_build_object('key_id', p_key));
end $$;

create function public.elixir_admin_config() returns jsonb
language plpgsql stable security definer set search_path = elixir, pg_temp as $$
begin
  perform elixir.require_staff('agent');
  return (select to_jsonb(c) - 'id' from elixir.config c);
end $$;

create function public.elixir_admin_save_config(p jsonb) returns void
language plpgsql security definer set search_path = elixir, pg_temp as $$
declare v_staff elixir.staff;
begin
  v_staff := elixir.require_staff('admin');
  update elixir.config set
    earn_points_per_gbp = coalesce((p->>'earn_points_per_gbp')::numeric, earn_points_per_gbp),
    redeem_points_per_gbp = coalesce((p->>'redeem_points_per_gbp')::integer, redeem_points_per_gbp),
    tier_window_months = coalesce((p->>'tier_window_months')::integer, tier_window_months),
    code_valid_days = coalesce((p->>'code_valid_days')::integer, code_valid_days),
    agent_adjust_limit = coalesce((p->>'agent_adjust_limit')::integer, agent_adjust_limit),
    updated_at = now();
  perform elixir.log_admin(v_staff, 'config.save', p);
end $$;

-- ---------------------------------------------------------------------------
-- Grants. Supabase grants EXECUTE on new public functions to anon/authenticated
-- by default, so revoke explicitly and grant only what each caller needs.
-- ---------------------------------------------------------------------------

do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig, p.proname
           from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'elixir\_%'
  loop
    execute format('revoke all on function %s from public, anon, authenticated, service_role', f.sig);
    if f.proname in ('elixir_record_earn', 'elixir_record_reversal', 'elixir_check_code', 'elixir_consume_code') then
      execute format('grant execute on function %s to service_role', f.sig);
    else
      execute format('grant execute on function %s to authenticated', f.sig);
    end if;
  end loop;
end $$;
