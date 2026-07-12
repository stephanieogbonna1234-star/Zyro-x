import React, { useState, useEffect } from 'react';
import { playSound } from '../../utils/audio';
import { Game, AppSettings } from '../../types';
import { ArrowLeft, RefreshCw, Volume2, VolumeX, Trophy, HelpCircle } from 'lucide-react';

interface GameSlidingPuzzleProps {
  game: Game;
  settings: AppSettings;
  onGameOver: (score: number, win: boolean) => void;
  onExit: () => void;
}

export default function GameSlidingPuzzle({
  game,
  settings,
  onGameOver,
  onExit
}: GameSlidingPuzzleProps) {
  const [gridSize, setGridSize] = useState<3 | 4>(3); // 3x3 (8-puzzle) or 4x4 (15-puzzle)
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const simulatedSettings = {
    ...settings,
    soundVolume: soundEnabled ? settings.soundVolume : 0
  };

  // Check if a layout is solvable
  const isSolvable = (puzzle: number[], size: number): boolean => {
    let inversions = 0;
    const len = puzzle.length;
    for (let i = 0; i < len - 1; i++) {
      for (let j = i + 1; j < len; j++) {
        if (puzzle[i] && puzzle[j] && puzzle[i] > puzzle[j]) {
          inversions++;
        }
      }
    }
    // For 3x3 grid, odd inversions mean unsolvable
    if (size === 3) {
      return inversions % 2 === 0;
    } else {
      // 4x4 size is more complex (row position of blank + inversions must equal odd/even)
      const blankIndex = puzzle.indexOf(0);
      const blankRowFromBottom = size - Math.floor(blankIndex / size);
      if (blankRowFromBottom % 2 === 0) {
        return inversions % 2 !== 0;
      } else {
        return inversions % 2 === 0;
      }
    }
  };

  const initBoard = () => {
    playSound('click', simulatedSettings);
    setShowTutorial(false);
    setIsSolved(false);
    setMoves(0);
    setTimer(0);

    const totalCells = gridSize * gridSize;
    let newTiles: number[] = [];

    // Create sorted list [1, 2, 3... 0]
    for (let i = 1; i < totalCells; i++) {
      newTiles.push(i);
    }
    newTiles.push(0); // 0 represents the blank space

    // Shuffle until solvable
    let solvable = false;
    while (!solvable) {
      // Shuffle
      for (let i = newTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newTiles[i], newTiles[j]] = [newTiles[j], newTiles[i]];
      }
      // Check solvability and make sure it is not already solved
      solvable = isSolvable(newTiles, gridSize) && !checkWinState(newTiles);
    }

    setTiles(newTiles);
  };

  useEffect(() => {
    if (!showTutorial) {
      initBoard();
    }
  }, [gridSize]);

  // Timer loop
  useEffect(() => {
    if (showTutorial || isSolved || tiles.length === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [showTutorial, isSolved, tiles]);

  const checkWinState = (currentTiles: number[]): boolean => {
    const totalCells = gridSize * gridSize;
    for (let i = 0; i < totalCells - 1; i++) {
      if (currentTiles[i] !== i + 1) return false;
    }
    return currentTiles[totalCells - 1] === 0;
  };

  const handleTileClick = (index: number) => {
    if (isSolved) return;

    const blankIndex = tiles.indexOf(0);
    const tileRow = Math.floor(index / gridSize);
    const tileCol = index % gridSize;
    const blankRow = Math.floor(blankIndex / gridSize);
    const blankCol = blankIndex % gridSize;

    // Check if clicked tile is adjacent to blank tile
    const isAdjacent =
      (Math.abs(tileRow - blankRow) === 1 && tileCol === blankCol) ||
      (Math.abs(tileCol - blankCol) === 1 && tileRow === blankRow);

    if (isAdjacent) {
      const nextTiles = [...tiles];
      // Swap clicked tile with blank space
      nextTiles[blankIndex] = tiles[index];
      nextTiles[index] = 0;
      setTiles(nextTiles);
      setMoves((prev) => prev + 1);
      playSound('bounce', simulatedSettings);

      if (checkWinState(nextTiles)) {
        setIsSolved(true);
        playSound('win', simulatedSettings);
      }
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
          Sliding 15-Puzzle
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
            <h3 className="font-bold text-slate-100 text-sm">How to Solve</h3>
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
            <div className="flex gap-1.5">
              {([3, 4] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setGridSize(sz)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                    gridSize === sz
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {sz === 3 ? '3x3 (Easy)' : '4x4 (Hard)'}
                </button>
              ))}
            </div>
            <button
              onClick={initBoard}
              className="bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wide cursor-pointer"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* Stats panels */}
      {!showTutorial && (
        <div className="flex items-center justify-between mb-4 gap-3 select-none">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-center">
            <span className="text-[9px] text-slate-500 block">TOTAL MOVES</span>
            <span className="text-lg font-bold text-emerald-400">{moves}</span>
          </div>
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-center">
            <span className="text-[9px] text-slate-500 block">STOPWATCH</span>
            <span className="text-lg font-bold text-indigo-400">{formatTime(timer)}</span>
          </div>
          <button
            onClick={initBoard}
            className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cabinet Screen */}
      {!showTutorial && (
        <div className="flex-1 flex flex-col items-center justify-center relative select-none">
          {/* Victory Overlay */}
          {isSolved && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10 gap-4 text-center border border-slate-800">
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold font-mono uppercase text-emerald-400">Solved!</h4>
                <p className="text-xs text-slate-400 mt-1">Stellar brain speed and sliding layout.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 w-40 font-mono space-y-1">
                <div>
                  <span className="text-[9px] text-slate-500 block">MOVES</span>
                  <span className="text-md font-bold text-emerald-400">{moves}</span>
                </div>
                <div className="border-t border-slate-800/85 my-1"></div>
                <div>
                  <span className="text-[9px] text-slate-500 block">TIME TAKEN</span>
                  <span className="text-md font-bold text-indigo-400">{formatTime(timer)}</span>
                </div>
              </div>
              <div className="flex gap-2 w-full max-w-[240px]">
                <button
                  onClick={() => onGameOver(Math.max(10, 500 - moves * 2 - timer), true)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 cursor-pointer"
                >
                  Save & Exit
                </button>
                <button
                  onClick={initBoard}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {/* Sliding Grid card */}
          <div
            className={`w-full max-w-[280px] aspect-square bg-slate-900 border-2 border-slate-800 p-2.5 rounded-3xl grid gap-2 shadow-2xl relative`}
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
            }}
          >
            {tiles.map((tile, idx) => (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                disabled={tile === 0 || isSolved}
                className={`aspect-square rounded-2xl flex items-center justify-center font-mono font-black transition-all cursor-pointer border ${
                  tile === 0
                    ? 'bg-slate-950 border-slate-950/20'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-100 border-slate-700 shadow-md active:scale-95'
                } ${gridSize === 3 ? 'text-3xl' : 'text-xl'}`}
              >
                {tile > 0 ? tile : ''}
              </button>
            ))}
          </div>

          {/* Mode controller */}
          <div className="mt-6 flex items-center gap-1 select-none">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide font-mono mr-1">GRID:</span>
            {([3, 4] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => setGridSize(sz)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                  gridSize === sz
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/20 shadow-sm'
                    : 'bg-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {sz === 3 ? '8-Puzzle (3x3)' : '15-Puzzle (4x4)'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
