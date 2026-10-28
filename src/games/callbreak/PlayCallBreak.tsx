import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayingCard } from '../../components/PlayingCard';
import { createInitialState, placeBid, playCard, getLegalMoves, botBid, botPlay, type CallBreakState } from './engine';
import { loadProfile, saveProfile, recordMatch, loadSettings, updateUsername } from '../../store/profile';
import type { Card } from '../../utils/cards';
import { t } from '../../i18n';

const BOT_NAMES = ['Charlie', 'Marie', 'Jim'];
const BOT_MASCOTS = ['🤖', '👩', '👨'];
const GAME_STATE_KEY = 'cardverse-callbreak-state';
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
    <div style={{ position: 'relative', width: vertical ? 120 : n * 18 + 50, height: vertical ? n * 10 + 60 : 160, margin: '0 auto' }}>
      {Array.from({ length: n }).map((_, i) => {
        const off = i - n / 2;
        return (
          <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${vertical ? 0 : off * 14}px, ${vertical ? off * 10 : 0}px) rotate(${off * (vertical ? 1.4 : 1)}deg)`, zIndex: i }}>
            <PlayingCard card={null} faceDown size="sm" />
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
  const [dealing, setDealing] = useState(true);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [tempName, setTempName] = useState(playerName);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [trickMessage, setTrickMessage] = useState('');
  const [lastTrick, setLastTrick] = useState<{ cards: Card[]; winner: number } | null>(null);
  const [showLastTrick, setShowLastTrick] = useState(false);

  // Custom drag state
  const [dragCard, setDragCard] = useState<Card | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const tableRef = useRef<HTMLDivElement>(null);

  const difficulty = settings.difficulty;

  useEffect(() => {
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
    }, 2200);
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
    setDragCard(null);
    playSound('play');
  }, [state]);

  // Pointer-based drag so card leaves its place in real time
  const onPointerDown = (e: React.PointerEvent, card: Card) => {
    if (state.phase !== 'playing' || state.currentPlayer !== 0) return;
    const legal = getLegalMoves(state, 0);
    if (!legal.some(c => c.id === card.id)) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragPos({ x: e.clientX, y: e.clientY });
    setDragCard(card);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragCard) return;
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragCard) return;
    const table = tableRef.current;
    if (table) {
      const rect = table.getBoundingClientRect();
      const inTable = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (inTable) {
        doPlay(dragCard);
        return;
      }
    }
    setDragCard(null);
  };


  const nextRound = () => {
    if (state.round >= settings.roundsToPlay) {
      // Match over
      setShowResult(false);
      // Could show final summary, but for now just allow new
      startNewGame();
      return;
    }
    const newState = createInitialState();
    setState({
      ...newState,
      scores: state.scores,
      round: state.round + 1,
      roundHistory: state.roundHistory,
    });
    setShowResult(false);
    setDealing(true);
    setTimeout(() => setDealing(false), 2200);
  };

  const startNewGame = () => {
    localStorage.removeItem(GAME_STATE_KEY);
    setState(createInitialState());
    setShowResult(false);
    setDealing(true);
    setShowRefreshConfirm(false);
    setShowMenu(false);
    setShowScoreboard(false);
    setTimeout(() => setDealing(false), 2200);
  };

  const continueGame = () => {
    setShowRefreshConfirm(false);
    setDealing(false);
  };

  const saveProfileAndStart = () => {
    updateUsername(tempName);
    setShowProfileSetup(false);
    setDealing(true);
    setTimeout(() => setDealing(false), 2200);
  };

  const playerHand = state.hands[0].filter(c => dragCard?.id !== c.id);
  const legalMoves = state.phase === 'playing' && state.currentPlayer === 0 ? getLegalMoves(state, 0) : [];

  return (
    <div
      style={{ height: '100vh', background: 'radial-gradient(ellipse at center, #1a7a1a 0%, #0a4a0a 65%, #052805 100%)', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 1rem', background: 'rgba(0,0,0,0.2)', zIndex: 10 }}>
        <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: 8 }}>← {t('leave')}</button>
        <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{t('callBreak')}</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setShowScoreboard(true)} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>Scores</button>
          <button onClick={() => setShowMenu(true)} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.7rem' }}>{t('menu')}</button>
        </div>
      </header>

      {/* Compact current round info */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', padding: '0.3rem', background: 'rgba(0,0,0,0.3)', fontSize: '0.75rem' }}>
        <span>Round {state.round}/{settings.roundsToPlay}</span>
        <span>Phase: {state.phase}</span>
        {PLAYER_NAMES.map((n, i) => (
          <span key={i} style={{ opacity: state.currentPlayer === i || state.currentBidder === i ? 1 : 0.7 }}>
            {MASCOTS[i]} {n}: {state.bids[i] ?? '-'} / {state.tricksWon[i]}
          </span>
        ))}
      </div>

      {trickMessage && (
        <div style={{ textAlign: 'center', padding: '0.25rem', background: 'rgba(255,215,0,0.25)', fontWeight: 600, fontSize: '0.85rem' }}>{trickMessage}</div>
      )}

      {/* Shuffling / dealing animation overlay */}
      {dealing && !showRefreshConfirm && !showProfileSetup && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, background: 'rgba(0,0,0,0.25)', pointerEvents: 'none' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: 12, animation: 'pulse 1s infinite' }}>Shuffling & Dealing...</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ width: 40, height: 56, background: 'linear-gradient(135deg,#1a4d1a,#0d2e0d)', borderRadius: 6, animation: `deal 0.6s ${i*0.15}s both`, border: '1px solid #333' }} />
              ))}
            </div>
          </div>
          <style>{`
            @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
            @keyframes deal { from{transform:translateY(-80px) rotate(-20deg);opacity:0} to{transform:translateY(0);opacity:1} }
          `}</style>
        </div>
      )}

      <div ref={tableRef} style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 2 }}>
          <CardFan count={state.hands[1]?.length ?? 13} />
          <div style={{ marginTop: 4, background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '2px 8px', fontSize: '0.75rem' }}>
            {MASCOTS[1]} {PLAYER_NAMES[1]} • {state.bids[1] ?? '-'} / {state.tricksWon[1]}
          </div>
        </div>
        <div style={{ position: 'absolute', left: 6, top: '40%', transform: 'translateY(-50%)', textAlign: 'center', zIndex: 2 }}>
          <CardFan count={state.hands[3]?.length ?? 13} vertical />
          <div style={{ marginTop: 4, background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '2px 6px', fontSize: '0.7rem' }}>
            {MASCOTS[3]} {PLAYER_NAMES[3]}<br/>{state.bids[3] ?? '-'} / {state.tricksWon[3]}
          </div>
        </div>
        <div style={{ position: 'absolute', right: 6, top: '40%', transform: 'translateY(-50%)', textAlign: 'center', zIndex: 2 }}>
          <CardFan count={state.hands[2]?.length ?? 13} vertical />
          <div style={{ marginTop: 4, background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '2px 6px', fontSize: '0.7rem' }}>
            {MASCOTS[2]} {PLAYER_NAMES[2]}<br/>{state.bids[2] ?? '-'} / {state.tricksWon[2]}
          </div>
        </div>

        <div style={{ position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', gap: '1rem', alignItems: 'center', minHeight: 140, zIndex: 3 }}>
          {!dealing && state.currentTrick.length === 0 && !showRefreshConfirm && !showProfileSetup && <div style={{ opacity: 0.5 }}>Waiting for lead</div>}
          {state.currentTrick.map((p, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <PlayingCard card={p.card} size="sm" />
              <div style={{ fontSize: '0.65rem', marginTop: 2 }}>{MASCOTS[p.player]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Player hand - cards leave place while dragging */}
      <div style={{ paddingBottom: 10, background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)', zIndex: 5 }}>
        <div style={{ position: 'relative', height: 200, display: 'flex', justifyContent: 'center' }}>
          {playerHand.map((card, idx) => {
            const isLegal = legalMoves.some(c => c.id === card.id);
            const mid = (playerHand.length - 1) / 2;
            const off = idx - mid;
            return (
              <div
                key={card.id}
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: 0,
                  transform: `translateX(calc(-50% + ${off * 48}px)) rotate(${off * 0.8}deg)`,
                  zIndex: idx,
                  cursor: isLegal ? 'grab' : 'default',
                  opacity: isLegal ? 1 : 0.45,
                  transition: 'transform 0.15s',
                }}
                onPointerDown={(e) => isLegal && onPointerDown(e, card)}
              >
                <PlayingCard card={card} size="sm" />
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', minHeight: 40, fontSize: '0.85rem' }}>
          {state.phase === 'bidding' && state.currentBidder === 0 && !showRefreshConfirm && !showProfileSetup && (
            <div>
              <div style={{ marginBottom: 4, fontWeight: 600 }}>{t('yourBid')}</div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                {Array.from({ length: 9 }, (_, i) => i + 1).map(b => (
                  <button key={b} onClick={() => handleBid(b)} className="primary" style={{ minWidth: 36, padding: '0.3rem 0.5rem' }}>{b}</button>
                ))}
              </div>
            </div>
          )}
          {state.phase === 'playing' && state.currentPlayer === 0 && !showRefreshConfirm && (
            <div style={{ opacity: 0.8 }}>Drag a card to the center to play</div>
          )}
          {state.phase === 'playing' && state.currentPlayer !== 0 && !showRefreshConfirm && (
            <div style={{ opacity: 0.65 }}>{MASCOTS[state.currentPlayer]} {PLAYER_NAMES[state.currentPlayer]} {t('thinking')}</div>
          )}
        </div>
      </div>

      {/* Floating dragged card */}
      {dragCard && (
        <div
          style={{
            position: 'fixed',
            left: dragPos.x - dragOffset.x,
            top: dragPos.y - dragOffset.y,
            pointerEvents: 'none',
            zIndex: 1000,
            transform: 'scale(1.05)',
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
          }}
        >
          <PlayingCard card={dragCard} size="sm" />
        </div>
      )}

      {/* Scoreboard modal - full history */}
      {showScoreboard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }} onClick={() => setShowScoreboard(false)}>
          <div className="card" style={{ maxWidth: 520, width: '90%', maxHeight: '80vh', overflow: 'auto', background: '#1a1a1a', color: '#fff' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Scoreboard</h3>
            {state.roundHistory.length === 0 ? (
              <p>No completed rounds yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #444' }}>
                    <th style={{ textAlign: 'left', padding: '4px' }}>Round</th>
                    {PLAYER_NAMES.map((n, i) => <th key={i} style={{ padding: '4px' }}>{MASCOTS[i]} {n}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {state.roundHistory.map(r => (
                    <tr key={r.round} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '4px' }}>{r.round}</td>
                      {r.roundScores.map((s, i) => (
                        <td key={i} style={{ padding: '4px', textAlign: 'center' }}>
                          {r.bids[i]}/{r.tricksWon[i]} → {s > 0 ? '+' : ''}{s.toFixed(1)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 700, borderTop: '2px solid #555' }}>
                    <td style={{ padding: '6px 4px' }}>Total</td>
                    {state.scores.map((s, i) => <td key={i} style={{ padding: '6px 4px', textAlign: 'center' }}>{s.toFixed(1)}</td>)}
                  </tr>
                </tbody>
              </table>
            )}
            <button onClick={() => setShowScoreboard(false)} className="primary" style={{ marginTop: 12 }}>Close</button>
          </div>
        </div>
      )}

      {showResult && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card" style={{ maxWidth: 440, textAlign: 'center', background: '#1a1a1a', color: '#fff' }}>
            <h2>Round {state.round} Complete</h2>
            <div style={{ margin: '0.8rem 0', fontSize: '0.9rem' }}>
              {state.roundHistory[state.roundHistory.length - 1]?.roundScores.map((s, i) => (
                <div key={i} style={{ margin: '0.25rem 0' }}>
                  {MASCOTS[i]} {PLAYER_NAMES[i]}: Bid {state.bids[i]} • Tricks {state.tricksWon[i]} • Round {s.toFixed(1)} • Total {state.scores[i].toFixed(1)}
                </div>
              ))}
            </div>
            <button onClick={nextRound} className="primary">{state.round >= settings.roundsToPlay ? "New Match" : "Next Round"}</button>
            <button onClick={() => navigate('/')} style={{ marginLeft: 10, background: 'rgba(255,255,255,0.1)', color: '#fff' }}>Home</button>
          </div>
        </div>
      )}

      {showRefreshConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="card" style={{ maxWidth: 380, textAlign: 'center', background: '#1a1a1a', color: '#fff' }}>
            <h2>Game in Progress</h2>
            <p>Continue or start fresh?</p>
            <button onClick={startNewGame} className="primary">New Game</button>
            <button onClick={continueGame} style={{ marginLeft: 10 }}>Continue</button>
          </div>
        </div>
      )}

      {showProfileSetup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400 }}>
          <div className="card" style={{ maxWidth: 360, textAlign: 'center', background: '#1a1a1a', color: '#fff' }}>
            <h2>Set Your Profile</h2>
            <input value={tempName} onChange={e => setTempName(e.target.value)} placeholder="Your name" style={{ padding: '0.6rem', borderRadius: 8, width: '80%', margin: '0.5rem 0', background: '#333', color: '#fff', border: '1px solid #555' }} />
            <br />
            <button onClick={saveProfileAndStart} className="primary" style={{ marginTop: 8 }}>Start Game</button>
          </div>
        </div>
      )}

      {showMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250 }} onClick={() => setShowMenu(false)}>
          <div className="card" style={{ maxWidth: 300, background: '#1a1a1a', color: '#fff' }} onClick={e => e.stopPropagation()}>
            <h3>Menu</h3>
            <button onClick={() => { setShowLastTrick(true); setShowMenu(false); }} style={{ display: 'block', width: '100%', marginBottom: 8 }}>Show Last Trick</button>
            <button onClick={startNewGame} style={{ display: 'block', width: '100%', marginBottom: 8 }}>New Game</button>
            <button onClick={() => navigate('/settings')} style={{ display: 'block', width: '100%', marginBottom: 8 }}>Settings</button>
            <button onClick={() => setShowMenu(false)} style={{ display: 'block', width: '100%' }}>Close</button>
          </div>
        </div>
      )}

      {showLastTrick && lastTrick && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 260 }}>
          <div className="card" style={{ textAlign: 'center', background: '#1a1a1a', color: '#fff' }}>
            <h3>Last Trick — {PLAYER_NAMES[lastTrick.winner]}</h3>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '1rem 0' }}>
              {lastTrick.cards.map((c, i) => <PlayingCard key={i} card={c} size="sm" />)}
            </div>
            <button onClick={() => setShowLastTrick(false)} className="primary">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
