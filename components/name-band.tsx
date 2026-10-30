import type { CSSProperties } from 'react';
import { BoltMark } from '@/components/logo';
import { UNIVERSES } from '@/lib/universes';

/**
 * A still band of outlined universe names that runs the full width of the
 * page between sections. Purely decorative, so it is hidden from screen readers.
 */
export default function NameBand() {
  const run = [...UNIVERSES, ...UNIVERSES, ...UNIVERSES];
  return (
    <div aria-hidden="true" className="select-none overflow-hidden border-y border-line/60 py-5">
      <div className="flex justify-center">
        <div className="flex shrink-0 items-center gap-10 whitespace-nowrap">
          {run.map((u, i) => (
            <span key={`${u.slug}-${i}`} className="flex items-center gap-10" style={{ '--accent': u.accent } as CSSProperties}>
              <span className="band-text font-display text-6xl font-black uppercase leading-none sm:text-7xl">
                {u.name}
              </span>
              <BoltMark className="h-6 w-6 text-volt/60" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
