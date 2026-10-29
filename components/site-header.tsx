import Link from 'next/link';
import { Menu } from 'lucide-react';
import Logo from '@/components/logo';
import HeaderAuth from '@/components/header-auth';

const NAV = [
  { href: '/universes', label: 'Universes' },
  { href: '/about', label: 'About' },
  { href: '/help', label: 'Help' },
];

/** The logo sits in the middle, with the menu on a line of its own underneath. */
export default function SiteHeader() {
  return (
    <header className="relative z-40 border-b border-line/60 bg-ink/70 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-24">
          <div className="flex items-center justify-start">
            {/* Menu for small screens: native details element, no script needed. */}
            <details className="group relative md:hidden">
              <summary
                aria-label="Menu"
                className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded border border-line text-bone [&::-webkit-details-marker]:hidden"
              >
                <Menu className="h-5 w-5" />
              </summary>
              <nav
                aria-label="Main"
                className="absolute left-0 top-12 z-40 w-52 border border-line bg-panel p-2 shadow-xl"
              >
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded px-3 py-2 text-sm text-bone hover:bg-raised"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link href="/signup" className="block rounded px-3 py-2 text-sm text-volt hover:bg-raised">
                  Create account
                </Link>
              </nav>
            </details>
          </div>
          <Logo imgClassName="h-7 sm:h-8 md:h-11" />
          <div className="flex items-center justify-end">
            <HeaderAuth />
          </div>
        </div>
        <nav
          aria-label="Main"
          className="hidden items-center justify-center gap-10 border-t border-line/40 py-3 md:flex"
        >
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-dim hover:text-bone">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
