import React, { useState, useEffect, useRef } from 'react';
import AndroidSimulator from './components/AndroidSimulator';
import HomeTab from './components/HomeTab';
import CategoriesTab from './components/CategoriesTab';
import FavoritesTab from './components/FavoritesTab';
import AchievementsTab from './components/AchievementsTab';
import SettingsTab from './components/SettingsTab';

// Game Views
import Game2048 from './components/games/Game2048';
import GameSnake from './components/games/GameSnake';
import GameFlappyBird from './components/games/GameFlappyBird';
import GameTicTacToe from './components/games/GameTicTacToe';
import GameMemoryMatch from './components/games/GameMemoryMatch';
import GameSlidingPuzzle from './components/games/GameSlidingPuzzle';
import GameBlackjack from './components/games/GameBlackjack';
import RetroArcadeSimulator from './components/games/RetroArcadeSimulator';

import {
  INITIAL_GAMES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_STATS,
  INITIAL_PROFILE,
  DEFAULT_SETTINGS
} from './data/initialData';
import { Game, Achievement, GameStats, UserProfile, AppSettings } from './types';
import { playSound, startMusic, stopMusic } from './utils/audio';

// Bottom Navigation Icons
import { Home, Grid, Heart, Award, Settings, Gamepad2, Volume2, Flame } from 'lucide-react';

