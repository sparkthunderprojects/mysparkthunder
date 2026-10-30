'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { Button, Notice, inputClass } from '@/components/ui';

/**
 * Email sign-up. `topic` says what the person wants to hear about:
 * 'newsletter', 'shop', or a universe slug such as 'occult-inc'.
 */
export default function NotifyForm({
  topic = 'newsletter',
  button = 'Keep me posted',
  done = 'You are on the list. Thank you.',
}: {
  topic?: string;
  button?: string;
  done?: string;
}) {
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (trap) {
      setState('ok'); // a bot filled the hidden field: pretend it worked
      return;
    }
    setBusy(true);
    const { error } = await getBrowserClient()
      .from('newsletter_subscribers')
      .insert({ email: email.trim().toLowerCase(), topic });
    setBusy(false);
    // 23505 = already on the list, which is fine.
    setState(!error || error.code === '23505' ? 'ok' : 'error');
  }

  if (state === 'ok') return <Notice kind="ok">{done}</Notice>;

  return (
    <form onSubmit={submit} className="space-y-3" noValidate={false}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`notify-${topic}`} className="sr-only">
          Email address
        </label>
        <input
          id={`notify-${topic}`}
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass + ' sm:max-w-sm'}
        />
        <div aria-hidden="true" className="absolute -left-[9999px]">
          <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {button}
        </Button>
      </div>
      {state === 'error' && (
        <Notice kind="error">That did not save. Check the address and try again in a moment.</Notice>
      )}
    </form>
  );
}
