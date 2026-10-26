import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { ThemeProvider } from './design/ThemeProvider';
import { Home } from './pages/Home';
import { Games } from './pages/Games';
import { Themes } from './pages/Themes';
import { HowToPlay } from './pages/HowToPlay';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { PlayCallBreak } from './games/callbreak/PlayCallBreak';
import { BRAND } from './config/brand';
import './index.css';

function Navigation() {
  const isMobile = window.innerWidth < 768;

  const links = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/games', label: 'Games', icon: '🃏' },
    { to: '/themes', label: 'Themes', icon: '🎨' },
    { to: '/how-to-play', label: 'How to Play', icon: '📖' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  if (isMobile) {
    return (
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.5rem 0',
        zIndex: 100,
      }}>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent)' : 'var(--textMuted)',
              textDecoration: 'none',
              fontSize: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            })}
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <aside style={{
      width: 220,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      padding: '1.5rem 1rem',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
    }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ margin: 0, color: 'var(--accent)' }}>{BRAND.name}</h2>
        <small style={{ color: 'var(--textMuted)' }}>{BRAND.tagline}</small>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius)',
              background: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? '#000' : 'var(--text)',
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 400,
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function AppContent() {
  const location = useLocation();
  const isGame = location.pathname.startsWith('/play');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!isGame && <Navigation />}
      <main style={{
        flex: 1,
        marginLeft: !isGame && window.innerWidth >= 768 ? 220 : 0,
        padding: isGame ? 0 : '1.5rem',
        paddingBottom: !isGame && window.innerWidth < 768 ? 80 : '1.5rem',
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/themes" element={<Themes />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/play/call-break" element={<PlayCallBreak />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}
