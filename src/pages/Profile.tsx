import { loadProfile } from '../store/profile';

export function Profile() {
  const profile = loadProfile();
  const winRate = profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0;

  return (
    <div>
      <h1>Profile</h1>
      <div className="card" style={{ maxWidth: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
          <div>
            <h2 style={{ margin: 0 }}>{profile.username}</h2>
            <p style={{ margin: 0, color: 'var(--textMuted)' }}>Level {profile.level}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><strong>Gold:</strong> {profile.gold}</div>
          <div><strong>Gems:</strong> {profile.gems}</div>
          <div><strong>Games:</strong> {profile.gamesPlayed}</div>
          <div><strong>Win Rate:</strong> {winRate}%</div>
          <div><strong>Best Streak:</strong> {profile.bestStreak}</div>
          <div><strong>XP:</strong> {profile.xp}</div>
        </div>
        <h3 style={{ marginTop: '1.5rem' }}>Recent Matches</h3>
        {profile.matchHistory.length === 0 ? (
          <p style={{ color: 'var(--textMuted)' }}>No matches yet. Play a game!</p>
        ) : (
          <ul>
            {profile.matchHistory.slice(0, 5).map(m => (
              <li key={m.id}>{m.game}: {m.result} on {new Date(m.date).toLocaleDateString()}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
