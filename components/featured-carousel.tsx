'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Horizontal slides that snap into place. Every slide is in the page's HTML,
 * so search engines read them all, and swiping or scrolling works without the
 * buttons. The counter and buttons are the only script.
 */
export default function FeaturedCarousel({ count, children }: { count: number; children: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function onScroll() {
    const el = track.current;
    if (!el) return;
    setIndex(Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth))));
  }

  function go(to: number) {
    const el = track.current;
    if (!el) return;
    const next = Math.min(count - 1, Math.max(0, to));
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const buttonClass =
    'flex h-10 w-10 items-center justify-center rounded border border-bone/25 text-bone transition-colors hover:border-volt hover:text-volt disabled:opacity-30 disabled:hover:border-bone/25 disabled:hover:text-bone';

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Featured universes">
      <div
        ref={track}
        onScroll={onScroll}
        className="carousel-track flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {children}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <p className="font-display text-2xl font-extrabold" aria-live="polite">
          {pad(index + 1)}
          <span className="text-dim"> / {pad(count)}</span>
        </p>
        <div className="flex gap-2">
          <button type="button" aria-label="Previous universe" className={buttonClass} disabled={index === 0} onClick={() => go(index - 1)}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Next universe" className={buttonClass} disabled={index === count - 1} onClick={() => go(index + 1)}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
