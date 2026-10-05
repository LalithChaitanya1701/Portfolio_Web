/**
 * Synthesized Web Audio API Sound Engine
 * Zero external audio files, pure programmatic synthesis.
 * Off by default; activated by user toggle.
 */

class SoundEngine {
  constructor() {
    this.enabled = false;
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.init();
      this.playBoot();
    }
    return this.enabled;
  }

  setEnabled(state) {
    this.enabled = !!state;
    if (this.enabled) {
      this.init();
      this.playBeep(880, 0.05, 'sine');
    }
    return this.enabled;
  }

  playBeep(freq = 600, duration = 0.04, type = 'sine', gainVal = 0.04) {
    if (!this.enabled) return;
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Audio fallback silent
    }
  }

  playKey() {
    if (!this.enabled) return;
    const freq = 1200 + Math.random() * 600;
    this.playBeep(freq, 0.02, 'triangle', 0.02);
  }

  playNav() {
    if (!this.enabled) return;
    this.playBeep(440, 0.04, 'sine', 0.03);
    setTimeout(() => this.playBeep(880, 0.04, 'sine', 0.03), 35);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.playBeep(523.25, 0.06, 'sine', 0.04);
    setTimeout(() => this.playBeep(659.25, 0.06, 'sine', 0.04), 50);
    setTimeout(() => this.playBeep(783.99, 0.09, 'sine', 0.04), 100);
  }

  playAlert() {
    if (!this.enabled) return;
    this.playBeep(320, 0.08, 'sawtooth', 0.03);
    setTimeout(() => this.playBeep(240, 0.09, 'sawtooth', 0.03), 80);
  }

  playClose() {
    if (!this.enabled) return;
    if (!this.ctx) this.init();
    // Distinctive two-tone descending closure sound with subtle cyber decay
    this.playBeep(640, 0.03, 'sine', 0.035);
    setTimeout(() => {
      this.playBeep(380, 0.05, 'triangle', 0.03);
      setTimeout(() => this.playBeep(190, 0.06, 'sawtooth', 0.02), 30);
    }, 25);
  }

  playBoot() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.28);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.14);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch (e) {}
  }
}

export const sound = new SoundEngine();
