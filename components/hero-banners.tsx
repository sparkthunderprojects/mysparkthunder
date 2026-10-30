'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import UniverseArt from '@/components/universe-art';
import UniverseActions from '@/components/universe-actions';
import { UNIVERSES } from '@/lib/universes';
import { cn } from '@/lib/utils';

const INTERVAL = 7000;

/** Universes that have banner artwork. Until any do, every universe gets a slide with its drawn art. */
const withBanners = UNIVERSES.filter((u) => u.banner);
const SLIDES = withBanners.length > 0 ? withBanners : UNIVERSES;

/**
 * The home page hero: one full-width banner per universe that changes on its
 * own, with arrows, dots and a pause button. Every banner is in the page's
 * HTML so search engines read them all. A universe with a `banner` image
 * shows that image; otherwise its drawn key art fills the right side.
 */
export default function HeroBanners() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);
  const count = SLIDES.length;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing || hold) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => window.clearTimeout(id);
  }, [index, playing, hold, count]);

  const go = (to: number) => setIndex((to + count) % count);
  const control =
    'flex h-10 w-10 items-center justify-center rounded-full border border-bone/30 bg-ink/50 text-bone backdrop-blur transition-colors hover:border-volt hover:text-volt';

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Sparkthunder universes"
      className="relative isolate h-[calc(100svh-8.5rem)] min-h-[34rem] max-h-[50rem] w-full overflow-hidden bg-ink"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
    >
      {SLIDES.map((universe, i) => {
        const active = i === index;
        const live = universe.status === 'live' && universe.url;
        const Heading = i === 0 ? 'h1' : 'h2';
        return (
          <article
            key={universe.slug}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${universe.name}`}
            aria-hidden={!active}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000',
              active ? 'z-[2] opacity-100' : 'pointer-events-none z-[1] opacity-0',
            )}
            style={{ '--accent': universe.accent } as CSSProperties}
          >
            {universe.banner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={universe.banner}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ) : (
              <div className="absolute inset-y-0 right-0 w-full md:w-[62%]">
                <UniverseArt slug={universe.slug} />
              </div>
            )}
            {!universe.banner && (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent md:via-ink/55"
              />
            )}
            <div
              aria-hidden="true"
              className={cn(
                'absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent',
                universe.banner ? 'h-3/5 via-ink/70' : 'h-1/3',
              )}
            />
            <div
              className={cn(
                'relative z-[3] flex h-full w-full flex-col px-5 sm:px-8 lg:px-14',
                universe.banner ? 'justify-end pb-24' : 'justify-center pb-20',
              )}
            >
              <div className="max-w-xl">
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
                  <Heading className="mt-5 drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={universe.logo.src}
                      alt={universe.name}
                      width={universe.logo.width}
                      height={universe.logo.height}
                      className={cn('h-auto w-full', universe.banner ? 'max-w-[18rem] sm:max-w-sm' : 'max-w-[28rem] sm:max-w-lg')}
                    />
                  </Heading>
                ) : (
                  <Heading className="mt-5 text-6xl font-black uppercase leading-[0.88] sm:text-8xl">
                    {universe.name}
                  </Heading>
                )}
                {universe.tagline !== 'In development.' && (
                  <p className="mt-6 max-w-md text-lg leading-relaxed text-bone/85">{universe.tagline}</p>
                )}
                <UniverseActions universe={universe} />
              </div>
            </div>
          </article>
        );
      })}

      <div className="absolute inset-x-0 bottom-0 z-[4] flex items-center justify-between px-5 pb-6 sm:px-8 lg:px-14">
        <div className="flex items-center gap-2" role="group" aria-label="Choose a banner">
          {SLIDES.map((universe, i) => (
            <button
              key={universe.slug}
              type="button"
              aria-label={`Show ${universe.name}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className="group flex h-8 items-center"
            >
              <span
                className={cn(
                  'block h-[3px] rounded-full transition-all duration-500',
                  i === index ? 'w-12 bg-volt' : 'w-6 bg-bone/35 group-hover:bg-bone/70',
                )}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" aria-label="Previous banner" className={control} onClick={() => go(index - 1)}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Next banner" className={control} onClick={() => go(index + 1)}>
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={playing ? 'Pause banners' : 'Play banners'}
            className={control}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </section>
  );
}
