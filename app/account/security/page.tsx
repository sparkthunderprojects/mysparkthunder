import type { Metadata } from 'next';
import { SecurityView } from '@/components/account-views';

export const metadata: Metadata = { title: 'Security' };

export default function Page() {
  return <SecurityView />;
}
