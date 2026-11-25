// Warung Rush — mouse and keyboard input: clicks on counter slots, the
// plate, the ready tray and buttons, plus number keys, Space, Backspace,
// P to pause, M to mute and R to restart.
import { COUNTER_SLOTS, PLATE, READY_TRAY, SERVE_BUTTON, START_BUTTON } from './render.js';
import { INGREDIENTS } from './config.js';

function inside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function bindInput(canvas, state, sound, actions) {
  const toGame = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 800,
    };
  };

  canvas.addEventListener('mousemove', (event) => {
    const { x, y } = toGame(event);
    const slot = COUNTER_SLOTS.find((s) => inside(x, y, s));
    state.hoverSlot = slot ? slot.ing.id : null;
    canvas.style.cursor = slot || inside(x, y, SERVE_BUTTON) ? 'pointer' : 'default';
  });

  canvas.addEventListener('click', (event) => {
    const { x, y } = toGame(event);
    sound.ensure();
    if (state.screen === 'title') {
      if (inside(x, y, START_BUTTON)) actions.start();
      return;
    }
    if (state.screen === 'over') {
      if (x >= 490 && x <= 790 && y >= 510 && y <= 570) actions.start();
      return;
    }
    if (state.screen !== 'playing') return;
    if (inside(x, y, SERVE_BUTTON) || inside(x, y, READY_TRAY)) {
      actions.serve();
      return;
    }
    const slot = COUNTER_SLOTS.find((s) => inside(x, y, s));
    if (slot) {
      actions.addIngredient(slot.ing.id);
      return;
    }
    if (inside(x, y, PLATE)) actions.clearPlate();
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'm') {
      actions.toggleMute();
      return;
    }
    if (state.screen === 'title' && (key === 'enter' || key === ' ')) {
      actions.start();
      return;
    }
    if (state.screen === 'over' && key === 'r') {
      actions.start();
      return;
    }
    if (key === 'p' && (state.screen === 'playing' || state.screen === 'paused')) {
      actions.togglePause();
      return;
    }
    if (state.screen !== 'playing') return;
    if (key === ' ') {
      event.preventDefault();
      actions.serve();
      return;
    }
    if (key === 'backspace') {
      actions.clearPlate();
      return;
    }
    const ing = INGREDIENTS.find((i) => i.key === key);
    if (ing) actions.addIngredient(ing.id);
  });
}
