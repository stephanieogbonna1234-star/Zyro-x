export type GameCategory =
  | 'Puzzle'
  | 'Arcade'
  | 'Racing'
  | 'Action'
  | 'Casual'
  | 'Sports'
  | 'Card'
  | 'Board';

export interface Game {
  id: string;
  name: string;
  category: GameCategory;
  icon: string; // Lucide icon name
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  bestScore: number;
  playCount: number;
  isFavorite: boolean;
  tutorial: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string; // Lucide icon name or emoji
  points: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
}

export interface GameStats {
  gamesPlayed: number;
  timePlayed: number; // in seconds
  wins: number;
  losses: number;
  highestScore: number;
  dailyStreak: number;
  lastPlayedDate?: string;
  longestSession: number; // in seconds
}

export interface UserProfile {
  username: string;
  avatar: string;
  level: number;
  xp: number;
  joinedAt: string;
}

export interface AppSettings {
  darkMode: boolean;
  language: 'en' | 'es' | 'fr' | 'de' | 'ja';
  musicVolume: number; // 0 to 100
  soundVolume: number; // 0 to 100
  vibration: boolean;
  animations: boolean;
  highContrast: boolean;
  largeText: boolean;
}
