/**
 * The opening strike: a bolt of lightning comes down from the top of the
 * frame, the screen flashes and a lens streak runs across the point where
 * it lands. All of it is plain SVG and CSS, so it plays without any script
 * and is only decoration (hidden from screen readers).
 */
const MAIN = 'M500 0 L476 72 L514 120 L468 198 L506 240 L460 322 L498 378 L472 440';
const BRANCHES = [
  'M514 120 L584 172 L566 232 L636 292',
  'M468 198 L398 252 L416 304 L348 366',
  'M460 322 L528 362 L508 412',
];

export default function HeroBolt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[62%]">
      <svg viewBox="250 0 500 520" preserveAspectRatio="xMidYMin meet" className="h-full w-full overflow-visible">
        <defs>
          <filter id="bolt-glow" x="-40%" y="-10%" width="180%" height="120%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        {[MAIN, ...BRANCHES].map((d, i) => (
          <g key={d} className={i === 0 ? '' : 'opacity-80'}>
            <path
              d={d}
              pathLength={1}
              fill="none"
              stroke="hsl(41 96% 58%)"
              strokeWidth={i === 0 ? 16 : 9}
              strokeLinejoin="miter"
              filter="url(#bolt-glow)"
              className={i === 0 ? 'bolt-line' : 'bolt-line bolt-line-late'}
            />
            <path
              d={d}
              pathLength={1}
              fill="none"
              stroke="hsl(205 100% 96%)"
              strokeWidth={i === 0 ? 3.2 : 1.8}
              strokeLinejoin="miter"
              className={i === 0 ? 'bolt-line' : 'bolt-line bolt-line-late'}
            />
          </g>
        ))}
      </svg>
      <div className="hero-flare" style={{ top: '84.6%' }} />
    </div>
  );
}
