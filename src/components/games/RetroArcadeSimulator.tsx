import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../../utils/audio';
import { Game, AppSettings } from '../../types';
import { Volume2, VolumeX, Pause, Play, RotateCcw, ArrowLeft, Gamepad2, Info, Trophy } from 'lucide-react';

interface RetroArcadeSimulatorProps {
  game: Game;
  settings: AppSettings;
  onGameOver: (score: number, win: boolean) => void;
  onExit: () => void;
}

export default function RetroArcadeSimulator({
  game,
  settings,
  onGameOver,
  onExit
}: RetroArcadeSimulatorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(game.bestScore || 0);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Expert'>(game.difficulty);
  const [showTutorial, setShowTutorial] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  
  // Game states for Canvas
  const playerX = useRef(150);
  const bullets = useRef<{ x: number; y: number }[]>([]);
  const entities = useRef<{ x: number; y: number; speed: number; size: number; id: number }[]>([]);
  const stars = useRef<{ x: number; y: number; speed: number }[]>([]);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const lastSpawnTime = useRef(0);
  const entityIdCounter = useRef(0);

  // Initialize background stars
  useEffect(() => {
    const tempStars = [];
    for (let i = 0; i < 25; i++) {
      tempStars.push({
        x: Math.random() * 300,
        y: Math.random() * 400,
        speed: Math.random() * 2 + 1
      });
    }
    stars.current = tempStars;
  }, []);

  // Sync volume with sound toggle
  const simulatedSettings = {
    ...settings,
    soundVolume: soundEnabled ? settings.soundVolume : 0
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused) return;
      keysPressed.current[e.key] = true;
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        shootBullet();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, isPaused, soundEnabled]);

  // Start the Game
  const startGame = () => {
    playSound('click', simulatedSettings);
    setIsPlaying(true);
    setIsPaused(false);
    setShowTutorial(false);
    setScore(0);
    setLives(3);
    playerX.current = 150;
    bullets.current = [];
    entities.current = [];
    lastSpawnTime.current = Date.now();
    entityIdCounter.current = 0;
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

  const resetGame = () => {
    playSound('click', simulatedSettings);
    startGame();
  };

  const shootBullet = () => {
    if (!isPlaying || isPaused) return;
    
    // Space Shooter or alien shooter fires lasers
    if (game.id === 'space_shooter' || game.id === 'match3' || game.id.includes('shooter')) {
      bullets.current.push({ x: playerX.current + 15, y: 340 });
      playSound('shoot', simulatedSettings);
    }
  };

  // Steer controls for Mobile buttons
  const movePlayer = (direction: 'left' | 'right') => {
    if (!isPlaying || isPaused) return;
    const speed = 25;
    if (direction === 'left') {
      playerX.current = Math.max(10, playerX.current - speed);
    } else {
      playerX.current = Math.min(260, playerX.current + speed);
    }
    playSound('click', simulatedSettings);
  };

  // --- MAIN CANVAS LOOP ---
  useEffect(() => {
    if (!isPlaying || isPaused) {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameType = game.id;
    const speedMultiplier = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 1.5 : difficulty === 'Hard' ? 2 : 2.5;

    const updateAndDraw = () => {
      // Clear
      ctx.fillStyle = '#0f172a'; // slate 900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- 1. RENDER BACKGROUND STARS ---
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      stars.current.forEach((star) => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        ctx.fillRect(star.x, star.y, 1.5, 1.5);
      });

      // Keyboard continuous polling
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
        playerX.current = Math.max(10, playerX.current - 5);
      }
      if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
        playerX.current = Math.min(260, playerX.current + 5);
      }

      // --- 2. GAME-SPECIFIC LOGIC ---
      
      // A. SPACE SHOOTER / ALIEN SHOOTER
      if (gameType === 'space_shooter' || gameType.includes('shooter') || gameType === 'match3') {
        // Draw Player Ship
        ctx.fillStyle = '#6366f1'; // indigo-500
        ctx.beginPath();
        ctx.moveTo(playerX.current + 15, 340);
        ctx.lineTo(playerX.current, 365);
        ctx.lineTo(playerX.current + 30, 365);
        ctx.closePath();
        ctx.fill();
        // Thruster flame
        ctx.fillStyle = Math.random() > 0.5 ? '#f97316' : '#ef4444';
        ctx.fillRect(playerX.current + 11, 365, 8, 5);

        // Update & Draw bullets
        ctx.fillStyle = '#10b981'; // emerald-500
        bullets.current.forEach((b, idx) => {
          b.y -= 7;
          ctx.fillRect(b.x - 2, b.y, 4, 10);
          if (b.y < 0) bullets.current.splice(idx, 1);
        });

        // Spawn Invaders
        const now = Date.now();
        const spawnDelay = 1500 / speedMultiplier;
        if (now - lastSpawnTime.current > spawnDelay) {
          entities.current.push({
            id: entityIdCounter.current++,
            x: Math.random() * 260 + 10,
            y: 0,
            speed: (Math.random() * 1.5 + 1) * speedMultiplier,
            size: 20
          });
          lastSpawnTime.current = now;
        }

        // Update & Draw Invaders
        entities.current.forEach((e, eIdx) => {
          e.y += e.speed;
          
          // Draw Invader UFO
          ctx.fillStyle = '#f43f5e'; // rose-500
          ctx.beginPath();
          ctx.ellipse(e.x + 10, e.y + 10, 12, 7, 0, 0, Math.PI * 2);
          ctx.fill();
          // Dome
          ctx.fillStyle = '#38bdf8'; // sky-400
          ctx.beginPath();
          ctx.arc(e.x + 10, e.y + 7, 5, Math.PI, 0);
          ctx.fill();

          // Out of bounds check
          if (e.y > canvas.height) {
            entities.current.splice(eIdx, 1);
            setLives((prev) => {
              const next = prev - 1;
              if (next <= 0) handleGameOver(false);
              return next;
            });
            playSound('lose', simulatedSettings);
          }

          // Bullet Collision check
          bullets.current.forEach((b, bIdx) => {
            const dist = Math.hypot((b.x) - (e.x + 10), b.y - (e.y + 10));
            if (dist < 18) {
              bullets.current.splice(bIdx, 1);
              entities.current.splice(eIdx, 1);
              setScore((prev) => {
                const next = prev + 50;
                if (next > highScore) setHighScore(next);
                return next;
              });
              playSound('explosion', simulatedSettings);
            }
          });

          // Ship Collision check
          const shipDist = Math.hypot((playerX.current + 15) - (e.x + 10), 350 - (e.y + 10));
          if (shipDist < 25) {
            entities.current.splice(eIdx, 1);
            setLives((prev) => {
              const next = prev - 1;
              if (next <= 0) handleGameOver(false);
              return next;
            });
            playSound('explosion', simulatedSettings);
          }
        });
      }

      // B. RACING / ENDLESS HIGHWAY
      else if (gameType.includes('racing') || gameType.includes('highway') || gameType.includes('runner')) {
        // Road Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(80, 0); ctx.lineTo(80, canvas.height);
        ctx.moveTo(220, 0); ctx.lineTo(220, canvas.height);
        ctx.stroke();

        // Dash center line
        ctx.strokeStyle = '#f59e0b'; // amber-500 yellow lines
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        ctx.moveTo(150, (Date.now() / 15 * speedMultiplier) % 40 - 40);
        ctx.lineTo(150, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]); // Reset

        // Draw Player Car
        ctx.fillStyle = '#ef4444'; // Red speedster
        // Main chassis
        ctx.fillRect(playerX.current + 2, 330, 26, 45);
        // Wheels
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(playerX.current, 335, 4, 10);
        ctx.fillRect(playerX.current + 26, 335, 4, 10);
        ctx.fillRect(playerX.current, 360, 4, 10);
        ctx.fillRect(playerX.current + 26, 360, 4, 10);
        // Windshield
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(playerX.current + 6, 342, 18, 8);

        // Spawn Traffic/Obstacles
        const now = Date.now();
        const spawnDelay = 1800 / speedMultiplier;
        if (now - lastSpawnTime.current > spawnDelay) {
          const lanes = [40, 110, 180, 240];
          const randomLaneX = lanes[Math.floor(Math.random() * lanes.length)];
          entities.current.push({
            id: entityIdCounter.current++,
            x: randomLaneX,
            y: -50,
            speed: (Math.random() * 2 + 2) * speedMultiplier,
            size: 30
          });
          lastSpawnTime.current = now;
        }

        // Update & Draw Traffic
        entities.current.forEach((e, eIdx) => {
          e.y += e.speed;
          
          // Draw opponent blue/yellow trucks
          ctx.fillStyle = e.id % 2 === 0 ? '#3b82f6' : '#eab308';
          ctx.fillRect(e.x + 2, e.y, 26, 45);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(e.x, e.y + 5, 4, 10);
          ctx.fillRect(e.x + 26, e.y + 5, 4, 10);
          ctx.fillRect(e.x, e.y + 30, 4, 10);
          ctx.fillRect(e.x + 26, e.y + 30, 4, 10);

          // Scoring points for passing cars
          if (e.y > canvas.height) {
            entities.current.splice(eIdx, 1);
            setScore((prev) => {
              const next = prev + 100;
              if (next > highScore) setHighScore(next);
              return next;
            });
            playSound('powerup', simulatedSettings);
          }

          // Crash Detection
          if (
            playerX.current < e.x + 28 &&
            playerX.current + 30 > e.x &&
            330 < e.y + 45 &&
            375 > e.y
          ) {
            entities.current.splice(eIdx, 1);
            setLives((prev) => {
              const next = prev - 1;
              if (next <= 0) handleGameOver(false);
              return next;
            });
            playSound('explosion', simulatedSettings);
          }
        });
      }

      // C. OTHER SIMULATIONS (CHESS, SPORTS, BOARD GAMES, ETC.)
      else {
        // Fallback target bounce interactive game
        // Draw Paddle
        ctx.fillStyle = '#10b981'; // emerald-500
        ctx.fillRect(playerX.current, 360, 60, 10);

        // Ball movement simulation
        const now = Date.now();
        const ballX = 150 + Math.sin(now / 300) * 120;
        const ballY = 180 + Math.cos(now / 150) * 80;

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Board pattern mock visual
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < canvas.width; i += 30) {
          ctx.beginPath();
          ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
          ctx.moveTo(0, i); ctx.lineTo(canvas.width, i);
          ctx.stroke();
        }

        // Animated target dots
        const targetDelay = 1200 / speedMultiplier;
        if (now - lastSpawnTime.current > targetDelay) {
          entities.current.push({
            id: entityIdCounter.current++,
            x: Math.random() * 250 + 25,
            y: Math.random() * 150 + 50,
            speed: 0,
            size: 20
          });
          lastSpawnTime.current = now;
        }

        // Draw and pop targets on tap
        entities.current.forEach((t, tIdx) => {
          ctx.fillStyle = 'rgba(139, 92, 246, 0.3)'; // violet-500 translucent ring
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.size + Math.sin(Date.now() / 100) * 3, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#8b5cf6'; // violet-500 core
          ctx.beginPath();
          ctx.arc(t.x, t.y, 8, 0, Math.PI * 2);
          ctx.fill();

          // Intersect with moving ball - simulated player point!
          const dist = Math.hypot(ballX - t.x, ballY - t.y);
          if (dist < 20) {
            entities.current.splice(tIdx, 1);
            setScore((prev) => {
              const next = prev + 100;
              if (next > highScore) setHighScore(next);
              return next;
            });
            playSound('bounce', simulatedSettings);
          }
        });

        // Countdown timer score progress
        if (Math.random() < 0.005) {
          setScore((prev) => {
            const next = prev + 10;
            if (next > highScore) setHighScore(next);
            return next;
          });
        }
      }

      gameLoopRef.current = requestAnimationFrame(updateAndDraw);
    };

    gameLoopRef.current = requestAnimationFrame(updateAndDraw);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, isPaused, difficulty, game.id]);

  const handleGameOver = (win: boolean) => {
    setIsPlaying(false);
    onGameOver(score, win || score >= 500);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-4 relative font-sans overflow-y-auto">
      {/* Header controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-100 text-xs py-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <span className="text-xs font-bold font-mono tracking-wider text-indigo-400 uppercase">
          {game.name} Simulator
        </span>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-slate-400 hover:text-slate-200 p-1"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Tutorial overlay panel */}
      {showTutorial && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl mb-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm">How to Play</h3>
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
              {(['Easy', 'Medium', 'Hard', 'Expert'] as const).map((lvl) => (
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
              onClick={startGame}
              className="bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-wide cursor-pointer"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* Play cabinet Screen */}
      {isPlaying && (
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Status Overlay */}
          <div className="absolute top-2 left-2 right-2 flex justify-between px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-xl text-[11px] font-mono font-semibold z-20 border border-slate-800">
            <span className="text-emerald-400">SCORE: {score}</span>
            <span className="text-indigo-400">HI: {highScore}</span>
            <span className="text-rose-400 flex gap-0.5">
              {'❤️'.repeat(Math.max(0, lives)) || '💀'}
            </span>
          </div>

          {/* Pause overlay screen */}
          {isPaused && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-3">
              <h4 className="text-xl font-bold text-slate-200 tracking-wider font-mono">GAME PAUSED</h4>
              <p className="text-xs text-slate-500 mb-2">Sound level: {settings.soundVolume}%</p>
              <div className="flex gap-4">
                <button
                  onClick={togglePause}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <Play className="w-6 h-6 fill-slate-950" />
                </button>
                <button
                  onClick={resetGame}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {/* Canvas viewport */}
          <div className="w-full max-w-[300px] aspect-[3/4] border-2 border-slate-800 rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.15)] bg-slate-900 relative">
            <canvas
              ref={canvasRef}
              width={300}
              height={400}
              className="w-full h-full block"
            />
          </div>

          {/* Touch D-PAD & Action Buttons */}
          <div className="w-full max-w-[300px] mt-4 flex items-center justify-between gap-4 px-2">
            <div className="flex gap-2">
              <button
                onMouseDown={() => movePlayer('left')}
                onTouchStart={() => movePlayer('left')}
                className="w-14 h-12 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center text-xl font-bold text-slate-200 active:scale-95 active:bg-slate-700 transition-all select-none"
              >
                ◀
              </button>
              <button
                onMouseDown={() => movePlayer('right')}
                onTouchStart={() => movePlayer('right')}
                className="w-14 h-12 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center text-xl font-bold text-slate-200 active:scale-95 active:bg-slate-700 transition-all select-none"
              >
                ▶
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={togglePause}
                className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 active:scale-95"
              >
                <Pause className="w-4 h-4" />
              </button>
              {(game.id === 'space_shooter' || game.id === 'match3' || game.id.includes('shooter')) ? (
                <button
                  onClick={shootBullet}
                  className="w-16 h-12 bg-rose-600 hover:bg-rose-500 border border-rose-500 rounded-2xl flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-rose-900/30 uppercase tracking-wider active:scale-90 select-none cursor-pointer"
                >
                  Fire
                </button>
              ) : (
                <button
                  onClick={() => {
                    setScore((prev) => prev + 10);
                    playSound('bounce', simulatedSettings);
                  }}
                  className="w-16 h-12 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 rounded-2xl flex items-center justify-center font-bold text-white text-xs shadow-lg active:scale-90 select-none cursor-pointer"
                >
                  TAP!
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Screen Game Over Summary */}
      {!isPlaying && !showTutorial && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-4">
          <div className="w-16 h-16 bg-slate-900/80 border border-slate-800 rounded-3xl flex items-center justify-center shadow-lg">
            <Trophy className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100">Round Completed!</h3>
            <p className="text-xs text-slate-400 font-mono">GAMES CONSOLE SIMULATION ENGINE</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 w-full max-w-xs grid grid-cols-2 gap-4 text-left font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block">SCORE ACHIEVED</span>
              <span className="text-xl font-bold text-emerald-400">{score}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">DIFFICULTY LEVEL</span>
              <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wide">{difficulty}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">WIN STATUS</span>
              <span className={`text-sm font-bold uppercase ${score >= 500 ? 'text-emerald-400' : 'text-amber-500'}`}>
                {score >= 500 ? 'SUCCESS' : 'TRAINING'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">BEST VAULT SCORE</span>
              <span className="text-sm font-bold text-slate-300">{Math.max(highScore, score)}</span>
            </div>
          </div>

          <div className="flex gap-3 w-full max-w-xs mt-2">
            <button
              onClick={() => handleGameOver(score >= 500)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer border border-slate-700"
            >
              Save & Exit
            </button>
            <button
              onClick={startGame}
              className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      {/* Help Tips */}
      <div className="mt-auto pt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 select-none">
        <Info className="w-3.5 h-3.5" />
        <span>Tip: Reaching 500 points counts as an Offline Victory!</span>
      </div>
    </div>
  );
}
