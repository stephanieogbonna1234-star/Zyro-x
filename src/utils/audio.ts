// synthesized retro 8-bit sound engine using Web Audio API
// completely offline-safe, no external files needed!

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playSound = (
  type: 'click' | 'shoot' | 'bounce' | 'explosion' | 'powerup' | 'win' | 'lose' | 'achievement' | 'pause' | 'resume',
  settings: { soundVolume: number }
) => {
  if (settings.soundVolume === 0) return;

  try {
    const ctx = getAudioContext();
    const volume = settings.soundVolume / 100;
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
    gainNode.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.connect(gainNode);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'shoot':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'bounce':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;

      case 'explosion':
        // Generate noise-like explosion
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.3);
        gainNode.gain.setValueAtTime(volume * 0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case 'powerup':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.setValueAtTime(440, now + 0.06);
        osc.frequency.setValueAtTime(554, now + 0.12);
        osc.frequency.setValueAtTime(660, now + 0.18);
        gainNode.gain.setValueAtTime(volume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
        break;

      case 'win':
        // Arpeggio
        osc.type = 'triangle';
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const oscNode = ctx.createOscillator();
          const gainNode2 = ctx.createGain();
          oscNode.type = 'triangle';
          oscNode.frequency.setValueAtTime(freq, now + idx * 0.08);
          gainNode2.gain.setValueAtTime(volume * 0.3, now + idx * 0.08);
          gainNode2.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
          
          oscNode.connect(gainNode2);
          gainNode2.connect(ctx.destination);
          
          oscNode.start(now + idx * 0.08);
          oscNode.stop(now + idx * 0.08 + 0.25);
        });
        break;

      case 'lose':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.4);
        gainNode.gain.setValueAtTime(volume * 0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
        break;

      case 'achievement':
        // High sparkling bells
        osc.type = 'sine';
        const bells = [587.33, 698.46, 880.00, 1046.50, 1396.91];
        bells.forEach((freq, idx) => {
          const oscNode = ctx.createOscillator();
          const gainNode2 = ctx.createGain();
          oscNode.type = 'sine';
          oscNode.frequency.setValueAtTime(freq, now + idx * 0.05);
          gainNode2.gain.setValueAtTime(volume * 0.25, now + idx * 0.05);
          gainNode2.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.3);
          
          oscNode.connect(gainNode2);
          gainNode2.connect(ctx.destination);
          
          oscNode.start(now + idx * 0.05);
          oscNode.stop(now + idx * 0.05 + 0.35);
        });
        break;

      case 'pause':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'resume':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      default:
        break;
    }
  } catch (error) {
    console.error('Failed to play sound:', error);
  }
};

// Simple synthesized background music loop
let musicInterval: any = null;
export const startMusic = (settings: { musicVolume: number }) => {
  stopMusic();
  if (settings.musicVolume === 0) return;

  try {
    const ctx = getAudioContext();
    const volume = settings.musicVolume / 100 * 0.08; // very low background music

    // A simple, pleasant retro bass/melody pattern
    const notes = [
      261.63, 329.63, 392.00, 329.63, // C4, E4, G4, E4
      293.66, 349.23, 440.00, 349.23, // D4, F4, A4, F4
      220.00, 261.63, 329.63, 261.63, // A3, C4, E4, C4
      349.23, 440.00, 523.25, 440.00  // F4, A4, C5, A4
    ];
    let step = 0;

    musicInterval = setInterval(() => {
      try {
        if (ctx.state === 'suspended') return;
        const now = ctx.currentTime;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        gainNode.connect(ctx.destination);

        const osc = ctx.createOscillator();
        osc.type = 'triangle'; // soft warm tone
        osc.frequency.setValueAtTime(notes[step % notes.length], now);
        osc.connect(gainNode);
        
        osc.start(now);
        osc.stop(now + 0.4);

        step++;
      } catch (e) {
        // Safe catch for interval failures during fast restarts
      }
    }, 400);

  } catch (e) {
    console.error('Failed to start music:', e);
  }
};

export const stopMusic = () => {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
};
