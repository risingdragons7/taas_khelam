import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { THEMES, DEFAULT_THEME, type ThemeId, type Theme } from './themes';

type ColorMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  activeThemeId: ThemeId;
  setActiveTheme: (id: ThemeId) => void;
  currentTheme: Theme;
  unlockedThemes: ThemeId[];
  unlockTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'cardverse-theme';

function getSystemMode(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.colorMode || 'system';
      } catch {}
    }
    return 'system';
  });

  const [activeThemeId, setActiveThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.activeThemeId || DEFAULT_THEME;
      } catch {}
    }
    return DEFAULT_THEME;
  });

  const [unlockedThemes, setUnlockedThemes] = useState<ThemeId[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.unlocked || THEMES.filter(t => t.unlockedByDefault).map(t => t.id);
      } catch {}
    }
    return THEMES.filter(t => t.unlockedByDefault).map(t => t.id);
  });

  const effectiveMode = colorMode === 'system' ? getSystemMode() : colorMode;
  const currentTheme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-color-mode', effectiveMode);
    root.setAttribute('data-theme', activeThemeId);
    
    // Apply CSS variables
    const colors = currentTheme.colors;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      colorMode,
      activeThemeId,
      unlocked: unlockedThemes,
    }));
  }, [colorMode, activeThemeId, currentTheme, unlockedThemes, effectiveMode]);

  const setColorMode = (mode: ColorMode) => setColorModeState(mode);
  const setActiveTheme = (id: ThemeId) => {
    if (unlockedThemes.includes(id)) {
      setActiveThemeId(id);
    }
  };
  const unlockTheme = (id: ThemeId) => {
    if (!unlockedThemes.includes(id)) {
      setUnlockedThemes(prev => [...prev, id]);
    }
  };

  return (
    <ThemeContext.Provider value={{
      colorMode,
      setColorMode,
      activeThemeId,
      setActiveTheme,
      currentTheme,
      unlockedThemes,
      unlockTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
