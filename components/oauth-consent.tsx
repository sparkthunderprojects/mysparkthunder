'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, Globe, Loader2, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { getProfile } from '@/lib/data';
import { usePopupMode } from '@/components/popup-mode';
import { Button, Notice } from '@/components/ui';

type Details = { clientName: string; host: string | null; scopes: string[] };
type Who = { name: string; email: string; avatar: string | null };

const SCOPE_TEXT: Record<string, string> = {
  openid: 'Confirm who you are',
  email: 'See your email address',
  profile: 'See your name and profile picture',
  phone: 'See your phone number',
};

const SCOPE_ICON: Record<string, LucideIcon> = {
  openid: BadgeCheck,
  email: Mail,
  profile: UserRound,
  phone: Phone,
};

/** Shows which site is asking, then approves or denies through Supabase. */
export default function ConsentView({ authorizationId }: { authorizationId: string }) {
  const popup = usePopupMode();
  const [details, setDetails] = useState<Details | null>(null);
  const [who, setWho] = useState<Who | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'approve' | 'deny' | null>(null);

  useEffect(() => {
    if (!authorizationId) {
      setError('This approval link is missing its reference. Go back to the site and try signing in again.');
      return;
    }
    let cancelled = false;
    (async () => {
      const supabase = getBrowserClient();
      const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
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
      const d = data as { client?: { name?: string }; scope?: string; redirect_uri?: string };
      let host: string | null = null;
      try {
        const u = d.redirect_uri ? new URL(d.redirect_uri) : null;
        if (u && (u.protocol === 'https:' || u.protocol === 'http:')) host = u.hostname;
      } catch {
        host = null;
      }
      setDetails({
        clientName: d.client?.name || 'A Sparkthunder site',
        host,
        scopes: (d.scope || 'openid email profile').split(/\s+/).filter(Boolean),
      });

      // Who is signing in, so they can see it is the right account.
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (user && !cancelled) {
        const profile = await getProfile(supabase, user.id);
        if (cancelled) return;
        const email = user.email ?? '';
        const avatar = profile?.avatar_url && /^https:\/\//i.test(profile.avatar_url) ? profile.avatar_url : null;
        setWho({ name: profile?.display_name || email.split('@')[0] || 'Your account', email, avatar });
      }
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

  // Signed in as the wrong person: sign out here, then come back to this same approval after signing in again.
  async function switchAccount() {
    await getBrowserClient().auth.signOut();
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  }

  if (error) return <Notice kind="error">{error}</Notice>;
  if (!details) {
    return (
      <p className="flex items-center justify-center gap-2 py-6 text-dim">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Checking the request
      </p>
    );
  }

  if (popup) {
    return <PopupConsent details={details} who={who} busy={busy} onDecide={decide} onSwitch={switchAccount} />;
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

/** The approval card shown in the sign-in window. Pure display: the parent supplies the details and the handlers. */
export function PopupConsent({
  details,
  who,
  busy,
  onDecide,
  onSwitch,
}: {
  details: Details;
  who: Who | null;
  busy: 'approve' | 'deny' | null;
  onDecide: (kind: 'approve' | 'deny') => void;
  onSwitch: () => void;
}) {
  const { clientName, host, scopes } = details;
  return (
    <div>
      {who && (
        <div className="flex items-center gap-3 rounded-full border border-line bg-raised/60 py-1.5 pl-1.5 pr-4">
          {who.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={who.avatar} alt="" referrerPolicy="no-referrer" className="h-9 w-9 shrink-0 rounded-full object-cover" />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-volt text-sm font-bold text-ink"
            >
              {(who.name || who.email).charAt(0).toUpperCase()}
            </span>
          )}
          <span className="min-w-0 flex-1 text-left leading-tight">
            <span className="block truncate text-sm font-semibold">{who.name}</span>
            {who.email && <span className="block truncate text-xs text-dim">{who.email}</span>}
          </span>
          <button
            type="button"
            onClick={onSwitch}
            disabled={busy !== null}
            className="shrink-0 text-xs font-semibold text-volt hover:underline disabled:opacity-60"
          >
            Switch
          </button>
        </div>
      )}

      <h1 className="mt-6 text-center font-sans text-xl font-semibold normal-case leading-snug tracking-normal">
        <span className="text-volt">{clientName}</span> wants to access your MySparkthunder account
      </h1>
      {host && (
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-dim">
          <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          {host}
        </p>
      )}

      <div className="mt-6 rounded-lg border border-line bg-raised/40 p-4">
        <p className="text-sm font-semibold">This will allow {clientName} to:</p>
        <ul className="mt-3 space-y-3">
          {scopes.map((s) => {
            const Icon = SCOPE_ICON[s] ?? BadgeCheck;
            return (
              <li key={s} className="flex items-center gap-3 text-sm">
                <Icon className="h-5 w-5 shrink-0 text-volt" aria-hidden="true" />
                <span>{SCOPE_TEXT[s] ?? s}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-4 flex items-start gap-2.5 text-xs leading-relaxed text-dim">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
        <span>
          Your password is never shared with {clientName}. Only continue if you trust this site. You can read how
          Sparkthunder handles your details in our{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-volt hover:underline">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-volt hover:underline">
            Terms
          </a>
          .
        </span>
      </p>

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={() => onDecide('deny')} disabled={busy !== null} className="flex-1">
          {busy === 'deny' && <Loader2 className="h-4 w-4 animate-spin" />}
          Cancel
        </Button>
        <Button onClick={() => onDecide('approve')} disabled={busy !== null} className="flex-1">
          {busy === 'approve' && <Loader2 className="h-4 w-4 animate-spin" />}
          Allow
        </Button>
      </div>
    </div>
  );
}
