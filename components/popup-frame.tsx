'use client';

import { Lock } from 'lucide-react';

/**
 * The look of the sign-in window: the Sparkthunder logo, a "secure sign-in" line that names the real address, and one
 * clean card. Used for sign-in, approval and every page the window may pass through.
 */
export default function PopupFrame({
  title,
  intro,
  hideHeading = false,
  children,
}: {
  title: string;
  intro?: string;
  /** The page supplies its own heading (the approval screen does). */
  hideHeading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="popup-bg flex min-h-svh flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[26rem]">
        <div className="rounded-xl border border-line bg-panel/95 p-7 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)] sm:p-8">
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sparkthunder-logo.png"
              alt="Sparkthunder"
              width={960}
              height={160}
              className="h-9 w-auto drop-shadow-[0_0_14px_hsl(var(--volt)/0.25)]"
            />
            <p className="mt-3 flex items-center gap-1.5 text-xs text-dim">
              <Lock className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
              Secure sign-in <span aria-hidden="true">&middot;</span> mysparkthunder.com
            </p>
          </div>
          {!hideHeading && (
            <div className="mt-7 text-center">
              <h1 className="font-sans text-2xl font-semibold normal-case leading-tight tracking-normal">{title}</h1>
              {intro && <p className="mt-2 text-sm leading-relaxed text-dim">{intro}</p>}
            </div>
          )}
          <div className={hideHeading ? 'mt-6' : 'mt-7'}>{children}</div>
        </div>
        <nav aria-label="Legal" className="mt-5 flex justify-center gap-5 text-xs text-dim">
          {[
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms', label: 'Terms' },
            { href: '/help', label: 'Help' },
          ].map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-bone">
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
