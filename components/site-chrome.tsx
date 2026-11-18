'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Hides the My Sparkthunder header/footer on the Elixir staff area, which has its own. */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const path = usePathname() ?? '';
  if (path === '/elixir' || path.startsWith('/elixir/')) return null;
  return <>{children}</>;
}
