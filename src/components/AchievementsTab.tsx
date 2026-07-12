import React from 'react';
import { Achievement, GameStats } from '../types';
import { Award, Trophy, Lock, ShieldAlert, Heart, Flame, Coins, Hash, Milestone, Gamepad2 } from 'lucide-react';

interface AchievementsTabProps {
  achievements: Achievement[];
  stats: GameStats;
}

export default function AchievementsTab({
  achievements,
  stats
}: AchievementsTabProps) {
  // Map standard string keys to beautiful Lucide components
  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const iconClass = `w-5 h-5 ${isUnlocked ? 'text-indigo-400' : 'text-slate-600'}`;

    switch (iconName) {
      case 'Gamepad2': return <Gamepad2 className={iconClass} />;
      case 'Trophy': return <Trophy className={iconClass} />;
      case 'Milestone': return <Milestone className={iconClass} />;
      case 'Award': return <Award className={iconClass} />;
      case 'Flame': return <Flame className={iconClass} />;
      case 'Coins': return <Coins className={iconClass} />;
      case 'Hash': return <Hash className={iconClass} />;
      case 'Heart': return <Heart className={iconClass} />;
      default: return <Award className={iconClass} />;
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXP = achievements.reduce((acc, a) => acc + (a.unlocked ? a.points : 0), 0);

  const formatDuration = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-4 overflow-y-auto space-y-4 font-sans select-none">
      
      {/* Title */}
      <div className="flex flex-col gap-1 border-b border-slate-900 pb-2.5">
        <h2 className="text-base font-black text-slate-100 tracking-wide">Milestones & Statistics</h2>
        <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">LOCAL SYSTEM ACHIEVEMENTS</p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl font-mono text-center relative overflow-hidden">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider block">COMPLETED</span>
          <span className="text-lg font-bold text-indigo-400">{unlockedCount} / {achievements.length}</span>
          <div className="text-[9px] text-slate-500 mt-1">Unlocked Badges</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl font-mono text-center relative overflow-hidden">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider block">XP SCORE</span>
          <span className="text-lg font-bold text-amber-500">+{totalXP} EXP</span>
          <div className="text-[9px] text-slate-500 mt-1">Gained Offline XP</div>
        </div>
      </div>

      {/* Statistics board */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5">
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wide block border-b border-slate-950 pb-2">
          OFFLINE TELEMETRY RECORDS
        </span>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 text-[10px] block">TOTAL PLAYTIME</span>
            <span className="text-slate-200 font-bold text-sm">{formatDuration(stats.timePlayed)}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">DAILY STREAK</span>
            <span className="text-slate-200 font-bold text-sm flex items-center gap-1">
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500" /> {stats.dailyStreak} Days
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">GAMES LAUNCHED</span>
            <span className="text-slate-200 font-bold text-sm">{stats.gamesPlayed} Rounds</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">RATIO (W / L)</span>
            <span className="text-slate-200 font-bold text-sm text-emerald-400">
              {stats.wins}W <span className="text-slate-600">-</span> {stats.losses}L
            </span>
          </div>
        </div>
      </div>

      {/* Milestones list */}
      <div className="space-y-3 pb-4">
        <h3 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
          BADGES REGISTRY ({achievements.length})
        </h3>
        
        <div className="space-y-2.5">
          {achievements.map((ach) => {
            const isUnlocked = ach.unlocked;
            return (
              <div
                key={ach.id}
                className={`border p-3.5 rounded-2xl flex items-center justify-between gap-4 transition-all shadow-sm ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-slate-900 to-indigo-950/25 border-indigo-500/25'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isUnlocked
                      ? 'bg-slate-950 border-indigo-500/30'
                      : 'bg-slate-950 border-slate-850'
                  }`}>
                    {renderBadgeIcon(ach.badge, isUnlocked)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs font-bold ${isUnlocked ? 'text-slate-100' : 'text-slate-400'}`}>
                      {ach.title}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-normal max-w-[200px]">
                      {ach.description}
                    </span>
                    {/* Progress tracking bar */}
                    {ach.maxProgress > 1 && (
                      <div className="w-40 mt-1.5 space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                          <span>Progress</span>
                          <span>{ach.progress} / {ach.maxProgress}</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${
                    isUnlocked
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-950 text-slate-600'
                  }`}>
                    {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    +{ach.points} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
