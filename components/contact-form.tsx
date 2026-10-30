'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { Button, Field, Notice, inputClass } from '@/components/ui';
import { CONTACT_EMAIL } from '@/lib/site';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [trap, setTrap] = useState('');
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (trap) {
      setState('ok');
      return;
    }
    setBusy(true);
    const { error } = await getBrowserClient()
      .from('contact_messages')
      .insert({ name: name.trim() || null, email: email.trim(), message: message.trim() });
    setBusy(false);
    setState(error ? 'error' : 'ok');
  }

  if (state === 'ok') {
    return <Notice kind="ok">Message sent. We will reply to {email || 'your email address'}.</Notice>;
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-5">
      <Field label="Your name (optional)" htmlFor="contact-name">
        <input id="contact-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" />
      </Field>
      <Field label="Email address" htmlFor="contact-email" hint="Use the email on your account so we can find it.">
        <input id="contact-email" type="email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </Field>
      <Field label="How can we help?" htmlFor="contact-message" hint="Never include your password.">
        <textarea id="contact-message" required minLength={5} maxLength={4000} rows={6} className={inputClass} value={message} onChange={(e) => setMessage(e.target.value)} />
      </Field>
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
      </div>
      {state === 'error' && (
        <Notice kind="error">
          That did not send. Try again, or email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </Notice>
      )}
      <Button type="submit" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Send message
      </Button>
    </form>
  );
}
