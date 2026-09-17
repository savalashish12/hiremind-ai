let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const isMuted = () => {
  return localStorage.getItem('hiremind_auth_muted') === 'true';
};

export const setMuted = (muted) => {
  localStorage.setItem('hiremind_auth_muted', muted ? 'true' : 'false');
};

const playTone = (freq, type, duration, startVol, endVol, decayType = 'exponential') => {
  if (isMuted()) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gainNode.gain.setValueAtTime(startVol, ctx.currentTime);
    if (decayType === 'exponential') {
      gainNode.gain.exponentialRampToValueAtTime(endVol || 0.0001, ctx.currentTime + duration);
    } else {
      gainNode.gain.linearRampToValueAtTime(endVol || 0, ctx.currentTime + duration);
    }

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio feedback failed to play', e);
  }
};

export const playTypeSound = () => {
  // Randomize frequency slightly for more realistic mechanical anime keyboard sound
  const freq = 120 + Math.random() * 80;
  playTone(freq, 'triangle', 0.05, 0.1, 0.0001);
};

export const playHoverSound = () => {
  playTone(600, 'sine', 0.1, 0.05, 0.0001);
};

export const playSuccessSound = () => {
  if (isMuted()) return;
  try {
    const ctx = getAudioContext();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    notes.forEach((freq, index) => {
      setTimeout(() => {
        playTone(freq, 'sine', 0.25, 0.15, 0.0001);
      }, index * 60);
    });
  } catch {}
};

export const playErrorSound = () => {
  if (isMuted()) return;
  try {
    const ctx = getAudioContext();
    // Play a low detuned rumble
    playTone(90, 'sawtooth', 0.4, 0.25, 0.0001);
    playTone(93, 'sawtooth', 0.4, 0.25, 0.0001);
  } catch {}
};

export const playPortalSound = () => {
  if (isMuted()) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.8);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {}
};
