import { useTheme } from '../design/ThemeProvider';
import { loadProfile } from '../store/profile';
import { useState } from 'react';

export function Settings() {
  const { colorMode, setColorMode } = useTheme();
  const [profile] = useState(loadProfile);

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
        <p>Default bot difficulty: Intermediate (configurable in future updates)</p>
        <p>Animations: Enabled (respects reduced-motion preference)</p>
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
