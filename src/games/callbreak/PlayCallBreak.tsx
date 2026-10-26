import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayingCard } from '../../components/PlayingCard';
import {
  createInitialState,
  placeBid,
  playCard,
  getLegalMoves,
  botBid,
  botPlay,
  type CallBreakState,
} from './engine';
import { loadProfile, saveProfile, recordMatch } from '../../store/profile';
import type { Card } from '../../utils/cards';

const PLAYER_NAMES = ['You', 'North', 'East', 'West'];

export function PlayCallBreak() {
  const navigate = useNavigate();
  const [state, setState] = useState<CallBreakState>(() => createInitialState());
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [difficulty] = useState<'intermediate'>('intermediate');
  const [showResult, setShowResult] = useState(false);
  const [dealing, setDealing] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDealing(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Bot turns
  useEffect(() => {
    if (dealing) return;
    if (state.phase === 'bidding' && state.currentBidder !== 0) {
      const timer = setTimeout(() => {
        const bid = botBid(state, state.currentBidder, difficulty);
        setState(prev => placeBid(prev, state.currentBidder, bid));
      }, 700);
      return () => clearTimeout(timer);
    }
    if (state.phase === 'playing' && state.currentPlayer !== 0) {
      const timer = setTimeout(() => {
        const card = botPlay(state, state.currentPlayer, difficulty);
        if (card) setState(prev => playCard(prev, state.currentPlayer, card));
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.currentBidder, state.currentPlayer, state, dealing]);

  useEffect(() => {
    if (state.phase === 'round-end') {
      setShowResult(true);
      const profile = loadProfile();
      const playerScore = state.scores[0];
      const won = playerScore > state.scores[1] && playerScore > state.scores[2] && playerScore > state.scores[3];
      const updated = recordMatch(profile, {
        id: Date.now().toString(),
        game: 'Call Break',
        result: won ? 'win' : 'loss',
        date: new Date().toISOString(),
        score: playerScore,
      }, won ? 100 : 30);
      saveProfile(updated);
    }
  }, [state.phase]);

  const handleBid = (bid: number) => {
    setState(prev => placeBid(prev, 0, bid));
  };

  const handlePlay = () => {
    if (!selectedCard) return;
    const legal = getLegalMoves(state, 0);
    if (!legal.some(c => c.id === selectedCard.id)) return;
    setState(prev => playCard(prev, 0, selectedCard));
    setSelectedCard(null);
  };

  const playerHand = state.hands[0];
  const legalMoves = state.phase === 'playing' && state.currentPlayer === 0 ? getLegalMoves(state, 0) : [];

  const seatStyle = (pos: 'top' | 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    ...(pos === 'top' && { top: 16, left: '50%', transform: 'translateX(-50%)' }),
    ...(pos === 'left' && { left: 16, top: '50%', transform: 'translateY(-50%)' }),
    ...(pos === 'right' && { right: 16, top: '50%', transform: 'translateY(-50%)' }),
    textAlign: 'center',
    zIndex: 2,
  });

  return (
    <div style={{
      height: '100vh',
      background: 'radial-gradient(ellipse at center, #0d5c0d 0%, #063006 70%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.25)', zIndex: 10 }}>
        <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>← Leave</button>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Call Break</h2>
        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Round {state.round} • {state.phase}</div>
      </header>

      {/* Table area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Opponent seats */}
        <div style={seatStyle('top')}>
          <div style={{ fontWeight: 600 }}>{PLAYER_NAMES[1]}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Bid {state.bids[1] ?? '-'} • Tricks {state.tricksWon[1]}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <PlayingCard card={null} faceDown />
          </div>
        </div>

        <div style={seatStyle('left')}>
          <div style={{ fontWeight: 600 }}>{PLAYER_NAMES[3]}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Bid {state.bids[3] ?? '-'} • {state.tricksWon[3]}</div>
          <PlayingCard card={null} faceDown />
        </div>

        <div style={seatStyle('right')}>
          <div style={{ fontWeight: 600 }}>{PLAYER_NAMES[2]}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Bid {state.bids[2] ?? '-'} • {state.tricksWon[2]}</div>
          <PlayingCard card={null} faceDown />
        </div>

        {/* Center trick */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          gap: '1rem',
          minHeight: 120,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {state.currentTrick.length === 0 && !dealing && (
            <div style={{ opacity: 0.6, fontSize: '1.1rem' }}>Waiting for lead...</div>
          )}
          {dealing && <div style={{ opacity: 0.7 }}>Dealing cards...</div>}
          {state.currentTrick.map((play, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <PlayingCard card={play.card} />
              <div style={{ fontSize: '0.75rem', marginTop: 4 }}>{PLAYER_NAMES[play.player]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Player area fixed at bottom */}
      <div style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
        padding: '1rem 0.5rem 1.25rem',
        zIndex: 5,
      }}>
        {/* Hand */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.4rem',
          flexWrap: 'wrap',
          marginBottom: '0.75rem',
          minHeight: 120,
        }}>
          {playerHand.map((card, idx) => {
            const isLegal = legalMoves.some(c => c.id === card.id);
            const isSelected = selectedCard?.id === card.id;
            return (
              <div key={card.id} style={{ transform: `rotate(${(idx - playerHand.length / 2) * 1.5}deg)`, transition: 'transform 0.2s' }}>
                <PlayingCard
                  card={card}
                  selected={isSelected}
                  onClick={() => isLegal && setSelectedCard(isSelected ? null : card)}
                  className={!isLegal && state.phase === 'playing' ? 'opacity-40' : ''}
                />
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ textAlign: 'center', minHeight: 60 }}>
          {state.phase === 'bidding' && state.currentBidder === 0 && (
            <>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>Your bid</div>
              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {Array.from({ length: 9 }, (_, i) => i + 1).map(b => (
                  <button key={b} onClick={() => handleBid(b)} className="primary" style={{ minWidth: 40 }}>{b}</button>
                ))}
              </div>
            </>
          )}
          {state.phase === 'playing' && state.currentPlayer === 0 && (
            <button onClick={handlePlay} disabled={!selectedCard} className="primary" style={{ fontSize: '1.05rem', padding: '0.75rem 2rem' }}>
              Play Card
            </button>
          )}
          {state.phase === 'playing' && state.currentPlayer !== 0 && (
            <div style={{ opacity: 0.7 }}>{PLAYER_NAMES[state.currentPlayer]} is playing...</div>
          )}
        </div>

        {/* Your score strip */}
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.9rem', opacity: 0.9 }}>
          You • Bid {state.bids[0] ?? '-'} • Tricks {state.tricksWon[0]} • Score {state.scores[0].toFixed(1)}
        </div>
      </div>

      {showResult && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div className="card" style={{ maxWidth: 400, textAlign: 'center', background: '#1a1a1a', color: '#fff' }}>
            <h2>Round Complete</h2>
            <p>Your score this round: {state.scores[0].toFixed(1)}</p>
            <button onClick={() => {
              setState(createInitialState());
              setShowResult(false);
              setDealing(true);
              setTimeout(() => setDealing(false), 1200);
            }} className="primary">Play Again</button>
            <button onClick={() => navigate('/')} style={{ marginLeft: '1rem', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>Home</button>
          </div>
        </div>
      )}
    </div>
  );
}
