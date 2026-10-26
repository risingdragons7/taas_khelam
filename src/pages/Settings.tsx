import { useTheme } from '../design/ThemeProvider';
import { loadProfile } from '../store/profile';
import { useState, useEffect } from 'react';

const PLAY_MODE_KEY = 'cardverse-play-mode';
const SOUND_KEY = 'cardverse-sounds';

export function Settings() {
  const { colorMode, setColorMode } = useTheme();
  const [profile] = useState(loadProfile);
  const [playMode, setPlayMode] = useState<'click' | 'dblclick' | 'drag'>('click');
  const [sounds, setSounds] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(PLAY_MODE_KEY);
    if (saved === 'click' || saved === 'dblclick' || saved === 'drag') setPlayMode(saved);
    const s = localStorage.getItem(SOUND_KEY);
    if (s !== null) setSounds(s === 'true');
  }, []);

  const handlePlayMode = (mode: 'click' | 'dblclick' | 'drag') => {
    setPlayMode(mode);
    localStorage.setItem(PLAY_MODE_KEY, mode);
  };

  const handleSounds = (on: boolean) => {
    setSounds(on);
    localStorage.setItem(SOUND_KEY, String(on));
  };

  const handleReset = () => {
    if (confirm('Reset all local progress? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div>
      <h1>Settings</h1>
      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>Appearance</h2>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Color Mode
          <select
            value={colorMode}
            onChange={e => setColorMode(e.target.value as any)}
            style={{ marginLeft: '1rem', padding: '0.5rem', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <p style={{ color: 'var(--textMuted)' }}>Themes can be changed in the Themes section. Card back and table environment are tied to the selected theme.</p>
      </section>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>Gameplay</h2>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          How to play a card
          <select
            value={playMode}
            onChange={e => handlePlayMode(e.target.value as any)}
            style={{ marginLeft: '1rem', padding: '0.5rem', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="click">Click to select, button to play</option>
            <option value="dblclick">Double-click to play</option>
            <option value="drag">Drag to the center to play</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <input type="checkbox" checked={sounds} onChange={e => handleSounds(e.target.checked)} />
          Sound effects
        </label>
        <p>Default bot difficulty: Intermediate</p>
      </section>

      <section className="card">
        <h2>Data</h2>
        <p>Username: {profile.username}</p>
        <p>Games Played: {profile.gamesPlayed}</p>
        <button onClick={handleReset} style={{ background: '#c41e3a', color: '#fff', marginTop: '1rem' }}>
          Reset All Local Data
        </button>
      </section>
    </div>
  );
}
