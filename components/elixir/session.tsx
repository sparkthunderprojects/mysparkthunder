'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getElixirClient } from '@/lib/elixir-client';
import { api, type Staff } from '@/lib/elixir';
import { Spinner } from './ui';

interface ElixirSessionValue {
  staff: Staff;
  signOut: () => Promise<void>;
}

const Ctx = createContext<ElixirSessionValue | null>(null);

export function useAuth(): ElixirSessionValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside <ElixirSession>');
  return v;
}

type State = { kind: 'loading' } | { kind: 'denied'; email: string | null } | { kind: 'ok'; staff: Staff };

/**
 * Gate for the Elixir admin area. The middleware already sends signed-out visitors
 * to /login; this checks the signed-in person is Elixir staff (agent or admin).
 * The database enforces the same rule on every call, so this is only the friendly layer.
 */
export default function ElixirSession({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let active = true;
    const supabase = getElixirClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      if (!data.user) {
        router.replace('/login?next=/elixir');
        return;
      }
      try {
        const staff = await api.whoami();
        if (!active) return;
        setState(staff ? { kind: 'ok', staff } : { kind: 'denied', email: data.user.email ?? null });
      } catch {
        if (active) setState({ kind: 'denied', email: data.user.email ?? null });
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (state.kind === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (state.kind === 'denied') {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="panel space-y-4 p-8">
          <h1 className="text-lg font-bold">No Elixir staff access</h1>
          <p className="text-sm text-slate-500">
            {state.email ?? 'This account'} is signed in, but is not an Elixir staff member. Ask an admin to add this account.
          </p>
        </div>
      </div>
    );
  }

  const signOut = async () => {
    await getElixirClient().auth.signOut();
    router.push('/');
    router.refresh();
  };

  return <Ctx.Provider value={{ staff: state.staff, signOut }}>{children}</Ctx.Provider>;
}
