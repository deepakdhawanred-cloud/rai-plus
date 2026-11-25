// Tactile Web Audio feedback + lightweight confetti helper for Quick Revise Study Games

export type QuickReviseSfxKind = 'ok' | 'bad' | 'pop' | 'win';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (sharedAudioCtx) return sharedAudioCtx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    sharedAudioCtx = new Ctor();
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

export function playQuickReviseSfx(kind: QuickReviseSfxKind, muted: boolean): void {
  if (muted) return;
  const ac = getAudioContext();
  if (ac) {
    try {
      if (ac.state === 'suspended') {
        void ac.resume();
      }
      const t = ac.currentTime;
      const notesMap: Record<QuickReviseSfxKind, Array<[number, number]>> = {
        ok: [[660, 990]],
        bad: [[240, 160]],
        pop: [[480, 620]],
        win: [
          [523, 523],
          [659, 659],
          [784, 1046],
        ],
      };
      const notes = notesMap[kind] || [[440, 440]];
      notes.forEach(([f0, f1], idx) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const start = t + idx * 0.09;
        osc.type = kind === 'bad' ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(f0, start);
        osc.frequency.exponentialRampToValueAtTime(f1, start + 0.14);
        gain.gain.setValueAtTime(kind === 'bad' ? 0.045 : 0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
        osc.connect(gain).connect(ac.destination);
        osc.start(start);
        osc.stop(start + 0.24);
      });
    } catch {
      // Audio playback blocked or unavailable
    }
  }
  if (kind === 'bad' && typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(35);
    } catch {
      // Ignore vibration errors
    }
  }
}

export function launchQuickReviseConfetti(count = 60): void {
  if (typeof document === 'undefined') return;
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }
  const colors = ['#FF6B35', '#FACC15', '#22C55E', '#3B82F6', '#EC4899', '#8B5CF6'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.style.position = 'fixed';
    piece.style.top = '-14px';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.width = '10px';
    piece.style.height = '14px';
    piece.style.borderRadius = '2px';
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.zIndex = '9999';
    piece.style.pointerEvents = 'none';
    const duration = 1500 + Math.random() * 1500;
    const delay = Math.random() * 350;
    document.body.appendChild(piece);
    try {
      piece.animate(
        [
          { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          {
            transform: `translateY(105vh) rotate(${360 + Math.random() * 360}deg)`,
            opacity: 0.85,
          },
        ],
        { duration, delay, easing: 'linear', fill: 'forwards' },
      );
    } catch {
      // Ignore Web Animations API fallback
    }
    window.setTimeout(() => {
      piece.remove();
    }, duration + delay + 150);
  }
}

export function shuffleArray<T>(input: readonly T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
