'use client';

import { useEffect, useRef, useState } from 'react';

/** Rising sparks, placed by a fixed formula so the server and browser draw the same ones. */
const EMBERS = Array.from({ length: 34 }, (_, i) => {
  const a = Math.sin((i + 1) * 12.9898) * 43758.5453;
  const b = Math.sin((i + 1) * 78.233) * 12345.6789;
  return {
    left: Math.round((12 + (a - Math.floor(a)) * 76) * 100) / 100,
    delay: Math.round((b - Math.floor(b)) * 9 * 100) / 100,
    duration: 7 + (i % 6) * 1.4,
    size: 1.5 + (i % 4) * 0.9,
    drift: ((i % 7) - 3) * 14,
    gold: i % 3 !== 0,
  };
});

/**
 * Opening scene for the About page. A storm sky, a lightning strike, and the
 * Sparkthunder logo materialising in the flash, with light rays, a lens
 * streak and drifting sparks. The only text is the page heading, which is
 * kept for search engines and screen readers.
 */
export default function AboutSky() {
  const ref = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setLive(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      aria-labelledby="about-heading"
      className={`sky relative isolate flex min-h-[34rem] h-[calc(100svh-8.5rem)] max-h-[56rem] items-center justify-center overflow-hidden bg-[#03060f] ${live ? 'sky-live' : ''}`}
    >
      <h1 id="about-heading" className="sr-only">
        About Sparkthunder
      </h1>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/about/night-sky.jpg" alt="" aria-hidden="true" className="sky-photo absolute inset-0 h-full w-full object-cover" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/about/storm-strike.jpg" alt="" aria-hidden="true" className="sky-strike-img absolute inset-0 h-full w-full object-cover" />
      <div aria-hidden="true" className="sky-storm absolute inset-0" />

      <div aria-hidden="true" className="sky-flash absolute inset-0" />

      <div aria-hidden="true" className="sky-streak absolute left-1/2 top-1/2" />

      <div className="relative z-[3] w-[min(88vw,980px)]">
        <span aria-hidden="true" className="sky-logo-glow absolute inset-0 block" />
        <div className="sky-logo-wrap">
          <span className="sky-logo block" role="img" aria-label="Sparkthunder" />
        </div>
      </div>

      <div aria-hidden="true" className="sky-embers absolute inset-0 z-[2] overflow-hidden">
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="sky-ember"
            style={{
              left: `${e.left}%`,
              width: e.size,
              height: e.size,
              animationDelay: `${e.delay}s`,
              animationDuration: `${e.duration}s`,
              background: e.gold ? 'hsl(42 100% 70%)' : 'hsl(205 100% 92%)',
              boxShadow: `0 0 ${e.size * 4}px ${e.gold ? 'hsl(42 100% 60%)' : 'hsl(205 100% 80%)'}`,
              ['--drift' as string]: `${e.drift}px`,
            }}
          />
        ))}
      </div>

      {/* film look: dark bars top and bottom, tight vignette */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[4] h-24 bg-gradient-to-b from-black/80 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-28 bg-gradient-to-t from-ink to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[4] bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.65)_100%)]" />
    </section>
  );
}
