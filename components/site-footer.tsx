import Link from 'next/link';
import Logo from '@/components/logo';
import { UNIVERSES } from '@/lib/universes';

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/help', label: 'Help' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export default function SiteFooter() {
  const live = UNIVERSES.filter((u) => u.status === 'live' && u.url);
  return (
    <footer className="border-t border-line bg-gradient-to-b from-ink to-panel">
      <div className="grid gap-10 w-full px-5 sm:px-8 lg:px-14 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-dim">
            The account behind every Sparkthunder universe.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="mb-3 text-lg font-semibold">MySparkthunder</h2>
          <ul className="space-y-2 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-dim hover:text-bone">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Universes">
          <h2 className="mb-3 text-lg font-semibold">Universes</h2>
          <ul className="space-y-2 text-sm">
            {live.map((u) => (
              <li key={u.slug}>
                <a href={u.url as string} className="text-dim hover:text-bone">
                  {u.name}
                </a>
              </li>
            ))}
            <li>
              <Link href="/universes" className="text-dim hover:text-bone">
                All universes
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="w-full px-5 sm:px-8 lg:px-14 py-5 text-xs text-dim">
          &copy; {new Date().getFullYear()} Sparkthunder. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
