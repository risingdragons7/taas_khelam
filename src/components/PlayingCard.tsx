import { type Card, SUIT_SYMBOLS, SUIT_COLORS } from '../utils/cards';
import clsx from 'clsx';

interface PlayingCardProps {
  card: Card | null;
  faceDown?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PlayingCard({ card, faceDown = false, selected = false, onClick, className, size = 'md' }: PlayingCardProps) {
  if (!card || faceDown) {
    return (
      <div
        className={clsx('playing-card playing-card-back', className, size, { selected })}
        onClick={onClick}
        style={{ transform: selected ? 'translateY(-12px)' : undefined }}
      />
    );
  }

  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];

  return (
    <div
      className={clsx('playing-card', color, className, size, { selected })}
      onClick={onClick}
      style={{ transform: selected ? 'translateY(-12px)' : undefined, cursor: onClick ? 'pointer' : 'default' }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div style={{ position: 'absolute', top: 4, left: 6, fontSize: '0.8em', lineHeight: 1 }}>
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
      <div style={{ fontSize: '1.8em' }}>{symbol}</div>
      <div style={{ position: 'absolute', bottom: 4, right: 6, fontSize: '0.8em', lineHeight: 1, transform: 'rotate(180deg)' }}>
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
    </div>
  );
}
