# Climbing Grid — Game Design Document

## Overview

A turn-based, deterministic puzzle game about climbing a scrolling grid. The player selects a hand, adjusts weight, activates skills, then clicks a hold. Each move is resolved by looking up `[direction, hand, angle, weight]` in the penalty table. Two resource tracks — **pump** and **grip** — accumulate cost and trigger a fall at state 3. Skills unlock progressively as the player earns stars at each location and spread to adjacent areas on the world map.

---

## Core Climbing Loop

1. Select a hand (A = Left, D = Right). Hands must alternate — the same hand cannot be used twice in a row.
2. Optionally shift weight (Z = Left, X = Center, C = Right), activate a skill, or use a recovery action.
3. Click a reachable hold above the current position.
4. The game resolves the penalty, applies pump and grip changes, then checks for fall or route completion.

---

## The Grid & Viewport

- The climbing wall is a **5-column** grid of unlimited height.
- The viewport shows **5 rows** at a time and scrolls as the player climbs.
- The player always climbs **upward** — moves to the same row or below are rejected.
- **Normal reach**: dy ≤ 2 AND dx ≤ 2 (two rows up or two columns across).
- **Dyno reach**: dy ≤ 3 AND dx ≤ 3 (expanded when Dyno is active).
- Hold positions are defined by `{ x: col, y: row }` in route data.

---

## Hand Alternation

- `lastHandUsed` tracks which hand was used on the previous move.
- The same hand cannot be selected again until after the next move.
- **Match** (skill) resets `lastHandUsed` to null on matchable holds, allowing the same hand to be reused.

### Cross-body Moves

A move is **cross-body** if:
- Right hand reaches **up-left**
- Left hand reaches **up-right**

Cross-body moves use a different row of the penalty table (inherently higher base penalties). The Cross skill reduces the effective penalty by 1 for these moves.

---

## Move Direction

Determined by the horizontal delta from current column to target column:

| dx | Direction |
|----|-----------|
| < 0 | `up-left` |
| > 0 | `up-right` |
| = 0 | `up` |

---

## Penalty System

Every move has an **effective penalty level** (0–4) that drives pump state changes.

### Base Penalty Table

`PENALTY_TABLE_RAW` maps `[direction, hand, holdAngle, weight]` → level 0–4.

- **Level 0** — Clean move, no pump change
- **Level 1** — Slight penalty, +1 pump state
- **Level 2** — Moderate penalty, +2 pump states
- **Level 3** — Severe, instant fall
- **Level 4** — Instant fall (regardless of any modifiers)

The table covers three directions (`up`, `up-left`, `up-right`), two hands (`L`/`R`), eight angles (0°–315° in 45° steps), and three weight positions (`L`/`C`/`R`).

**Quick reference — clean (level 0) combinations:**

| Direction | Hand | Angle | Weight |
|-----------|------|-------|--------|
| UP | Either | 0° or 180° | Center |
| UP | Either | 45° | Left |
| UP | Either | 315° | Right |
| UP-LEFT | Left | 0° | Center |
| UP-LEFT | Left | 45° | Left |
| UP-LEFT | Left | 270° | Right |
| UP-LEFT | Left | 315° | Right |
| UP-RIGHT | Right | 0° | Center |
| UP-RIGHT | Right | 45° | Left |
| UP-RIGHT | Right | 90° | Left |
| UP-RIGHT | Right | 315° | Right |

### Ideal Weight per Angle

| Angle | Ideal Weight |
|-------|-------------|
| 0°, 180° | Center |
| 45°, 90°, 135° | Left |
| 225°, 270°, 315° | Right |

### Penalty Modifiers (applied after base lookup)

Modifiers adjust the effective level before mapping to pump state change. Applied in order:

1. **+1 Distance** — move spans dy ≥ 2 OR dx ≥ 2. Negated by Reach skill when active.
2. **Cross skill** (if active) — effective level −1 on cross-body moves.
3. **Commit skill** (if active) — effective level −1 (applied after cross).

Effective level is clamped to [0, 4]. A base level of 4 triggers an instant fall **before** modifiers are applied.

### Effective Level → Pump State Change

| Effective Level | Result |
|----------------|--------|
| 0 | No pump change |
| 1 | +1 pump state |
| 2 | +2 pump states |
| 3+ | Instant fall |

---

## Pump Resource

**States**: Fresh (0) → Pumped (1) → Struggling (2) → Fall (3+)

