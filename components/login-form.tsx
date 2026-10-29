'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { friendlyAuthError } from '@/lib/auth-errors';
import { Button, Field, Notice, inputClass } from '@/components/ui';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await getBrowserClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(friendlyAuthError(error.message));
      setBusy(false);
      return;
    }
    router.push('/account');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Email" htmlFor="email">
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </Field>
      {error && <Notice kind="error">{error}</Notice>}
      <Button type="submit" disabled={busy} className="w-full">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in
      </Button>
      <p className="text-sm">
        <Link href="/forgot-password" className="text-volt hover:underline">
          Forgot password
        </Link>
      </p>
    </form>
  );
}
