'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { safeNext } from '@/lib/safe-next';
import { TERMS_VERSION } from '@/lib/terms';
import { Button, Notice } from '@/components/ui';

/**
 * First-time screen: explains what a Sparkthunder ID is, asks for the
 * Terms / Privacy agreement, and offers marketing emails as a separate,
 * unticked, optional choice. Records the answers in the account.
 */
export default function WelcomeForm({ next }: { next?: string }) {
  const [agree, setAgree] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(null);
  const target = safeNext(next) ?? '/account';

  // If another Sparkthunder site sent them here, name it (best effort).
  useEffect(() => {
    const id = new URLSearchParams(target.split('?')[1] ?? '').get('authorization_id');
    if (!target.startsWith('/oauth/consent') || !id) return;
    getBrowserClient()
      .auth.oauth.getAuthorizationDetails(id)
      .then(({ data }) => {
        const name = (data as { client?: { name?: string } } | null)?.client?.name;
        if (name) setSite(name);
      })
      .catch(() => {});
  }, [target]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) return;
    setBusy(true);
    setError(null);
    const now = new Date().toISOString();
    const { error } = await getBrowserClient().auth.updateUser({
      data: {
        terms_accepted_at: now,
        terms_version: TERMS_VERSION,
        marketing_opt_in: marketing,
        marketing_opt_in_at: marketing ? now : null,
        ...(site ? { joined_via: site } : {}),
      },
    });
    if (error) {
      setError('We could not save that. Please try again.');
      setBusy(false);
      return;
    }
    // A full page load so the new session details reach the server.
    window.location.href = target;
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {site && (
        <Notice>
          You are joining through <strong>{site}</strong>.
        </Notice>
      )}
      <p className="leading-relaxed text-dim">
        Your Sparkthunder ID is one account you can use on participating Sparkthunder sites, such as Knightverge and
        Knightverge Legacy. We keep your name and email with the account so each site can recognise you. Each site
        keeps its own saved content, such as favourites and campaigns.
      </p>

      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[hsl(var(--volt))]"
          required
        />
        <span>
          I agree to the{' '}
          <Link href="/terms" target="_blank" className="text-volt hover:underline">
            Terms of Service
          </Link>{' '}
          and acknowledge the{' '}
          <Link href="/privacy" target="_blank" className="text-volt hover:underline">
            Privacy Policy
          </Link>
          . My account can be used across participating Sparkthunder services.
        </span>
      </label>

      <label className="flex items-start gap-3 text-sm leading-relaxed text-dim">
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[hsl(var(--volt))]"
        />
        <span>Optional: send me news and updates from Sparkthunder. I can change this at any time.</span>
      </label>

      {error && <Notice kind="error">{error}</Notice>}
      <Button type="submit" disabled={!agree || busy} className="w-full">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Create my Sparkthunder ID
      </Button>
    </form>
  );
}
