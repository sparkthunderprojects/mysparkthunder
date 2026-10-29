import type { Metadata } from 'next';
import AccountSession from '@/components/account-session';
import { NotConfigured } from '@/components/ui';
import { isConfigured } from '@/lib/config';

// The whole account area is private and kept out of search results.
export const metadata: Metadata = {
  title: { default: 'My account', template: '%s | MySparkthunder' },
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  if (!isConfigured) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <NotConfigured />
      </div>
    );
  }
  return <AccountSession>{children}</AccountSession>;
}
