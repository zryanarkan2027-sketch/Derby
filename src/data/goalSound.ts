// Goal sound for Derby. The sound is synthesised with the Web Audio API,
// so there are no audio files to load or license.

const KEY = 'derby_sound';
let ctx: AudioContext | null = null;

export function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) === 'on';
  } catch {
    return false;
  }
}

export function setSoundEnabled(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* ignore */
  }
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/** Call from a click/tap so the browser allows sound later. */
export function unlockAudio(): void {
  getCtx();
}

/**
 * If the visitor turned sound on in an earlier visit, the browser still needs
 * one tap/click on this page before it allows audio. Arm a one-time listener.
 */
export function armAudioUnlock(): void {
  if (typeof window === 'undefined') return;
  const unlock = () => {
    if (isSoundEnabled()) getCtx();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
}

/** Short chime + crowd swell, about 2.8 seconds. */
export function playGoal(): void {
  if (!isSoundEnabled()) return;
  const c = getCtx();
  if (!c) return;

  const t0 = c.currentTime + 0.02;
  const master = c.createGain();
  master.gain.value = 0.5;
  master.connect(c.destination);

  // Crowd: filtered noise that swells and fades
  const length = Math.floor(c.sampleRate * 2.8);
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

  const noise = c.createBufferSource();
  noise.buffer = buffer;

  const band = c.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 0.6;
  band.frequency.setValueAtTime(500, t0);
  band.frequency.linearRampToValueAtTime(1200, t0 + 0.9);

  const crowd = c.createGain();
  crowd.gain.setValueAtTime(0.0001, t0);
  crowd.gain.linearRampToValueAtTime(0.45, t0 + 0.5);
  crowd.gain.setValueAtTime(0.45, t0 + 1.4);
  crowd.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.8);

  noise.connect(band);
  band.connect(crowd);
  crowd.connect(master);
  noise.start(t0);
  noise.stop(t0 + 2.8);

  // Chime: fast rising arpeggio (C5 E5 G5 C6)
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = c.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const gain = c.createGain();
    const start = t0 + i * 0.13;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.35, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + 1);
  });
}
