# Climbing Grid Prototype — Claude Context

## Project Overview
A deterministic puzzle-climbing game played on a scrolling grid. Each move is resolved by looking up `[direction, hand, angle, weight]` in a penalty table; two resource tracks (pump and grip) accumulate cost and cause falls at level 3. Skills unlock progressively per location and modify penalty math or enable special actions.

## Game Mechanics

### Resources
- **Pump** (0=Fresh, 1=Pumped, 2=Struggling, 3+=Fall): rises via hold-type tick accumulation (3 ticks = 1 state advance).
  - **Shake**: fully resets pump to 0 and clears decay counter, 1-move cooldown, requires `shakable` hold. Deadpoint blocks the next move's pump decay.
- **Grip** (0=Chalked, 1=Weakening, 2=Slipping, 3+=Fall): advances based on move penalty level (level 1 = +1 state, level 2 = +2 states).
  - **Chalk**: resets grip to 0, 3 uses per climb, 1-move cooldown, requires `chalkable` hold. Deadpoint blocks the next move's grip state change.

### Move Resolution
Base penalty `[direction, hand, angle, weight]` → level 0–4 via `PENALTY_TABLE_RAW` in `routes-data.js`. Gaston angles (L@135°, R@225°) have elevated base penalties baked into the table.
Modifiers applied in order:
1. **Distance**: extended moves (dy/dx ≥ 2) require Reach skill — no Reach = instant fall; with Reach = no penalty added.
2. **Cross skill**: cross-body moves require Cross — no Cross = instant fall; with Cross = -1 effective level.
3. **Commit** (if active): -1 one-shot, 10-move cooldown
4. **Level ≥ 3** = fall; **level = 4** = instant fall regardless of modifiers

### Hold Types & Pump Cost (ticks accumulated per move)
| Ticks | Types |
|-------|-------|
| 1 | jug |
| 2 | edge, pocket, undercling |
| 3 | pinch |
| 4 | crimp, sloper |
Pump advances one state every 3 ticks (i.e., jug every 3 moves, crimp every ~0.75 moves).

### Skills (location-gated, 8 total)
| Skill | Unlock | Effect |
|-------|--------|--------|
| Cross | Area 0 complete | Required for cross-body moves (no skill = fall); -1 effective level when used |
| Reach | Area 0, 8-star | Required for extended moves (no skill = fall); no penalty when used |
| Weight Shift | Area 1 | Manual weight control |
| Match | Area 2 | Reset hand tracking on matchable holds |
| Deadpoint | Area 3 | Shake blocks next pump decay; Chalk blocks next grip state change |
| Commit | Area 4 | -1 penalty one-shot, 10-move cooldown |
| Bump | Area 5 | Lateral reposition without hand change |
| Dyno | Area 7 | Extend reach to 3 spaces, 5-move cooldown |

### Progression
- 25 locations on a 5×5 world map; unlock spreads from (0,0) when adjacent area has 8+ stars.
- Each location has 3 routes (tutorial → practice → mastery).
- 5 star challenges per route: completion, speed, pumpEfficiency (finish pump=0), gripEfficiency (finish grip=0), flashClimb (first try).

---

## Script Inventory
Scripts load in dependency order (no module system — all global scope):

`gear-data` → `constants` → `routes-area0..7` → `routes-data` → `skills-data` → `state` → `route` → `skills` → `equipment` → `ui-tooltip` → `ui` → `camp` → `climbing-actions` → `climbing` → `main`

