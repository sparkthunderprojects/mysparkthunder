'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { friendlyAuthError } from '@/lib/auth-errors';
import { Button, Field, Notice, inputClass } from '@/components/ui';

type NoticeState = { kind: 'ok' | 'error'; text: string } | null;

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    if (email.trim().toLowerCase() === currentEmail.toLowerCase()) {
      setNotice({ kind: 'error', text: 'That is already your email address.' });
      return;
    }
    setBusy(true);
    const { error } = await getBrowserClient().auth.updateUser({ email: email.trim() });
    setBusy(false);
    if (error) {
      setNotice({ kind: 'error', text: friendlyAuthError(error.message) });
      return;
    }
    setNotice({ kind: 'ok', text: 'Check your new address. We sent a link to confirm the change.' });
    setEmail('');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <Field label="New email address" htmlFor="newEmail" hint={`Currently ${currentEmail}`}>
        <input
          id="newEmail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </Field>
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <Button type="submit" variant="secondary" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Change email
      </Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    if (password.length < 8) {
      setNotice({ kind: 'error', text: 'Choose a password with at least 8 characters.' });
      return;
    }
    if (password !== confirm) {
      setNotice({ kind: 'error', text: 'The two passwords do not match.' });
      return;
    }
    setBusy(true);
    const { error } = await getBrowserClient().auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setNotice({ kind: 'error', text: friendlyAuthError(error.message) });
      return;
    }
    setNotice({ kind: 'ok', text: 'Password changed. Use it next time you sign in on any Sparkthunder site.' });
    setPassword('');
    setConfirm('');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <Field label="New password" htmlFor="newPassword" hint="At least 8 characters.">
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword">
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
      </Field>
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <Button type="submit" variant="secondary" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Change password
      </Button>
    </form>
  );
}

export function DeleteRequestForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);

  async function handleDelete() {
    setNotice(null);
    setBusy(true);
    const supabase = getBrowserClient();
    const { error } = await supabase
      .from('profiles')
      .update({ deletion_requested_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) {
      setBusy(false);
      setNotice({ kind: 'error', text: 'Your request could not be sent. Try again in a moment.' });
      return;
    }
    await supabase.auth.signOut();
    router.push('/deletion-requested');
    router.refresh();
  }

  return (
    <div className="max-w-md space-y-4">
      <p className="text-sm leading-relaxed text-dim">
        Deleting your account removes it from every Sparkthunder site, along with your favourites and reading
        history. We will remove it after your request is reviewed.
      </p>
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1 accent-[hsl(0_72%_62%)]"
        />
        I understand this removes my account from every Sparkthunder site.
      </label>
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <Button type="button" variant="danger" disabled={!confirmed || busy} onClick={handleDelete}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Request account deletion
      </Button>
    </div>
  );
}
