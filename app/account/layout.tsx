import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AccountNav from '@/components/account-nav';
import { NotConfigured } from '@/components/ui';
import { isConfigured } from '@/lib/config';
import { createServerSupabase } from '@/lib/supabase/server';

// The whole account area is private and kept out of search results.
export const metadata: Metadata = {
  title: { default: 'My account', template: '%s | MySparkthunder' },
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  if (!isConfigured) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <NotConfigured />
      </div>
    );
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <AccountNav email={user.email ?? ''} />
      <div>{children}</div>
    </div>
  );
}
