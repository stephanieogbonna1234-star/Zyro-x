import React from 'react';
import { Game } from '../types';
import { Heart, Play, Trophy } from 'lucide-react';

interface FavoritesTabProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  onToggleFavorite: (id: string) => void;
}

export default function FavoritesTab({
  games,
  onSelectGame,
  onToggleFavorite
}: FavoritesTabProps) {
  const favoriteGames = games.filter((g) => g.isFavorite);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-4 overflow-y-auto space-y-4 font-sans select-none">
      
      {/* Title */}
      <div className="flex flex-col gap-1 border-b border-slate-900 pb-2.5">
        <h2 className="text-base font-black text-slate-100 tracking-wide">Saved Favorites</h2>
        <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">YOUR BOOKMARKED QUICK-LAUNCH LIST</p>
      </div>

      {/* Favorites List */}
      <div className="grid grid-cols-1 gap-3 pb-4">
        {favoriteGames.map((game) => (
          <div
            key={game.id}
            className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex justify-between items-center gap-4 shadow-md hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950/80 flex items-center justify-center text-lg border border-slate-800 shadow-inner">
                <span>{game.id === '2048' ? '🔢' : game.id === 'snake' ? '🐍' : game.id === 'flappy_bird' ? '🐦' : game.id === 'tic_tac_toe' ? '❌' : game.id === 'memory_match' ? '🧩' : game.id === 'sliding_puzzle' ? '🧩' : game.id === 'blackjack' ? '🃏' : '👾'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-100">{game.name}</span>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>BEST: <strong className="text-slate-300">{game.bestScore || '0'}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(game.id)}
                className="text-rose-500 p-2 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors"
                title="Remove from favorites"
              >
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </button>
              <button
                onClick={() => onSelectGame(game)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Play className="w-3 h-3 fill-white" /> Play
              </button>
            </div>
          </div>
        ))}

        {favoriteGames.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-600">
              <Heart className="w-5 h-5 text-slate-700" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-bold">No favorite games saved yet.</p>
              <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                Click the heart icon on any game cards to bookmark them for easy launch!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
