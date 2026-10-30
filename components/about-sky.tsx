'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/**
 * About section: the Sparkthunder logo materialises out of the clouds on a
 * starry night sky when the section scrolls into view. The heading and text
 * are plain HTML, so the section reads well without the animation.
 */
export default function AboutSky({ as: Heading = 'h2', showLink = true }: { as?: 'h1' | 'h2'; showLink?: boolean }) {
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/about/night-sky.jpg"
        alt=""
        aria-hidden="true"
        className="sky-photo absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(55%_60%_at_50%_60%,hsl(224_60%_6%/0.72),transparent_80%)]" />
      <div aria-hidden="true" className="sky-flash absolute inset-0 -z-10" />

      <div className="mx-auto flex min-h-[44rem] w-full max-w-5xl flex-col items-center justify-center px-5 py-24 text-center sm:py-32">
        <div className="sky-logo-wrap w-[min(86vw,820px)]">
          <span className="sky-logo block" role="img" aria-label="Sparkthunder" />
        </div>
        <Heading id="about-heading" className="sky-copy mt-14 text-4xl font-black uppercase leading-none sm:text-6xl">
          About Sparkthunder
        </Heading>
        <p className="sky-copy mt-7 max-w-2xl text-lg leading-relaxed text-bone/90 sm:text-xl sm:leading-relaxed">
          Sparkthunder makes original worlds, each with its own heroes, villains and stories. Every universe has
          its own home online, and MySparkthunder is the one account that carries you between them.
        </p>
        {showLink && (
          <Link
            href="/about"
            className="sky-copy mt-8 inline-flex text-sm font-semibold uppercase tracking-[0.18em] text-volt transition-colors hover:text-bone"
          >
            Read our story
          </Link>
        )}
      </div>

    </section>
  );
}
