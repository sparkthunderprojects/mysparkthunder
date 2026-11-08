'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { Button, Notice } from '@/components/ui';

type Details = { clientName: string; scopes: string[] };

const SCOPE_TEXT: Record<string, string> = {
  openid: 'Confirm who you are',
  email: 'See your email address',
  profile: 'See your name and profile picture',
  phone: 'See your phone number',
};

/** Shows which site is asking, then approves or denies through Supabase. */
export default function ConsentView({ authorizationId }: { authorizationId: string }) {
  const [details, setDetails] = useState<Details | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'approve' | 'deny' | null>(null);

  useEffect(() => {
    if (!authorizationId) {
      setError('This approval link is missing its reference. Go back to the site and try signing in again.');
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await getBrowserClient().auth.oauth.getAuthorizationDetails(authorizationId);
      if (cancelled) return;
      if (error || !data) {
        setError('This approval request has expired or is not valid. Go back to the site and try signing in again.');
        return;
      }
      // Already approved earlier: Supabase hands back the address to return to.
      if ('redirect_url' in data && data.redirect_url) {
        window.location.href = data.redirect_url;
        return;
      }
      const d = data as { client?: { name?: string }; scope?: string };
      setDetails({
        clientName: d.client?.name || 'A Sparkthunder site',
        scopes: (d.scope || 'openid email profile').split(/\s+/).filter(Boolean),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [authorizationId]);

  async function decide(kind: 'approve' | 'deny') {
    setBusy(kind);
    setError(null);
    const auth = getBrowserClient().auth.oauth;
    const { data, error } =
      kind === 'approve'
        ? await auth.approveAuthorization(authorizationId)
        : await auth.denyAuthorization(authorizationId);
    if (error || !data?.redirect_url) {
      setError('Something went wrong. Please go back to the site and try again.');
      setBusy(null);
      return;
    }
    window.location.href = data.redirect_url;
  }

  if (error) return <Notice kind="error">{error}</Notice>;
  if (!details) {
    return (
      <p className="flex items-center gap-2 text-dim">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking the request
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="leading-relaxed">
        <strong>{details.clientName}</strong> wants to sign you in with MySparkthunder. It will be able to:
      </p>
      <ul className="list-disc space-y-1 pl-5 text-dim">
        {details.scopes.map((s) => (
          <li key={s}>{SCOPE_TEXT[s] ?? s}</li>
        ))}
      </ul>
      <p className="text-sm text-dim">It will not see your password.</p>
      <div className="flex gap-3">
        <Button onClick={() => decide('approve')} disabled={busy !== null} className="flex-1">
          {busy === 'approve' && <Loader2 className="h-4 w-4 animate-spin" />}
          Approve
        </Button>
        <Button variant="secondary" onClick={() => decide('deny')} disabled={busy !== null} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}
