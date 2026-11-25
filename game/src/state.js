// Warung Rush — game state: orders, the plate being built, ready dishes,
// score, coins, combos, levels and the shift timer. Pure logic, no drawing.
import { CUSTOMERS, GAME, INGREDIENT_BY_ID, RECIPES, levelForScore, orderGapForLevel, orderTimeForLevel } from './config.js';

let nextOrderId = 1;

export function makeOrder(level, rng = Math.random) {
  const recipe = RECIPES[Math.floor(rng() * RECIPES.length)];
  const customer = CUSTOMERS[Math.floor(rng() * CUSTOMERS.length)];
  return {
    id: nextOrderId++,
    recipe,
    customer,
    timeLeft: orderTimeForLevel(level, recipe),
    timeMax: orderTimeForLevel(level, recipe),
    bornAt: Date.now(),
  };
}

export function plateMatchesOrder(plate, order) {
  if (plate.length !== order.recipe.needs.length) return false;
  const sorted = [...plate].sort().join(',');
  return sorted === [...order.recipe.needs].sort().join(',');
}

export function plateFitsAnyOrder(plate, orders) {
  return orders.some((o) => plate.every((ing) => o.recipe.needs.includes(ing)));
}

export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.screen = 'title'; // title | playing | paused | over
    this.score = 0;
    this.coins = 0;
    this.served = 0;
    this.missed = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.lastServeAt = 0;
    this.level = 1;
    this.shiftLeft = GAME.shiftSeconds;
    this.orders = [];
    this.plate = [];
    this.ready = [];
    this.orderTimer = 4;
    this.message = '';
    this.messageAt = 0;
    this.messageKind = '';
    this.particles = [];
    this.floaters = [];
    this.shake = 0;
    this.servedFlash = 0;
    this.startedAt = 0;
    this.elapsed = 0;
  }

  start() {
    this.reset();
    this.screen = 'playing';
    this.startedAt = Date.now();
    this.orders.push(makeOrder(1));
    this.orders.push(makeOrder(1));
    this.orderTimer = 8;
    this.showMessage('Shift started! Serve every order!', 'good');
  }

  showMessage(text, kind = 'info') {
    this.message = text;
    this.messageKind = kind;
    this.messageAt = Date.now();
  }

  addIngredient(id) {
    if (this.screen !== 'playing') return 'idle';
    if (this.plate.includes(id)) return 'dup';
    const next = [...this.plate, id];
    if (!plateFitsAnyOrder(next, this.orders)) return 'reject';
    this.plate = next;
    const match = this.orders.find((o) => plateMatchesOrder(this.plate, o));
    if (match) {
      this.orders = this.orders.filter((o) => o.id !== match.id);
      this.ready.push({ order: match, readyAt: Date.now() });
      if (this.ready.length > GAME.maxReady) this.ready.shift();
      this.plate = [];
      this.showMessage(`${match.recipe.name} ready — serve it!`, 'good');
      return 'complete';
    }
    return 'added';
  }

  clearPlate() {
    if (this.plate.length === 0) return false;
    this.plate = [];
    return true;
  }

  serveReady() {
    if (this.screen !== 'playing' || this.ready.length === 0) return null;
    const dish = this.ready.shift();
    const now = Date.now();
    if (now - this.lastServeAt <= GAME.comboWindowMs) this.combo += 1;
    else this.combo = 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.lastServeAt = now;
    const timeBonus = Math.round((dish.order.timeLeft / dish.order.timeMax) * 30);
    const gained = 100 + timeBonus + (this.combo - 1) * 25;
    this.score += gained;
    this.coins += dish.order.recipe.price;
    this.served += 1;
    this.servedFlash = Date.now();
    const newLevel = levelForScore(this.score);
    const leveled = newLevel > this.level;
    if (leveled) this.level = newLevel;
    this.spawnCoins(dish.order.customer);
    return { dish, gained, leveled, combo: this.combo };  }

  spawnCoins(customer) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        kind: 'coin',
        x: 640 + (Math.random() - 0.5) * 120,
        y: 430,
        vx: (Math.random() - 0.5) * 260,
        vy: -180 - Math.random() * 160,
        life: 0.9,
        maxLife: 0.9,
        size: 7 + Math.random() * 5,
      });
    }
  }

  update(dt) {
    if (this.screen !== 'playing') return;
    this.elapsed += dt;
    this.shiftLeft -= dt;
    if (this.shiftLeft <= 0) {
      this.shiftLeft = 0;
      this.screen = 'over';
      return;
    }
    // Order timers tick down; expired orders are missed.
    for (const order of this.orders) {
      order.timeLeft -= dt;
      if (order.timeLeft <= 0) {
        this.orders = this.orders.filter((o) => o.id !== order.id);
        this.missed += 1;
        this.combo = 0;
        this.score = Math.max(0, this.score - GAME.wrongPenalty);
        this.showMessage(`${order.customer.name} left hungry! -${GAME.wrongPenalty}`, 'bad');
      }
    }
    // Spawn new orders on a level-paced timer.
    this.orderTimer -= dt;
    if (this.orderTimer <= 0 && this.orders.length < GAME.maxOrders) {
      this.orders.push(makeOrder(this.level));
      this.orderTimer = orderGapForLevel(this.level) * (0.8 + Math.random() * 0.5);
    }
    // Particles and floaters age out.
    const step = (list) => {
      for (const p of list) p.life -= dt;
      return list.filter((p) => p.life > 0);
    };
    this.particles = step(this.particles);
    this.floaters = step(this.floaters);
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 520 * dt;
    }
    for (const f of this.floaters) f.y -= 42 * dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 3);
  }

  plateProgress() {
    if (this.orders.length === 0) return 0;
    let best = 0;
    for (const o of this.orders) {
      const hit = this.plate.filter((ing) => o.recipe.needs.includes(ing)).length;
      best = Math.max(best, hit / o.recipe.needs.length);
    }
    return best;
  }

  shiftClock() {
    const s = Math.max(0, Math.ceil(this.shiftLeft));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  ingredientName(id) {
    return INGREDIENT_BY_ID[id] ? INGREDIENT_BY_ID[id].name : id;
  }
}
