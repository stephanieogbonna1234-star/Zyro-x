import React, { useState } from 'react';
import { Game, UserProfile } from '../types';
import { Search, Heart, Star, Flame, Trophy, Play, Grid, ArrowRight } from 'lucide-react';

interface HomeTabProps {
  games: Game[];
  profile: UserProfile;
  onSelectGame: (game: Game) => void;
  onToggleFavorite: (id: string) => void;
}

export default function HomeTab({
  games,
  profile,
  onSelectGame,
  onToggleFavorite
}: HomeTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  const categories = ['All', 'Puzzle', 'Arcade', 'Casual', 'Card', 'Board', 'Sports'];

  // Handle search and category filters
  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategoryFilter === 'All' || game.category === activeCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const featuredGame = games.find((g) => g.id === 'snake') || games[0];
  const popularGames = games.slice(1, 5);
  const playables = games.filter((g) => ['2048', 'snake', 'flappy_bird', 'tic_tac_toe', 'memory_match', 'sliding_puzzle', 'blackjack'].includes(g.id));

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-4 overflow-y-auto space-y-5 font-sans scrollbar-none select-none">
      
      {/* Top Welcome / Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-xl shadow-lg border border-indigo-400/20">
            {profile.avatar}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest">OFFLINE VAULT</span>
            <span className="text-sm font-bold text-slate-100">{profile.username}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 font-mono text-[10px] text-slate-400">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>LVL <strong className="text-white">{profile.level}</strong></span>
        </div>
      </div>

      {/* Dynamic Search Box */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search offline mini-games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs px-10 py-3 rounded-2xl focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-500 shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Featured Game Section */}
      {searchQuery === '' && featuredGame && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/60 to-slate-950 border border-indigo-500/20 p-5 flex flex-col gap-3 shadow-xl">
          {/* Decorative neon lights */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex justify-between items-start z-10">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 text-[9px] font-bold font-mono uppercase px-2.5 py-1 rounded-full tracking-wider">
              🎮 FEATURED VAULT TITLE
            </span>
            <button
              onClick={() => onToggleFavorite(featuredGame.id)}
              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
            >
              <Heart className={`w-5 h-5 ${featuredGame.isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
            </button>
          </div>

          <div className="space-y-1 z-10">
            <h2 className="text-lg font-black tracking-wide text-slate-100">{featuredGame.name}</h2>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{featuredGame.description}</p>
          </div>

          <div className="flex justify-between items-center z-10 pt-2 border-t border-slate-900">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>BEST: <strong className="text-slate-300">{featuredGame.bestScore || '0'}</strong></span>
            </div>
            <button
              onClick={() => onSelectGame(featuredGame)}
              className="bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-950/40 transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-white" /> Play Game
            </button>
          </div>
        </div>
      )}

      {/* Category Tabs list */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
              activeCategoryFilter === cat
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-950/35'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Games List Container */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
            {activeCategoryFilter === 'All' ? 'PRO-GAMES LIST' : `${activeCategoryFilter} GAMES`} ({filteredGames.length})
          </h3>
          {activeCategoryFilter === 'All' && (
            <span className="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
              Fully Playable <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4">
          {filteredGames.map((game) => {
            const isPlayable = playables.some((p) => p.id === game.id);
            return (
              <div
                key={game.id}
                className="bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-3 flex flex-col justify-between gap-3 transition-all hover:scale-[1.02] shadow-md group relative overflow-hidden"
              >
                {isPlayable && (
                  <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-500/10 rounded-bl-2xl border-l border-b border-indigo-500/20 flex items-center justify-center">
                    <span className="text-[8px] font-mono font-bold text-indigo-400">PLAY</span>
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-xl bg-slate-950/80 flex items-center justify-center text-indigo-400 border border-slate-800">
                    <span className="text-lg">{game.id === '2048' ? '🔢' : game.id === 'snake' ? '🐍' : game.id === 'flappy_bird' ? '🐦' : game.id === 'tic_tac_toe' ? '❌' : game.id === 'memory_match' ? '🧩' : game.id === 'sliding_puzzle' ? '🧩' : game.id === 'blackjack' ? '🃏' : '👾'}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(game.id);
                    }}
                    className="text-slate-500 hover:text-rose-500 transition-colors p-1 z-10"
                  >
                    <Heart className={`w-4 h-4 ${game.isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
                  </button>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                    {game.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                    {game.category}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-950/40">
                  <span className="text-[9px] text-slate-400 font-mono">
                    HI: <strong className="text-slate-200">{game.bestScore || '0'}</strong>
                  </span>
                  <button
                    onClick={() => onSelectGame(game)}
                    className="bg-slate-950 hover:bg-indigo-600 text-slate-300 hover:text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-800 transition-all cursor-pointer"
                  >
                    Start
                  </button>
                </div>
              </div>
            );
          })}
          {filteredGames.length === 0 && (
            <div className="col-span-2 text-center py-8 text-slate-500 text-xs font-mono">
              No matching offline games found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
