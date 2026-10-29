import type { CSSProperties } from 'react';
import UniverseArt from '@/components/universe-art';
import { cn } from '@/lib/utils';
import type { Universe } from '@/lib/universes';

/** A one-sheet for a universe: its own key art, title and release status. */
export default function UniversePoster({
  universe,
  heading = 'h2',
  className,
}: {
  universe: Universe;
  heading?: 'h2' | 'h3';
  className?: string;
}) {
  const live = universe.status === 'live' && universe.url;
  const Heading = heading;
  const body = (
    <div
      className={cn('poster flex h-full min-h-[26rem] flex-col justify-end p-6 sm:min-h-[30rem] lg:min-h-[38rem]', className)}
      style={{ '--accent': universe.accent } as CSSProperties}
    >
      <UniverseArt slug={universe.slug} />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-gradient-to-t from-ink via-ink/55 to-transparent"
      />
      <p className="absolute left-6 top-6 z-[2] flex items-center gap-2 text-sm font-medium">
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
      <div className="relative z-[2]">
        <Heading className="text-5xl font-black uppercase leading-[0.88] sm:text-6xl lg:text-[2.6rem]">{universe.name}</Heading>
        {universe.tagline !== 'In development.' && (
          <p className="mt-4 max-w-[22rem] text-sm leading-relaxed text-bone/75">{universe.tagline}</p>
        )}
      </div>
    </div>
  );

  return live ? (
    <a href={universe.url as string} className="group block h-full" aria-label={`Visit ${universe.name}`}>
      {body}
    </a>
  ) : (
    <div className="block h-full">{body}</div>
  );
}
