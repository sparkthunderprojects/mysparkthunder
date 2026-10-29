'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getBrowserClient } from '@/lib/supabase/client';

const ITEMS = [
  { href: '/account', label: 'Overview' },
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/security', label: 'Security' },
  { href: '/account/universes', label: 'Universes' },
  { href: '/account/favourites', label: 'Favourites' },
  { href: '/account/wishlist', label: 'Wish list' },
  { href: '/account/orders', label: 'Orders' },
];

export default function AccountNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await getBrowserClient().auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <aside>
      <p className="mb-4 truncate text-sm text-dim" title={email}>
        {email}
      </p>
      <nav aria-label="Account" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {ITEMS.map((item) => {
          const active = item.href === '/account' ? pathname === '/account' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'whitespace-nowrap rounded px-3 py-2 text-sm font-medium',
                active ? 'bg-raised text-volt' : 'text-dim hover:bg-raised hover:text-bone',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={signOut}
        className="mt-4 rounded px-3 py-2 text-sm font-medium text-dim hover:bg-raised hover:text-bone"
      >
        Sign out
      </button>
    </aside>
  );
}
