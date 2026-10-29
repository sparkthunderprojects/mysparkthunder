'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { friendlyAuthError } from '@/lib/auth-errors';
import { SITE_SLUG } from '@/lib/site';
import { Button, Field, Notice, inputClass } from '@/components/ui';

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Choose a password with at least 8 characters.');
      return;
    }
    setBusy(true);
    const supabase = getBrowserClient();
    const displayName = name.trim();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { signup_site: SITE_SLUG, ...(displayName ? { display_name: displayName } : {}) } },
    });

    if (error) {
      setError(friendlyAuthError(error.message));
      setBusy(false);
      return;
    }
    // When email confirmation is on, an existing address comes back as a user with no identities.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError(friendlyAuthError('User already registered'));
      setBusy(false);
      return;
    }
    if (data.session && data.user) {
      if (displayName) {
        await supabase.from('profiles').update({ display_name: displayName }).eq('id', data.user.id);
      }
      router.push('/account');
      router.refresh();
      return;
    }
    setCheckEmail(true);
    setBusy(false);
  }

  if (checkEmail) {
    return <Notice kind="ok">Check your email. We sent a link to confirm your address, then you can sign in.</Notice>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Display name" htmlFor="name" hint="Optional. You can change it later.">
        <input
          id="name"
          type="text"
          autoComplete="nickname"
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </Field>
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
      <Field label="Password" htmlFor="password" hint="At least 8 characters.">
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
      {error && <Notice kind="error">{error}</Notice>}
      <Button type="submit" disabled={busy} className="w-full">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Create your account
      </Button>
      <p className="text-xs leading-relaxed text-dim">
        By creating an account you agree to the <Link href="/terms" className="text-volt hover:underline">terms of use</Link>{' '}
        and the <Link href="/privacy" className="text-volt hover:underline">privacy policy</Link>.
      </p>
    </form>
  );
}
