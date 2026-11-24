// Derby sound: an optional, original fanfare on Champions League days.
// Everything is synthesised with the Web Audio API (no files, no licensing).
// If you add your OWN licensed file at  public/champions-day.mp3
// the site plays that instead of the built-in fanfare (max 15 seconds, then fades out).

const KEY = 'derby_sound';
const CL_KEY = 'derby_cl_played';
const CUSTOM_FILE = '/champions-day.mp3';
const MAX_SECONDS = 15;

let ctx: AudioContext | null = null;
let clArmed = false;

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

/** If sound was enabled on an earlier visit, one tap on this page is still required by the browser. */
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

/** Soft two-note chime, used as a confirmation when the visitor turns sound on. */
export function playChime(): void {
  if (!isSoundEnabled()) return;
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + 0.02;
  const master = c.createGain();
  master.gain.value = 0.3;
  master.connect(c.destination);
  [659.25, 880].forEach((freq, i) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = c.createGain();
    const start = t0 + i * 0.16;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.4, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.8);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + 0.9);
  });
}

/** Original fanfare (about 3.5 s): rising brass-like chords and timpani. */
function playFanfareSynth(c: AudioContext): void {
  const t0 = c.currentTime + 0.05;
  const master = c.createGain();
  master.gain.value = 0.35;
  master.connect(c.destination);

  const chord = (freqs: number[], start: number, dur: number, vol: number) => {
    freqs.forEach((f) => {
      const osc = c.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(900, t0 + start);
      lp.frequency.linearRampToValueAtTime(2200, t0 + start + 0.15);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t0 + start);
      g.gain.linearRampToValueAtTime(vol, t0 + start + 0.06);
      g.gain.setValueAtTime(vol, t0 + start + Math.max(dur - 0.15, 0.1));
      g.gain.linearRampToValueAtTime(0.0001, t0 + start + dur);
      osc.connect(lp);
      lp.connect(g);
      g.connect(master);
      osc.start(t0 + start);
      osc.stop(t0 + start + dur + 0.05);
    });
  };

  const timpani = (start: number) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, t0 + start);
    osc.frequency.exponentialRampToValueAtTime(55, t0 + start + 0.4);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0 + start);
    g.gain.exponentialRampToValueAtTime(0.9, t0 + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + 0.9);
    osc.connect(g);
    g.connect(master);
    osc.start(t0 + start);
    osc.stop(t0 + start + 1);
  };

  timpani(0);
  chord([261.63, 329.63, 392.0], 0, 0.45, 0.12);
  chord([349.23, 440.0, 523.25], 0.5, 0.45, 0.12);
  chord([392.0, 493.88, 587.33], 1.0, 0.45, 0.12);
  timpani(1.5);
  chord([523.25, 659.25, 783.99, 1046.5], 1.5, 1.9, 0.14);
}

async function playCustomOrFanfare(): Promise<void> {
  try {
    const audio = new Audio(CUSTOM_FILE);
    audio.volume = 0.7;
    await audio.play(); // rejects if the file does not exist

    // Never play longer than MAX_SECONDS: fade out during the last 2 seconds
    window.setTimeout(() => {
      const fade = () => {
        if (audio.paused || audio.ended) return;
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.07);
          window.setTimeout(fade, 100);
        } else {
          audio.pause();
        }
      };
      fade();
    }, Math.max(MAX_SECONDS - 1, 1) * 1000);
    return;
  } catch {
    /* fall back to the built-in fanfare */
  }
  const c = getCtx();
  if (c) playFanfareSynth(c);
}

function todayKey(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Baghdad' }).format(new Date());
}

function alreadyPlayedToday(): boolean {
  try {
    return localStorage.getItem(CL_KEY) === todayKey();
  } catch {
    return false;
  }
}

function markPlayed(): void {
  try {
    localStorage.setItem(CL_KEY, todayKey());
  } catch {
    /* ignore */
  }
}

/**
 * On a Champions League day: play the fanfare ONCE per day, after the
 * visitor's first tap/click (browsers do not allow sound before that).
 */
export function playChampionsDayMusicOnce(): void {
  if (typeof window === 'undefined') return;
  if (!isSoundEnabled() || alreadyPlayedToday() || clArmed) return;

  const run = () => {
    if (!isSoundEnabled() || alreadyPlayedToday()) return;
    getCtx();
    markPlayed();
    void playCustomOrFanfare();
  };

  const c = getCtx();
  if (c && c.state === 'running') {
    run();
    return;
  }

  clArmed = true;
  const onGesture = () => {
    window.removeEventListener('pointerdown', onGesture);
    window.removeEventListener('keydown', onGesture);
    clArmed = false;
    run();
  };
  window.addEventListener('pointerdown', onGesture);
  window.addEventListener('keydown', onGesture);
}

/** Kept only so an older App.tsx that still imports playGoal keeps building. */
export function playGoal(): void {
  playChime();
}
