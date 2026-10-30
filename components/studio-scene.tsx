'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import HeroBolt from '@/components/hero-bolt';
import { ButtonLink } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  speed: number;
  phase: number;
  drift: number;
}

/** Draws the nebula once into its own canvas so every frame only repaints the stars. */
function paintNebula(width: number, height: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const g = c.getContext('2d');
  if (!g) return c;
  const clouds = [
    { x: 0.14, y: 0.3, r: 0.42, color: '110,80,230', a: 0.34 },
    { x: 0.86, y: 0.25, r: 0.4, color: '60,120,255', a: 0.3 },
    { x: 0.5, y: 0.05, r: 0.5, color: '240,180,60', a: 0.16 },
    { x: 0.08, y: 0.85, r: 0.38, color: '240,150,60', a: 0.22 },
    { x: 0.92, y: 0.8, r: 0.38, color: '150,80,220', a: 0.22 },
    { x: 0.5, y: 0.95, r: 0.5, color: '255,170,70', a: 0.14 },
  ];
  for (const cloud of clouds) {
    const radius = cloud.r * Math.max(width, height);
    const grad = g.createRadialGradient(cloud.x * width, cloud.y * height, 0, cloud.x * width, cloud.y * height, radius);
    grad.addColorStop(0, `rgba(${cloud.color},${cloud.a})`);
    grad.addColorStop(1, `rgba(${cloud.color},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, width, height);
  }
  return c;
}

/**
 * The opening scene: a drifting starfield and nebula, the Sparkthunder logo
 * struck into view by lightning, and a glowing arc beneath it. The play and
 * pause buttons stop and restart all of the motion.
 */
export default function StudioScene() {
  const [paused, setPaused] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const drawRef = useRef<(() => void) | null>(null);
  const rafRef = useRef(0);
  const startRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: Star[] = [];
    let nebula: HTMLCanvasElement | null = null;
    let width = 0;
    let height = 0;
    let time = 0;
    let last = 0;

    function resize() {
      const el = canvasRef.current;
      if (!el) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = el.clientWidth;
      height = el.clientHeight;
      el.width = width * ratio;
      el.height = height * ratio;
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
      nebula = paintNebula(width, height);
      const count = Math.round((width * height) / 5200);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() < 0.9 ? 0.4 + Math.random() * 0.8 : 1.2 + Math.random() * 1.1,
        base: 0.3 + Math.random() * 0.7,
        speed: 0.4 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        drift: 1 + Math.random() * 5,
      }));
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      if (nebula) ctx!.drawImage(nebula, 0, 0, width, height);
      for (const s of stars) {
        const x = (((s.x + time * s.drift) % width) + width) % width;
        const alpha = s.base * (0.55 + 0.45 * Math.sin(time * s.speed + s.phase));
        ctx!.fillStyle = `rgba(235,242,255,${alpha.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }
    drawRef.current = draw;

    function frame(now: number) {
      if (pausedRef.current) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      time += dt;
      draw();
      rafRef.current = requestAnimationFrame(frame);
    }
    function start() {
      last = 0;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(frame);
    }
    startRef.current = start;

    resize();
    draw();
    const onResize = () => {
      resize();
      draw();
    };
    window.addEventListener('resize', onResize);

    // People who prefer less motion get a still scene they can start themselves.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pausedRef.current = true;
      setPaused(true);
    } else {
      start();
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  function setMotion(stop: boolean) {
    pausedRef.current = stop;
    setPaused(stop);
    if (stop) {
      cancelAnimationFrame(rafRef.current);
      drawRef.current?.();
    } else {
      startRef.current?.();
    }
  }

  const control =
    'flex h-10 w-10 items-center justify-center rounded-full border border-bone/30 bg-ink/40 text-bone backdrop-blur transition-colors hover:border-volt hover:text-volt';

  return (
    <section
      className={cn(
        'scene relative isolate flex min-h-[calc(100svh-8.5rem)] flex-col items-center justify-center overflow-hidden px-5 py-16 text-center',
        paused && 'scene-paused',
      )}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 z-0 h-full w-full" />
      <HeroBolt heightClass="h-[44%]" />
      <div className="hero-flash" aria-hidden="true" />

      <div className="relative z-[4] w-full max-w-5xl">
        <h1>
          <span className="scene-logo-wrap block">
            <span className="scene-logo" role="img" aria-label="Sparkthunder" />
          </span>
          <svg
            viewBox="0 0 1000 60"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="scene-arc mx-auto mt-1 block h-10 w-[min(72vw,700px)] overflow-visible"
          >
            <defs>
              <linearGradient id="arc-line" x1="0" x2="1">
                <stop offset="0" stopColor="hsl(42 100% 62%)" stopOpacity="0" />
                <stop offset="0.5" stopColor="hsl(205 100% 97%)" />
                <stop offset="1" stopColor="hsl(42 100% 62%)" stopOpacity="0" />
              </linearGradient>
              <filter id="arc-blur" x="-10%" y="-200%" width="120%" height="500%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>
            <path d="M10 44 Q500 -8 990 44" pathLength={1} fill="none" stroke="hsl(42 100% 60%)" strokeWidth="7" filter="url(#arc-blur)" />
            <path d="M10 44 Q500 -8 990 44" pathLength={1} fill="none" stroke="url(#arc-line)" strokeWidth="2.4" />
          </svg>
          <span
            className="title-lit mt-3 block text-[clamp(2rem,5.2vw,4.4rem)] font-black uppercase leading-[0.95]"
            style={{ animationDelay: '1.7s' }}
          >
            One account. Every universe.
          </span>
        </h1>
        <div className="hero-rise" style={{ animationDelay: '2.3s' }}>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-bone/85">
            MySparkthunder is the account behind every Sparkthunder universe. Sign in once to save your
            favourites, keep your reading history and manage your details in one place.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/signup">Create your account</ButtonLink>
            <ButtonLink href="/login" variant="secondary">
              Sign in
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-[5] flex gap-2 sm:right-10">
        <button type="button" aria-label="Play the opening" aria-pressed={!paused} className={control} onClick={() => setMotion(false)}>
          <Play className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Pause the opening" aria-pressed={paused} className={control} onClick={() => setMotion(true)}>
          <Pause className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
