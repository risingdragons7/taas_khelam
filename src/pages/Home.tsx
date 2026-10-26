import { Link } from 'react-router-dom';
import { BRAND } from '../config/brand';
import { loadProfile } from '../store/profile';
import { PlayingCard } from '../components/PlayingCard';
import type { Card } from '../utils/cards';

const sampleCards: Card[] = [
  { suit: 'hearts', rank: 'A', id: '1' },
  { suit: 'spades', rank: 'K', id: '2' },
  { suit: 'diamonds', rank: 'Q', id: '3' },
];

export function Home() {
  const profile = loadProfile();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '1rem' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'var(--accent)', marginBottom: '0.25rem', background: 'linear-gradient(135deg, var(--accent), var(--accentHover))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {BRAND.name}
        </h1>
        <p style={{ color: 'var(--textMuted)', fontSize: '1.25rem', maxWidth: 600, margin: '0 auto' }}>{BRAND.tagline}</p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: 300, flex: 1 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accentHover))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            👤
          </div>
          <div>
            <strong style={{ fontSize: '1.25rem' }}>{profile.username}</strong>
            <div style={{ color: 'var(--textMuted)', fontSize: '0.95rem', marginTop: 4 }}>Level {profile.level} • {profile.xp} XP</div>
            <div style={{ color: 'var(--accent)', fontWeight: 700, marginTop: 4 }}>💰 {profile.gold} Gold • 💎 {profile.gems} Gems</div>
          </div>
        </div>
        <Link to="/play/call-break">
          <button className="primary" style={{ fontSize: '1.15rem', padding: '1.1rem 2.5rem', borderRadius: 20 }}>
            Play Now
          </button>
        </Link>
      </div>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Featured Game</h2>
        <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', background: 'linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--surface) 80%, var(--accent)))' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {sampleCards.map(c => <PlayingCard key={c.id} card={c} />)}
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Call Break</h3>
            <p style={{ color: 'var(--textMuted)', lineHeight: 1.6 }}>Classic trick-taking game popular in Nepal and India. Bid the number of tricks you can win, then play carefully.</p>
            <Link to="/play/call-break"><button style={{ marginTop: '1rem' }}>Play Call Break</button></Link>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>All Games</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {[
            { name: 'Call Break', players: '4', difficulty: 'Medium', path: '/play/call-break' },
            { name: 'Dhumbal', players: '2-6', difficulty: 'Easy', path: '/games' },
            { name: 'Teen Patti', players: '3-6', difficulty: 'Easy', path: '/games' },
            { name: 'In Between', players: '2-8', difficulty: 'Easy', path: '/games' },
            { name: 'Jut Patti', players: '2-4', difficulty: 'Medium', path: '/games' },
            { name: 'Kitti', players: '2-4', difficulty: 'Medium', path: '/games' },
            { name: 'Fanash', players: '2-6', difficulty: 'Hard', path: '/games' },
            { name: 'Gulaam Chor', players: '3-5', difficulty: 'Easy', path: '/games' },
            { name: '29', players: '4', difficulty: 'Hard', path: '/games' },
            { name: 'Marriage', players: '2-4', difficulty: 'Hard', path: '/games' },
          ].map(game => (
            <div key={game.name} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{game.name}</h4>
              <p style={{ color: 'var(--textMuted)', fontSize: '0.95rem', flex: 1 }}>{game.players} players • {game.difficulty}</p>
              <Link to={game.path} style={{ marginTop: '1rem' }}><button style={{ width: '100%' }}>Play</button></Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
