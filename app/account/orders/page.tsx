import type { Metadata } from 'next';
import { OrdersView } from '@/components/account-views';

export const metadata: Metadata = { title: 'Orders' };

export default function Page() {
  return <OrdersView />;
}
