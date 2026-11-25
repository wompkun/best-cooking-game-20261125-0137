# 🍜 Warung Rush

[![make.fun](https://make.fun/api/competitions/best-cooking-game-20261125-0137/badge)](https://make.fun/c/best-cooking-game-20261125-0137)

**Warung Rush** is an original cooking game for the make.fun best-cooking-game bounty. You run a little Indonesian noodle stall — *Warung Senja* — that never sleeps. Customers queue up at the order board, and you build their dishes ingredient by ingredient on the counter, then serve them before their patience (and your shift timer) runs out.

> Play it free via make.fun — referral `jk303ka9`

## How to play

1. **Read the order board** — each customer wants one dish (Mie Ayam, Nasi Goreng, Mie Pedas, … 8 original recipes).
2. **Click ingredients** on the counter (or press **1–8**) to build the dish on your plate. A wrong ingredient is refused with a buzz.
3. A finished dish waits in the **READY tray** — press **SPACE** (or click it) to serve.
4. Serve fast for time bonuses and combos. Missed orders cost points, and every level makes orders arrive faster.

Other keys: **Backspace** clears the plate, **P** pauses, **M** mutes, **R** restarts after a shift, **Enter** starts.

## What is in the game

- A full kitchen: order board with per-order patience timers, a stove with a steaming wok, ingredient counter, assembly plate, ready tray, shift timer, score / coins / combo HUD.
- 8 original recipes, 8 customers with their own faces and moods, 3 difficulty levels that speed up as your score grows.
- 150-second shifts, combos for fast consecutive serves, a results screen with your best combo.
- All art is flat vector drawing on canvas and all sound is synthesized with WebAudio — no image or audio files, no network requests, no libraries.

## Run it

Serve `game/` with any static server and open `index.html` in a desktop browser:

```sh
cd game && python3 -m http.server 8080
```

Or open `game/index.html` directly from disk.

## Hand in

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored `vendor/makefun-game.ts` library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

| File | Job |
| --- | --- |
| `game/index.html` | Page shell, canvas, help line |
| `game/src/main.js` | Game loop and wiring |
| `game/src/config.js` | Ingredients, recipes, customers, tuning |
| `game/src/state.js` | Orders, plate, serving, score, levels |
| `game/src/render.js` | All drawing: kitchen, board, counter, HUD |
| `game/src/input.js` | Mouse + keyboard |
| `game/src/audio.js` | Synthesized WebAudio effects + music |
| `game/src/shots.js` | Deterministic screenshot states (`?shot=`) |
| `main.ts` | Hand-in program |
| `vendor/makefun-game.ts` | make.fun dossier library (kit copy, unchanged) |

## License

MIT — see [LICENSE](LICENSE). SPDX-License-Identifier: MIT.
