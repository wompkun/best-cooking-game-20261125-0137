// Warung Rush — deterministic screenshot states. The game reads ?shot=
// from the URL and arranges a fixed, lively scene so each screenshot is a
// real render of the game's own code: cover (mid-assembly + ready plate),
// rush (timer low, plate ready), served (coins flying) and title.
import { makeOrder } from './state.js';
import { RECIPES } from './config.js';

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pickOrders(state, rng, count, lowTime) {
  state.orders = [];
  // Distinct recipes per shot, so the board never repeats a dish.
  const shuffled = [...RECIPES];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  for (let i = 0; i < count; i++) {
    const order = makeOrder(state.level, rng);
    order.recipe = shuffled[i % shuffled.length];
    order.timeMax = Math.max(24, order.recipe.time - (state.level - 1) * 2.5);
    order.timeLeft = order.timeMax;
    if (lowTime) order.timeLeft = 6 + rng() * 8;
    state.orders.push(order);
  }
}

export function applyShot(state, shot) {
  const rng = seededRandom(20261125);
  state.screen = 'playing';
  state.startedAt = Date.now();
  state.level = 2;
  state.score = 340;
  state.coins = 54;
  state.served = 6;
  state.combo = 2;
  state.bestCombo = 3;
  state.shiftLeft = 132;
  state.plate = [];
  state.ready = [];
  state.particles = [];
  state.floaters = [];

  if (shot === 'cover') {
    // The fullest scene: four orders, a dish mid-assembly on the plate,
    // one finished dish waiting in the ready tray, timer running.
    pickOrders(state, rng, 4, false);
    const target = state.orders[0];
    state.plate = target.recipe.needs.slice(0, 2);
    const readyOrder = state.orders[1];
    state.ready = [{ order: readyOrder, readyAt: Date.now() }];
    state.orders = state.orders.filter((o) => o.id !== readyOrder.id);
    state.showMessage(`${readyOrder.recipe.name} ready — serve it!`, 'good');
  } else if (shot === 'rush') {
    // Rush hour: timer almost out, an order about to expire, plate ready.
    state.shiftLeft = 24;
    state.score = 720;
    state.coins = 118;
    state.served = 14;
    state.level = 3;
    pickOrders(state, rng, 4, true);
    const target = state.orders[0];
    state.plate = [...target.recipe.needs];
    // Complete the plate into the ready tray for the shot.
    state.ready = [{ order: target, readyAt: Date.now() }];
    state.orders = state.orders.filter((o) => o.id !== target.id);
    state.plate = state.orders[0].recipe.needs.slice(0, 2);
    state.showMessage('RUSH HOUR! Serve before the timer ends!', 'bad');
  } else if (shot === 'served') {
    // Just served: coins burst over the worktop, combo banner up.
    pickOrders(state, rng, 2, false);
    state.score = 540;
    state.coins = 86;
    state.served = 9;
    state.combo = 3;
    state.plate = state.orders[0].recipe.needs.slice(0, 1);
    state.spawnCoins(state.orders[0].customer);
    state.floaters.push({ text: '+130  PERFECT!', x: 640, y: 340, life: 1.2, maxLife: 1.2, color: '#2e7d32' });
    state.showMessage('Perfect serve! Combo x3!', 'good');
  } else if (shot === 'title') {
    state.screen = 'title';
    state.score = 0;
    state.coins = 0;
    state.served = 0;
    state.combo = 0;
    state.level = 1;
    state.shiftLeft = 150;
    pickOrders(state, rng, 2, false);
  }
}

export function shotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('shot');
}

// The recipe list the title screen can show; kept here so the shot module
// owns every deterministic arrangement the screenshots use.
export function shotRecipes() {
  return RECIPES.slice(0, 4);
}