- Reaching state 3 ends the climb immediately.
- **Shake** reduces pump by 1 state (5-move cooldown).
- **Deadpoint** (skill): after Shake, the next move has zero pump state change.

Pump is displayed as a colored bar and text label. State is checked at the start of each move and again after applying changes.

---

## Grip Resource

**States**: Chalked (0) → Weakening (1) → Slipping (2) → Fall (3+)

- Reaching state 3 ends the climb immediately.
- A **decay counter** accumulates ticks each move based on the hold type grabbed.
- Every time the counter reaches 3 ticks, grip advances one state and the counter resets (carries over remainder).
- **Chalk** resets grip state to 0 and decay counter to 0 (3 uses per climb, 1-move cooldown).
- **Deadpoint** (skill): after Chalk, the next move skips grip decay entirely.

### Hold Types & Grip Cost

| Hold Type | Ticks per Move | Moves to Decay (from 0 ticks) |
|-----------|:--------------:|:-----------------------------:|
| Jug       | 1              | 3                             |
| Edge      | 1              | 3                             |
| Pocket    | 2              | 1.5                           |
| Undercling | 2             | 1.5                           |
| Pinch     | 3              | 1                             |
| Crimp     | 4              | 0.75                          |
| Sloper    | 4              | 0.75                          |

*Grip cost is looked up from `HOLD_GRIP_COST` in `js/constants.js` using the hold's `type` field.*

### Chalk Economy Reference

| Route Length | Expected Grip Pressure |
|---|---|
| ≤ 4 holds | No chalk needed (max ~1.3 ticks on jugs) |
| 5–8 holds | 1 chalk may be needed |
| 9+ holds | Chalk management becomes critical |

---

## Recovery Actions

### Shake (Q)
- Reduces pump state by 1 (minimum 0).
- 5-move cooldown (`actionCooldownLength = 5`).
- Cannot be used at pump state 0.
- If Deadpoint is unlocked: sets `justShook = true` so the next move has no pump state change.
- Counts as a turn for all other cooldowns.

### Chalk (E)
- Resets grip state to 0 and decay counter to 0.
- Limited to 3 uses per climb (`maxChalk = 3`), reset at climb start.
- 1-move cooldown after use.
- Cannot be used if `chalkRemaining = 0`.
- If Deadpoint is unlocked: sets `justChalked = true` so the next move skips grip decay.
- Counts as a turn for all other cooldowns.

---

## Weight System

- Three positions: **Left**, **Center**, **Right**.
- Can only shift **one step** per move relative to the weight at move start (`weightAtMoveStart`).
  - From Left: can reach Left or Center.
  - From Center: can reach any.
  - From Right: can reach Center or Right.
