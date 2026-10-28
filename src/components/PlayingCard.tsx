import type { CSSProperties } from "react";
import { type Card, SUIT_SYMBOLS, SUIT_COLORS, type Rank } from '../utils/cards';
import clsx from 'clsx';

interface PlayingCardProps {
  card: Card | null;
  faceDown?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
}

const PIP_LAYOUTS: Record<string, { top: string; left: string; rotate?: string }[]> = {
  '2': [
    { top: '18%', left: '50%' },
    { top: '82%', left: '50%', rotate: '180deg' },
  ],
  '3': [
    { top: '18%', left: '50%' },
    { top: '50%', left: '50%' },
    { top: '82%', left: '50%', rotate: '180deg' },
  ],
  '4': [
    { top: '22%', left: '28%' },
    { top: '22%', left: '72%' },
    { top: '78%', left: '28%', rotate: '180deg' },
    { top: '78%', left: '72%', rotate: '180deg' },
  ],
  '5': [
    { top: '22%', left: '28%' },
    { top: '22%', left: '72%' },
    { top: '50%', left: '50%' },
    { top: '78%', left: '28%', rotate: '180deg' },
    { top: '78%', left: '72%', rotate: '180deg' },
  ],
  '6': [
    { top: '20%', left: '28%' },
    { top: '20%', left: '72%' },
    { top: '50%', left: '28%' },
    { top: '50%', left: '72%' },
    { top: '80%', left: '28%', rotate: '180deg' },
    { top: '80%', left: '72%', rotate: '180deg' },
  ],
  '7': [
    { top: '18%', left: '28%' },
    { top: '18%', left: '72%' },
    { top: '38%', left: '50%' },
    { top: '50%', left: '28%' },
    { top: '50%', left: '72%' },
    { top: '82%', left: '28%', rotate: '180deg' },
    { top: '82%', left: '72%', rotate: '180deg' },
  ],
  '8': [
    { top: '18%', left: '28%' },
    { top: '18%', left: '72%' },
    { top: '36%', left: '50%' },
    { top: '50%', left: '28%' },
    { top: '50%', left: '72%' },
    { top: '64%', left: '50%', rotate: '180deg' },
    { top: '82%', left: '28%', rotate: '180deg' },
    { top: '82%', left: '72%', rotate: '180deg' },
  ],
  '9': [
    { top: '16%', left: '28%' },
    { top: '16%', left: '72%' },
    { top: '32%', left: '50%' },
    { top: '42%', left: '28%' },
    { top: '42%', left: '72%' },
    { top: '58%', left: '28%', rotate: '180deg' },
    { top: '58%', left: '72%', rotate: '180deg' },
    { top: '68%', left: '50%', rotate: '180deg' },
    { top: '84%', left: '28%', rotate: '180deg' },
    { top: '84%', left: '72%', rotate: '180deg' },
  ],
  '10': [
    { top: '15%', left: '28%' },
    { top: '15%', left: '72%' },
    { top: '30%', left: '50%' },
    { top: '40%', left: '28%' },
    { top: '40%', left: '72%' },
    { top: '55%', left: '50%' },
    { top: '60%', left: '28%', rotate: '180deg' },
    { top: '60%', left: '72%', rotate: '180deg' },
    { top: '70%', left: '50%', rotate: '180deg' },
    { top: '85%', left: '28%', rotate: '180deg' },
    { top: '85%', left: '72%', rotate: '180deg' },
  ],
};

export function PlayingCard({ card, faceDown = false, selected = false, onClick, className, size = 'md', style }: PlayingCardProps) {
  if (!card || faceDown) {
    return (
      <div
        className={clsx('playing-card playing-card-back', className, size, { selected })}
        onClick={onClick}
        style={{ ...style, transform: selected ? 'translateY(-12px)' : undefined }}
      />
    );
  }

  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];
  const isNumber = ['2','3','4','5','6','7','8','9','10'].includes(card.rank);
  const pips = isNumber ? PIP_LAYOUTS[card.rank] || [] : [];

  return (
    <div
      className={clsx('playing-card', color, className, size, { selected })}
      onClick={onClick}
      style={{ ...style, transform: selected ? 'translateY(-12px)' : undefined, cursor: onClick ? 'pointer' : 'default' }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div style={{ position: 'absolute', top: 4, left: 6, fontSize: '0.75em', lineHeight: 1, fontWeight: 700 }}>
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
      <div style={{ position: 'absolute', bottom: 4, right: 6, fontSize: '0.75em', lineHeight: 1, transform: 'rotate(180deg)', fontWeight: 700 }}>
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>

      {isNumber ? (
        pips.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              transform: `translate(-50%, -50%) ${p.rotate ? `rotate(${p.rotate})` : ''}`,
              fontSize: '1.1em',
              lineHeight: 1,
            }}
          >
            {symbol}
          </div>
        ))
      ) : (
        <div style={{ fontSize: card.rank === 'A' ? '2.4em' : '1.8em', fontWeight: 700 }}>{symbol}</div>
      )}
    </div>
  );
}
