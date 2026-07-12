import React, { useState } from 'react';
import { Game, GameCategory } from '../types';
import { Heart, Trophy, Play } from 'lucide-react';

interface CategoriesTabProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  onToggleFavorite: (id: string) => void;
}

export default function CategoriesTab({
  games,
  onSelectGame,
  onToggleFavorite
}: CategoriesTabProps) {
  const [expandedCategory, setExpandedCategory] = useState<GameCategory | null>(null);

  const categoriesList: { name: GameCategory; icon: string; count: number; desc: string; gradient: string }[] = [
    {
      name: 'Puzzle',
      icon: '🧩',
      count: games.filter((g) => g.category === 'Puzzle').length,
      desc: 'Brain teasers, sliding cubes, and mathematical logic riddles.',
      gradient: 'from-blue-600 to-indigo-700'
    },
    {
      name: 'Arcade',
      icon: '👾',
      count: games.filter((g) => g.category === 'Arcade').length,
      desc: 'Action-packed retro controllers, snake reflexes, and pipe flaps.',
      gradient: 'from-purple-600 to-pink-700'
    },
    {
      name: 'Casual',
      icon: '🎈',
      count: games.filter((g) => g.category === 'Casual').length,
      desc: 'Simple, quick, paper-and-pencil matching duels for downtime.',
      gradient: 'from-teal-600 to-emerald-700'
    },
    {
      name: 'Card',
      icon: '🃏',
      count: games.filter((g) => g.category === 'Card').length,
      desc: 'Decks of cards, vegas high stakes, chips, and classic solitaire.',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      name: 'Board',
      icon: '👑',
      count: games.filter((g) => g.category === 'Board').length,
      desc: 'Strategic checkers and chess moves against local micro AI engines.',
      gradient: 'from-red-600 to-rose-700'
    },
    {
      name: 'Sports',
      icon: '⚽',
      count: games.filter((g) => g.category === 'Sports').length,
      desc: 'Action physics championship flicking penalties and stadium shoots.',
      gradient: 'from-emerald-600 to-teal-700'
    }
  ];

  const handleCategoryClick = (cat: GameCategory) => {
    if (expandedCategory === cat) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(cat);
    }
  };

  const categoryGames = games.filter((g) => g.category === expandedCategory);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-4 overflow-y-auto space-y-4 font-sans select-none">
      
      {/* Title */}
      <div className="flex flex-col gap-1 border-b border-slate-900 pb-2.5">
        <h2 className="text-base font-black text-slate-100 tracking-wide">Category Vault</h2>
        <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">BROWSE OFFLINE MINI-GAME GENRES</p>
      </div>

      {/* Categories Grid or Expanded Detail view */}
      {expandedCategory === null ? (
        <div className="grid grid-cols-1 gap-3.5 pb-4">
          {categoriesList.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="w-full text-left bg-gradient-to-r from-slate-900 to-slate-950/80 hover:to-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-3xl flex items-center justify-between gap-4 transition-all hover:scale-[1.01] shadow-lg group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-2xl shadow-md border border-white/10 group-hover:scale-105 transition-transform`}>
                  {cat.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-100">{cat.name}</span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">{cat.desc}</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 font-mono text-[10px] font-bold text-indigo-400">
                {cat.count}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-4">
          {/* Header to return back to grid list */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800/80 px-4 py-2.5 rounded-2xl">
            <span className="text-xs font-bold text-slate-300">
              Showing <strong className="text-indigo-400">{expandedCategory}</strong> ({categoryGames.length} games)
            </span>
            <button
              onClick={() => setExpandedCategory(null)}
              className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400 hover:text-slate-100 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              ◀ Genres
            </button>
          </div>

          {/* List of games in category */}
          <div className="grid grid-cols-1 gap-3">
            {categoryGames.map((game) => (
              <div
                key={game.id}
                className="bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 flex justify-between items-center gap-4 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950/85 border border-slate-800 flex items-center justify-center text-lg shadow-inner">
                    <span>{game.id === '2048' ? '🔢' : game.id === 'snake' ? '🐍' : game.id === 'flappy_bird' ? '🐦' : game.id === 'tic_tac_toe' ? '❌' : game.id === 'memory_match' ? '🧩' : game.id === 'sliding_puzzle' ? '🧩' : game.id === 'blackjack' ? '🃏' : '👾'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-100">{game.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                      DIFFICULTY: <strong className="text-indigo-400">{game.difficulty}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleFavorite(game.id)}
                    className="text-slate-500 hover:text-rose-500 p-2 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${game.isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
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
          </div>
        </div>
      )}
    </div>
  );
}
