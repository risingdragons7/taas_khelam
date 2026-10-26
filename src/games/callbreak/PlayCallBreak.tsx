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

const PLAYER_NAMES = ['You', 'Bot North', 'Bot East', 'Bot West'];

export function PlayCallBreak() {
  const navigate = useNavigate();
  const [state, setState] = useState<CallBreakState>(() => createInitialState());
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [difficulty] = useState<'intermediate'>('intermediate');
  const [showResult, setShowResult] = useState(false);

  // Bot turns
  useEffect(() => {
    if (state.phase === 'bidding' && state.currentBidder !== 0) {
      const timer = setTimeout(() => {
        const bid = botBid(state, state.currentBidder, difficulty);
        setState(prev => placeBid(prev, state.currentBidder, bid));
      }, 800);
      return () => clearTimeout(timer);
    }
    if (state.phase === 'playing' && state.currentPlayer !== 0) {
      const timer = setTimeout(() => {
        const card = botPlay(state, state.currentPlayer, difficulty);
        if (card) setState(prev => playCard(prev, state.currentPlayer, card));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.currentBidder, state.currentPlayer, state]);

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--table)', padding: '1rem', color: 'var(--text)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button onClick={() => navigate('/')}>← Leave</button>
        <h2>Call Break</h2>
        <div>Round {state.round} • Phase: {state.phase}</div>
      </header>

      {/* Scores */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem' }}>
        {PLAYER_NAMES.map((name, i) => (
          <div key={i} style={{ textAlign: 'center', opacity: state.currentPlayer === i ? 1 : 0.7 }}>
            <div>{name}</div>
            <div style={{ fontWeight: 'bold' }}>Bid: {state.bids[i] ?? '-'}</div>
            <div>Tricks: {state.tricksWon[i]}</div>
            <div>Score: {state.scores[i].toFixed(1)}</div>
          </div>
        ))}
      </div>

      {/* Current Trick */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', minHeight: 120, margin: '2rem 0' }}>
        {state.currentTrick.map((play, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <PlayingCard card={play.card} />
            <small>{PLAYER_NAMES[play.player]}</small>
          </div>
        ))}
        {state.currentTrick.length === 0 && <div style={{ color: 'var(--textMuted)' }}>Waiting for lead...</div>}
      </div>

      {/* Player Hand */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {playerHand.map(card => {
          const isLegal = legalMoves.some(c => c.id === card.id);
          const isSelected = selectedCard?.id === card.id;
          return (
            <PlayingCard
              key={card.id}
              card={card}
              selected={isSelected}
              onClick={() => isLegal && setSelectedCard(isSelected ? null : card)}
              className={!isLegal && state.phase === 'playing' ? 'opacity-40' : ''}
            />
          );
        })}
      </div>

      {/* Actions */}
      {state.phase === 'bidding' && state.currentBidder === 0 && (
        <div style={{ textAlign: 'center' }}>
          <p>Your bid (number of tricks):</p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {Array.from({ length: 9 }, (_, i) => i + 1).map(b => (
              <button key={b} onClick={() => handleBid(b)} className="primary">{b}</button>
            ))}
          </div>
        </div>
      )}

      {state.phase === 'playing' && state.currentPlayer === 0 && (
        <div style={{ textAlign: 'center' }}>
          <button onClick={handlePlay} disabled={!selectedCard} className="primary">
            Play Selected Card
          </button>
          {legalMoves.length > 0 && <p style={{ color: 'var(--textMuted)' }}>Must follow suit if possible</p>}
        </div>
      )}

      {showResult && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div className="card" style={{ maxWidth: 400, textAlign: 'center' }}>
            <h2>Round Complete</h2>
            <p>Your score this round: {state.scores[0].toFixed(1)}</p>
            <button onClick={() => {
              setState(createInitialState());
              setShowResult(false);
            }} className="primary">Play Again</button>
            <button onClick={() => navigate('/')} style={{ marginLeft: '1rem' }}>Home</button>
          </div>
        </div>
      )}
    </div>
  );
}
