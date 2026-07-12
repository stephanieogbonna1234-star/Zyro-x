import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../../utils/audio';
import { Game, AppSettings } from '../../types';
import { ArrowLeft, RefreshCw, Volume2, VolumeX, Pause, Play, Trophy, HelpCircle } from 'lucide-react';

interface GameSnakeProps {
  game: Game;
  settings: AppSettings;
  onGameOver: (score: number, win: boolean) => void;
  onExit: () => void;
}

type Point = { x: number; y: number };

export default function GameSnake({
  game,
  settings,
  onGameOver,
  onExit
}: GameSnakeProps) {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(game.bestScore || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Point>({ x: 1, y: 0 });
  const lastDirectionRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const GRID_SIZE = 20;
  const TILE_COUNT = 15;

  const simulatedSettings = {
    ...settings,
    soundVolume: soundEnabled ? settings.soundVolume : 0
  };

  const getSpeed = () => {
    switch (difficulty) {
      case 'Easy': return 160;
      case 'Hard': return 80;
      case 'Medium':
      default:
        return 120;
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused || showTutorial) return;

      const lastDir = lastDirectionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (lastDir.y === 0) directionRef.current = { x: 0, y: -1 };
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
          if (lastDir.y === 0) directionRef.current = { x: 0, y: 1 };
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
          if (lastDir.x === 0) directionRef.current = { x: -1, y: 0 };
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
          if (lastDir.x === 0) directionRef.current = { x: 1, y: 0 };
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, isPaused, showTutorial]);

  const startGame = () => {
    playSound('click', simulatedSettings);
    setShowTutorial(false);
    setIsPlaying(true);
    setIsPaused(false);
    setScore(0);
    snakeRef.current = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 }
    ];
    directionRef.current = { x: 1, y: 0 };
    lastDirectionRef.current = { x: 1, y: 0 };
    spawnFood();
    lastUpdateRef.current = Date.now();
  };

  const spawnFood = () => {
    let newFood: Point;
    let onSnake = true;
    while (onSnake) {
      newFood = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
      };
      onSnake = snakeRef.current.some(part => part.x === newFood.x && part.y === newFood.y);
    }
    foodRef.current = newFood!;
  };

  const changeDirection = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (!isPlaying || isPaused) return;
    const lastDir = lastDirectionRef.current;
    
    switch (dir) {
      case 'UP':
        if (lastDir.y === 0) directionRef.current = { x: 0, y: -1 };
        break;
      case 'DOWN':
        if (lastDir.y === 0) directionRef.current = { x: 0, y: 1 };
        break;
      case 'LEFT':
        if (lastDir.x === 0) directionRef.current = { x: -1, y: 0 };
        break;
      case 'RIGHT':
        if (lastDir.x === 0) directionRef.current = { x: 1, y: 0 };
        break;
    }
    playSound('click', simulatedSettings);
  };

  const togglePause = () => {
    if (isPaused) {
      playSound('resume', simulatedSettings);
      setIsPaused(false);
    } else {
      playSound('pause', simulatedSettings);
      setIsPaused(true);
    }
  };

  // Canvas render and loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const gameLoop = (timestamp: number) => {
      if (!isPlaying || isPaused) {
        // Draw static
        draw();
        animFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const now = Date.now();
      const elapsed = now - lastUpdateRef.current;
      const speed = getSpeed();

      if (elapsed > speed) {
        updateGame();
        lastUpdateRef.current = now;
      }

      draw();
      animFrameId = requestAnimationFrame(gameLoop);
    };

    const updateGame = () => {
      const snake = [...snakeRef.current];
      const dir = directionRef.current;
      lastDirectionRef.current = dir;

      const head = {
        x: snake[0].x + dir.x,
        y: snake[0].y + dir.y
      };

      // Collision checks with walls or body
      if (
        head.x < 0 || head.x >= TILE_COUNT ||
        head.y < 0 || head.y >= TILE_COUNT ||
        snake.some(part => part.x === head.x && part.y === head.y)
      ) {
        // Game Over!
        setIsPlaying(false);
        playSound('lose', simulatedSettings);
        return;
      }

      // Add new head
      snake.unshift(head);

      // Check food eating
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore((prev) => {
          const next = prev + 10;
          if (next > bestScore) setBestScore(next);
          return next;
        });
        playSound('powerup', simulatedSettings);
        spawnFood();
      } else {
        // Remove tail
        snake.pop();
      }

      snakeRef.current = snake;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background Grid Pattern
      ctx.fillStyle = '#0f172a'; // slate 900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#1e293b'; // slate 800
      ctx.lineWidth = 1;
      for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
      }

      // Draw Apple Food
      ctx.fillStyle = '#ef4444'; // Red-500
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      const radius = GRID_SIZE / 2 - 2;
      ctx.arc(
        foodRef.current.x * GRID_SIZE + GRID_SIZE / 2,
        foodRef.current.y * GRID_SIZE + GRID_SIZE / 2,
        radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Apple leaf
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(foodRef.current.x * GRID_SIZE + GRID_SIZE / 2 - 1, foodRef.current.y * GRID_SIZE + 2, 2, 4);

      // Draw Snake Body
      const snake = snakeRef.current;
      snake.forEach((part, index) => {
        const isHead = index === 0;
        
        ctx.fillStyle = isHead ? '#10b981' : '#34d399'; // Emerald head, lighter body
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = isHead ? 6 : 0;
        
        // Rounded blocks
        ctx.beginPath();
        const padding = isHead ? 1 : 2;
        ctx.roundRect(
          part.x * GRID_SIZE + padding,
          part.y * GRID_SIZE + padding,
          GRID_SIZE - padding * 2,
          GRID_SIZE - padding * 2,
          isHead ? 6 : 4
        );
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Snake eyes
        if (isHead) {
          ctx.fillStyle = '#ffffff';
          const dir = directionRef.current;
          let eyeX1 = 0, eyeY1 = 0, eyeX2 = 0, eyeY2 = 0;

          if (dir.x !== 0) { // Moving Horizontally
            eyeX1 = part.x * GRID_SIZE + (dir.x > 0 ? 12 : 4);
            eyeY1 = part.y * GRID_SIZE + 4;
            eyeX2 = part.x * GRID_SIZE + (dir.x > 0 ? 12 : 4);
            eyeY2 = part.y * GRID_SIZE + 12;
          } else { // Moving Vertically
            eyeX1 = part.x * GRID_SIZE + 4;
            eyeY1 = part.y * GRID_SIZE + (dir.y > 0 ? 12 : 4);
            eyeX2 = part.x * GRID_SIZE + 12;
            eyeY2 = part.y * GRID_SIZE + (dir.y > 0 ? 12 : 4);
          }

          ctx.beginPath();
          ctx.arc(eyeX1, eyeY1, 2, 0, Math.PI * 2);
          ctx.arc(eyeX2, eyeY2, 2, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(eyeX1, eyeY1, 1, 0, Math.PI * 2);
          ctx.arc(eyeX2, eyeY2, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    animFrameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animFrameId);
  }, [isPlaying, isPaused, difficulty]);

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
          Retro Snake
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
            <h3 className="font-bold text-slate-100 text-sm">How to Play Snake</h3>
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
              {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
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
              onClick={startGame}
              className="bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-wide cursor-pointer"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* Score and Stats panels */}
      {!showTutorial && (
        <div className="flex items-center justify-between mb-4 gap-3 select-none">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-center">
            <span className="text-[9px] text-slate-500 block">FRUITS POPPED</span>
            <span className="text-lg font-bold text-emerald-400">{score}</span>
          </div>
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-center">
            <span className="text-[9px] text-slate-500 block">BEST HIGH</span>
            <span className="text-lg font-bold text-indigo-400">{bestScore}</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={startGame}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 transition-all border border-slate-700 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={togglePause}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 transition-all border border-slate-700 cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Screen Game State Overlays */}
      {!showTutorial && (
        <div className="flex-1 flex flex-col items-center justify-center relative select-none">
          {/* Pause Screen Overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10 gap-3 border border-slate-800">
              <h4 className="text-xl font-bold text-slate-200 font-mono tracking-wider">SNAKE PAUSED</h4>
              <p className="text-xs text-slate-500 mb-2">Tap controls to resume!</p>
              <button
                onClick={togglePause}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg transition-transform uppercase cursor-pointer"
              >
                Resume Game
              </button>
            </div>
          )}

          {/* Game Over Screen Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10 gap-4 text-center border border-slate-800">
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-rose-500 font-mono uppercase">Crash!</h4>
                <p className="text-xs text-slate-400 mt-1">Snake collided. Best score saved!</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 w-40 font-mono">
                <span className="text-[9px] text-slate-500 block">SCORE</span>
                <span className="text-lg font-bold text-emerald-400">{score}</span>
              </div>
              <div className="flex gap-2 w-full max-w-[240px]">
                <button
                  onClick={() => onGameOver(score, score >= 150)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 cursor-pointer"
                >
                  Save & Exit
                </button>
                <button
                  onClick={startGame}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Restart
                </button>
              </div>
            </div>
          )}

          {/* Canvas Wrapper */}
          <div className="w-full max-w-[300px] aspect-square border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl bg-slate-900 relative">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="w-full h-full block"
            />
          </div>

          {/* Retro Phone D-PAD controls */}
          <div className="mt-5 w-full max-w-[220px] aspect-square flex flex-col items-center justify-center relative">
            <div className="absolute top-0 w-14 h-12">
              <button
                onClick={() => changeDirection('UP')}
                className="w-full h-full bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-200 font-bold active:scale-90 shadow-md select-none"
              >
                ▲
              </button>
            </div>
            <div className="absolute bottom-0 w-14 h-12">
              <button
                onClick={() => changeDirection('DOWN')}
                className="w-full h-full bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-200 font-bold active:scale-90 shadow-md select-none"
              >
                ▼
              </button>
            </div>
            <div className="absolute left-0 w-14 h-12">
              <button
                onClick={() => changeDirection('LEFT')}
                className="w-full h-full bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-200 font-bold active:scale-90 shadow-md select-none"
              >
                ◀
              </button>
            </div>
            <div className="absolute right-0 w-14 h-12">
              <button
                onClick={() => changeDirection('RIGHT')}
                className="w-full h-full bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-200 font-bold active:scale-90 shadow-md select-none"
              >
                ▶
              </button>
            </div>
            {/* Safe Core Circle badge */}
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center text-[10px] font-mono text-indigo-400 select-none">
              SNAK
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
