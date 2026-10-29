import type { Metadata } from 'next';
import { EmptyState, PageHeading } from '@/components/ui';
import { getOrders } from '@/lib/shop';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Orders' };

export default async function OrdersPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const orders = await getOrders(user.id);

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
