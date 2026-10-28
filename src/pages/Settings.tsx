import { useTheme } from '../design/ThemeProvider';
import { loadProfile, loadSettings, saveSettings, type GameSettings } from '../store/profile';
import { useState, useEffect } from 'react';
import { getLanguage, setLanguage, t, type Language } from '../i18n';

const SOUND_KEY = 'cardverse-sounds';

export function Settings() {
  const { colorMode, setColorMode } = useTheme();
  const [profile] = useState(loadProfile);
  const [sounds, setSounds] = useState(true);
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [lang, setLang] = useState<Language>(getLanguage);

  useEffect(() => {
    const s = localStorage.getItem(SOUND_KEY);
    if (s !== null) setSounds(s === 'true');
  }, []);

  const handleSounds = (on: boolean) => {
    setSounds(on);
    localStorage.setItem(SOUND_KEY, String(on));
  };

  const handleLang = (l: Language) => {
    setLang(l);
    setLanguage(l);
    // Force re-render of game pages if needed; simple reload for now
    window.location.reload();
  };

  const updateSetting = (partial: Partial<GameSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    saveSettings(partial);
  };

  const handleReset = () => {
    if (confirm('Reset all local progress? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div>
      <h1>{t('settings')}</h1>
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
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          {t('language')}
          <select value={lang} onChange={e => handleLang(e.target.value as Language)} style={{ marginLeft: '1rem', padding: '0.5rem', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}>
            <option value="en">English</option>
            <option value="ne">नेपाली (Nepali)</option>
            <option value="hi">हिंदी (Hindi)</option>
          </select>
        </label>
        <p style={{ color: 'var(--textMuted)' }}>Themes can be changed in the Themes section.</p>
      </section>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>Gameplay</h2>
        <p style={{ color: "var(--textMuted)", marginBottom: "1rem" }}>Cards are played by dragging them to the center of the table.</p>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Bot difficulty
          <select value={settings.difficulty} onChange={e => updateSetting({ difficulty: e.target.value as any })} style={{ marginLeft: '1rem', padding: '0.5rem', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </label>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Rounds per match
          <input type="number" min={1} max={13} value={settings.roundsToPlay} onChange={e => updateSetting({ roundsToPlay: Number(e.target.value) || 5 })} style={{ marginLeft: '1rem', padding: '0.5rem', width: 70, borderRadius: 8 }} />
        </label>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Winning amount for 1st place (after all rounds)
          <input type="number" min={0} value={settings.winningAmount} onChange={e => updateSetting({ winningAmount: Number(e.target.value) || 0 })} style={{ marginLeft: '1rem', padding: '0.5rem', width: 100, borderRadius: 8 }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={sounds} onChange={e => handleSounds(e.target.checked)} />
          Sound effects
        </label>
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
