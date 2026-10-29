import Link from 'next/link';
import { Menu } from 'lucide-react';
import Logo from '@/components/logo';
import HeaderAuth from '@/components/header-auth';

const NAV = [
  { href: '/universes', label: 'Universes' },
  { href: '/about', label: 'About' },
  { href: '/help', label: 'Help' },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-ink/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-dim hover:text-bone">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <HeaderAuth />
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
              className="absolute right-0 top-12 z-40 w-48 border border-line bg-panel p-2 shadow-xl"
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
              <Link href="/login" className="block rounded px-3 py-2 text-sm text-bone hover:bg-raised sm:hidden">
                Sign in
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
