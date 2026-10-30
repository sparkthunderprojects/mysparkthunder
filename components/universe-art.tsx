/**
 * Original key art for each universe poster, drawn in SVG so it needs no
 * image files and stays sharp at any size. Colours come from the poster's
 * --accent variable, so each poster glows in its own colour.
 */
function Stars({ count = 26, seed = 3 }: { count?: number; seed?: number }) {
  const dots = Array.from({ length: count }, (_, i) => {
    const a = Math.sin((i + 1) * 12.9898 * seed) * 43758.5453;
    const b = Math.sin((i + 1) * 78.233 * seed) * 12345.6789;
    const x = (a - Math.floor(a)) * 300;
    const y = (b - Math.floor(b)) * 260;
    const r = 0.5 + ((i * 7) % 5) * 0.28;
    return <circle key={i} cx={x} cy={y} r={r} fill="hsl(205 100% 96%)" opacity={0.35 + ((i * 3) % 6) / 12} />;
  });
  return <g>{dots}</g>;
}

function Knightverge() {
  return (
    <>
      <defs>
        <radialGradient id="kv-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="hsl(205 100% 96%)" />
          <stop offset="0.35" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Stars seed={2} />
      <circle cx="150" cy="215" r="150" fill="url(#kv-sun)" opacity="0.85" />
      <circle cx="150" cy="215" r="62" fill="hsl(45 100% 90%)" />
      {/* five-thousand-year skyline: towers, a keep and a great blade */}
      <path
        d="M0 450V330l14-6v-26l8-10 8 10v26l12 6v-34l10-14 10 14v34h14v-60l12-18 12 18v60h22V300l18-24 18 24v50h16v-44l10-12 10 12v44h14v-34l10-12 10 12v34h18v-70l12-16 12 16v70h14V450z"
        fill="hsl(226 48% 9%)"
      />
      <path d="M150 90l9 130-9 110-9-110z" fill="hsl(226 48% 9%)" />
      <path d="M126 262h48v7h-48z" fill="hsl(226 48% 9%)" />
      <path d="M150 90l3 125-3 8-3-8z" fill="var(--accent)" opacity="0.9" />
    </>
  );
}

function Legacy() {
  return (
    <>
      <defs>
        <radialGradient id="lg-glow" cx="50%" cy="48%" r="55%">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Stars seed={5} count={18} />
      <circle cx="150" cy="210" r="160" fill="url(#lg-glow)" />
      {/* a twenty-sided die, the tabletop at the heart of the Legacy */}
      <g fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinejoin="round">
        <polygon points="150,92 238,142 238,246 150,296 62,246 62,142" />
        <polygon points="150,92 238,246 62,246" opacity="0.8" />
        <polygon points="150,296 62,142 238,142" opacity="0.5" />
        <polygon points="150,142 196,220 104,220" strokeWidth="2.2" />
        <circle cx="150" cy="194" r="128" opacity="0.25" />
        <circle cx="150" cy="194" r="150" opacity="0.14" />
      </g>
      <text
        x="150"
        y="212"
        textAnchor="middle"
        fontSize="40"
        fontWeight="800"
        fill="hsl(205 100% 96%)"
        style={{ fontFamily: '"Big Shoulders Display", Impact, sans-serif' }}
      >
        20
      </text>
      <path d="M0 450V392c40-22 82-30 150-30s110 8 150 30v58z" fill="hsl(226 48% 9%)" />
    </>
  );
}

function Occult() {
  return (
    <>
      <defs>
        <radialGradient id="oc-glow" cx="50%" cy="46%" r="52%">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.6" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Stars seed={7} count={34} />
      <circle cx="150" cy="200" r="170" fill="url(#oc-glow)" />
      <g fill="none" stroke="var(--accent)" strokeWidth="1.4">
        <circle cx="150" cy="200" r="112" />
        <circle cx="150" cy="200" r="96" opacity="0.6" />
        <polygon points="150,92 243,254 57,254" />
        <polygon points="150,308 57,146 243,146" opacity="0.7" />
        {/* the watching eye */}
        <path d="M96 200c18-30 38-42 54-42s36 12 54 42c-18 30-38 42-54 42s-36-12-54-42z" strokeWidth="2" />
      </g>
      <circle cx="150" cy="200" r="19" fill="var(--accent)" />
      <circle cx="150" cy="200" r="8" fill="hsl(226 48% 9%)" />
      <circle cx="145" cy="195" r="3" fill="hsl(205 100% 96%)" />
      <path d="M0 450V400l30-20 24 14 36-30 30 20 30-26 36 28 30-18 30 22 24-14 30 18v56z" fill="hsl(226 48% 9%)" />
    </>
  );
}

function Gala() {
  return (
    <>
      <defs>
        <radialGradient id="gg-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.6" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="170" r="190" fill="url(#gg-glow)" />
      {/* a hall of tall arched windows */}
      <g fill="hsl(226 48% 9%)" stroke="var(--accent)" strokeWidth="1.2" strokeOpacity="0.55">
        <path d="M18 420V210a32 32 0 0 1 64 0v210z" />
        <path d="M118 420V190a32 32 0 0 1 64 0v230z" />
        <path d="M218 420V210a32 32 0 0 1 64 0v210z" />
      </g>
      {/* the mask, centre stage */}
      <path
        d="M70 214c20-26 52-34 80-26 28-8 60 0 80 26-6 36-30 58-80 58s-74-22-80-58z"
        fill="hsl(226 48% 9%)"
        stroke="var(--accent)"
        strokeWidth="2"
      />
      <path d="M96 218c14-8 30-6 42 6-12 10-30 10-42-6zM204 218c-14-8-30-6-42 6 12 10 30 10 42-6z" fill="var(--accent)" />
      <path d="M150 232l-8 26h16z" fill="var(--accent)" opacity="0.6" />
      <path d="M0 450V404h300v46z" fill="hsl(226 48% 9%)" />
    </>
  );
}

const ART: Record<string, () => JSX.Element> = {
  knightverge: Knightverge,
  'knightverge-legacy': Legacy,
  'occult-inc': Occult,
  'grim-gala': Gala,
};

function Fallback() {
  return (
    <>
      <circle cx="150" cy="200" r="150" fill="var(--accent)" opacity="0.18" />
      <Stars />
    </>
  );
}

export default function UniverseArt({ slug }: { slug: string }) {
  const Art = ART[slug] ?? Fallback;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 300 450"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <Art />
    </svg>
  );
}
