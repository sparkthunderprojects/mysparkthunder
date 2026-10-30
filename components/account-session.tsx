'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import AccountNav from '@/components/account-nav';
import { getBrowserClient } from '@/lib/supabase/client';

interface Session {
  user: User;
  supabase: SupabaseClient;
}

const SessionContext = createContext<Session | null>(null);

export function useAccount(): Session {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useAccount must be used inside the account area');
  return value;
}

/** Loads a page's data once the member is known. */
export function useAccountData<T>(load: (session: Session) => Promise<T>): { data: T | null; loading: boolean } {
  const session = useAccount();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    load(session)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((error) => console.error('account data failed', error))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.user.id]);

  return { data, loading };
}

/**
 * Signed-in frame for the account area. The middleware already keeps signed-out
 * visitors out; this loads the member in the browser so the pages work the same
 * everywhere the site runs.
 */
export default function AccountSession({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabase = getBrowserClient();
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) {
        router.replace('/login');
        return;
      }
      setSession({ user: data.user, supabase });
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/login');
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (!session) {
    return (
      <div className="w-full px-5 sm:px-8 lg:px-14 py-16">
        <p className="text-dim" role="status">
          Loading your account
        </p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={session}>
      <div className="grid gap-10 w-full px-5 sm:px-8 lg:px-14 py-12 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <AccountNav email={session.user.email ?? ''} />
        <div>{children}</div>
      </div>
    </SessionContext.Provider>
  );
}
