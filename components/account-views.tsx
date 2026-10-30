'use client';

import Link from 'next/link';
import ProfileForm from '@/components/profile-form';
import { ChangeEmailForm, ChangePasswordForm, DeleteRequestForm } from '@/components/security-forms';
import { ButtonLink, EmptyState, PageHeading } from '@/components/ui';
import { useAccount, useAccountData } from '@/components/account-session';
import { computeBadges } from '@/lib/badges';
import { entityTypeLabel, getFavouriteGroups, getMemberships, getProfile } from '@/lib/data';
import { getOrders, getWishlist } from '@/lib/shop';
import { UNIVERSES, findUniverse, universeName } from '@/lib/universes';
import { formatDate } from '@/lib/utils';

function Loading() {
  return (
    <p className="text-dim" role="status">
      Loading
    </p>
  );
}

export function OverviewView() {
  const { user } = useAccount();
  const { data, loading } = useAccountData(async ({ supabase, user }) => {
    const [profile, memberships, favourites] = await Promise.all([
      getProfile(supabase, user.id),
      getMemberships(supabase, user.id),
      getFavouriteGroups(supabase, user.id),
    ]);
    return { profile, memberships, favourites };
  });
  if (loading || !data) return <Loading />;

  const { profile, memberships, favourites } = data;
  const name = profile?.display_name || user.email?.split('@')[0] || 'there';
  const favouriteTotal = favourites.reduce((sum, g) => sum + g.total, 0);
  const figures = [
    { label: 'Universes joined', value: String(memberships.length) },
    { label: 'Favourites saved', value: String(favouriteTotal) },
    { label: 'Member since', value: formatDate(profile?.created_at ?? user.created_at) },
  ];
  const shortcuts = [
    { href: '/account/profile', label: 'Edit your profile' },
    { href: '/account/security', label: 'Change your password or email' },
    { href: '/account/favourites', label: 'See your favourites' },
    { href: '/account/orders', label: 'See your orders' },
  ];

  const joined = new Set(memberships.map((m) => m.site));
  const badges = computeBadges({
    createdAt: profile?.created_at ?? user.created_at,
    universesJoined: memberships.length,
    favourites: favouriteTotal,
    hasAvatar: Boolean(profile?.avatar_url),
    hasName: Boolean(profile?.display_name),
  });

  return (
    <div>
      <div className="mb-8 flex items-center gap-5">
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full border border-line object-cover" />
        ) : (
          <span aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full border border-line bg-raised font-display text-4xl font-extrabold text-volt">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-4xl font-black uppercase leading-none sm:text-5xl">Welcome back, {name}</h1>
          <p className="mt-2 text-dim">Everything about your Sparkthunder account, in one place.</p>
        </div>
      </div>
      <dl className="grid gap-px border border-line bg-line sm:grid-cols-3">
        {figures.map((f) => (
          <div key={f.label} className="bg-ink p-5">
            <dd className="font-display text-4xl font-extrabold leading-none">{f.value}</dd>
            <dt className="mt-2 text-sm text-dim">{f.label}</dt>
          </div>
        ))}
      </dl>

      <section aria-labelledby="dash-universes" className="mt-12">
        <h2 id="dash-universes" className="text-3xl font-semibold">
          Your universes
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {UNIVERSES.map((u) => {
            const isIn = joined.has(u.slug);
            const live = u.status === 'live' && u.url;
            return (
              <li key={u.slug} className="rounded border border-line bg-panel/60 p-5" style={{ borderLeft: `4px solid ${u.accent}` }}>
                <h3 className="text-2xl font-bold">{u.name}</h3>
                <p className="mt-1 text-sm text-dim">
                  {isIn ? 'You are a member.' : live ? 'Sign in there with this account to join.' : 'In development.'}
                </p>
                <div className="mt-4">
                  {live ? (
                    <ButtonLink href={u.url as string} variant={isIn ? 'primary' : 'secondary'} className="px-4 py-2.5">
                      {isIn ? `Continue in ${u.name}` : `Visit ${u.name}`}
                    </ButtonLink>
                  ) : (
                    <Link href={`/universes/${u.slug}`} className="text-sm font-semibold text-volt hover:underline">
                      Get notified
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="dash-badges" className="mt-12">
        <h2 id="dash-badges" className="text-3xl font-semibold">
          Badges
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b) => (
            <li key={b.id} className={`rounded border p-4 ${b.earned ? 'border-volt/60 bg-volt/[0.06]' : 'border-line opacity-60'}`}>
              <p className="font-bold">{b.name}</p>
              <p className="mt-1 text-sm text-dim">{b.earned ? b.detail : `Locked. ${b.detail}`}</p>
            </li>
          ))}
        </ul>
      </section>

      <ul className="mt-12 divide-y divide-line border-y border-line">
        {shortcuts.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="block py-4 text-lg font-semibold hover:text-volt">
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProfileView() {
  const { user } = useAccount();
  const { data: profile, loading } = useAccountData(({ supabase, user }) => getProfile(supabase, user.id));
  if (loading) return <Loading />;

  return (
    <div>
      <PageHeading title="Profile" intro="How you appear across Sparkthunder sites." />
      <ProfileForm
        userId={user.id}
        initial={{
          displayName: profile?.display_name ?? '',
          avatarUrl: profile?.avatar_url ?? '',
          theme: profile?.theme_preference === 'light' ? 'light' : 'dark',
        }}
      />
    </div>
  );
}

export function SecurityView() {
  const { user } = useAccount();
  return (
    <div className="space-y-14">
      <PageHeading
        title="Security"
        intro="Your email and password work on every Sparkthunder site, so changes here apply everywhere."
      />
      <section aria-labelledby="password-heading" className="space-y-4">
        <h2 id="password-heading" className="text-3xl font-semibold">
          Password
        </h2>
        <ChangePasswordForm />
      </section>
      <section aria-labelledby="email-heading" className="space-y-4 border-t border-line pt-10">
        <h2 id="email-heading" className="text-3xl font-semibold">
          Email address
        </h2>
        <ChangeEmailForm currentEmail={user.email ?? ''} />
      </section>
      <section aria-labelledby="delete-heading" className="space-y-4 border-t border-line pt-10">
        <h2 id="delete-heading" className="text-3xl font-semibold">
          Delete your account
        </h2>
        <DeleteRequestForm userId={user.id} />
      </section>
    </div>
  );
}

export function UniversesView() {
  const { data: memberships, loading } = useAccountData(({ supabase, user }) => getMemberships(supabase, user.id));
  if (loading || !memberships) return <Loading />;

  return (
    <div>
      <PageHeading title="Universes" intro="The Sparkthunder universes you have signed in to." />
      {memberships.length === 0 ? (
        <EmptyState title="No universes yet" action={<ButtonLink href="/universes">See the universes</ButtonLink>}>
          Sign in on a Sparkthunder universe with this account and it will appear here.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {memberships.map((m) => {
            const universe = findUniverse(m.site);
            return (
              <li key={m.site} className="flex flex-wrap items-center justify-between gap-4 py-5">
                <div>
                  <h2 className="text-2xl font-semibold" style={universe ? { color: universe.accent } : undefined}>
                    {universeName(m.site)}
                  </h2>
                  <p className="mt-1 text-sm text-dim">
                    Joined {formatDate(m.joined_at)}. Last used {formatDate(m.last_seen_at)}.
                  </p>
                </div>
                {universe?.url && (
                  <ButtonLink href={universe.url} variant="secondary">
                    Visit {universe.name}
                  </ButtonLink>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function FavouritesView() {
  const { data: groups, loading } = useAccountData(({ supabase, user }) => getFavouriteGroups(supabase, user.id));
  if (loading || !groups) return <Loading />;

  return (
    <div>
      <PageHeading title="Favourites" intro="What you have saved, kept separately for each universe." />
      {groups.length === 0 ? (
        <EmptyState title="No favourites yet" action={<ButtonLink href="/universes">Explore the universes</ButtonLink>}>
          Favourite something in any Sparkthunder universe while you are signed in and it will be listed here.
        </EmptyState>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => {
            const universe = findUniverse(group.site);
            return (
              <section key={group.site} aria-labelledby={`fav-${group.site}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
                  <h2
                    id={`fav-${group.site}`}
                    className="text-3xl font-semibold"
                    style={universe ? { color: universe.accent } : undefined}
                  >
                    {universeName(group.site)}
                  </h2>
                  {universe?.url && (
                    <a href={universe.url} className="text-sm font-semibold text-volt hover:underline">
                      View on {universe.name}
                    </a>
                  )}
                </div>
                <ul className="mt-4 grid gap-x-10 sm:grid-cols-2">
                  {group.byType.map((t) => (
                    <li key={t.type} className="flex items-baseline justify-between border-b border-line/60 py-3">
                      <span>{entityTypeLabel(t.type)}</span>
                      <span className="font-display text-2xl font-extrabold">{t.count}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function WishlistView() {
  const { data: items, loading } = useAccountData(({ user }) => getWishlist(user.id));
  if (loading || !items) return <Loading />;

  return (
    <div>
      <PageHeading title="Wish list" intro="Products from the Sparkthunder Shop that you want to come back to." />
      {items.length === 0 ? (
        <EmptyState title="Your wish list is empty">
          Your Sparkthunder Shop wish list will appear here once the shop opens.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.id} className="flex items-baseline justify-between gap-4 py-4">
              {item.url ? (
                <a href={item.url} className="text-lg font-semibold hover:text-volt">
                  {item.name}
                </a>
              ) : (
                <span className="text-lg font-semibold">{item.name}</span>
              )}
              <span className="text-sm text-dim">Added {formatDate(item.addedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OrdersView() {
  const { data: orders, loading } = useAccountData(({ user }) => getOrders(user.id));
  if (loading || !orders) return <Loading />;

  return (
    <div>
      <PageHeading title="Orders" intro="Your orders from the Sparkthunder Shop, all in one place." />
      {orders.length === 0 ? (
        <EmptyState title="No orders yet">
          Orders you place in the Sparkthunder Shop will appear here once the shop opens.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-wrap items-baseline justify-between gap-4 py-4">
              <div>
                <p className="text-lg font-semibold">Order {order.id}</p>
                <p className="text-sm text-dim">
                  {formatDate(order.placedAt)}, {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{order.total}</p>
                <p className="text-sm text-dim">{order.status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