| File | Lines | Role | Key Exports / Functions |
|------|-------|------|------------------------|
| `js/constants.js` | 123 | Hold types, pump costs | `HOLD_TYPES`, `HOLD_PUMP_COST`, `normalizeAngle()` |
| `js/routes-data.js` | 163 | Penalty table, helpers, route DB assembly | `PENALTY_TABLE_RAW`, `lookupPenalty()`, `getMoveDirection()`, `isCrossMove()`, `getIdealWeight()`, `routeDatabase` |
| `js/routes-area0.js` | ~90 | Area 0 routes (Boulder Garden) | `ROUTES_AREA_0` |
| `js/routes-area1.js` | ~75 | Area 1 routes (Crimp Canyon) | `ROUTES_AREA_1` |
| `js/routes-area2.js` | ~110 | Area 2 routes (Overhang Alley) | `ROUTES_AREA_2` |
| `js/routes-area3.js` | ~90 | Area 3 routes (Slab Valley) | `ROUTES_AREA_3` |
| `js/routes-area4.js` | ~100 | Area 4 routes (Jug Junction) | `ROUTES_AREA_4` |
| `js/routes-area5.js` | ~110 | Area 5 routes (Pinch Peak) | `ROUTES_AREA_5` |
| `js/routes-area6.js` | ~110 | Area 6 routes (Pocket Paradise) | `ROUTES_AREA_6` |
| `js/routes-area7.js` | ~120 | Area 7 routes (Steep Street) | `ROUTES_AREA_7` |
| `js/skills-data.js` | 126 | Skill database, unlock logic | `SKILLS`, `isSkillUnlocked()`, `tryUnlockSkillOnCompletion()` |
| `js/state.js` | 239 | Master game state + locations | `gameState`, `locations[]`, `calculateTotalStars()`, `isLocationUnlocked()` |
| `js/gear-data.js` | 201 | Equipment/gear definitions | Gear item objects |
| `js/route.js` | 117 | Grid loading, viewport math | `loadRoute()`, `updateViewport()`, `routeRowToViewportRow()` |
| `js/skills.js` | 57 | Skills UI wrapper | `renderSkillsUI()` |
| `js/equipment.js` | 442 | Equipment slot/inventory UI | `showEquipment()` |
| `js/ui-tooltip.js` | 301 | Hold hover tooltip with penalty breakdown | `showHoldTooltip()`, `refreshTooltip()` |
| `js/ui.js` | 393 | Primary render loop + input handling | `renderGrid()`, `selectHand()`, `setWeight()`, `updateUI()`, `addFeedback()` |
| `js/camp.js` | 776 ⚠️ | Camp overlay, guidebook, equipment wrapper | `showCamp()`, `showGuidebook()`, `updateCampUI()` |
| `js/climbing-actions.js` | 416 | Action system (shake, chalk, commit, dyno) | `useShake()`, `useChalk()`, `activateCommit()`, `activateDyno()` |
| `js/climbing.js` | 271 | Core move resolver, route completion | `moveToHold()`, `completeRoute()`, `endGame()` |
| `js/main.js` | 413 | Game flow + keyboard handlers | `startGame()`, `showWorldMap()`, `startClimb()`, `selectLocation()` |

### Route Editor (`route-editor/` — standalone tool)
| File | Lines | Role |
|------|-------|------|
| `editor.js` | 344 | Visual hold placement |
| `simulator.js` | 638 ⚠️ | Move simulation with feedback |
| `penalty-data.js` | 229 | Penalty table copy for solver |
| `io.js` | 292 | Import/export ↔ `Handcrafted Routes/*.txt` |
| `solver.js` | 502 ⚠️ | BFS solver — validates solvability, computes holdCount |

---

## Coding Conventions

- **Global scope only** — no ES modules, no bundler. Script load order in `index.html` is the dependency graph.
- **`gameState` is the single source of truth.** Never duplicate or shadow state elsewhere.
- **All penalty math goes through `lookupPenalty()`** in `routes-data.js`.
- **Hold labels are always uppercase** of the type name (`pocket` → `POCKET`, `jug` → `JUG`).
- **`holdCount` in `routes-data.js` must equal the `holds[]` array length** — the game uses it to detect route completion. The text file's `holdCount` field is unreliable; always recount.
- **Route text format**: `# y x type angle pump grip match rest` where `y=row, x=col` maps to `position: { x: col, y: row }`.
- **Minimal changes only.** Do not add features, error handling, comments, or refactors beyond what is asked.

---

## 500-Line Rule
**Every script must stay under 500 lines.** Files currently over the limit are flagged ⚠️ above.

When a task would push a file over 500 lines, **propose a split first**:
- `js/routes-data.js` — already split into `js/routes-area0.js` through `js/routes-area7.js` ✓
- `js/camp.js` (776): extract guidebook/equipment sub-UIs into `js/camp-ui.js`.
- `route-editor/simulator.js` (638): extract rendering helpers.
- `route-editor/solver.js` (502): extract graph traversal utilities.

Before touching an over-limit file, read it fully to identify the right split boundary.

---

## Key Reference Files
- [`game design.md`](game design.md) — full design spec (areas, routes, skill teaching plan)
- [`Handcrafted Routes/`](Handcrafted Routes/) — text format source for all routes
- [`js/routes-data.js`](js/routes-data.js) — all route definitions (import destination)
- [`js/state.js`](js/state.js) — gameState defaults, location definitions
- [`js/constants.js`](js/constants.js) — hold types, grip costs
