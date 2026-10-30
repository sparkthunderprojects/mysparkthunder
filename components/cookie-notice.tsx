'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const KEY = 'mst-cookie-notice';

/** A one-line notice. The site only sets the cookies that keep you signed in. */
export default function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);
  if (!show) return null;
  function dismiss() {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
    setShow(false);
  }
  return (
    <div role="region" aria-label="Cookie notice" className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-4 sm:max-w-sm">
      <div className="rounded border border-line bg-panel p-4 text-sm shadow-xl">
        <p className="leading-relaxed text-bone/90">
          We only use the cookies that keep you signed in. No tracking, no advertising.{' '}
          <Link href="/privacy" className="text-volt hover:underline">
            Privacy
          </Link>
        </p>
        <button type="button" onClick={dismiss} className="mt-3 rounded border border-line px-3 py-1.5 font-semibold hover:border-volt hover:text-volt">
          Got it
        </button>
      </div>
    </div>
  );
}
