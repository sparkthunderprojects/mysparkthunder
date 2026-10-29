import type { Metadata } from 'next';
import { WishlistView } from '@/components/account-views';

export const metadata: Metadata = { title: 'Wish list' };

export default function Page() {
  return <WishlistView />;
}
