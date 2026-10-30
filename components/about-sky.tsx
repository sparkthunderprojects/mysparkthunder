'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/** Deterministic star field so the server and browser draw the same sky. */
const STARS = Array.from({ length: 150 }, (_, i) => {
  const a = Math.sin((i + 1) * 12.9898) * 43758.5453;
  const b = Math.sin((i + 1) * 78.233) * 12345.6789;
  const c = Math.sin((i + 1) * 39.346) * 24634.6345;
  return {
    x: (a - Math.floor(a)) * 100,
    y: (b - Math.floor(b)) * 100,
    r: 0.6 + (c - Math.floor(c)) * 1.6,
    d: (i % 7) * 0.7,
    twinkle: i % 3 === 0,
  };
});

function Clouds({ id, seed, freq, className }: { id: string; seed: number; freq: string; className: string }) {
  return (
    <svg aria-hidden="true" className={className} preserveAspectRatio="none" viewBox="0 0 1200 600">
      <filter id={id} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves="5" seed={seed} />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.62  0 0 0 0 0.68  0 0 0 0 0.9  2.6 0 0 0 -0.95"
        />
      </filter>
      <rect width="1200" height="600" filter={`url(#${id})`} />
    </svg>
  );
}

/**
 * About section: the Sparkthunder logo materialises out of the clouds on a
 * starry night sky when the section scrolls into view. The heading and text
 * are plain HTML, so the section reads well without the animation.
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
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      aria-labelledby="about-heading"
      className={`sky relative isolate overflow-hidden ${live ? 'sky-live' : ''}`}
    >
      <div aria-hidden="true" className="sky-bg absolute inset-0 -z-10" />
      <svg aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r * 0.09}
            fill="hsl(205 100% 96%)"
            className={s.twinkle ? 'sky-twinkle' : undefined}
            style={s.twinkle ? { animationDelay: `${s.d}s` } : undefined}
            opacity={0.45 + (i % 5) * 0.11}
          />
        ))}
      </svg>
      <Clouds id="cloud-back" seed={4} freq="0.0045 0.011" className="sky-cloud sky-cloud-back absolute -inset-x-[10%] bottom-0 -z-10 h-[85%] w-[120%]" />
      <div aria-hidden="true" className="sky-flash absolute inset-0 -z-10" />

      <div className="mx-auto flex min-h-[44rem] w-full max-w-5xl flex-col items-center justify-center px-5 py-24 text-center sm:py-32">
        <div className="sky-logo-wrap w-[min(86vw,820px)]">
          <span className="sky-logo block" role="img" aria-label="Sparkthunder" />
        </div>
        <h2 id="about-heading" className="sky-copy mt-14 text-4xl font-black uppercase leading-none sm:text-6xl">
          About Sparkthunder
        </h2>
        <p className="sky-copy mt-7 max-w-2xl text-lg leading-relaxed text-bone/90 sm:text-xl sm:leading-relaxed">
          Sparkthunder makes original worlds, each with its own heroes, villains and stories. Every universe has
          its own home online, and MySparkthunder is the one account that carries you between them.
        </p>
        <Link
          href="/about"
          className="sky-copy mt-8 inline-flex text-sm font-semibold uppercase tracking-[0.18em] text-volt transition-colors hover:text-bone"
        >
          Read our story
        </Link>
      </div>

      <Clouds id="cloud-front" seed={9} freq="0.006 0.014" className="sky-cloud sky-cloud-front pointer-events-none absolute -inset-x-[10%] bottom-0 z-[1] h-[55%] w-[120%]" />
    </section>
  );
}
