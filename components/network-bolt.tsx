import { UNIVERSES } from '@/lib/universes';

/**
 * The signature graphic: a bolt of lightning runs through every universe
 * in the network, and each one lights up as it passes. On small screens
 * the same list reads top to bottom along a vertical line. The graphic is
 * decorative; the universe names and links below it are real page text.
 */
export default function NetworkBolt() {
  const n = UNIVERSES.length;
  const xs = UNIVERSES.map((_, i) => ((i + 0.5) * 100) / n);
  const points: string[] = ['0,12'];
  xs.forEach((x, i) => {
    points.push(`${x},12`);
    if (i < n - 1) {
      const mid = (x + xs[i + 1]) / 2;
      points.push(`${mid - 3},3`, `${mid + 3},21`);
    }
  });
  points.push('100,12');

  return (
    <div className="relative">
      <div className="bolt-wipe pointer-events-none absolute inset-x-0 top-0 hidden h-16 md:block" aria-hidden="true">
        <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-full w-full text-volt">
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <ol
        className="relative flex flex-col gap-10 border-l border-line pl-8 md:grid md:gap-0 md:border-l-0 md:pl-0 md:pt-16"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {UNIVERSES.map((u, i) => {
          const live = u.status === 'live' && u.url;
          return (
            <li key={u.slug} className="relative md:px-4 md:text-center">
              <span
                aria-hidden="true"
                style={{ animationDelay: `${0.3 + i * 0.22}s` }}
                className={
                  'node-ignite absolute -left-[39px] top-2 h-3.5 w-3.5 rounded-full border-2 md:-top-[39px] md:left-1/2 md:-translate-x-1/2 ' +
                  (live
                    ? 'border-volt bg-volt shadow-[0_0_14px_hsl(var(--volt)/0.85)]'
                    : 'border-dim bg-ink')
                }
              />
              <h3 className="text-3xl font-extrabold leading-none">
                {live ? (
                  <a href={u.url as string} className="hover:text-volt">
                    {u.name}
                  </a>
                ) : (
                  u.name
                )}
              </h3>
              <p className={'mt-2 text-sm ' + (live ? 'text-volt' : 'text-dim')}>
                {live ? 'Open now' : 'In development'}
              </p>
              {u.tagline !== 'In development.' && (
                <p className="mt-2 text-sm leading-relaxed text-dim">{u.tagline}</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
