import { useState } from 'react';
import { loadProfile, updateUsername } from '../store/profile';

export function Profile() {
  const [profile, setProfile] = useState(loadProfile);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.username);
  const winRate = profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0;

  const saveName = () => {
    const updated = updateUsername(name);
    setProfile(updated);
    setEditing(false);
  };

  return (
    <div>
      <h1>Profile</h1>
      <div className="card" style={{ maxWidth: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>{profile.avatar}</div>
          <div style={{ flex: 1 }}>
            {editing ? (
              <div>
                <input value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.4rem', borderRadius: 6, marginRight: 8 }} />
                <button onClick={saveName} className="primary">Save</button>
                <button onClick={() => setEditing(false)} style={{ marginLeft: 6 }}>Cancel</button>
              </div>
            ) : (
              <>
                <h2 style={{ margin: 0 }}>{profile.username} <button onClick={() => setEditing(true)} style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>Edit</button></h2>
                <p style={{ margin: 0, color: 'var(--textMuted)' }}>Level {profile.level}</p>
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <div><strong>Gold:</strong> {profile.gold}</div>
          <div><strong>Gems:</strong> {profile.gems}</div>
          <div><strong>Games:</strong> {profile.gamesPlayed}</div>
          <div><strong>Win Rate:</strong> {winRate}%</div>
          <div><strong>Wins:</strong> {profile.wins}</div>
          <div><strong>Losses:</strong> {profile.losses}</div>
          <div><strong>Best Streak:</strong> {profile.bestStreak}</div>
          <div><strong>Current Streak:</strong> {profile.currentStreak}</div>
          <div><strong>XP:</strong> {profile.xp}</div>
        </div>
        <h3 style={{ marginTop: '1.5rem' }}>Recent Matches</h3>
        {profile.matchHistory.length === 0 ? (
          <p style={{ color: 'var(--textMuted)' }}>No matches yet. Play a game!</p>
        ) : (
          <ul style={{ paddingLeft: '1.2rem' }}>
            {profile.matchHistory.slice(0, 8).map(m => (
              <li key={m.id}>{m.game}: {m.result} {m.score != null ? `(${m.score.toFixed(1)})` : ''} — {new Date(m.date).toLocaleDateString()}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
