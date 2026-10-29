import Link from 'next/link';
import { PageHeading } from '@/components/ui';
import { getFavouriteGroups, getMemberships, getProfile } from '@/lib/data';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

export default async function AccountOverviewPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile, memberships, favourites] = await Promise.all([
    getProfile(supabase, user.id),
    getMemberships(supabase, user.id),
    getFavouriteGroups(supabase, user.id),
  ]);

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

  return (
    <div>
      <PageHeading title={`Welcome back, ${name}`} intro="Everything about your Sparkthunder account, in one place." />
      <dl className="grid gap-px border border-line bg-line sm:grid-cols-3">
        {figures.map((f) => (
          <div key={f.label} className="bg-ink p-5">
            <dd className="font-display text-4xl font-extrabold leading-none">{f.value}</dd>
            <dt className="mt-2 text-sm text-dim">{f.label}</dt>
          </div>
        ))}
      </dl>
      <ul className="mt-10 divide-y divide-line border-y border-line">
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
