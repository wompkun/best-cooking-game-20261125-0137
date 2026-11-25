// Warung Rush — entry point: game loop, wiring of input, sound and state,
// and the deterministic screenshot hook (?shot=cover|rush|served|title).
import { GameState } from './state.js';
import { SoundEngine } from './audio.js';
import { drawGame } from './render.js';
import { bindInput } from './input.js';
import { applyShot, shotFromUrl } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = new GameState();
const sound = new SoundEngine();

const actions = {
  start() {
    sound.ensure();
    sound.startMusic();
    state.start();
    sound.ding();
  },
  addIngredient(id) {
    sound.ensure();
    const result = state.addIngredient(id);
    if (result === 'added') sound.chop();
    else if (result === 'complete') { sound.ding(); sound.sizzle(); }
    else if (result === 'reject' || result === 'dup') { sound.error(); state.shake = 0.6; }
  },
  clearPlate() {
    if (state.clearPlate()) sound.click();
  },
  serve() {
    const served = state.serveReady();
    if (served) {
      sound.serve();
      sound.coin();
      if (served.leveled) { sound.levelUp(); state.showMessage(`Level ${state.level}! Orders come faster!`, 'good'); }
    } else {
      sound.click();
    }
  },
  togglePause() {
    if (state.screen === 'playing') { state.screen = 'paused'; sound.click(); }
    else if (state.screen === 'paused') { state.screen = 'playing'; sound.click(); }
  },
  toggleMute() {
    sound.ensure();
    sound.setMuted(!sound.muted);
    state.showMessage(sound.muted ? 'Sound off (M to turn on)' : 'Sound on', 'info');
  },
};

bindInput(canvas, state, sound, actions);

// Screenshot mode: arrange a fixed scene, draw one frame, and stop the
// clock so headless captures are stable.
const shot = shotFromUrl();
let last = performance.now();
let shotDrawn = false;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (shot) {
    if (!shotDrawn) {
      applyShot(state, shot);
      drawGame(ctx, state, 1.2);
      shotDrawn = true;
      window.__shotReady = true;
      document.title = `Warung Rush — ${shot}`;
    }
    return;
  }
  state.update(dt);
  drawGame(ctx, state, now / 1000);
  // Warn the player when the shift is almost over.
  if (state.screen === 'playing' && state.shiftLeft < 10 && Math.floor(state.shiftLeft) !== frame.lastTick) {
    frame.lastTick = Math.floor(state.shiftLeft);
    sound.tick();
  }
  requestAnimationFrame(frame);
}

if (shot) {
  // Screenshot mode: the help line is hidden and the canvas fills the
  // viewport exactly, so the capture is the game alone, edge to edge.
  const help = document.getElementById('help');
  if (help) help.remove();
  const wrap = document.getElementById('wrap');
  if (wrap) {
    wrap.style.width = '100vw';
    wrap.style.height = '100vh';
    wrap.style.aspectRatio = 'auto';
  }
  // Draw immediately as well, so a plain screenshot flag captures the scene
  // even before the first animation frame.
  applyShot(state, shot);
  drawGame(ctx, state, 1.2);
  shotDrawn = true;
  window.__shotReady = true;
}
requestAnimationFrame(frame);

// Expose a tiny debug handle for play-testing from the console.
window.__warung = { state, sound, actions };
