import React, { useState, useEffect } from 'react';
import { playSound } from '../../utils/audio';
import { Game, AppSettings } from '../../types';
import { ArrowLeft, RefreshCw, Volume2, VolumeX, Pause, Play, Award, HelpCircle } from 'lucide-react';

interface Game2048Props {
  game: Game;
  settings: AppSettings;
  onGameOver: (score: number, win: boolean) => void;
  onExit: () => void;
}

type Board = number[][];

export default function Game2048({
  game,
  settings,
  onGameOver,
  onExit
}: Game2048Props) {
  const [board, setBoard] = useState<Board>([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(game.bestScore || 0);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  const simulatedSettings = {
    ...settings,
    soundVolume: soundEnabled ? settings.soundVolume : 0
  };

  // Initialize board with two random tiles
  const initBoard = () => {
    let newBoard = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setHasWon(false);
    setIsPaused(false);
    setShowTutorial(false);
    playSound('click', simulatedSettings);
  };

  useEffect(() => {
    initBoard();
  }, []);

  const addRandomTile = (currentBoard: Board): Board => {
    const emptyCells: { r: number; c: number }[] = [];
    currentBoard.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 0) emptyCells.push({ r, c });
      });
    });

    if (emptyCells.length === 0) return currentBoard;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    const newBoard = currentBoard.map((row) => [...row]);
    newBoard[randomCell.r][randomCell.c] = value;
    return newBoard;
  };

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return 'bg-slate-800 text-slate-100 border border-slate-700';
      case 4: return 'bg-slate-700 text-slate-100 border border-slate-600';
      case 8: return 'bg-orange-500 text-white font-bold border border-orange-400 shadow-lg';
      case 16: return 'bg-amber-600 text-white font-bold border border-amber-500 shadow-lg';
      case 32: return 'bg-rose-500 text-white font-bold border border-rose-400 shadow-lg';
      case 64: return 'bg-red-600 text-white font-bold border border-red-500 shadow-lg';
      case 128: return 'bg-yellow-500 text-slate-900 font-extrabold border border-yellow-400 shadow-md scale-105';
      case 256: return 'bg-yellow-400 text-slate-900 font-extrabold border border-yellow-300 shadow-md scale-105';
      case 512: return 'bg-emerald-500 text-white font-extrabold border border-emerald-400 shadow-lg scale-105 animate-pulse';
      case 1024: return 'bg-teal-500 text-white font-extrabold border border-teal-400 shadow-xl scale-110 animate-pulse';
      case 2048: return 'bg-indigo-600 text-white font-black border border-indigo-500 shadow-2xl scale-110 animate-bounce duration-1000';
      default: return 'bg-slate-900 text-slate-600 border border-slate-950/40';
    }
  };

  // Move operations
  const slideLeft = (currentBoard: Board): { board: Board; scoreGain: number; moved: boolean } => {
    let scoreGain = 0;
    let moved = false;
    const newBoard = currentBoard.map((row) => {
      // 1. Filter out zeros
      const filtered = row.filter((val) => val !== 0);
      // 2. Merge adjacent identical tiles
      const merged: number[] = [];
      let i = 0;
      while (i < filtered.length) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
          const mergedVal = filtered[i] * 2;
          merged.push(mergedVal);
          scoreGain += mergedVal;
          moved = true;
          i += 2;
        } else {
          merged.push(filtered[i]);
          i++;
        }
      }
      // 3. Pad with zeros
      while (merged.length < 4) {
        merged.push(0);
      }
      
      // Check if actually moved
      if (JSON.stringify(row) !== JSON.stringify(merged)) {
        moved = true;
      }
      return merged;
    });

    return { board: newBoard, scoreGain, moved };
  };

  const rotateClockwise = (matrix: Board): Board => {
    const n = matrix.length;
    const result = Array.from({ length: n }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        result[c][n - 1 - r] = matrix[r][c];
      }
    }
    return result;
  };

  const handleMove = (direction: 'LEFT' | 'UP' | 'RIGHT' | 'DOWN') => {
    if (gameOver || isPaused) return;

    let current = board.map((row) => [...row]);
    let rotatedCount = 0;

    switch (direction) {
      case 'LEFT':
        rotatedCount = 0;
        break;
      case 'UP':
        current = rotateClockwise(rotateClockwise(rotateClockwise(current))); // 270 deg
        rotatedCount = 1;
        break;
      case 'RIGHT':
        current = rotateClockwise(rotateClockwise(current)); // 180 deg
        rotatedCount = 2;
        break;
      case 'DOWN':
        current = rotateClockwise(current); // 90 deg
        rotatedCount = 3;
        break;
    }

    const { board: slid, scoreGain, moved } = slideLeft(current);

    // Rotate back to original alignment
    let finalBoard = slid;
    for (let i = 0; i < (4 - rotatedCount) % 4; i++) {
      finalBoard = rotateClockwise(finalBoard);
    }

    if (moved) {
      const updatedBoard = addRandomTile(finalBoard);
      setBoard(updatedBoard);
      setScore((prev) => {
        const next = prev + scoreGain;
        if (next > bestScore) setBestScore(next);
        return next;
      });

      if (scoreGain > 0) {
        playSound('powerup', simulatedSettings);
      } else {
        playSound('bounce', simulatedSettings);
      }

      // Check for 2048 win
      let maxTile = 0;
      updatedBoard.forEach((r) => r.forEach((val) => {
        if (val > maxTile) maxTile = val;
      }));

      if (maxTile >= 2048 && !hasWon) {
        setHasWon(true);
        playSound('win', simulatedSettings);
      }

      // Check for Game Over
      if (checkGameOver(updatedBoard)) {
        setGameOver(true);
        playSound('lose', simulatedSettings);
      }
    }
  };

  const checkGameOver = (tempBoard: Board): boolean => {
    // Check for empty cells
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (tempBoard[r][c] === 0) return false;
      }
    }
    // Check for adjacent matching numbers
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = tempBoard[r][c];
        if (r + 1 < 4 && tempBoard[r + 1][c] === val) return false;
        if (c + 1 < 4 && tempBoard[r][c + 1] === val) return false;
      }
    }
    return true;
  };

  // Keyboard hooks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || isPaused || showTutorial) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        e.preventDefault();
        handleMove('LEFT');
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault();
        handleMove('RIGHT');
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        handleMove('UP');
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        handleMove('DOWN');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, gameOver, isPaused, showTutorial]);

  // Touch Swipe Gesture Detection
  let touchStartX = 0;
  let touchStartY = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (gameOver || isPaused || showTutorial) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > 30) {
        if (diffX > 0) handleMove('RIGHT');
        else handleMove('LEFT');
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > 30) {
        if (diffY > 0) handleMove('DOWN');
        else handleMove('UP');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-4 relative font-sans overflow-y-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-100 text-xs py-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <span className="text-xs font-bold font-mono tracking-wider text-indigo-400 uppercase">
          2048 Puzzle
        </span>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-slate-400 hover:text-slate-200 p-1"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Tutorial Card */}
      {showTutorial && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl mb-4 select-none">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm">How to Play 2048</h3>
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
          <button
            onClick={initBoard}
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-wide cursor-pointer"
          >
            Start Puzzle!
          </button>
        </div>
      )}

      {/* Score and Stats panels */}
      {!showTutorial && (
        <div className="flex items-center justify-between mb-4 gap-3 select-none">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-center">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">SCORE</span>
            <span className="text-lg font-bold text-emerald-400">{score}</span>
          </div>
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-center">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">BEST SCORE</span>
            <span className="text-lg font-bold text-indigo-400">{bestScore}</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={initBoard}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 transition-all border border-slate-700 cursor-pointer"
              title="Restart game"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 transition-all border border-slate-700 cursor-pointer"
              title="Pause"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Game board wrapper */}
      {!showTutorial && (
        <div className="flex-1 flex flex-col items-center justify-center relative">
          
          {/* Pause overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-20 gap-3 border border-slate-800">
              <h4 className="text-xl font-bold text-slate-200 font-mono tracking-wider">GAME PAUSED</h4>
              <p className="text-xs text-slate-500 mb-2">Sweep or slide to resume!</p>
              <button
                onClick={() => {
                  playSound('resume', simulatedSettings);
                  setIsPaused(false);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 uppercase tracking-wide cursor-pointer"
              >
                Resume Match
              </button>
            </div>
          )}

          {/* Game Over / Win modal */}
          {gameOver && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-20 gap-4 text-center border border-slate-800">
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center">
                <Award className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-rose-500 font-mono uppercase">Game Over</h4>
                <p className="text-xs text-slate-400 mt-1">Excellent effort! Saved score to Vault.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 w-40 font-mono">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">FINAL SCORE</span>
                <span className="text-lg font-bold text-emerald-400">{score}</span>
              </div>
              <div className="flex gap-2 w-full max-w-[240px]">
                <button
                  onClick={() => onGameOver(score, score >= 2048)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 cursor-pointer"
                >
                  Save & Exit
                </button>
                <button
                  onClick={initBoard}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Board Grid container */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full max-w-[280px] aspect-square bg-slate-900 border-2 border-slate-800 p-2.5 rounded-3xl flex flex-col gap-2 relative shadow-inner select-none"
          >
            {board.map((row, rIdx) => (
              <div key={rIdx} className="flex-1 flex gap-2">
                {row.map((cell, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`flex-1 aspect-square rounded-xl flex items-center justify-center font-mono font-bold text-lg transition-all duration-100 ${getTileColor(cell)}`}
                  >
                    {cell > 0 ? cell : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Controls instructions */}
          <div className="mt-4 text-center select-none">
            <p className="text-[10px] text-slate-500 font-mono">
              Desktop: <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-400">WASD</kbd> or <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-400">Arrows</kbd>
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Mobile: Swipe inside grid board
            </p>
          </div>
          
          {/* Virtual arrow keys for Mobile clickers */}
          <div className="mt-4 flex flex-col items-center gap-1 select-none">
            <button
              onClick={() => handleMove('UP')}
              className="w-10 h-10 bg-slate-800 active:bg-slate-700 border border-slate-700 rounded-xl font-bold flex items-center justify-center text-slate-200 shadow-md"
            >
              ▲
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => handleMove('LEFT')}
                className="w-10 h-10 bg-slate-800 active:bg-slate-700 border border-slate-700 rounded-xl font-bold flex items-center justify-center text-slate-200 shadow-md"
              >
                ◀
              </button>
              <button
                onClick={() => handleMove('DOWN')}
                className="w-10 h-10 bg-slate-800 active:bg-slate-700 border border-slate-700 rounded-xl font-bold flex items-center justify-center text-slate-200 shadow-md"
              >
                ▼
              </button>
              <button
                onClick={() => handleMove('RIGHT')}
                className="w-10 h-10 bg-slate-800 active:bg-slate-700 border border-slate-700 rounded-xl font-bold flex items-center justify-center text-slate-200 shadow-md"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
