export type ThemeId = 
  | 'classic-casino'
  | 'royal-gold'
  | 'himalayan'
  | 'midnight-neon'
  | 'minimalist'
  | 'royal-red'
  | 'cyberpunk'
  | 'vintage'
  | 'ocean'
  | 'festival'
  | 'durbar-palace';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    bg: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    accentHover: string;
    border: string;
    cardBg: string;
    table: string;
  };
  cardBack: string; // CSS gradient or pattern description
  unlockCost?: { gold?: number; gems?: number };
  unlockedByDefault: boolean;
}

export const THEMES: Theme[] = [
  {
    id: 'classic-casino',
    name: 'Classic Casino',
    description: 'Deep green felt, ivory cards, gold accents.',
    colors: {
      bg: '#0d1f0f',
      surface: '#1a3320',
      text: '#f5f0e6',
      textMuted: '#c4b8a0',
      accent: '#d4af37',
      accentHover: '#f0d060',
      border: '#2d4a32',
      cardBg: '#fffef8',
      table: '#0a5c0a',
    },
    cardBack: 'linear-gradient(135deg, #1a4d1a 0%, #0d2e0d 100%)',
    unlockedByDefault: true,
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    description: 'Black surfaces, gold ornamentation, luxurious feel.',
    colors: {
      bg: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#f5e6c8',
      textMuted: '#c9b896',
      accent: '#c9a227',
      accentHover: '#e0c050',
      border: '#333',
      cardBg: '#fffef8',
      table: '#111',
    },
    cardBack: 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)',
    unlockCost: { gold: 500 },
    unlockedByDefault: false,
  },
  {
    id: 'himalayan',
    name: 'Himalayan Heritage',
    description: 'Subtle Himalayan patterns and Nepal-inspired motifs.',
    colors: {
      bg: '#1a2332',
      surface: '#243044',
      text: '#f0f4f8',
      textMuted: '#b0c0d0',
      accent: '#e67e22',
      accentHover: '#f39c12',
      border: '#3a4a5c',
      cardBg: '#fffef8',
      table: '#2c3e50',
    },
    cardBack: 'linear-gradient(135deg, #2c3e50 0%, #1a2332 100%)',
    unlockedByDefault: true,
  },
  {
    id: 'midnight-neon',
    name: 'Midnight Neon',
    description: 'Dark backgrounds with electric accent colors.',
    colors: {
      bg: '#0a0a12',
      surface: '#12121e',
      text: '#e0e0ff',
      textMuted: '#a0a0c0',
      accent: '#00f0ff',
      accentHover: '#40ffff',
      border: '#2a2a40',
      cardBg: '#1a1a2e',
      table: '#0d0d1a',
    },
    cardBack: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a12 100%)',
    unlockCost: { gems: 50 },
    unlockedByDefault: false,
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean surfaces, understated colors, maximum readability.',
    colors: {
      bg: '#f8f9fa',
      surface: '#ffffff',
      text: '#212529',
      textMuted: '#6c757d',
      accent: '#0d6efd',
      accentHover: '#0b5ed7',
      border: '#dee2e6',
      cardBg: '#ffffff',
      table: '#e9ecef',
    },
    cardBack: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
    unlockedByDefault: true,
  },
  {
    id: 'royal-red',
    name: 'Royal Red',
    description: 'Rich red and dark wood aesthetics.',
    colors: {
      bg: '#1a0a0a',
      surface: '#2a1515',
      text: '#f5e6e6',
      textMuted: '#c9a0a0',
      accent: '#c41e3a',
      accentHover: '#e04060',
      border: '#4a2525',
      cardBg: '#fffef8',
      table: '#3a1a1a',
    },
    cardBack: 'linear-gradient(135deg, #3a1a1a 0%, #1a0a0a 100%)',
    unlockCost: { gold: 300 },
    unlockedByDefault: false,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristic neon and digital visual effects.',
    colors: {
      bg: '#0d0015',
      surface: '#1a0030',
      text: '#ff00ff',
      textMuted: '#c000c0',
      accent: '#00ff9f',
      accentHover: '#40ffbf',
      border: '#3a0050',
      cardBg: '#1a0030',
      table: '#150025',
    },
    cardBack: 'linear-gradient(135deg, #1a0030 0%, #0d0015 100%)',
    unlockCost: { gems: 100 },
    unlockedByDefault: false,
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Aged paper, classic typography, traditional feel.',
    colors: {
      bg: '#2c2416',
      surface: '#3d3424',
      text: '#f5e6c8',
      textMuted: '#d4c4a8',
      accent: '#8b6914',
      accentHover: '#a67c1a',
      border: '#5a4a32',
      cardBg: '#f5e6c8',
      table: '#3d3424',
    },
    cardBack: 'linear-gradient(135deg, #3d3424 0%, #2c2416 100%)',
    unlockedByDefault: true,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep blue and turquoise tones.',
    colors: {
      bg: '#0a1a2a',
      surface: '#122a3a',
      text: '#e0f0ff',
      textMuted: '#a0c0d0',
      accent: '#00bcd4',
      accentHover: '#26c6da',
      border: '#1a3a4a',
      cardBg: '#fffef8',
      table: '#0d2a3a',
    },
    cardBack: 'linear-gradient(135deg, #0d2a3a 0%, #0a1a2a 100%)',
    unlockCost: { gold: 200 },
    unlockedByDefault: false,
  },
  {
    id: 'festival',
    name: 'Festival',
    description: 'Colorful celebratory designs inspired by South Asian festivities.',
    colors: {
      bg: '#1a0f0a',
      surface: '#2a1a12',
      text: '#fff8e0',
      textMuted: '#e0c8a0',
      accent: '#ff6b35',
      accentHover: '#ff8c5a',
      border: '#4a2a1a',
      cardBg: '#fffef8',
      table: '#2a1a12',
    },
    cardBack: 'linear-gradient(135deg, #ff6b35 0%, #ffd166 100%)',
    unlockCost: { gems: 75 },
    unlockedByDefault: false,
  },
  {
    id: 'durbar-palace',
    name: 'Durbar Palace',
    description: 'Rich maroon and antique gold inspired by Nepali royal palaces. Ideal for Call Break.',
    colors: {
      bg: '#1a0c0c',
      surface: '#2d1515',
      text: '#f8e8d0',
      textMuted: '#d4b896',
      accent: '#c9a227',
      accentHover: '#e0c050',
      border: '#4a2525',
      cardBg: '#fffef8',
      table: '#3a1a1a',
    },
    cardBack: 'linear-gradient(135deg, #3a1a1a 0%, #1a0c0c 100%)',
    unlockedByDefault: true,
  },
];

export const DEFAULT_THEME = 'classic-casino';
