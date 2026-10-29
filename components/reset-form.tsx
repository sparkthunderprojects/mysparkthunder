'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { friendlyAuthError } from '@/lib/auth-errors';
import { Button, Field, Notice, inputClass } from '@/components/ui';

/**
 * Lets a member choose a new password from the emailed reset link. The
 * Supabase client reads the link and opens a short-lived session; this
 * form then saves the new password against it.
 */
export default function ResetForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = getBrowserClient();
    // Only set state inside the callback; calling back into Supabase from
    // here can lock up its internal session handling.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) setReady(true);
    });

    // The link's token is read asynchronously. If no session appears
    // shortly after load, the link is invalid or already used.
    const timer = setTimeout(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) setReady(true);
      else setExpired(true);
    }, 2500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Choose a password with at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    const { error } = await getBrowserClient().auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(friendlyAuthError(error.message));
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push('/account');
      router.refresh();
    }, 1800);
  }

  if (done) {
    return <Notice kind="ok">Your password has been changed. Taking you to your account.</Notice>;
  }

  if (expired && !ready) {
    return (
      <div className="space-y-4">
        <Notice kind="error">This reset link is invalid or has expired. Ask for a new one.</Notice>
        <Link href="/forgot-password" className="inline-block font-semibold text-volt hover:underline">
          Send a new reset link
        </Link>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex justify-center py-6" role="status" aria-label="Checking your link">
        <Loader2 className="h-5 w-5 animate-spin text-dim" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="New password" htmlFor="password" hint="At least 8 characters.">
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm">
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
      </Field>
      {error && <Notice kind="error">{error}</Notice>}
      <Button type="submit" disabled={busy} className="w-full">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Save new password
      </Button>
    </form>
  );
}
