// Warung Rush — all sound is synthesized with WebAudio, no audio files.
// A tiny pentatonic music loop plus one-shot effects for every kitchen action.
export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
    this.started = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.5;
  }

  tone(freq, dur, type = 'sine', vol = 0.2, when = 0, slideTo = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  noise(dur, vol = 0.15, when = 0, filterFreq = 1800) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t0);
  }

  click() { this.tone(660, 0.07, 'triangle', 0.16); }
  chop() { this.noise(0.09, 0.25, 0, 900); this.tone(180, 0.08, 'square', 0.08); }
  sizzle() { this.noise(0.35, 0.1, 0, 4200); }
  ding() { this.tone(880, 0.25, 'sine', 0.22); this.tone(1318, 0.35, 'sine', 0.16, 0.08); }
  coin() { this.tone(988, 0.09, 'square', 0.1); this.tone(1319, 0.16, 'square', 0.1, 0.07); }
  error() { this.tone(160, 0.22, 'sawtooth', 0.14, 0, 110); }
  serve() { this.tone(523, 0.12, 'triangle', 0.2); this.tone(659, 0.12, 'triangle', 0.2, 0.09); this.tone(784, 0.22, 'triangle', 0.2, 0.18); }
  levelUp() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.18, i * 0.09)); }
  tick() { this.tone(1200, 0.05, 'square', 0.07); }

  startMusic() {
    if (!this.ctx || this.started) return;
    this.started = true;
    // Gentle pentatonic loop: C major pentatonic, one note per beat.
    const scale = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3];
    const melody = [0, 2, 4, 3, 2, 4, 5, 4, 2, 1, 0, 2, 3, 2, 0, -1];
    const step = () => {
      if (!this.muted && this.ctx) {
        const idx = melody[this.musicStep % melody.length];
        const note = scale[Math.max(0, Math.min(scale.length - 1, 4 + idx))];
        this.tone(note, 0.42, 'triangle', 0.05);
        if (this.musicStep % 4 === 0) this.tone(note / 2, 0.5, 'sine', 0.06);
      }
      this.musicStep++;
      this.musicTimer = window.setTimeout(step, 460);
    };
    step();
  }

  stopMusic() {
    this.started = false;
    if (this.musicTimer) window.clearTimeout(this.musicTimer);
  }
}
