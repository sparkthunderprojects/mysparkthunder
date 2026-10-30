import { ImageResponse } from 'next/og';
import { OG_CARDS } from '@/lib/og';

export function GET(_req: Request, { params }: { params: { key: string } }) {
  const card = OG_CARDS[params.key] ?? OG_CARDS.default;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 72,
          color: '#f4efe6',
          background: `radial-gradient(circle at 78% 12%, ${card.accent}55, rgba(0,0,0,0) 60%), linear-gradient(160deg, #0b1220 0%, #161f31 55%, #070b14 100%)`,
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 6, color: card.accent, textTransform: 'uppercase' }}>
          Sparkthunder
        </div>
        <div style={{ display: 'flex', fontSize: 132, fontWeight: 900, lineHeight: 1, marginTop: 18, textTransform: 'uppercase' }}>
          {card.title}
        </div>
        <div style={{ display: 'flex', fontSize: 40, marginTop: 22, color: '#b9c0cf' }}>{card.sub}</div>
        <div style={{ display: 'flex', height: 8, width: 220, marginTop: 40, background: card.accent }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
