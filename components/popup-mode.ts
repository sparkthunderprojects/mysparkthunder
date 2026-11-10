'use client';

import { useEffect, useState } from 'react';

/**
 * True when this page is open in the small sign-in window another Sparkthunder site launched. The root layout sets
 * data-popup on <html> before the page paints (it checks for the window name "sparkthunder-signin").
 */
export function usePopupMode(): boolean {
  const [popup, setPopup] = useState(false);
  useEffect(() => {
    setPopup(document.documentElement.getAttribute('data-popup') === 'true');
  }, []);
  return popup;
}
