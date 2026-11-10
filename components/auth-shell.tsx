'use client';

import HeroBolt from '@/components/hero-bolt';
import PopupFrame from '@/components/popup-frame';
import { usePopupMode } from '@/components/popup-mode';
import { NotConfigured } from '@/components/ui';
import { isConfigured } from '@/lib/config';

/**
 * Sign-in, sign-up and reset pages: a lit stage on the left, the form on the right. When the page is open in the
 * sign-in window another Sparkthunder site launched, it shows the compact, branded popup design instead.
 */
export default function AuthShell({
  title,
  intro,
  children,
  footer,
  popupTitle,
  popupIntro,
  popupHideHeading = false,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Heading for the popup window, if it should differ from the page heading. */
  popupTitle?: string;
  popupIntro?: string;
  /** The page draws its own heading inside the popup (the approval screen does). */
  popupHideHeading?: boolean;
}) {
  const popup = usePopupMode();
  const body = isConfigured ? children : <NotConfigured />;

  if (popup) {
    return (
      <PopupFrame title={popupTitle ?? title} intro={popupIntro ?? intro} hideHeading={popupHideHeading}>
        {body}
        {footer && <div className="mt-6 border-t border-line pt-5 text-center text-sm text-dim">{footer}</div>}
      </PopupFrame>
    );
  }

  return (
    <div className="auth-shell grid min-h-[calc(100svh-8.5rem)] lg:grid-cols-[1.1fr_1fr]">
      <div className="auth-stage hero-stage hidden items-end p-12 lg:flex" aria-hidden="true">
        <HeroBolt />
        <div className="hero-flash" />
        <p className="title-lit relative z-[4] text-7xl font-black uppercase leading-[0.88]">
          One account.
          <br />
          Every universe.
        </p>
      </div>
      <div className="auth-panel relative mx-auto flex w-full max-w-md flex-col justify-center px-5 py-14 lg:max-w-lg lg:px-14">
        <h1 className="auth-title text-5xl font-black uppercase leading-[0.92] sm:text-6xl">{title}</h1>
        {intro && <p className="mt-3 leading-relaxed text-dim">{intro}</p>}
        <div className="mt-8">{body}</div>
        {footer && <div className="mt-8 border-t border-line pt-6 text-sm text-dim">{footer}</div>}
      </div>
    </div>
  );
}
