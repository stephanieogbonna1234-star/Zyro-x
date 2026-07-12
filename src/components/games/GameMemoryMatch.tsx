import React, { useState, useEffect } from 'react';
import { playSound } from '../../utils/audio';
import { Game, AppSettings } from '../../types';
import { ArrowLeft, RefreshCw, Volume2, VolumeX, Trophy, HelpCircle, Eye } from 'lucide-react';

interface GameMemoryMatchProps {
  game: Game;
  settings: AppSettings;
  onGameOver: (score: number, win: boolean) => void;
  onExit: () => void;
}

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORY_THEMES = {
  animals: ['🐶', '🐱', '🦁', '🦊', '🐷', '🐸', '🐙', '🦖'],
  retro: ['👾', '🕹️', '🚀', '💣', '🛡️', '💎', '🔑', '❤️'],
  food: ['🍎', '🍕', '🍔', '🍣', '🍦', '🍩', '🍪', '🥑']
};

export default function GameMemoryMatch({
  game,
  settings,
  onGameOver,
  onExit
}: GameMemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [theme, setTheme] = useState<'retro' | 'animals' | 'food'>('retro');
  const [showTutorial, setShowTutorial] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameEnded, setGameEnded] = useState(false);

  const simulatedSettings = {
    ...settings,
    soundVolume: soundEnabled ? settings.soundVolume : 0
  };

  const initGame = () => {
    playSound('click', simulatedSettings);
    setShowTutorial(false);
    setGameEnded(false);
    setMoves(0);
    setMatchesCount(0);
    setFlippedIndices([]);

    const items = MEMORY_THEMES[theme];
    // Duplicate items to make pairs
    const deck = [...items, ...items].map((icon, idx) => ({
      id: idx,
      icon,
      isFlipped: false,
      isMatched: false
    }));

    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
  };

  useEffect(() => {
    if (!showTutorial) {
      initGame();
    }
  }, [theme]);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length >= 2) return;

    // Flip card
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    playSound('click', simulatedSettings);

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = nextFlipped;

      if (cards[firstIdx].icon === cards[secondIdx].icon) {
        // MATCHED!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatchesCount((prev) => {
            const next = prev + 1;
            playSound('powerup', simulatedSettings);
            if (next === MEMORY_THEMES[theme].length) {
              setGameEnded(true);
              playSound('win', simulatedSettings);
            }
            return next;
          });
        }, 500);
      } else {
        // NO MATCH, flip back
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          playSound('bounce', simulatedSettings);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-4 relative font-sans overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-100 text-xs py-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <span className="text-xs font-bold font-mono tracking-wider text-indigo-400 uppercase">
          Memory Match
        </span>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-slate-400 hover:text-slate-200 p-1"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Tutorial panel */}
      {showTutorial && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl mb-4 select-none">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm">Memory Training</h3>
          </div>
          <ul className="text-xs text-slate-400 space-y-2 pl-1 list-none">
            {game.tutorial.map((step, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-indigo-400 font-bold font-mono">{(idx + 1).toString().padStart(2, '0')}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-800/80 my-1"></div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {(['retro', 'animals', 'food'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                    theme === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={initGame}
              className="bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md uppercase tracking-wide cursor-pointer"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* Score Dashboard */}
      {!showTutorial && (
        <div className="flex items-center justify-between mb-4 gap-3 select-none">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-center">
            <span className="text-[9px] text-slate-500 block">FLIP MOVES</span>
            <span className="text-lg font-bold text-emerald-400">{moves}</span>
          </div>
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-center">
            <span className="text-[9px] text-slate-500 block">MATCHES</span>
            <span className="text-lg font-bold text-indigo-400">{matchesCount} / {MEMORY_THEMES[theme].length}</span>
          </div>
          <button
            onClick={initGame}
            className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 cursor-pointer"
            title="Reset cards"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Play cabinet Screen */}
      {!showTutorial && (
        <div className="flex-1 flex flex-col items-center justify-center relative select-none">
          {/* End Match Overlay */}
          {gameEnded && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10 gap-4 text-center border border-slate-800">
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold font-mono uppercase">Puzzle Solved!</h4>
                <p className="text-xs text-slate-400 mt-1">Excellent speed and memory recall.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 w-40 font-mono">
                <span className="text-[9px] text-slate-500 block">TOTAL MOVES</span>
                <span className="text-lg font-bold text-emerald-400">{moves}</span>
              </div>
              <div className="flex gap-2 w-full max-w-[240px]">
                <button
                  onClick={() => onGameOver(Math.max(10, 200 - moves * 5), true)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 cursor-pointer"
                >
                  Save & Exit
                </button>
                <button
                  onClick={initGame}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {/* Cards Grid board */}
          <div className="w-full max-w-[280px] grid grid-cols-4 gap-2 border-2 border-slate-800 p-2.5 bg-slate-900 rounded-3xl shadow-2xl relative">
            {cards.map((card, idx) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(idx)}
                disabled={card.isFlipped || card.isMatched}
                className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all duration-300 cursor-pointer border ${
                  card.isFlipped || card.isMatched
                    ? 'bg-slate-850 border-indigo-500/30 rotate-y-180 shadow-md shadow-indigo-950/20'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-600 shadow-inner'
                }`}
              >
                {card.isFlipped || card.isMatched ? (
                  <span>{card.icon}</span>
                ) : (
                  <Eye className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                )}
              </button>
            ))}
          </div>

          {/* Theme selections */}
          <div className="mt-6 flex items-center gap-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide font-mono mr-1">THEME:</span>
            {(['retro', 'animals', 'food'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                  theme === t
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/20 shadow-sm'
                    : 'bg-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
