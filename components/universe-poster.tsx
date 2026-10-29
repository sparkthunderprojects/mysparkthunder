import type { Universe } from '@/lib/universes';

/** A tall poster tile for one universe. Each carries its own accent colour. */
export default function UniversePoster({ universe }: { universe: Universe }) {
  const live = universe.status === 'live' && universe.url;
  const body = (
    <div
      className="relative flex aspect-[3/4] flex-col justify-end overflow-hidden border border-line bg-panel p-6 transition-colors group-hover:border-bone/40"
      style={{ borderTopColor: universe.accent, borderTopWidth: 3 }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(120% 70% at 50% 0%, ${universe.accent}26, transparent 70%)`,
        }}
      />
      <div className="relative">
        <h2 className="text-4xl font-extrabold leading-[0.95] sm:text-5xl">{universe.name}</h2>
        {universe.tagline !== 'In development.' && (
          <p className="mt-3 text-sm leading-relaxed text-dim">{universe.tagline}</p>
        )}
        <p className="mt-4 flex items-center gap-2 text-sm font-medium">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full"
            style={{ background: live ? universe.accent : 'transparent', border: `1.5px solid ${universe.accent}` }}
          />
          <span className={live ? 'text-bone' : 'text-dim'}>{live ? 'Open now' : 'In development'}</span>
        </p>
      </div>
    </div>
  );

  return live ? (
    <a href={universe.url as string} className="group block" aria-label={`Visit ${universe.name}`}>
      {body}
    </a>
  ) : (
    <div className="group block">{body}</div>
  );
}
