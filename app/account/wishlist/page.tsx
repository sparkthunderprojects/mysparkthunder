import type { Metadata } from 'next';
import { EmptyState, PageHeading } from '@/components/ui';
import { getWishlist } from '@/lib/shop';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Wish list' };

export default async function WishlistPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const items = await getWishlist(user.id);

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