export default function App() {
  // Loading & Splash states
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);

  // Persistent States
  const [games, setGames] = useState<Game[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // UI Navigation States
  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'favorites' | 'achievements' | 'settings'>('home');
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  // Real-time Toast Notifications for unlocks
  const [activeToast, setActiveToast] = useState<{ title: string; desc: string } | null>(null);

  const playtimeTimerRef = useRef<any>(null);
  const sessionStartRef = useRef<number>(0);

  // --- BOOT LOADER PROCESS ---
  useEffect(() => {
    // 1. Load Data from SQLite cache simulation (localStorage)
    const storedGames = localStorage.getItem('gv_games');
    const storedAchievements = localStorage.getItem('gv_achievements');
    const storedStats = localStorage.getItem('gv_stats');
    const storedProfile = localStorage.getItem('gv_profile');
    const storedSettings = localStorage.getItem('gv_settings');

    setGames(storedGames ? JSON.parse(storedGames) : INITIAL_GAMES);
    setAchievements(storedAchievements ? JSON.parse(storedAchievements) : INITIAL_ACHIEVEMENTS);
    setStats(storedStats ? JSON.parse(storedStats) : INITIAL_STATS);
    setProfile(storedProfile ? JSON.parse(storedProfile) : INITIAL_PROFILE);
    
    const parsedSettings: AppSettings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;
    setSettings(parsedSettings);

    // Dynamic booting countdown
    const bootTimer = setInterval(() => {
      setBootProgress((prev) => {
        if (prev >= 100) {
          clearInterval(bootTimer);
          setIsBooting(false);
          // Play booting chime
          playSound('win', parsedSettings);
          return 100;
        }
        return prev + 8;
      });
    }, 120);

    return () => clearInterval(bootTimer);
  }, []);

  // --- BACKGROUND AMBIENT MUSIC ENGINE ---
  useEffect(() => {
    if (!isBooting && settings && !activeGame) {
      startMusic(settings);
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [isBooting, settings, activeGame]);

  // --- SESSION TIME TRACKER ---
  useEffect(() => {
    if (activeGame) {
      sessionStartRef.current = Date.now();
      // Incremental play counts
      updatePlayCount(activeGame.id);

      playtimeTimerRef.current = setInterval(() => {
        // Log playtime tick incrementally
        setStats((prev) => {
          if (!prev) return null;
          const next = { ...prev, timePlayed: prev.timePlayed + 5 };
          localStorage.setItem('gv_stats', JSON.stringify(next));
          return next;
        });
      }, 5000);
    } else {
      if (playtimeTimerRef.current) {
        clearInterval(playtimeTimerRef.current);
        playtimeTimerRef.current = null;
      }
      if (sessionStartRef.current > 0) {
        const sessionLength = Math.floor((Date.now() - sessionStartRef.current) / 1000);
        setStats((prev) => {
          if (!prev) return null;
          const next = {
            ...prev,
            longestSession: Math.max(prev.longestSession, sessionLength)
          };
          localStorage.setItem('gv_stats', JSON.stringify(next));
          return next;
        });
        sessionStartRef.current = 0;
      }
    }

    return () => {
      if (playtimeTimerRef.current) clearInterval(playtimeTimerRef.current);
    };
  }, [activeGame]);

  // --- HELPER WRITERS ---
  const updatePlayCount = (id: string) => {
    const updated = games.map((g) => {
      if (g.id === id) {
        return { ...g, playCount: g.playCount + 1 };
      }
      return g;
    });
    setGames(updated);
    localStorage.setItem('gv_games', JSON.stringify(updated));

    setStats((prev) => {
      if (!prev) return null;
      const next = { ...prev, gamesPlayed: prev.gamesPlayed + 1 };
      localStorage.setItem('gv_stats', JSON.stringify(next));
      return next;
    });

    // Check Playtime milestones
    runAchievementChecks(updated, stats);
  };

  const handleToggleFavorite = (id: string) => {
    if (!settings) return;
    playSound('click', settings);
    const updated = games.map((g) => {
      if (g.id === id) {
        return { ...g, isFavorite: !g.isFavorite };
      }
      return g;
    });
    setGames(updated);
    localStorage.setItem('gv_games', JSON.stringify(updated));

    // Achievement check
    runAchievementChecks(updated, stats);
  };

  const handleUpdateSettings = (next: Partial<AppSettings>) => {
    if (!settings) return;
    const updated = { ...settings, ...next };
    setSettings(updated);
    localStorage.setItem('gv_settings', JSON.stringify(updated));
    playSound('click', updated);
  };

  // --- CRITICAL STORAGE CONTROL ACTIONS ---
  const handleResetStats = () => {
    if (!settings) return;
    playSound('lose', settings);
    setStats(INITIAL_STATS);
    localStorage.setItem('gv_stats', JSON.stringify(INITIAL_STATS));
    triggerToast('Stats Resetted', 'Your telemetry play history has been cleared!');
  };

  const handleResetAchievements = () => {
    if (!settings) return;
    playSound('lose', settings);
    setAchievements(INITIAL_ACHIEVEMENTS);
    localStorage.setItem('gv_achievements', JSON.stringify(INITIAL_ACHIEVEMENTS));
    triggerToast('Badges Locked', 'All accomplishments have been locked again.');
  };

  const handleClearSaves = () => {
    if (!settings) return;
    playSound('lose', settings);
    localStorage.clear();
    setGames(INITIAL_GAMES);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setStats(INITIAL_STATS);
    setProfile(INITIAL_PROFILE);
    setSettings(DEFAULT_SETTINGS);
    triggerToast('System Restored', 'Cleared all offline files and storage values.');
  };

  // --- TOAST EMITTER ---
  const triggerToast = (title: string, desc: string) => {
    setActiveToast({ title, desc });
    if (settings) {
      playSound('achievement', settings);
    }
    setTimeout(() => {
      setActiveToast(null);
    }, 4000);
  };

  // --- ACHIEVEMENT MILESTONE CHECKS ---
  const runAchievementChecks = (currentGames: Game[], currentStats: GameStats | null) => {
    if (!currentStats || !settings) return;

    let updatedAchievements = [...achievements];
    let unlockedAny = false;

    // Check rule 1: first_game (Play any game)
    const firstGameAch = updatedAchievements.find((a) => a.id === 'first_game');
    if (firstGameAch && !firstGameAch.unlocked && currentStats.gamesPlayed >= 1) {
      firstGameAch.unlocked = true;
      firstGameAch.progress = 1;
      firstGameAch.unlockedAt = new Date().toLocaleDateString();
      unlockedAny = true;
      triggerToast('Achievement Unlocked!', firstGameAch.title);
    }

    // Check rule 2: first_win
    const firstWinAch = updatedAchievements.find((a) => a.id === 'first_win');
    if (firstWinAch && !firstWinAch.unlocked && currentStats.wins >= 1) {
      firstWinAch.unlocked = true;
      firstWinAch.progress = 1;
      firstWinAch.unlockedAt = new Date().toLocaleDateString();
      unlockedAny = true;
      triggerToast('Achievement Unlocked!', firstWinAch.title);
    }

    // Check rule 3: hundred_wins (Accumulate 10 wins)
    const hundredWinsAch = updatedAchievements.find((a) => a.id === 'hundred_wins');
    if (hundredWinsAch && !hundredWinsAch.unlocked) {
      hundredWinsAch.progress = Math.min(10, currentStats.wins);
      if (hundredWinsAch.progress >= 10) {
        hundredWinsAch.unlocked = true;
        hundredWinsAch.unlockedAt = new Date().toLocaleDateString();
        unlockedAny = true;
        triggerToast('Achievement Unlocked!', hundredWinsAch.title);
      }
    }

    // Check rule 4: collector (Favorite 3 games)
    const collectorAch = updatedAchievements.find((a) => a.id === 'collector');
    if (collectorAch && !collectorAch.unlocked) {
      const favoritesCount = currentGames.filter((g) => g.isFavorite).length;
      collectorAch.progress = Math.min(3, favoritesCount);
      if (collectorAch.progress >= 3) {
        collectorAch.unlocked = true;
        collectorAch.unlockedAt = new Date().toLocaleDateString();
        unlockedAny = true;
        triggerToast('Achievement Unlocked!', collectorAch.title);
      }
    }

    // Check rule 5: score_1000 (best score of 1000 in any game)
    const highRollerAch = updatedAchievements.find((a) => a.id === 'score_1000');
    if (highRollerAch && !highRollerAch.unlocked) {
      const maxBestScore = Math.max(...currentGames.map((g) => g.bestScore));
      highRollerAch.progress = Math.min(1000, maxBestScore);
      if (highRollerAch.progress >= 1000) {
        highRollerAch.unlocked = true;
        highRollerAch.unlockedAt = new Date().toLocaleDateString();
        unlockedAny = true;
        triggerToast('Achievement Unlocked!', highRollerAch.title);
      }
    }

    if (unlockedAny) {
      setAchievements(updatedAchievements);
      localStorage.setItem('gv_achievements', JSON.stringify(updatedAchievements));
      
      // Upgrade profile level based on total unlocked achievements
      const totalXP = updatedAchievements.reduce((acc, a) => acc + (a.unlocked ? a.points : 0), 0);
      const nextLevel = Math.floor(totalXP / 50) + 1;
      
      setProfile((prev) => {
        if (!prev) return null;
        const nextProfile = {
          ...prev,
          level: nextLevel,
          xp: totalXP % 50
        };
        localStorage.setItem('gv_profile', JSON.stringify(nextProfile));
        return nextProfile;
      });
    }
  };

  // --- GAME END HANDLER ---
  const handleGameEnd = (finalScore: number, winStatus: boolean) => {
    if (!activeGame || !stats || !settings) return;

    // Check and save Highscore
    const isNewHigh = finalScore > activeGame.bestScore;
    const updatedGames = games.map((g) => {
      if (g.id === activeGame.id) {
        return {
          ...g,
          bestScore: Math.max(g.bestScore, finalScore)
        };
      }
      return g;
    });

    setGames(updatedGames);
    localStorage.setItem('gv_games', JSON.stringify(updatedGames));

    // Update global Statistics
    const updatedStats = {
      ...stats,
      highestScore: Math.max(stats.highestScore, finalScore),
      wins: stats.wins + (winStatus ? 1 : 0),
      losses: stats.losses + (winStatus ? 0 : 1)
    };
    setStats(updatedStats);
    localStorage.setItem('gv_stats', JSON.stringify(updatedStats));

    // Close game
    setActiveGame(null);

    // Trigger achievement evaluation
    runAchievementChecks(updatedGames, updatedStats);

    if (isNewHigh) {
      triggerToast('New High Score!', `You scored ${finalScore} in ${activeGame.name}!`);
    } else {
      triggerToast('Game Saved', `Logged round with score ${finalScore}!`);
    }
  };

  // --- SIMULATOR PHYSICAL KEY EVENTS ---
  const handleBackNavigation = () => {
    if (activeGame) {
      if (settings) playSound('click', settings);
      setActiveGame(null);
    } else {
      setActiveTab('home');
    }
  };

  const handleHomeNavigation = () => {
    if (settings) playSound('click', settings);
    setActiveGame(null);
    setActiveTab('home');
  };

  if (!stats || !profile || !settings) return null;

  return (
    <AndroidSimulator
      onBackPress={handleBackNavigation}
      onHomePress={handleHomeNavigation}
    >
      {/* 1. Android OS Boot Splash Screen */}
      {isBooting && (
        <div id="android-boot-screen" className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 z-50 select-none">
          {/* Neon Logo Sphere */}
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-[28px] flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.4)] border border-indigo-400/20 mb-4 animate-pulse">
            <span className="text-3xl">🎮</span>
          </div>
          
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-wider">GAMEVAULT</h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Android Offline Game Container</p>
          </div>

          {/* Loading status progress bar */}
          <div className="w-36 h-1.5 bg-slate-900 rounded-full overflow-hidden mt-12 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-150"
              style={{ width: `${bootProgress}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-600 font-mono mt-3 uppercase tracking-wider">
            Compiling SQLite Caches...
          </span>
        </div>
      )}

      {/* 2. Top Banner Notification Overlay for unlocks */}
      {activeToast && (
        <div className="absolute top-3 inset-x-3 bg-slate-900/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-3 flex items-center gap-3 z-40 shadow-2xl animate-bounce">
          <div className="w-9 h-9 rounded-xl bg-indigo-950 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Flame className="w-5 h-5 text-indigo-400 fill-indigo-500/30" />
          </div>
          <div className="flex-1 text-left">
            <h5 className="text-[11px] font-black text-slate-100 uppercase tracking-wide">{activeToast.title}</h5>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{activeToast.desc}</p>
          </div>
        </div>
      )}

      {/* 3. Main content area (App shell) */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* RENDER THE GAME VIEW (if any is active) */}
        {activeGame ? (
          activeGame.id === '2048' ? (
            <Game2048 game={activeGame} settings={settings} onGameOver={handleGameEnd} onExit={() => setActiveGame(null)} />
          ) : activeGame.id === 'snake' ? (
            <GameSnake game={activeGame} settings={settings} onGameOver={handleGameEnd} onExit={() => setActiveGame(null)} />
          ) : activeGame.id === 'flappy_bird' ? (
            <GameFlappyBird game={activeGame} settings={settings} onGameOver={handleGameEnd} onExit={() => setActiveGame(null)} />
          ) : activeGame.id === 'tic_tac_toe' ? (
            <GameTicTacToe game={activeGame} settings={settings} onGameOver={handleGameEnd} onExit={() => setActiveGame(null)} />
          ) : activeGame.id === 'memory_match' ? (
            <GameMemoryMatch game={activeGame} settings={settings} onGameOver={handleGameEnd} onExit={() => setActiveGame(null)} />
          ) : activeGame.id === 'sliding_puzzle' ? (
            <GameSlidingPuzzle game={activeGame} settings={settings} onGameOver={handleGameEnd} onExit={() => setActiveGame(null)} />
          ) : activeGame.id === 'blackjack' ? (
            <GameBlackjack game={activeGame} settings={settings} onGameOver={handleGameEnd} onExit={() => setActiveGame(null)} />
          ) : (
            <RetroArcadeSimulator game={activeGame} settings={settings} onGameOver={handleGameEnd} onExit={() => setActiveGame(null)} />
          )
        ) : (
          /* OTHERWISE RENDER HOME SYSTEM TABS */
          <>
            {activeTab === 'home' && (
              <HomeTab games={games} profile={profile} onSelectGame={setActiveGame} onToggleFavorite={handleToggleFavorite} />
            )}
            {activeTab === 'categories' && (
              <CategoriesTab games={games} onSelectGame={setActiveGame} onToggleFavorite={handleToggleFavorite} />
            )}
            {activeTab === 'favorites' && (
              <FavoritesTab games={games} onSelectGame={setActiveGame} onToggleFavorite={handleToggleFavorite} />
            )}
            {activeTab === 'achievements' && (
              <AchievementsTab achievements={achievements} stats={stats} />
            )}
            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onResetStats={handleResetStats}
                onResetAchievements={handleResetAchievements}
                onClearSaves={handleClearSaves}
              />
            )}

            {/* Bottom OS Navigation bar */}
            <nav className="h-14 bg-slate-950 border-t border-slate-900 flex justify-around items-center select-none z-30">
              <button
                onClick={() => { playSound('click', settings); setActiveTab('home'); }}
                className={`flex flex-col items-center gap-1 p-2 cursor-pointer ${activeTab === 'home' ? 'text-indigo-400' : 'text-slate-500'}`}
              >
                <Home className="w-4.5 h-4.5" />
                <span className="text-[9px] font-bold font-mono">Home</span>
              </button>
              
              <button
                onClick={() => { playSound('click', settings); setActiveTab('categories'); }}
                className={`flex flex-col items-center gap-1 p-2 cursor-pointer ${activeTab === 'categories' ? 'text-indigo-400' : 'text-slate-500'}`}
              >
                <Grid className="w-4.5 h-4.5" />
                <span className="text-[9px] font-bold font-mono">Genres</span>
              </button>

              <button
                onClick={() => { playSound('click', settings); setActiveTab('favorites'); }}
                className={`flex flex-col items-center gap-1 p-2 cursor-pointer ${activeTab === 'favorites' ? 'text-indigo-400' : 'text-slate-500'}`}
              >
                <Heart className="w-4.5 h-4.5" />
                <span className="text-[9px] font-bold font-mono">Favorites</span>
              </button>

              <button
                onClick={() => { playSound('click', settings); setActiveTab('achievements'); }}
                className={`flex flex-col items-center gap-1 p-2 cursor-pointer ${activeTab === 'achievements' ? 'text-indigo-400' : 'text-slate-500'}`}
              >
                <Award className="w-4.5 h-4.5" />
                <span className="text-[9px] font-bold font-mono">Badges</span>
              </button>

              <button
                onClick={() => { playSound('click', settings); setActiveTab('settings'); }}
                className={`flex flex-col items-center gap-1 p-2 cursor-pointer ${activeTab === 'settings' ? 'text-indigo-400' : 'text-slate-500'}`}
              >
                <Settings className="w-4.5 h-4.5" />
                <span className="text-[9px] font-bold font-mono">Config</span>
              </button>
            </nav>
          </>
        )}
      </div>
    </AndroidSimulator>
  );
}
