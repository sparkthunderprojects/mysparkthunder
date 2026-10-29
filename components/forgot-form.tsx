'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { friendlyAuthError } from '@/lib/auth-errors';
import { Button, Field, Notice, inputClass } from '@/components/ui';

export default function ForgotForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await getBrowserClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      setError(friendlyAuthError(error.message));
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Notice kind="ok">
        If an account exists for that email, a link to choose a new password is on its way. It can take a few
        minutes to arrive.
      </Notice>
    );
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
      {error && <Notice kind="error">{error}</Notice>}
      <Button type="submit" disabled={busy} className="w-full">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Send reset link
      </Button>
    </form>
  );
}
