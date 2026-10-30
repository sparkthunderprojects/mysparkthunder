import type { CSSProperties } from 'react';
import UniverseArt from '@/components/universe-art';
import UniverseActions from '@/components/universe-actions';
import type { Universe } from '@/lib/universes';

/** One full-width slide of the featured universe carousel. */
export default function FeaturedSlide({
  universe,
  index,
  total,
}: {
  universe: Universe;
  index: number;
  total: number;
}) {
  const live = universe.status === 'live' && universe.url;
  return (
    <article
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}: ${universe.name}`}
      className="shrink-0 basis-full snap-start"
      style={{ '--accent': universe.accent } as CSSProperties}
    >
      <div className="frame h-full">
        <div className="frame-in grid min-h-[30rem] md:grid-cols-[1.05fr_1fr] lg:min-h-[34rem]">
          <div className="relative z-[2] flex flex-col justify-center p-8 md:p-14">
            <p className="flex items-center gap-2 text-sm font-medium">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{
                  background: live ? universe.accent : 'transparent',
                  border: `1.5px solid ${universe.accent}`,
                  boxShadow: live ? `0 0 12px ${universe.accent}` : undefined,
                }}
              />
              <span className={live ? 'text-bone' : 'text-dim'}>{live ? 'Open now' : 'In development'}</span>
            </p>
            {universe.logo ? (
              <h3 className="mt-5 drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={universe.logo.src}
                  alt={universe.name}
                  width={universe.logo.width}
                  height={universe.logo.height}
                  className="h-auto w-full max-w-md"
                />
              </h3>
            ) : (
              <h3 className="mt-5 text-6xl font-black uppercase leading-[0.88] md:text-7xl">{universe.name}</h3>
            )}
            {universe.tagline !== 'In development.' && (
              <p className="mt-5 max-w-md leading-relaxed text-bone/75">{universe.tagline}</p>
            )}
            <UniverseActions universe={universe} />
          </div>
          <div className="relative min-h-[18rem] md:min-h-0">
            <UniverseArt slug={universe.slug} />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-transparent md:bg-gradient-to-r"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
