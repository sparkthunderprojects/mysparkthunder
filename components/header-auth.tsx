'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { isConfigured } from '@/lib/config';
import { buttonClass } from '@/components/ui';

/**
 * Sign in / account buttons. The server renders the signed-out version so
 * every public page stays static; once loaded, this swaps to "My account"
 * for signed-in members.
 */
export default function HeaderAuth() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!isConfigured) return;
    const supabase = getBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => setSignedIn(!!session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  if (signedIn) {
    return (
      <Link href="/account" className={buttonClass('primary', 'px-4 py-2')}>
        My account
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className={buttonClass('ghost', 'px-3 py-2')}>
        Sign in
      </Link>
      <Link href="/signup" className={buttonClass('primary', 'px-4 py-2')}>
        Create account
      </Link>
    </div>
  );
}
