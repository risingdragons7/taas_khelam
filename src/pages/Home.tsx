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
    <div>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: 0 }}>{BRAND.name}</h1>
        <p style={{ color: 'var(--textMuted)', fontSize: '1.2rem' }}>{BRAND.tagline}</p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 280 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            👤
          </div>
          <div>
            <strong>{profile.username}</strong>
            <div style={{ color: 'var(--textMuted)', fontSize: '0.9rem' }}>Level {profile.level} • {profile.xp} XP</div>
            <div style={{ color: 'var(--accent)', fontWeight: 600 }}>💰 {profile.gold} Gold • 💎 {profile.gems} Gems</div>
          </div>
        </div>
        <Link to="/play/call-break">
          <button className="primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
            Play Now
          </button>
        </Link>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Featured Game</h2>
        <div className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {sampleCards.map(c => <PlayingCard key={c.id} card={c} />)}
          </div>
          <div>
            <h3>Call Break</h3>
            <p>Classic trick-taking game popular in Nepal and India. Bid the number of tricks you can win, then play carefully.</p>
            <Link to="/play/call-break"><button>Play Call Break</button></Link>
          </div>
        </div>
      </section>

      <section>
        <h2>All Games</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
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
            <div key={game.name} className="card">
              <h4>{game.name}</h4>
              <p style={{ color: 'var(--textMuted)', fontSize: '0.9rem' }}>{game.players} players • {game.difficulty}</p>
              <Link to={game.path}><button style={{ width: '100%' }}>Play</button></Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
