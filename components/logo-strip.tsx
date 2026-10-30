import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CHARACTER_LOGOS } from '@/lib/characters';

/** A slow, endless row of character logos. It pauses when hovered. */
export default function LogoStrip() {
  return (
    <section aria-labelledby="logo-strip-heading" className="w-full overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 id="logo-strip-heading" className="font-display text-4xl font-semibold uppercase leading-none sm:text-6xl">
          Where legends are made
        </h2>
        <p className="mt-7 text-lg leading-relaxed text-bone/85 sm:text-xl sm:leading-relaxed">
          Sparkthunder is home to a growing roster of heroes, villains and monsters, each with a world of
          its own. Meet them, follow their stories and keep every favourite in one account.
        </p>
        <Link
          href="/universes"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-volt transition-colors hover:text-bone"
        >
          See all universes
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="logo-strip mt-20 sm:mt-24">
        <ul className="logo-strip-track">
          {[0, 1].map((copy) =>
            CHARACTER_LOGOS.map((logo) => (
              <li key={`${copy}-${logo.name}`} className="logo-strip-item" aria-hidden={copy === 1 ? true : undefined}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.src} alt={copy === 1 ? '' : logo.name} loading="lazy" decoding="async" />
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}
