import Link from 'next/link';
import { UNIVERSES } from '@/lib/universes';

/** The Sparkthunder network as a constellation: one centre, every universe around it. */
export default function UniverseMap() {
  const W = 1000;
  const H = 520;
  const cx = W / 2;
  const cy = H / 2;
  const n = UNIVERSES.length;
  const nodes = UNIVERSES.map((u, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n + Math.PI / n;
    return { u, x: cx + Math.cos(angle) * 360, y: cy + Math.sin(angle) * 175 };
  });
  return (
    <section aria-labelledby="map-heading" className="mt-20">
      <h2 id="map-heading" className="text-4xl font-black uppercase leading-none sm:text-5xl">
        How the universes connect
      </h2>
      <p className="mt-3 max-w-prose text-dim">
        Every universe is its own world. Your account is the one thread that runs through all of them.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Sparkthunder at the centre with each universe around it" className="mt-6 h-auto w-full max-w-5xl">
        {nodes.map(({ u, x, y }) => (
          <line key={u.slug} x1={cx} y1={cy} x2={x} y2={y} stroke={u.accent} strokeOpacity={0.45} strokeWidth={1.5} strokeDasharray={u.status === 'live' ? undefined : '5 6'} />
        ))}
        <circle cx={cx} cy={cy} r={62} fill="hsl(var(--panel))" stroke="hsl(var(--volt))" strokeWidth={2} />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="hsl(var(--bone))" fontSize={17} fontWeight={800}>
          Spark
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="hsl(var(--bone))" fontSize={17} fontWeight={800}>
          thunder
        </text>
        {nodes.map(({ u, x, y }) => (
          <Link key={u.slug} href={`/universes/${u.slug}`}>
            <g className="cursor-pointer">
              <title>{u.name}</title>
              <circle cx={x} cy={y} r={14} fill={u.status === 'live' ? u.accent : 'hsl(var(--ink))'} stroke={u.accent} strokeWidth={2.5} />
              <text x={x} y={y + 40} textAnchor="middle" fill="hsl(var(--bone))" fontSize={20} fontWeight={700}>
                {u.name}
              </text>
              <text x={x} y={y + 60} textAnchor="middle" fill="hsl(var(--dim))" fontSize={14}>
                {u.status === 'live' ? 'Open now' : 'In development'}
              </text>
            </g>
          </Link>
        ))}
      </svg>
    </section>
  );
}
