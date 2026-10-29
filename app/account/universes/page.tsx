import type { Metadata } from 'next';
import { UniversesView } from '@/components/account-views';

export const metadata: Metadata = { title: 'Universes' };

export default function Page() {
  return <UniversesView />;
}
