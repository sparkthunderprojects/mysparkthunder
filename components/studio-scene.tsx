'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { ButtonLink } from '@/components/ui';

/**
 * The opening scene: the Sparkthunder logo film plays full screen behind the
 * welcome and sign-in buttons. The play and pause buttons control the film.
 */
export default function StudioScene() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // People who prefer less motion get the still frame and can start the film themselves.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      setPlaying(false);
    }
  }, []);

  function play() {
    videoRef.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }
  function pause() {
    videoRef.current?.pause();
    setPlaying(false);
  }

  const control =
    'flex h-10 w-10 items-center justify-center rounded-full border border-bone/30 bg-ink/40 text-bone backdrop-blur transition-colors hover:border-volt hover:text-volt';

  return (
    <section className="relative isolate overflow-hidden bg-ink text-center">
      <div className="relative aspect-[2/1] w-full">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/video/intro-poster.jpg"
          aria-hidden="true"
        >
          <source src="/video/intro.webm" type="video/webm" />
          <source src="/video/intro.mp4" type="video/mp4" />
        </video>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="relative z-[4] mx-auto -mt-6 w-full max-w-4xl px-5 pb-16 sm:-mt-10">
        <h1>
          <span className="sr-only">Sparkthunder. </span>
          <span className="title-lit block text-[clamp(2rem,5.2vw,4.4rem)] font-black uppercase leading-[0.95]">
            One account. Every universe.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-bone/90">
          MySparkthunder is the account behind every Sparkthunder universe. Sign in once to save your
          favourites, keep your reading history and manage your details in one place.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/signup">Create your account</ButtonLink>
          <ButtonLink href="/login" variant="secondary">
            Sign in
          </ButtonLink>
        </div>
      </div>

      <div className="absolute right-5 top-5 z-[5] flex gap-2 sm:right-10">
        <button type="button" aria-label="Play the opening" aria-pressed={playing} className={control} onClick={play}>
          <Play className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Pause the opening" aria-pressed={!playing} className={control} onClick={pause}>
          <Pause className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
