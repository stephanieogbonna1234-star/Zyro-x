import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../../utils/audio';
import { Game, AppSettings } from '../../types';
import { ArrowLeft, RefreshCw, Volume2, VolumeX, Pause, Play, Award, HelpCircle } from 'lucide-react';

interface GameFlappyBirdProps {
  game: Game;
  settings: AppSettings;
  onGameOver: (score: number, win: boolean) => void;
  onExit: () => void;
}

export default function GameFlappyBird({
  game,
  settings,
  onGameOver,
  onExit
}: GameFlappyBirdProps) {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(game.bestScore || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  // Bird parameters
  const birdY = useRef(150);
  const birdVelocity = useRef(0);
  const birdAngle = useRef(0);

  // Pipes parameters
  const pipes = useRef<{ x: number; topHeight: number; bottomHeight: number; passed: boolean }[]>([]);
  const frameCount = useRef(0);

  const GRAVITY = 0.35;
  const JUMP_STRENGTH = -6.5;

  const simulatedSettings = {
    ...settings,
    soundVolume: soundEnabled ? settings.soundVolume : 0
  };

  const flap = () => {
    if (!isPlaying || isPaused || showTutorial) return;
    birdVelocity.current = JUMP_STRENGTH;
    birdAngle.current = -0.4; // Face upwards
    playSound('bounce', simulatedSettings);
  };

  const startGame = () => {
    playSound('click', simulatedSettings);
    setShowTutorial(false);
    setIsPlaying(true);
    setIsPaused(false);
    setScore(0);
    birdY.current = 150;
    birdVelocity.current = 0;
    birdAngle.current = 0;
    pipes.current = [];
    frameCount.current = 0;
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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, showTutorial]);

  // Main Canvas Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const loop = () => {
      updatePhysics();
      draw();
      animFrameId = requestAnimationFrame(loop);
    };

    const updatePhysics = () => {
      if (!isPlaying || isPaused) return;

      frameCount.current++;

      // Bird Gravity
      birdVelocity.current += GRAVITY;
      birdY.current += birdVelocity.current;

      // Rotate bird downwards slowly
      if (birdVelocity.current > 3) {
        birdAngle.current = Math.min(Math.PI / 2, birdAngle.current + 0.08);
      } else {
        birdAngle.current = Math.max(-0.4, birdAngle.current + 0.02);
      }

      // Ground Collision
      if (birdY.current > canvas.height - 40) {
        birdY.current = canvas.height - 40;
        handleGameOver();
      }
      if (birdY.current < 0) {
        birdY.current = 0;
        birdVelocity.current = 0;
      }

      // Spawn pipes
      if (frameCount.current % 110 === 0) {
        const gap = 110;
        const minHeight = 40;
        const maxHeight = canvas.height - gap - minHeight - 40;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
        const bottomHeight = canvas.height - topHeight - gap - 40;

        pipes.current.push({
          x: canvas.width,
          topHeight,
          bottomHeight,
          passed: false
        });
      }

      // Move and check pipes
      pipes.current.forEach((pipe, index) => {
        pipe.x -= 2;

        // Check bounds / score passing
        if (!pipe.passed && pipe.x < 50) { // bird is located at x=50
          pipe.passed = true;
          setScore((prev) => {
            const next = prev + 1;
            if (next > bestScore) setBestScore(next);
            return next;
          });
          playSound('powerup', simulatedSettings);
        }

        // Remove out of bounds pipes
        if (pipe.x < -60) {
          pipes.current.splice(index, 1);
        }

        // Pipe collision checks
        const birdRadius = 13;
        const birdX = 50;
        const pipeWidth = 52;

        if (
          birdX + birdRadius > pipe.x &&
          birdX - birdRadius < pipe.x + pipeWidth
        ) {
          // Horizontal overlap exists, check heights
          if (
            birdY.current - birdRadius < pipe.topHeight ||
            birdY.current + birdRadius > canvas.height - pipe.bottomHeight - 40
          ) {
            handleGameOver();
          }
        }
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. SKY BACKGROUND (Sky-900 to Sky-950 Gradient)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0284c7'); // sky-600
      skyGrad.addColorStop(0.7, '#bae6fd'); // sky-200
      skyGrad.addColorStop(0.701, '#22c55e'); // grass-500
      skyGrad.addColorStop(0.9, '#15803d'); // grass-700
      skyGrad.addColorStop(1, '#451a03'); // dirt
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cloud illustrations
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(100, 60, 25, 0, Math.PI * 2);
      ctx.arc(130, 50, 30, 0, Math.PI * 2);
      ctx.arc(160, 60, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(260, 90, 20, 0, Math.PI * 2);
      ctx.arc(285, 80, 25, 0, Math.PI * 2);
      ctx.arc(310, 90, 15, 0, Math.PI * 2);
      ctx.fill();

      // 2. GREEN PIPES
      pipes.current.forEach((pipe) => {
        ctx.fillStyle = '#22c55e'; // emerald green
        ctx.strokeStyle = '#15803d'; // forest borders
        ctx.lineWidth = 3;

        // Top Pipe
        ctx.fillRect(pipe.x, 0, 52, pipe.topHeight);
        ctx.strokeRect(pipe.x, -5, 52, pipe.topHeight + 5);
        // Top Pipe Rim
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(pipe.x - 4, pipe.topHeight - 20, 60, 20);
        ctx.strokeRect(pipe.x - 4, pipe.topHeight - 20, 60, 20);

        // Bottom Pipe
        const bY = canvas.height - pipe.bottomHeight - 40;
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(pipe.x, bY, 52, pipe.bottomHeight);
        ctx.strokeRect(pipe.x, bY, 52, pipe.bottomHeight + 5);
        // Bottom Pipe Rim
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(pipe.x - 4, bY, 60, 20);
        ctx.strokeRect(pipe.x - 4, bY, 60, 20);
      });

      // 3. GREEN GRASS LAND & DIRT BOTTOM ROAD
      ctx.fillStyle = '#eab308'; // Amber road
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 40);
      ctx.lineTo(canvas.width, canvas.height - 40);
      ctx.stroke();

      // Grid stripes on ground
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      for (let i = (frameCount.current * -2) % 30; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, canvas.height - 40);
        ctx.lineTo(i - 15, canvas.height);
        ctx.stroke();
      }

      // 4. FLAPPY BIRD
      ctx.save();
      ctx.translate(50, birdY.current);
      ctx.rotate(birdAngle.current);

      // Yellow Bird body
      ctx.fillStyle = '#facc15'; // Amber-400
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bird Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(5, -4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(6, -4, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Orange Beak
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(11, -3);
      ctx.lineTo(19, 0);
      ctx.lineTo(11, 4);
      ctx.closePath();
      ctx.fill();

      // Wing (Flapping back and forth)
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      const wingY = Math.sin(frameCount.current / 3) * 3;
      ctx.ellipse(-5, wingY, 8, 5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    animFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animFrameId);
  }, [isPlaying, isPaused]);

  const handleGameOver = () => {
    setIsPlaying(false);
    playSound('lose', simulatedSettings);
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
          Flappy Bird Neo
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl mb-4 select-none">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm">How to Fly</h3>
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
            onClick={startGame}
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-wide cursor-pointer"
          >
            Launch Flight!
          </button>
        </div>
      )}

      {/* Scores dashboard */}
      {!showTutorial && (
        <div className="flex items-center justify-between mb-4 gap-3 select-none">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-center">
            <span className="text-[9px] text-slate-500 block">GATE SCORE</span>
            <span className="text-lg font-bold text-emerald-400">{score}</span>
          </div>
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 font-mono text-center">
            <span className="text-[9px] text-slate-500 block">BEST FLIGHT</span>
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

      {/* Screen viewports */}
      {!showTutorial && (
        <div className="flex-1 flex flex-col items-center justify-center relative select-none">
          {/* Pause overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10 gap-3 border border-slate-800">
              <h4 className="text-xl font-bold text-slate-200 font-mono tracking-wider">GAME PAUSED</h4>
              <p className="text-xs text-slate-500 mb-2">Tap space or tap screen to flap!</p>
              <button
                onClick={togglePause}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg transition-transform uppercase cursor-pointer"
              >
                Resume Flight
              </button>
            </div>
          )}

          {/* Game Over Modal */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10 gap-4 text-center border border-slate-800">
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center">
                <Award className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-rose-500 font-mono uppercase">Crashed</h4>
                <p className="text-xs text-slate-400 mt-1">Fly high next time. Highscore synced!</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 w-40 font-mono">
                <span className="text-[9px] text-slate-500 block">SCORE</span>
                <span className="text-lg font-bold text-emerald-400">{score}</span>
              </div>
              <div className="flex gap-2 w-full max-w-[240px]">
                <button
                  onClick={() => onGameOver(score, score >= 20)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 cursor-pointer"
                >
                  Save & Exit
                </button>
                <button
                  onClick={startGame}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Flap Again
                </button>
              </div>
            </div>
          )}

          {/* Interactive Screen trigger viewport */}
          <div
            onClick={flap}
            onTouchStart={(e) => { e.preventDefault(); flap(); }}
            className="w-full max-w-[300px] aspect-[3/4] border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative cursor-pointer group select-none"
          >
            <canvas
              ref={canvasRef}
              width={300}
              height={400}
              className="w-full h-full block"
            />
            {isPlaying && (
              <div className="absolute inset-x-0 bottom-12 text-center pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
                <span className="text-[10px] font-mono uppercase text-slate-900 font-bold bg-white/70 px-3 py-1 rounded-full shadow-sm">
                  Tap anywhere to flap wings
                </span>
              </div>
            )}
          </div>
          
          {/* Big action Flap button for mobile clickers */}
          {isPlaying && (
            <button
              onClick={flap}
              className="mt-4 w-28 h-12 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-sm tracking-wider uppercase rounded-2xl shadow-lg border border-indigo-500/50 cursor-pointer"
            >
              FLAP!
            </button>
          )}
        </div>
      )}
    </div>
  );
}
