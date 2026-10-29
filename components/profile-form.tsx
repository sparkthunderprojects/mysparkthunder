'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { Button, Field, Notice, inputClass } from '@/components/ui';

export default function ProfileForm({
  userId,
  initial,
}: {
  userId: string;
  initial: { displayName: string; avatarUrl: string; theme: 'dark' | 'light' };
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [theme, setTheme] = useState<'dark' | 'light'>(initial.theme);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    setBusy(true);
    const { error } = await getBrowserClient()
      .from('profiles')
      .update({
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        theme_preference: theme,
      })
      .eq('id', userId);
    setBusy(false);
    if (error) {
      setNotice({ kind: 'error', text: 'Your profile could not be saved. Try again in a moment.' });
      return;
    }
    setNotice({ kind: 'ok', text: 'Profile saved.' });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-5">
      <Field label="Display name" htmlFor="displayName">
        <input
          id="displayName"
          type="text"
          maxLength={40}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Avatar link" htmlFor="avatarUrl" hint="The web address of an image. Leave blank for none.">
        <input
          id="avatarUrl"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className={inputClass}
        />
      </Field>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Theme</legend>
        <div className="flex gap-3">
          {(['dark', 'light'] as const).map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded border border-line px-4 py-2 text-sm has-[:checked]:border-volt has-[:checked]:text-volt"
            >
              <input
                type="radio"
                name="theme"
                value={value}
                checked={theme === value}
                onChange={() => setTheme(value)}
                className="accent-[hsl(42_94%_58%)]"
              />
              {value === 'dark' ? 'Dark' : 'Light'}
            </label>
          ))}
        </div>
        <p className="text-xs text-dim">Used on Sparkthunder sites that offer a light theme.</p>
      </fieldset>
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <Button type="submit" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Save profile
      </Button>
    </form>
  );
}
