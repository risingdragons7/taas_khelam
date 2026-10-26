import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayingCard } from '../../components/PlayingCard';
import { createInitialState, placeBid, playCard, getLegalMoves, botBid, botPlay, type CallBreakState } from './engine';
import { loadProfile, saveProfile, recordMatch } from '../../store/profile';
import type { Card } from '../../utils/cards';

const PLAYER_NAMES = ['You', 'North', 'East', 'West'];

function CardFan({ count = 10, vertical = false }: { count?: number; vertical?: boolean }) {
  const n = Math.min(count, 13);
  return (
    <div style={{ position: 'relative', width: vertical ? 120 : n * 18 + 50, height: vertical ? n * 10 + 60 : 160, margin: '0 auto' }}>
      {Array.from({ length: n }).map((_, i) => {
        const off = i - n / 2;
        return (
          <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${vertical ? 0 : off * 14}px, ${vertical ? off * 10 : 0}px) rotate(${off * (vertical ? 1.8 : 1.4)}deg)`, zIndex: i }}>
            <PlayingCard card={null} faceDown />
          </div>
        );
      })}
    </div>
  );
}

export function PlayCallBreak() {
  const navigate = useNavigate();
  const [state, setState] = useState<CallBreakState>(() => createInitialState());
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [difficulty] = useState<'intermediate'>('intermediate');
  const [showResult, setShowResult] = useState(false);
  const [dealing, setDealing] = useState(true);

  useEffect(() => { const t = setTimeout(() => setDealing(false), 900); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (dealing) return;
    if (state.phase === 'bidding' && state.currentBidder !== 0) {
      const timer = setTimeout(() => setState(prev => placeBid(prev, state.currentBidder, botBid(state, state.currentBidder, difficulty))), 550);
      return () => clearTimeout(timer);
    }
    if (state.phase === 'playing' && state.currentPlayer !== 0) {
      const timer = setTimeout(() => { const c = botPlay(state, state.currentPlayer, difficulty); if (c) setState(prev => playCard(prev, state.currentPlayer, c)); }, 750);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.currentBidder, state.currentPlayer, state, dealing]);

  useEffect(() => {
    if (state.phase === 'round-end') {
      setShowResult(true);
      const profile = loadProfile();
      const ps = state.scores[0];
      const won = ps > state.scores[1] && ps > state.scores[2] && ps > state.scores[3];
      saveProfile(recordMatch(profile, { id: Date.now().toString(), game: 'Call Break', result: won ? 'win' : 'loss', date: new Date().toISOString(), score: ps }, won ? 100 : 30));
    }
  }, [state.phase]);

  const handleBid = (bid: number) => setState(prev => placeBid(prev, 0, bid));
  const handlePlay = () => {
    if (!selectedCard) return;
    if (!getLegalMoves(state, 0).some(c => c.id === selectedCard.id)) return;
    setState(prev => playCard(prev, 0, selectedCard));
    setSelectedCard(null);
  };

  const playerHand = state.hands[0];
  const legalMoves = state.phase === 'playing' && state.currentPlayer === 0 ? getLegalMoves(state, 0) : [];

  return (
    <div style={{ height: '100vh', background: 'radial-gradient(ellipse at center, #1a7a1a 0%, #0a4a0a 65%, #052805 100%)', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 1rem', background: 'rgba(0,0,0,0.15)', zIndex: 10 }}>
        <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: 8 }}>← Leave</button>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Call Break</h2>
        <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>R{state.round} • {state.phase}</div>
      </header>

      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 2 }}>
          <CardFan count={state.hands[1]?.length ?? 13} />
          <div style={{ marginTop: 2, background: 'rgba(0,0,0,0.45)', borderRadius: 8, padding: '2px 10px', display: 'inline-block', fontSize: '0.8rem' }}>
            <b>{PLAYER_NAMES[1]}</b> • Bid {state.bids[1] ?? '-'} • {state.tricksWon[1]}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 4, top: '38%', transform: 'translateY(-50%)', textAlign: 'center', zIndex: 2 }}>
          <CardFan count={state.hands[3]?.length ?? 13} vertical />
          <div style={{ marginTop: 2, background: 'rgba(0,0,0,0.45)', borderRadius: 8, padding: '2px 8px', fontSize: '0.75rem' }}>
            <b>{PLAYER_NAMES[3]}</b><br/>Bid {state.bids[3] ?? '-'} • {state.tricksWon[3]}
          </div>
        </div>

        <div style={{ position: 'absolute', right: 4, top: '38%', transform: 'translateY(-50%)', textAlign: 'center', zIndex: 2 }}>
          <CardFan count={state.hands[2]?.length ?? 13} vertical />
          <div style={{ marginTop: 2, background: 'rgba(0,0,0,0.45)', borderRadius: 8, padding: '2px 8px', fontSize: '0.75rem' }}>
            <b>{PLAYER_NAMES[2]}</b><br/>Bid {state.bids[2] ?? '-'} • {state.tricksWon[2]}
          </div>
        </div>

        <div style={{ position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {dealing && <div style={{ opacity: 0.65 }}>Dealing...</div>}
          {!dealing && state.currentTrick.length === 0 && <div style={{ opacity: 0.45 }}>Waiting for lead</div>}
          {state.currentTrick.map((p, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <PlayingCard card={p.card} />
              <div style={{ fontSize: '0.7rem', marginTop: 2 }}>{PLAYER_NAMES[p.player]}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ paddingBottom: 10, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', zIndex: 5 }}>
        <div style={{ position: 'relative', height: 220, display: 'flex', justifyContent: 'center' }}>
          {playerHand.map((card, idx) => {
            const isLegal = legalMoves.some(c => c.id === card.id);
            const sel = selectedCard?.id === card.id;
            const mid = (playerHand.length - 1) / 2;
            const off = idx - mid;
            return (
              <div key={card.id} style={{ position: 'absolute', left: '50%', bottom: sel ? 28 : 0, transform: `translateX(calc(-50% + ${off * 52}px)) rotate(${off * 1.2}deg)`, zIndex: sel ? 30 : idx, transition: 'all 0.12s', cursor: isLegal ? 'pointer' : 'default' }} onClick={() => isLegal && setSelectedCard(sel ? null : card)}>
                <PlayingCard card={card} selected={sel} className={!isLegal && state.phase === 'playing' ? 'opacity-40' : ''} />
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', minHeight: 50, marginTop: 4 }}>
          {state.phase === 'bidding' && state.currentBidder === 0 && (
            <div>
              <div style={{ marginBottom: 4, fontWeight: 600, fontSize: '0.9rem' }}>Your bid</div>
              <div style={{ display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap' }}>
                {Array.from({ length: 9 }, (_, i) => i + 1).map(b => <button key={b} onClick={() => handleBid(b)} className="primary" style={{ minWidth: 34, padding: '0.35rem 0.5rem' }}>{b}</button>)}
              </div>
            </div>
          )}
          {state.phase === 'playing' && state.currentPlayer === 0 && <button onClick={handlePlay} disabled={!selectedCard} className="primary">Play Card</button>}
          {state.phase === 'playing' && state.currentPlayer !== 0 && <div style={{ opacity: 0.65 }}>{PLAYER_NAMES[state.currentPlayer]} playing...</div>}
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.85, marginTop: 2 }}>You • Bid {state.bids[0] ?? '-'} • Tricks {state.tricksWon[0]} • Score {state.scores[0].toFixed(1)}</div>
      </div>

      {showResult && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card" style={{ maxWidth: 360, textAlign: 'center', background: '#1a1a1a', color: '#fff' }}>
            <h2>Round Complete</h2>
            <p>Score: {state.scores[0].toFixed(1)}</p>
            <button onClick={() => { setState(createInitialState()); setShowResult(false); setDealing(true); setTimeout(() => setDealing(false), 900); }} className="primary">Play Again</button>
            <button onClick={() => navigate('/')} style={{ marginLeft: 10, background: 'rgba(255,255,255,0.1)', color: '#fff' }}>Home</button>
          </div>
        </div>
      )}
    </div>
  );
}
