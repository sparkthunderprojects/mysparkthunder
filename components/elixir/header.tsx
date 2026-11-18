'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, LogOut } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';

/** The Elixir Points header, used instead of the My Sparkthunder one. */
export default function ElixirHeader() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        if (active) setEmail(data.user?.email ?? null);
      });
    return () => {
      active = false;
    };
  }, []);

  const signOut = async () => {
    await getBrowserClient().auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="border-b border-slate-200 bg-white text-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link href="/elixir" aria-label="Elixir Points home" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/elixir-logo.png" alt="Elixir Points rewards programme" className="h-20 w-auto" />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="hidden items-center gap-1.5 text-slate-500 hover:text-slate-900 sm:inline-flex">
            My Sparkthunder <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          {email && <span className="hidden text-slate-500 md:inline">{email}</span>}
          {email && (
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
