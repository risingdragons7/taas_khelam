import { useTheme } from '../design/ThemeProvider';
import { THEMES } from '../design/themes';

export function Themes() {
  const { activeThemeId, setActiveTheme, unlockedThemes } = useTheme();

  return (
    <div>
      <h1>Themes</h1>
      <p>Customize the look of your card tables and interface. Some themes are unlocked through play.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        {THEMES.map(theme => {
          const unlocked = unlockedThemes.includes(theme.id);
          const active = activeThemeId === theme.id;
          return (
            <div
              key={theme.id}
              className="card"
              style={{
                borderColor: active ? 'var(--accent)' : undefined,
                opacity: unlocked ? 1 : 0.6,
                cursor: unlocked ? 'pointer' : 'not-allowed',
              }}
              onClick={() => unlocked && setActiveTheme(theme.id)}
            >
              <div style={{
                height: 80,
                borderRadius: 8,
                background: theme.colors.table,
                marginBottom: '1rem',
                border: '2px solid ' + theme.colors.accent,
              }} />
              <h3>{theme.name}</h3>
              <p style={{ color: 'var(--textMuted)', fontSize: '0.9rem' }}>{theme.description}</p>
              {active && <div style={{ color: 'var(--accent)', fontWeight: 600, marginTop: '0.5rem' }}>Active</div>}
              {!unlocked && <div style={{ color: 'var(--textMuted)', marginTop: '0.5rem' }}>Locked</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
