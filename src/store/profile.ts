export interface PlayerProfile {
  username: string;
  avatar: string;
  level: number;
  xp: number;
  gold: number;
  gems: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  bestStreak: number;
  currentStreak: number;
  unlockedThemes: string[];
  unlockedCardBacks: string[];
  selectedTheme: string;
  selectedCardBack: string;
  lastLogin: string;
  matchHistory: MatchRecord[];
}

export interface MatchRecord {
  id: string;
  game: string;
  result: 'win' | 'loss' | 'draw';
  date: string;
  score?: number;
}

const STORAGE_KEY = 'cardverse-profile';

const DEFAULT_PROFILE: PlayerProfile = {
  username: 'Player',
  avatar: 'default',
  level: 1,
  xp: 0,
  gold: 1000,
  gems: 50,
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  bestStreak: 0,
  currentStreak: 0,
  unlockedThemes: ['classic-casino', 'himalayan', 'minimalist', 'vintage'],
  unlockedCardBacks: ['classic'],
  selectedTheme: 'classic-casino',
  selectedCardBack: 'classic',
  lastLogin: new Date().toISOString(),
  matchHistory: [],
};

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const data = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...data };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile: PlayerProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function addXp(profile: PlayerProfile, amount: number): PlayerProfile {
  let xp = profile.xp + amount;
  let level = profile.level;
  const xpPerLevel = 100 * level;
  while (xp >= xpPerLevel) {
    xp -= xpPerLevel;
    level += 1;
  }
  return { ...profile, xp, level };
}

export function recordMatch(profile: PlayerProfile, record: MatchRecord, goldReward: number, gemReward = 0): PlayerProfile {
  const updated = {
    ...profile,
    gamesPlayed: profile.gamesPlayed + 1,
    wins: profile.wins + (record.result === 'win' ? 1 : 0),
    losses: profile.losses + (record.result === 'loss' ? 1 : 0),
    gold: profile.gold + goldReward,
    gems: profile.gems + gemReward,
    matchHistory: [record, ...profile.matchHistory].slice(0, 50),
  };
  if (record.result === 'win') {
    updated.currentStreak += 1;
    updated.bestStreak = Math.max(updated.bestStreak, updated.currentStreak);
  } else {
    updated.currentStreak = 0;
  }
  return addXp(updated, record.result === 'win' ? 50 : 20);
}
