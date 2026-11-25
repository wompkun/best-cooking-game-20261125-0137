// Warung Rush — recipe and ingredient catalogue.
// Every dish is an original recipe from the fictional "Warung Senja" stall.
export const INGREDIENTS = [
  { id: 'noodle', name: 'Noodles', key: '1', color: '#f2c14e', dark: '#c98f1b', emoji: '🍜', x: 0 },
  { id: 'rice', name: 'Rice', key: '2', color: '#fdf6e3', dark: '#d9c9a3', emoji: '🍚', x: 1 },
  { id: 'chicken', name: 'Chicken', key: '3', color: '#e8a87c', dark: '#b96a35', emoji: '🍗', x: 2 },
  { id: 'egg', name: 'Egg', key: '4', color: '#ffe9a8', dark: '#e0a92e', emoji: '🥚', x: 3 },
  { id: 'greens', name: 'Greens', key: '5', color: '#7dc383', dark: '#3f7d46', emoji: '🥬', x: 4 },
  { id: 'chili', name: 'Chili', key: '6', color: '#e4572e', dark: '#9c2b12', emoji: '🌶️', x: 5 },
  { id: 'tofu', name: 'Tofu', key: '7', color: '#f7ead1', dark: '#cbb27f', emoji: '🧈', x: 6 },
  { id: 'sauce', name: 'Sauce', key: '8', color: '#8b5e3c', dark: '#5d3a1e', emoji: '🥣', x: 7 },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

export const RECIPES = [
  { id: 'mie-ayam', name: 'Mie Ayam', base: 'noodle', needs: ['noodle', 'chicken', 'greens'], price: 18, time: 42, color: '#f2c14e' },
  { id: 'nasi-goreng', name: 'Nasi Goreng', base: 'rice', needs: ['rice', 'egg', 'chicken', 'chili'], price: 22, time: 46, color: '#e4572e' },
  { id: 'mie-pedas', name: 'Mie Pedas', base: 'noodle', needs: ['noodle', 'chili', 'egg'], price: 20, time: 40, color: '#d64533' },
  { id: 'nasi-tofu', name: 'Nasi Tofu', base: 'rice', needs: ['rice', 'tofu', 'greens', 'sauce'], price: 19, time: 44, color: '#7dc383' },
  { id: 'mie-telur', name: 'Mie Telur', base: 'noodle', needs: ['noodle', 'egg', 'greens', 'sauce'], price: 17, time: 38, color: '#f2c14e' },
  { id: 'nasi-ayam', name: 'Nasi Ayam', base: 'rice', needs: ['rice', 'chicken', 'sauce', 'greens'], price: 21, time: 45, color: '#e8a87c' },
  { id: 'mie-tofu', name: 'Mie Tofu', base: 'noodle', needs: ['noodle', 'tofu', 'chili'], price: 18, time: 39, color: '#e4572e' },
  { id: 'nasi-pedas', name: 'Nasi Pedas', base: 'rice', needs: ['rice', 'chili', 'egg', 'sauce'], price: 23, time: 47, color: '#d64533' },
];

export const CUSTOMERS = [
  { name: 'Budi', skin: '#f1c27d', shirt: '#3e7cb1', hair: '#2b2b2b' },
  { name: 'Sari', skin: '#e8b88a', shirt: '#c65d7b', hair: '#4a2c14' },
  { name: 'Agus', skin: '#c68642', shirt: '#5a9367', hair: '#1a1a1a' },
  { name: 'Dewi', skin: '#f1c27d', shirt: '#e0a458', hair: '#6b3a1f' },
  { name: 'Rudi', skin: '#8d5524', shirt: '#7b5ea7', hair: '#111111' },
  { name: 'Maya', skin: '#e8b88a', shirt: '#2e8b8b', hair: '#2b2b2b' },
  { name: 'Joko', skin: '#c68642', shirt: '#b3543f', hair: '#3a3a3a' },
  { name: 'Lina', skin: '#f1c27d', shirt: '#8a6d3b', hair: '#1a1a1a' },
];

export const GAME = {
  width: 1280,
  height: 800,
  shiftSeconds: 150,
  maxOrders: 4,
  maxReady: 2,
  startOrderGap: 11,
  minOrderGap: 6,
  comboWindowMs: 6000,
  wrongPenalty: 15,
};

export function levelForScore(score) {
  return 1 + Math.floor(score / 350);
}

export function orderGapForLevel(level) {
  return Math.max(GAME.minOrderGap, GAME.startOrderGap - (level - 1) * 1.4);
}

export function orderTimeForLevel(level, recipe) {
  return Math.max(24, recipe.time - (level - 1) * 2.5);
}
