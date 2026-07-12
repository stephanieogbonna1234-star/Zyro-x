import React, { useState, useEffect } from 'react';
import { playSound } from '../../utils/audio';
import { Game, AppSettings } from '../../types';
import { ArrowLeft, RefreshCw, Volume2, VolumeX, Trophy, HelpCircle } from 'lucide-react';

interface GameTicTacToeProps {
  game: Game;
  settings: AppSettings;
  onGameOver: (score: number, win: boolean) => void;
  onExit: () => void;
}

type BoardState = ('X' | 'O' | null)[];

export default function GameTicTacToe({
  game,
  settings,
  onGameOver,
  onExit
}: GameTicTacToeProps) {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [winner, setWinner] = useState<'X' | 'O' | 'Draw' | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [score, setScore] = useState(0);

  const simulatedSettings = {
    ...settings,
    soundVolume: soundEnabled ? settings.soundVolume : 0
  };

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  const checkWinner = (squares: BoardState): 'X' | 'O' | 'Draw' | null => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a] as 'X' | 'O';
      }
    }
    if (squares.every((square) => square !== null)) {
      return 'Draw';
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || !isXNext) return;

    // Player Move (X)
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsXNext(false);
    playSound('bounce', simulatedSettings);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      handleGameEnd(gameWinner);
    }
  };

  // AI Move triggers
  useEffect(() => {
    if (isXNext || winner || showTutorial) return;

    const timer = setTimeout(() => {
      makeAIMove();
    }, 400);

    return () => clearTimeout(timer);
  }, [isXNext, winner, showTutorial]);

  const makeAIMove = () => {
    const emptyIndices: number[] = [];
    board.forEach((val, idx) => {
      if (val === null) emptyIndices.push(idx);
    });

    if (emptyIndices.length === 0) return;

    let aiMoveIndex = -1;

    if (difficulty === 'Easy') {
      // 100% Random moves
      aiMoveIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    } else if (difficulty === 'Medium') {
      // 50% tactical, 50% random
      if (Math.random() < 0.5) {
        aiMoveIndex = findTacticalMove('O') ?? findTacticalMove('X') ?? emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      } else {
        aiMoveIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }
    } else {
      // Unbeatable Hard (Minimax algorithm)
      aiMoveIndex = getBestMinimaxMove(board);
    }

    const newBoard = [...board];
    newBoard[aiMoveIndex] = 'O';
    setBoard(newBoard);
    setIsXNext(true);
    playSound('click', simulatedSettings);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      handleGameEnd(gameWinner);
    }
  };

  const findTacticalMove = (player: 'X' | 'O'): number | null => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      const vals = [board[a], board[b], board[c]];
      const playerCount = vals.filter((v) => v === player).length;
      const nullCount = vals.filter((v) => v === null).length;
      if (playerCount === 2 && nullCount === 1) {
        if (board[a] === null) return a;
        if (board[b] === null) return b;
        if (board[c] === null) return c;
      }
    }
    return null;
  };

  // Minimax implementation for expert AI
  const getBestMinimaxMove = (currentBoard: BoardState): number => {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O';
        let score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  const minimax = (currentBoard: BoardState, depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(currentBoard);
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'Draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'O';
          let score = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'X';
          let score = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const handleGameEnd = (gameWinner: 'X' | 'O' | 'Draw') => {
    if (gameWinner === 'X') {
      setScore(100);
      playSound('win', simulatedSettings);
    } else if (gameWinner === 'O') {
      setScore(0);
      playSound('lose', simulatedSettings);
    } else {
      setScore(30);
      playSound('powerup', simulatedSettings);
    }
  };

  const restartBoard = () => {
    playSound('click', simulatedSettings);
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setScore(0);
    setShowTutorial(false);
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
          Tic Tac Toe Duo
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
            <h3 className="font-bold text-slate-100 text-sm">Offline Game Rules</h3>
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
              {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                    difficulty === lvl
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <button
              onClick={restartBoard}
              className="bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md uppercase tracking-wide cursor-pointer"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* Interactive Status Indicator */}
      {!showTutorial && (
        <div className="flex items-center justify-between mb-4 gap-3 select-none">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-center">
            <span className="text-[9px] text-slate-500 block">GAME STATUS</span>
            <span className="text-sm font-semibold text-indigo-400">
              {winner
                ? winner === 'Draw'
                  ? 'DRAW GAME'
                  : `WINNER: ${winner}`
                : isXNext
                ? 'YOUR TURN (X)'
                : 'AI IS THINKING...'}
            </span>
          </div>
          <button
            onClick={restartBoard}
            className="p-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 cursor-pointer"
            title="Reset Board"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Play area Grid */}
      {!showTutorial && (
        <div className="flex-1 flex flex-col items-center justify-center relative select-none">
          
          {/* Game End Overlay */}
          {winner && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10 gap-4 text-center border border-slate-800">
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold font-mono uppercase">
                  {winner === 'X' ? 'Victory!' : winner === 'O' ? 'AI Wins' : 'Draw Match'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {winner === 'X' ? 'You outsmarted the vault computer!' : winner === 'O' ? 'AI outmaneuvered you.' : 'A balanced tactical match.'}
                </p>
              </div>
              <div className="flex gap-2 w-full max-w-[240px]">
                <button
                  onClick={() => onGameOver(score, winner === 'X')}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 cursor-pointer"
                >
                  Save & Exit
                </button>
                <button
                  onClick={restartBoard}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {/* Tic Tac Toe Grid Board */}
          <div className="w-full max-w-[280px] aspect-square bg-slate-900 border-2 border-slate-800 p-3 rounded-3xl grid grid-cols-3 gap-3 shadow-2xl relative">
            {board.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={cell !== null || winner || !isXNext}
                className={`aspect-square rounded-2xl flex items-center justify-center font-mono font-black text-3xl transition-all duration-200 cursor-pointer ${
                  cell === 'X'
                    ? 'bg-indigo-900/60 border border-indigo-500/30 text-indigo-400 scale-100 shadow-[inset_0_0_15px_rgba(99,102,241,0.2)]'
                    : cell === 'O'
                    ? 'bg-rose-900/60 border border-rose-500/30 text-rose-400 scale-100 shadow-[inset_0_0_15px_rgba(244,63,94,0.2)]'
                    : 'bg-slate-950 border border-slate-850 hover:bg-slate-800 active:scale-95'
                }`}
              >
                {cell}
              </button>
            ))}
          </div>

          {/* Level selectors inside gameplay */}
          <div className="mt-6 flex gap-2 select-none">
            {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setDifficulty(lvl);
                  playSound('click', simulatedSettings);
                }}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                  difficulty === lvl
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/20 shadow-md'
                    : 'bg-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {lvl} Level
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