- Weight resets to the current position after each move (the new move's start weight).
- Shifting weight multiple steps in one move is blocked with feedback.
- The weight UI section is **hidden until Weight Shift is unlocked** at Area 1.
- Keyboard shortcuts: Z (left), X (center), C (right).

---

## Skills

Eight skills unlock as the player earns stars at locations. All skills except Weight Shift and Match require explicit activation before a move.

### Unlock Triggers

- **`completion`** — fires when any route at that location is first completed.
- **`areaUnlock`** — fires when 8+ stars have been earned at that location (same threshold that unlocks adjacent world map areas).

### Skill Reference

| Skill | Key | Unlock | Trigger | Effect | Cooldown |
|-------|-----|--------|---------|--------|----------|
| **Cross** | 3 | Area 0 (Boulder Garden) | completion | −1 effective penalty on cross-body moves | 3 moves |
| **Reach** | 1 | Area 0 (Boulder Garden) | areaUnlock (8★) | Negates the +1 distance penalty for extended (dy/dx ≥ 2) moves | 3 moves |
| **Weight Shift** | Z/X/C | Area 1 (Crimp Canyon) | areaUnlock (8★) | Unlocks the weight UI; enables pre-move weight positioning | Passive |
| **Match** | — | Area 2 (Overhang Alley) | areaUnlock (8★) | On matchable holds, resets `lastHandUsed` and consecutive crosses | Passive |
| **Deadpoint** | — | Area 3 (Slab Valley) | areaUnlock (8★) | After Shake: next move has no pump change. After Chalk: next move skips grip decay | Passive |
| **Commit** | R | Area 4 (Jug Junction) | areaUnlock (8★) | −1 effective penalty for one move (one-shot) | 10 moves |
| **Bump** | B | Area 5 (Pinch Peak) | areaUnlock (8★) | Reposition laterally without changing hands *(not yet implemented in climbing code)* | — |
| **Dyno** | T | Area 7 (Steep Street) | areaUnlock (8★) | Extends max reach to 3 spaces (dy or dx) for one move | 5 moves |
| **Body Tension** | G | Area 8 (TBD) | areaUnlock (8★) | Provides body tension for x moves to get through specific type of sequence. This is a future add that is to be determined | 5 moves |

### Skill Mechanics Detail

**Cross & Reach** — toggled on/off independently before a move (keys 1 and 3). Key 2 deactivates both. Auto-deactivate after use; cooldown begins on the move they are used, not when activated.

**Weight Shift** — purely enables the weight UI. Without it, weight is locked at center and the Z/X/C keys have no visible effect.

**Match** — triggers automatically when: the hold is `matchable: true`, Match is unlocked, and the player used the *opposite* hand from `lastHandUsed`. Resets `lastHandUsed = null` and `consecutiveCrosses = 0`.

**Deadpoint** — `justShook` and `justChalked` flags are cleared after each move in `updateSkillStateAfterMove()`. Only the *immediately following* move benefits.

**Commit** — activated manually before a move. Consumed on the next move resolution; 10-move cooldown begins then. The button shows "ACTIVE!" when primed and "CD: N" during cooldown.

**Dyno** — activated manually. Extends `maxReach` from 2 to 3 for grid rendering and reach validation. Consumed on the next move; 5-move cooldown begins then.

---

## Star Challenges

Each route has five star challenges. Stars accumulate across all attempts (best-of system). Stars from prior attempts are never lost.

| Star | Condition |
|------|-----------|
| **Completion** | Reach the top of the route |
| **Speed Climber** | Complete within the route's time limit |
| **Pump Efficiency** | Finish with pump state = 0 (Fresh) |
| **Grip Efficiency** | Finish with grip state = 0 (Chalked) |
| **Flash Climb** | Complete on the first attempt of this session |

Time limits are defined per route (`route.stars.speed.timeLimit`). If not specified, a default of `holds.length × 5` seconds is used.

---

## World Map & Progression

- **25 locations** arranged on a **5×5 grid** (indexed 0–24, row-major).
- **Starting location**: (row 0, col 0) = Boulder Garden (index 0), always unlocked.
- **Boss location**: (row 4, col 4) = The Sanctuary (index 24). Victory is achieved by completing route "The Ascension" there.
- **Unlock condition**: A locked location unlocks when any **orthogonally adjacent** location has earned **8+ stars**. Diagonal adjacency does not count.
- Each location shows its star progress toward the 8-star threshold for unlocking neighbors.

### Locations (Named)

Locations 0–7 have hand-crafted routes. Locations 8–24 show "Coming Soon" placeholder routes.

| Index | Name | Row | Col |
|-------|------|-----|-----|
| 0 | Boulder Garden | 0 | 0 |
| 1 | Crimp Canyon | 0 | 1 |
| 2 | Overhang Alley | 0 | 2 |
| 3 | Slab Valley | 0 | 3 |
| 4 | Jug Junction | 0 | 4 |
| 5 | Pinch Peak | 1 | 0 |
| 6 | Pocket Paradise | 1 | 1 |
| 7 | Steep Street | 1 | 2 |
| 8–24 | Face City … The Sanctuary | 1–4 | various |

### Location Modifiers

Each location is assigned a random modifier from a pool (e.g., "Polished Holds: +15% grip loss", "Overhang Wall: +15% pump on moves"). These are displayed in the world map tooltip and route selection screen. The modifier pool includes effects on grip multiplier, pump multiplier, grip cost, grip recovery, and hold-type bonuses.

---

## Time of Day

- Three periods: **Morning**, **Noon**, **Evening**.
- Advances after every **3 climbs** (completions or falls both count).
- Day number increments when Evening wraps to Morning.
- Displayed in the route selection screen.

---

## Environmental Conditions

Generated daily. Three independent axes:
- **Temperature**: cool / mild / hot
- **Humidity**: dry / moderate / humid
- **Wind**: calm / moderate / heavy

Displayed in the route selection screen with colored indicators and shorthand effect labels (e.g., "↑Pump", "↓Grip"). Effects are visible to the player before committing to a climb.

---

## Equipment & Loot

- Ten equipment slots: shoes, chalk bag, helmet, harness, gloves, clothing, food, brush, guidebook, watch.
- Gear is acquired as **loot drops** on first-time route completions (`route.hasLoot: true`).
- Collected loot is tracked per `"locationId-routeId"` key and replaced with a "collected" indicator on subsequent visits.

---

## Hold Familiarity

- Successful grabs are recorded per hold (`holdFamiliarity["locationId-routeId-holdIndex"]`).
- Up to 5 grabs tracked, each adding +2% to a familiarity bonus (max 10%).
- Familiarity persists across sessions.
*(Note: the familiarity bonus is tracked in state but its application to move resolution is not currently active in the climbing code.)*

---

## Route Format (Code Reference)

Routes are defined in `js/routes-area0.js` through `js/routes-area7.js` as arrays of route objects, assembled into `routeDatabase` in `js/routes-data.js`.

**Route object fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique route ID (e.g., `'bg1'`, `'cc2'`) |
| `name` | string | Display name |
| `grade` | string | V-grade (V0–V6) |
| `holdCount` | number | Informational; actual length = `holds.length` |
| `description` | string | Flavor / hint text shown at route selection |
| `startCol` | number | Column (0–4) where the player begins |
| `holds` | array | Ordered array of hold objects |
| `stars` | object | Star challenge configuration |

**Hold object fields:**

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `'jug'`, `'edge'`, `'pocket'`, `'undercling'`, `'pinch'`, `'crimp'`, `'sloper'` |
| `label` | string | Uppercase type name displayed on hold |
| `angle` | number | 0–315° in 45° steps (affects weight optimal and penalty lookup) |
| `position.x` | number | Column (0–4) |
| `position.y` | number | Row (1-indexed from bottom of route) |
| `matchable` | boolean | If true and Match is unlocked, triggers hand reset on grab |
| `isRest` | boolean | Displayed with "R" label (no mechanical effect beyond display) |

---

## Current Routes by Area

### Area 0 — Boulder Garden
*Unlocks: Cross (first completion), Reach (8★)*
*Teaches: Hand selection, direction-to-hand matching, basic movement*

| ID | Name | Grade | Holds | Start Col | Notes |
|----|------|-------|-------|-----------|-------|
| bg1 | Hands | V0 | 8 | 2 | All angle 0°. Straight-up movement tutorial. Unlocks Cross. |
| bg2 | Zig Zag | V0 | 6 | 2 | Alternating lateral moves, all angle 0°. |
| bg3 | Little Ladder | V0 | 8 | 2 | Introduces pinch holds (higher grip cost). All angle 0°. |
| bg4 | Snek | V1 | 9 | 2 | Winding path to far columns. Introduces left-column positions. |

---

### Area 1 — Crimp Canyon
*Unlocks: Weight Shift (8★)*
*Teaches: Cross + Reach skills (just unlocked at Area 0). Uses angled holds briefly.*

| ID | Name | Grade | Holds | Start Col | Notes |
|----|------|-------|-------|-----------|-------|
| cc1 | Monkey Arms | V1 | 8 | 2 | Wide first move, then mixed hold types ascending. All angle 0°. |
| cc2 | Reach a Cross | V2 | 8 | 0 | Far-left start, pinch holds, wide lateral spreads. All angle 0°. |
| cc3 | Careful Planning | V2 | 9 | 3 | Right-side start, pocket/pinch/jug mix, reaching far left. All angle 0°. |

---

### Area 2 — Overhang Alley
*Unlocks: Match (8★)*
*Teaches: Weight Shift (just unlocked). Introduces angled holds requiring weight management.*

| ID | Name | Grade | Holds | Start Col | Notes |
|----|------|-------|-------|-----------|-------|
| oa1 | The Weight | V1 | 8 | 2 | Varied angles (45°, 90°, 135°, 270°, 315°) in a straight column. Weight shift focus. |
| oa2 | Show You the Weigh | V2 | 7 | 2 | Lateral movement with angled holds (45°, 270°, 90°). |
| oa3 | Don't Fall A Weigh | V0 | 7 | 3 | Mixed hold types (crimp, sloper, pocket) with various angles. |

---

### Area 3 — Slab Valley
*Unlocks: Deadpoint (8★)*
*Teaches: Weight Shift + Cross + Reach in combination. Introduces gaston-angle holds (225°).*

| ID | Name | Grade | Holds | Start Col | Notes |
|----|------|-------|-------|-----------|-------|
| sv-1 | Weight Control | V2 | 8 | 2 | Angled holds (45°, 315°) requiring pre-shift weight management. Rest on hold 8. |
| sv-2 | Balanced Traverse | V3 | 10 | 2 | Alternating angles including 225° (gaston territory). Rest on hold 10. |
| sv-3 | The Slab Master | V4 | 12 | 2 | Weight traps, gastons, and distance moves. All three skills required. Rest on hold 12. |

---

### Area 4 — Jug Junction
*Unlocks: Commit (8★)*
*Teaches: Match (unlocked at Area 2). Matchable holds at turning points.*

| ID | Name | Grade | Holds | Start Col | Notes |
|----|------|-------|-------|-----------|-------|
| jj-1 | Match Point | V2 | 10 | 2 | Matchable holds 4, 8, 10. All angle 0°. Introduces Match as the key tool. Rest on hold 10. |
| jj-2 | Match and Shift | V3 | 12 | 2 | Matchable holds 4, 7, 12. Mixed angles including 225°. Cross and Weight Shift needed. Rest on hold 12. |
| jj-3 | The Junction Test | V4 | 12 | 2 | Matchable holds 4, 7, 13. Angled holds. Tests Match, Weight Shift, Cross, and Reach together. Rest on hold 13. |

---

### Area 5 — Pinch Peak
*Unlocks: Bump (8★) — not yet implemented in climbing code*
*Teaches: Deadpoint (unlocked at Area 3). Shake+Deadpoint timing is the core puzzle.*

| ID | Name | Grade | Holds | Start Col | Notes |
|----|------|-------|-------|-----------|-------|
| pp-1 | Dead On | V3 | 12 | 2 | Matchable holds 1, 7, 12. Many 225°/315° angles. Shake → Deadpoint required in crux section. Rest on hold 12. |
| pp-2 | Peak Performance | V4 | 12 | 2 | Matchable holds 1, 5, 12. Dense angle variation. Deadpoint + Cross + Weight Shift. Rest on hold 12. |
| pp-3 | The Pinch Gauntlet | V5 | 14 | 2 | Matchable holds 6, 10, 15. Five skills: Deadpoint, Match, Weight Shift, Cross, Reach. Rest on hold 15. |

---

### Area 6 — Pocket Paradise
*Unlocks: (no new skill)*
*Teaches: Commit (unlocked at Area 4). One-shot crux reduction as the central mechanic.*

| ID | Name | Grade | Holds | Start Col | Notes |
|----|------|-------|-------|-----------|-------|
| ppa-1 | Committed | V3 | 12 | 2 | Matchable holds 1, 7, 12. Hard crux at holds 4–6 (315°, 225°, 225°). Commit required. Rest on hold 12. |
| ppa-2 | Pick Your Battle | V4 | 14 | 2 | Matchable holds 1, 6, 15. Multiple crux candidates; 10-move Commit cooldown forces prioritization. Rest on hold 15. |
| ppa-3 | Paradise Lost | V5 | 14 | 2 | Matchable holds 6, 10, 15. Six skills: Commit, Deadpoint, Match, Weight Shift, Cross, Reach. Rest on hold 15. |

---

### Area 7 — Steep Street
*Unlocks: Dyno (8★)*
*Teaches: Bump (unlocked at Area 5 — not yet implemented). Routes designed around lateral repositioning.*

| ID | Name | Grade | Holds | Start Col | Notes |
|----|------|-------|-------|-----------|-------|
| ss-1 | Bump and Go | V3 | 12 | 2 | Matchable holds 1, 6, 12. Angled holds at crux. Designed around Bump repositioning. Rest on hold 12. |
| ss-2 | Street Smarts | V4 | 14 | 2 | Matchable holds 4, 8, 14. Gaston angles (225°, 315°). Bump + weight + gaston control. Rest on hold 14. |
| ss-3 | The Grand Wall | V5 | 16 | 2 | Matchable holds 6, 10, 17. Dense angle variation over 16 holds. All seven skills required. Rest on hold 17. |

---

## Route Design Principles

1. **All angles normalized to 45° increments.** Only 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315° are valid.
2. **`holdCount` is informational only.** Route completion is detected when `currentRow >= route.topRow`, computed from `holds.length`. Do not rely on `holdCount` for game logic.
3. **Rest holds** (`isRest: true`) display with an "R" label. They carry no mechanical effect in the current build.
4. **Matchable holds** (`matchable: true`) should be placed at sequence-breaking turning points, not at the very start or finish of a route.
5. **All routes verified by the route editor's BFS solver** before shipping.
6. **Star challenge economy:**
   - Pump Efficiency and Grip Efficiency are mutually exclusive goals on routes that require heavy Shake/Chalk use (spending a Shake to survive ≠ finishing Fresh).
   - Flash Climb and Speed are compatible on well-designed routes; flash + pump/grip efficiency is the highest-skill challenge combination.

---

## Controls Reference

| Key | Action | Available When |
|-----|--------|----------------|
| A | Select Left hand | Climbing |
| D | Select Right hand | Climbing |
| Q | Shake (pump −1 state) | Climbing |
| E | Chalk (grip reset) | Climbing |
| Z | Weight → Left | Climbing + Weight Shift unlocked |
| X | Weight → Center | Climbing + Weight Shift unlocked |
| C | Weight → Right | Climbing + Weight Shift unlocked |
| 1 | Toggle Reach skill | Climbing + Reach unlocked |
| 2 | Deactivate Cross & Reach | Climbing + Cross or Reach unlocked |
| 3 | Toggle Cross skill | Climbing + Cross unlocked |
| R | Activate Commit | Climbing + Commit unlocked |
| T | Activate Dyno | Climbing + Dyno unlocked |
| Tab | Toggle help modal | Any screen |
| Esc | Return to World Map / Route Select | Climbing / Route Select |

---

## Skill Unlock Sequence Summary

| Area | Location | Skill Unlocked | Trigger | Route Focus |
|------|----------|---------------|---------|-------------|
| 0 | Boulder Garden | **Cross** | First completion | Basic hand/direction |
| 0 | Boulder Garden | **Reach** | 8★ | Basic movement |
| 1 | Crimp Canyon | **Weight Shift** | 8★ | Cross + Reach |
| 2 | Overhang Alley | **Match** | 8★ | Weight management |
| 3 | Slab Valley | **Deadpoint** | 8★ | Weight + Cross + Reach |
| 4 | Jug Junction | **Commit** | 8★ | Match |
| 5 | Pinch Peak | **Bump** *(pending)* | 8★ | Deadpoint |
| 6 | Pocket Paradise | *(none)* | — | Commit |
| 7 | Steep Street | **Dyno** | 8★ | Bump *(pending)* |

---

## Penalty Table Design Notes

The penalty table encodes climbing biomechanics as discrete penalty levels. Key structural patterns:

- **Straight up (UP):** Low base penalties. Center weight is ideal for 0° and 180° holds; left weight for 45°; right weight for 315°.
- **Diagonal left (UP-LEFT):** Left hand is the natural choice (lower penalties). Right hand going up-left is cross-body (higher base penalties).
- **Diagonal right (UP-RIGHT):** Right hand is the natural choice. Left hand going up-right is cross-body.
- **Gaston angles (L@135°, R@225°):** Already encoded with elevated base penalties in the table. The Cross skill does **not** reduce gaston penalties — Cross only reduces penalties on direction-based cross-body moves (as determined by `isCrossMove()`).

---

## Implementation Status

| Feature | Status |
|---------|--------|
| Penalty table & move resolution | ✅ Complete |
| Pump system | ✅ Complete |
| Grip system | ✅ Complete |
| Shake / Chalk recovery | ✅ Complete |
| Cross skill | ✅ Complete |
| Reach skill | ✅ Complete |
| Weight Shift (UI gate) | ✅ Complete |
| Match skill | ✅ Complete |
| Deadpoint skill | ✅ Complete |
| Commit skill | ✅ Complete |
| Dyno skill | ✅ Complete |
| Bump skill | ⚠️ Defined in skill DB, not implemented in climbing code |
| World map (5×5) | ✅ Complete |
| Star challenges (5 per route) | ✅ Complete |
| Skill unlock triggers | ✅ Complete |
| Routes: Areas 0–7 | ✅ Complete |
| Routes: Areas 8–24 | ⏳ Placeholder ("Coming Soon") |
| Equipment / loot | ✅ Implemented |
| Time of day / conditions | ✅ Displayed; effects defined in `locationModifiers` and conditions system |
| Hold familiarity | ⚠️ Tracked in state, not applied to move resolution |
| Location modifiers in gameplay | ⚠️ Displayed in UI, application to climbing not confirmed in core move resolver |
