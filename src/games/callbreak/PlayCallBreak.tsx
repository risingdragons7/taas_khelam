import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayingCard } from '../../components/PlayingCard';
import { createInitialState, placeBid, playCard, getLegalMoves, botBid, botPlay, type CallBreakState } from './engine';
import { loadProfile, saveProfile, recordMatch, loadSettings, updateUsername } from '../../store/profile';
import type { Card } from '../../utils/cards';

const BOT_NAMES = ['Charlie', 'Marie', 'Jim'];
const BOT_MASCOTS = ['🤖', '👩', '👨'];
const GAME_STATE_KEY = 'cardverse-callbreak-state';
const PLAY_MODE_KEY = 'cardverse-play-mode';
const SOUND_KEY = 'cardverse-sounds';

function playSound(type: 'deal' | 'play' | 'bid' | 'win') {
  if (localStorage.getItem(SOUND_KEY) === 'false') return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === 'deal' ? 400 : type === 'play' ? 600 : type === 'bid' ? 500 : 800;
    gain.gain.value = 0.1;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

function CardFan({ count = 10, vertical = false }: { count?: number; vertical?: boolean }) {
  const n = Math.min(count, 13);
  return (
    <div style={{ position: 'relative', width: vertical ? 140 : n * 20 + 60, height: vertical ? n * 12 + 70 : 180, margin: '0 auto' }}>
      {Array.from({ length: n }).map((_, i) => {
        const off = i - n / 2;
        return (
          <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${vertical ? 0 : off * 16}px, ${vertical ? off * 12 : 0}px) rotate(${off * (vertical ? 1.6 : 1.2)}deg)`, zIndex: i }}>
            <PlayingCard card={null} faceDown />
          </div>
        );
      })}
    </div>
  );
}

export function PlayCallBreak() {
  const navigate = useNavigate();
  const profile = loadProfile();
  const settings = loadSettings();
  const playerName = profile.username || 'You';
  const PLAYER_NAMES = [playerName, BOT_NAMES[0], BOT_NAMES[1], BOT_NAMES[2]];
  const MASCOTS = [profile.avatar || '👤', BOT_MASCOTS[0], BOT_MASCOTS[1], BOT_MASCOTS[2]];

  const [state, setState] = useState<CallBreakState>(() => {
    try {
      const saved = localStorage.getItem(GAME_STATE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return createInitialState();
  });
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [difficulty] = useState(settings.difficulty);
  const [showResult, setShowResult] = useState(false);
  const [dealing, setDealing] = useState(true);
  const [playMode, setPlayMode] = useState<'click' | 'dblclick' | 'drag'>('click');
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const [dragging, setDragging] = useState<Card | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [lastTrick, setLastTrick] = useState<{ cards: Card[]; winner: number } | null>(null);
  const [showLastTrick, setShowLastTrick] = useState(false);
  const [trickMessage, setTrickMessage] = useState('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  useEffect(() => {
    const mode = localStorage.getItem(PLAY_MODE_KEY);
    if (mode === 'click' || mode === 'dblclick' || mode === 'drag') setPlayMode(mode);
    if (!profile.username || profile.username === 'Player') setShowProfileSetup(true);

    const saved = localStorage.getItem(GAME_STATE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.phase && parsed.phase !== 'round-end' && parsed.phase !== 'game-end') {
          setShowRefreshConfirm(true);
          setDealing(false);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (showRefreshConfirm || showProfileSetup) return;
    const t = setTimeout(() => {
      setDealing(false);
      playSound('deal');
    }, 1800);
    return () => clearTimeout(t);
  }, [showRefreshConfirm, showProfileSetup]);

  useEffect(() => {
    if (dealing || showRefreshConfirm || showProfileSetup) return;
    if (state.phase === 'bidding' && state.currentBidder !== 0) {
      const timer = setTimeout(() => {
        const bid = botBid(state, state.currentBidder, difficulty);
        setState(prev => placeBid(prev, state.currentBidder, bid));
        playSound('bid');
      }, 900);
      return () => clearTimeout(timer);
    }
    if (state.phase === 'playing' && state.currentPlayer !== 0) {
      const timer = setTimeout(() => {
        const c = botPlay(state, state.currentPlayer, difficulty);
        if (c) {
          setState(prev => playCard(prev, state.currentPlayer, c));
          playSound('play');
        }
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.currentBidder, state.currentPlayer, state, dealing, showRefreshConfirm, showProfileSetup, difficulty]);

  useEffect(() => {
    if (state.tricks.length > 0) {
      const last = state.tricks[state.tricks.length - 1];
      setLastTrick(last);
      setTrickMessage(`${PLAYER_NAMES[last.winner]} takes the trick!`);
      const t = setTimeout(() => setTrickMessage(''), 1800);
      return () => clearTimeout(t);
    }
  }, [state.tricks.length]);

  useEffect(() => {
    if (state.phase === 'round-end') {
      setShowResult(true);
      playSound('win');
      const p = loadProfile();
      const ps = state.scores[0];
      const won = ps > state.scores[1] && ps > state.scores[2] && ps > state.scores[3];
      saveProfile(recordMatch(p, { id: Date.now().toString(), game: 'Call Break', result: won ? 'win' : 'loss', date: new Date().toISOString(), score: ps }, won ? settings.winningAmount : 20));
    }
  }, [state.phase]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.phase !== 'round-end' && state.phase !== 'game-end') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.phase]);

  const handleBid = (bid: number) => {
    setState(prev => placeBid(prev, 0, bid));
    playSound('bid');
  };

  const doPlay = useCallback((card: Card) => {
    if (!getLegalMoves(state, 0).some(c => c.id === card.id)) return;
    setState(prev => playCard(prev, 0, card));
    setSelectedCard(null);
    setDragging(null);
    playSound('play');
  }, [state]);

  const handleCardClick = (card: Card) => {
    if (playMode === 'dblclick' || playMode === 'drag') return;
    const isLegal = getLegalMoves(state, 0).some(c => c.id === card.id);
    if (!isLegal) return;
    setSelectedCard(selectedCard?.id === card.id ? null : card);
  };

  const handleDoubleClick = (card: Card) => {
    if (playMode !== 'dblclick') return;
    doPlay(card);
  };

  const handleDragStart = (card: Card) => {
    if (playMode !== 'drag') return;
    setDragging(card);
  };

  const handleDrop = () => {
    if (dragging) doPlay(dragging);
  };

  const startNewGame = () => {
    localStorage.removeItem(GAME_STATE_KEY);
    setState(createInitialState());
    setShowResult(false);
    setDealing(true);
    setShowRefreshConfirm(false);
    setShowMenu(false);
    setTimeout(() => setDealing(false), 1800);
  };

  const continueGame = () => {
    setShowRefreshConfirm(false);
    setDealing(false);
  };

  const saveProfileAndStart = () => {
    updateUsername(tempName);
    setShowProfileSetup(false);
    setDealing(true);
    setTimeout(() => setDealing(false), 1800);
  };

  const playerHand = state.hands[0];
  const legalMoves = state.phase === 'playing' && state.currentPlayer === 0 ? getLegalMoves(state, 0) : [];
  const sortedScores = state.scores.map((s, i) => ({ s, i })).sort((a, b) => b.s - a.s);

  return (
    <div style={{ height: '100vh', background: 'radial-gradient(ellipse at center, #1a7a1a 0%, #0a4a0a 65%, #052805 100%)', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 1rem', background: 'rgba(0,0,0,0.15)', zIndex: 10 }}>
        <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: 8 }}>← Leave</button>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Call Break</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setShowMenu(true)} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.7rem' }}>Menu</button>
          <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>R{state.round}/{settings.roundsToPlay} • {state.phase}</div>
        </div>
      </header>

      {/* Scoreboard */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', padding: '0.35rem', background: 'rgba(0,0,0,0.25)', fontSize: '0.8rem', flexWrap: 'wrap' }}>
        {PLAYER_NAMES.map((name, i) => (
          <div key={i} style={{ textAlign: 'center', minWidth: 85, opacity: state.currentPlayer === i || state.currentBidder === i ? 1 : 0.75 }}>
            <div>{MASCOTS[i]} {name}</div>
            <div>Bid {state.bids[i] ?? '-'} • Tricks {state.tricksWon[i]}</div>
            <div style={{ fontWeight: 700 }}>{state.scores[i].toFixed(1)}</div>
          </div>
        ))}
      </div>

      {trickMessage && (
        <div style={{ textAlign: 'center', padding: '0.3rem', background: 'rgba(255,215,0,0.2)', fontWeight: 600 }}>{trickMessage}</div>
      )}

      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 2 }}>
          <CardFan count={state.hands[1]?.length ?? 13} />
          <div style={{ marginTop: 2, background: 'rgba(0,0,0,0.45)', borderRadius: 8, padding: '2px 10px', display: 'inline-block', fontSize: '0.8rem' }}>
            {MASCOTS[1]} <b>{PLAYER_NAMES[1]}</b> • Bid {state.bids[1] ?? '-'} • {state.tricksWon[1]}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 4, top: '38%', transform: 'translateY(-50%)', textAlign: 'center', zIndex: 2 }}>
          <CardFan count={state.hands[3]?.length ?? 13} vertical />
          <div style={{ marginTop: 2, background: 'rgba(0,0,0,0.45)', borderRadius: 8, padding: '2px 8px', fontSize: '0.75rem' }}>
            {MASCOTS[3]} <b>{PLAYER_NAMES[3]}</b><br/>Bid {state.bids[3] ?? '-'} • {state.tricksWon[3]}
          </div>
        </div>

        <div style={{ position: 'absolute', right: 4, top: '38%', transform: 'translateY(-50%)', textAlign: 'center', zIndex: 2 }}>
          <CardFan count={state.hands[2]?.length ?? 13} vertical />
          <div style={{ marginTop: 2, background: 'rgba(0,0,0,0.45)', borderRadius: 8, padding: '2px 8px', fontSize: '0.75rem' }}>
            {MASCOTS[2]} <b>{PLAYER_NAMES[2]}</b><br/>Bid {state.bids[2] ?? '-'} • {state.tricksWon[2]}
          </div>
        </div>

        <div style={{ position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', gap: '1.25rem', alignItems: 'center', minHeight: 160 }}>
          {dealing && !showRefreshConfirm && !showProfileSetup && <div style={{ opacity: 0.7, fontSize: '1.15rem' }}>Dealing from all sides...</div>}
          {!dealing && state.currentTrick.length === 0 && !showRefreshConfirm && !showProfileSetup && <div style={{ opacity: 0.45 }}>Waiting for lead</div>}
          {state.currentTrick.map((p, i) => (
            <div key={i} style={{ textAlign: 'center', transition: 'transform 0.3s' }}>
              <PlayingCard card={p.card} />
              <div style={{ fontSize: '0.7rem', marginTop: 2 }}>{MASCOTS[p.player]} {PLAYER_NAMES[p.player]}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ paddingBottom: 8, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', zIndex: 5 }}>
        <div style={{ position: 'relative', height: 230, display: 'flex', justifyContent: 'center' }}>
          {playerHand.map((card, idx) => {
            const isLegal = legalMoves.some(c => c.id === card.id);
            const sel = selectedCard?.id === card.id;
            const mid = (playerHand.length - 1) / 2;
            const off = idx - mid;
            return (
              <div
                key={card.id}
                draggable={playMode === 'drag' && isLegal}
                onDragStart={() => handleDragStart(card)}
                style={{ position: 'absolute', left: '50%', bottom: sel ? 32 : 0, transform: `translateX(calc(-50% + ${off * 54}px)) rotate(${off * 1}deg)`, zIndex: sel ? 30 : idx, transition: 'all 0.15s', cursor: isLegal ? 'pointer' : 'default' }}
                onClick={() => handleCardClick(card)}
                onDoubleClick={() => handleDoubleClick(card)}
              >
                <PlayingCard card={card} selected={sel} className={!isLegal && state.phase === 'playing' ? 'opacity-40' : ''} />
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', minHeight: 46, marginTop: 2 }}>
          {state.phase === 'bidding' && state.currentBidder === 0 && !showRefreshConfirm && !showProfileSetup && (
            <div>
              <div style={{ marginBottom: 4, fontWeight: 600, fontSize: '0.9rem' }}>Your bid</div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                {Array.from({ length: 9 }, (_, i) => i + 1).map(b => <button key={b} onClick={() => handleBid(b)} className="primary" style={{ minWidth: 32, padding: '0.3rem 0.45rem' }}>{b}</button>)}
              </div>
            </div>
          )}
          {state.phase === 'playing' && state.currentPlayer === 0 && playMode === 'click' && !showRefreshConfirm && (
            <button onClick={() => selectedCard && doPlay(selectedCard)} disabled={!selectedCard} className="primary">Play Card</button>
          )}
          {state.phase === 'playing' && state.currentPlayer === 0 && playMode === 'dblclick' && <div style={{ opacity: 0.7 }}>Double-click to play</div>}
          {state.phase === 'playing' && state.currentPlayer === 0 && playMode === 'drag' && <div style={{ opacity: 0.7 }}>Drag to center</div>}
          {state.phase === 'playing' && state.currentPlayer !== 0 && !showRefreshConfirm && <div style={{ opacity: 0.65 }}>{MASCOTS[state.currentPlayer]} {PLAYER_NAMES[state.currentPlayer]} thinking...</div>}
        </div>
      </div>

      {showResult && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card" style={{ maxWidth: 440, textAlign: 'center', background: '#1a1a1a', color: '#fff' }}>
            <h2>Round Complete</h2>
            <div style={{ margin: '0.8rem 0', fontSize: '0.9rem' }}>
              {sortedScores.map(({ s, i }, rank) => (
                <div key={i} style={{ margin: '0.3rem 0', fontWeight: rank === 0 ? 700 : 400 }}>
                  {rank === 0 ? '🏆 ' : ''}{MASCOTS[i]} {PLAYER_NAMES[i]}: Bid {state.bids[i]} • Tricks {state.tricksWon[i]} • Total {s.toFixed(1)}
                  {rank === 0 && settings.winningAmount > 0 ? ` • Wins ${settings.winningAmount}` : ''}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>Prize for 1st after {settings.roundsToPlay} rounds: {settings.winningAmount}</p>
            <button onClick={startNewGame} className="primary">Next Round / Play Again</button>
            <button onClick={() => navigate('/')} style={{ marginLeft: 10, background: 'rgba(255,255,255,0.1)', color: '#fff' }}>Home</button>
          </div>
        </div>
      )}

      {showRefreshConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="card" style={{ maxWidth: 380, textAlign: 'center', background: '#1a1a1a', color: '#fff' }}>
            <h2>Game in Progress</h2>
            <p>Do you want to start a new game?</p>
            <button onClick={startNewGame} className="primary">Yes, New Game</button>
            <button onClick={continueGame} style={{ marginLeft: 10 }}>Continue</button>
          </div>
        </div>
      )}

      {showProfileSetup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400 }}>
          <div className="card" style={{ maxWidth: 360, textAlign: 'center', background: '#1a1a1a', color: '#fff' }}>
            <h2>Set Your Profile</h2>
            <p>What should we call you?</p>
            <input value={tempName} onChange={e => setTempName(e.target.value)} placeholder="Your name" style={{ padding: '0.6rem', borderRadius: 8, width: '80%', margin: '0.5rem 0', background: '#333', color: '#fff', border: '1px solid #555' }} />
            <br />
            <button onClick={saveProfileAndStart} className="primary" style={{ marginTop: 8 }}>Start Game</button>
          </div>
        </div>
      )}

      {showMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250 }} onClick={() => setShowMenu(false)}>
          <div className="card" style={{ maxWidth: 320, background: '#1a1a1a', color: '#fff' }} onClick={e => e.stopPropagation()}>
            <h3>Menu</h3>
            <button onClick={() => { setShowLastTrick(true); setShowMenu(false); }} style={{ display: 'block', width: '100%', marginBottom: 8 }}>Show Last Trick</button>
            <button onClick={startNewGame} style={{ display: 'block', width: '100%', marginBottom: 8 }}>New Game</button>
            <button onClick={() => navigate('/how-to-play')} style={{ display: 'block', width: '100%', marginBottom: 8 }}>How to Play</button>
            <button onClick={() => navigate('/settings')} style={{ display: 'block', width: '100%', marginBottom: 8 }}>Settings</button>
            <button onClick={() => setShowMenu(false)} style={{ display: 'block', width: '100%' }}>Close</button>
          </div>
        </div>
      )}

      {showLastTrick && lastTrick && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 260 }}>
          <div className="card" style={{ textAlign: 'center', background: '#1a1a1a', color: '#fff' }}>
            <h3>Last Trick — Won by {PLAYER_NAMES[lastTrick.winner]}</h3>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '1rem 0' }}>
              {lastTrick.cards.map((c, i) => <PlayingCard key={i} card={c} />)}
            </div>
            <button onClick={() => setShowLastTrick(false)} className="primary">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
