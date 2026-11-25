let audioMuted = false;

export function isSoundMuted(): boolean {
  return audioMuted;
}

export function setSoundMuted(muted: boolean): void {
  audioMuted = muted;
}

function getAudioContext(): AudioContext | null {
  if (audioMuted || typeof window === 'undefined') return null;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    return new Ctx();
  } catch {
    return null;
  }
}

export function playTone(freq = 523.25, durationSec = 0.11, type: OscillatorType = 'sine'): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationSec);
    setTimeout(() => {
      void ctx.close().catch(() => {});
    }, (durationSec + 0.05) * 1000);
  } catch {
    // Ignore audio context errors in restricted environments
  }
}

export function playSuccessChime(): void {
  playTone(587.33, 0.09, 'triangle');
  setTimeout(() => playTone(880, 0.14, 'triangle'), 70);
}

export function playErrorCue(): void {
  playTone(210, 0.14, 'sawtooth');
}

export function playVictoryFanfare(): void {
  playTone(523.25, 0.1, 'triangle');
  setTimeout(() => playTone(659.25, 0.1, 'triangle'), 90);
  setTimeout(() => playTone(783.99, 0.16, 'triangle'), 180);
}
