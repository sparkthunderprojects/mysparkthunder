import type { Metadata } from 'next';
import { FavouritesView } from '@/components/account-views';

export const metadata: Metadata = { title: 'Favourites' };

export default function Page() {
  return <FavouritesView />;
}
