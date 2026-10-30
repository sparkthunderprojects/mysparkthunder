import { CHARACTER_LOGOS } from '@/lib/characters';

/** A slow, endless row of character logos. It pauses when hovered. */
export default function LogoStrip() {
  return (
    <section aria-labelledby="logo-strip-heading" className="w-full overflow-hidden py-16 sm:py-20">
      <div className="px-5 text-center sm:px-8">
        <h2 id="logo-strip-heading" className="text-3xl font-black uppercase leading-none sm:text-5xl">
          Heroes, villains and legends
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-dim">
          The characters and stories that live across the Sparkthunder universes.
        </p>
      </div>

      <div className="logo-strip mt-12">
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
