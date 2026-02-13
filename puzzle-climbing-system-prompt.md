# Puzzle Climbing System Rework — Implementation Prompt

## Context

You are working on the `puzzle` branch of https://github.com/hausrath/climbing-grid-game — an HTML5/CSS/JS climbing game prototype. The game currently uses a roguelike "bump" mechanic where grabbing holds involves a random success roll (chance-to-grab). We are replacing this entire climbing system with a **deterministic puzzle system** where every grab succeeds, but the player's decisions about hand selection, body weight, and technique create pump and grip costs that determine whether they can finish the route.

The game is modular with these files:
- `index.html` — layout and structure (39 KB)
- `css/main.css` — styling (26 KB), `css/ui.css` — UI styles (4 KB)
- `js/climbing.js` — **core climbing mechanics, the main file to rewrite** (41 KB)
- `js/route.js` — route generation, hold creation, move difficulty (20 KB)
- `js/constants.js` — hold types, gear definitions, game constants (26 KB)
- `js/state.js` — game state object, location data, helper functions (18 KB)
- `js/main.js` — game init, world map, route selection, UI rendering (19 KB)
- `js/camp.js` — camp system, beta overlay, time/conditions (35 KB)
- `js/skills.js` — skill effect calculations (26 KB)
- `js/skills-data.js` — skill definitions database (18 KB)
- `js/equipment.js` — equipment system (22 KB)
- `js/ui.js` — UI updates, input handling, bump animation (36 KB)

## What to REMOVE

### The "chance to grab" / bump system
The entire success-roll mechanic must be removed. This includes:

1. **In `climbing.js` — `moveToHold()` function**: Remove all of:
   - `successChance` calculation (base from `hold.difficulty`)
   - `Math.random()` roll and `success = roll <= successChance` check
   - All `successChance` modifiers (fatigue penalty, movement bonus, sidepull penalty, familiarity bonus, skill bonuses, commit doubling)
   - The success/failure branching (`if (success) {...} else {...}`)
   - Grit proc check (chance to ignore failure)
   - Battle Cry fail immunity
   - Commit instant-fall on failure
   - Bump animation trigger on failure (`triggerBumpAnimation`)
   - Flow state based on consecutive successes / combo counter
   - `gameState.totalGrabs` and `gameState.successfulGrabs` tracking

2. **In `route.js`**: Remove:
   - `generateHoldDifficulty()` — the GDD formula (angle × depth × texture × width × matchDifficulty)
   - `generateHold()` — creates holds with `difficulty` (success threshold), `difficultyDisplay`, random property ranges
   - `calculateMoveDifficulty()` — distance-based difficulty scaling
   - `pregenerateRoute()` — procedural route generation with weighted random hold selection, crux placement, dual hold generation
   - `selectHoldTypeWithLimits()` — weighted random hold type selection by location tier
   - `generateNextHold()` — feeds procedural holds into the scrolling grid
   - `generateCruxConfig()` — crux section placement

3. **In `constants.js` — `holdTypes` array**: Remove the GDD property ranges (`depthMin/Max`, `angleMin/Max`, `textureMin/Max`, `widthMin/Max`, `matchDiffMin/Max`). These served the old probability system.

4. **In `state.js`**: Remove or repurpose:
   - `fatiguePenalty` — was for chalking/shaking on bad holds reducing success chance
   - `totalGrabs`, `successfulGrabs` — success rate tracking (no longer relevant)
   - `holdsGenerated`, `totalHoldsInRoute` — procedural generation counters

5. **In `ui.js`**: Remove:
   - `triggerBumpAnimation()` — the failed-grab bump animation
   - All "X% chance" display text in hold tooltips / feedback

6. **In `css/main.css`**: Remove:
   - `@keyframes bump-fail` and `.player.bumping` styles

7. **In `skills.js` and `skills-data.js`**: Many skills reference `+X% success`, `chance to ignore failed grab`, `chance to negate grip cost`. These need to be **reworked, not just deleted** — see the "Skills Rework" section below.

## What to KEEP (unchanged or with minor adjustments)

- **World map system** (`main.js`): Location grid, discovery via stars, navigation — all stays
- **Camp system** (`camp.js`): Camp screens, resting, energy, time of day, conditions — all stays
- **Equipment system** (`equipment.js`, `constants.js` gear data): Keep the full gear system. Some modifier effects will need reinterpretation (see below), but the inventory/equip/loot mechanics stay
- **Skill tree structure** (`skills.js`, `skills-data.js`): The triangle layout, point allocation, skill point economy stays. Individual skill *effects* change
- **XP and leveling**: Stays as-is
- **Star challenges**: Keep the concept but some challenges need updating (no more "success rate" star)
- **Route progress tracking**: `routeProgress`, `completedRoutes`, `holdFamiliarity` — all stay
- **Energy system**: Stays
- **Time of day / conditions**: Stay, but effects change from success% modifiers to pump/grip modifiers
- **Visual theme and CSS**: Keep all the hold colors, grid styling, UI layout. Just remove bump animation

---

## The New Puzzle Climbing System

### Core Philosophy
**Every grab succeeds. The puzzle is in the consequences.** The player sees holds on the wall, chooses which hand to use, and every grab lands — but bad sequencing, wrong weight distribution, or mismatched technique creates massive pump penalties that end the climb. Good route-reading and planning let you flow through efficiently.

### Hold Data Model (replaces old hold generation)

Each hold is now a hand-crafted data object:

```javascript
{
    type: 'crimp',           // jug, crimp, sloper, pinch, pocket, edge, undercling
    label: 'CRIMP',          // display label
    angle: 0,                // 0-359 degrees. 0 = flat/perpendicular to ground (incut).
                             //   90 = facing right (sidepull if right hand, gaston if left).
                             //  -90/270 = facing left. 180 = facing down (sloper territory).
    pumpRating: 4,           // 1-10, the hold's inherent pump cost (forearm fatigue)
    gripDrain: 3,            // 1-10, how much the hold taxes skin friction
    position: { x: 2, y: 3 }, // grid position (x = column 0-4, y = row from bottom)
    preferredHand: null,     // derived at runtime from angle, not stored
    isRest: false,           // can the player recover pump here?
    matchable: true,         // can both hands be placed here?
}
```

**Key change: `angle` replaces `difficulty`.** The angle is a physical property of the hold. The challenge emerges from the *relationship* between the hold's angle, the player's chosen hand, and their current weight.

**Hold types remain intrinsic** — a crimp is a crimp because of its shallow depth and sharp edge, not because of the approach angle. The `type` determines base `pumpRating`. The `angle` determines weight requirements and whether a lateral hold becomes a sidepull or gaston.

### Pump vs. Grip — Two Distinct Resources

**Pump** = forearm fatigue from sustained effort. Your forearms swell and you lose the ability to close your fingers. Pump accumulates from *pulling and holding on*. **Pump is driven by body position errors** — wrong weight, crosses, gastons, big reaches, and physically demanding hold types (crimps require sustained contraction, underclings are exhausting). When pump hits maxPump, you fall.

**Grip** = skin friction and contact quality. Your fingers slip because your skin is sweaty, greasy, or worn down. Grip degrades based on the *surface interaction* between skin and rock. **Grip is driven by hold surface properties** — slopers are the grip killer (open-hand, high-friction contact), pinches demand sustained squeeze, rough holds wear skin. Humidity and weather conditions affect grip. When grip hits 0, you fall.

The key differentiation:
- **Pump penalties** come from the puzzle mechanics: hand choice, weight, crossing, gaston, reach distance. These are the player's *decisions*.
- **Grip drain** comes from hold type and is relatively predictable. It's a background resource the player manages through **chalk** (restores grip) and route planning (don't chain too many slopers).
- **Shake** reduces pump (blood flows back into forearms).
- **Chalk** restores grip (dries hands, improves friction).
- **Rest holds** recover both pump and grip.

This creates two planning layers: the tactical puzzle (minimize pump through smart sequencing) and the resource management layer (manage grip through chalk timing and hold-type awareness).

### Grid System Changes

The grid remains 5 columns wide. However, instead of a scrolling conveyor belt that generates holds procedurally, the **entire route is defined upfront** and the view window scrolls up through it. The grid shows a viewport of the full route (e.g., rows visible: current position ± 2).

Each route is an array of holds placed at specific (x, y) positions. The player starts at the bottom and climbs upward. Holds can be at any of the 3 positions relative to the player: **up-left, directly up, or up-right** (the "reachable" positions from the current location).

### Player State

```javascript
{
    position: { x: 2, y: 0 },    // current grid position
    currentHand: null,             // 'left' or 'right' — which hand is on the current hold
    weight: 'center',              // 'left', 'center', 'right'
    pump: 0,                       // 0 to maxPump (starts at 0, accumulates — forearm fatigue)
    maxPump: 20,                   // pump capacity — you fall when this is reached
    grip: 20,                      // starts at maxGrip, drains toward 0 (skin friction)
    maxGrip: 20,                   // grip capacity — you fall when this hits 0
    consecutiveCrosses: 0,         // tracks sequential cross-body moves
    // technique cooldowns
    staticCooldown: 0,
    dynamicCooldown: 0,
}
```

**Pump and Grip are both tracked.** Pump starts at 0 and accumulates (bad = high). Grip starts at max and drains (bad = low). The player falls if pump >= maxPump OR grip <= 0. This dual-resource system creates two planning layers: tactical sequencing (pump) and resource management (grip).

### Move Resolution — The MoveResolver

When the player selects a target hold and a hand, the system computes the move using a **penalty lookup table** that encodes every valid combination of movement direction, hand, hold angle, and weight. This table is the authoritative source for penalty values — the code should implement it as a data-driven lookup, not a chain of if/else rules.

#### The Penalty Lookup Table

The table covers 144 combinations across 3 movement directions (up, up-left, up-right), 2 hands, 8 hold angles (0° through 315° in 45° increments), and 3 weight positions.

**Penalty levels:** 0 = no penalty, 1 = slight, 2 = moderate, 3 = severe, 4 = instant fall

A corrected and symmetry-verified spreadsheet (`Effect_Table_Corrected.xlsx`) accompanies this prompt and should be treated as the definitive reference. Here is the full table encoded as a JavaScript data structure:

```javascript
// Penalty lookup: [direction, hand(R/L), holdAngle, weight(L/C/R)] → penalty level (0-4)
// Direction: "up" = directly above, "up-left" = up and left 1, "up-right" = up and right 1
const PENALTY_TABLE = [
  // === UP (directly above) ===
  // 0° holds (flat/incut) — ideal weight: Center
  ["up","R",0,"C",0], ["up","L",0,"C",0],
  ["up","R",0,"L",1], ["up","L",0,"L",1],
  ["up","R",0,"R",1], ["up","L",0,"R",1],
  // 45° holds (slight right) — ideal weight: Left
  ["up","R",45,"C",1], ["up","L",45,"C",1],
  ["up","R",45,"L",0], ["up","L",45,"L",0],
  ["up","R",45,"R",2], ["up","L",45,"R",2],
  // 90° holds (right-facing, sidepull/gaston) — ideal weight: Left
  ["up","R",90,"C",2], ["up","L",90,"C",2],
  ["up","R",90,"L",1], ["up","L",90,"L",1],
  ["up","R",90,"R",3], ["up","L",90,"R",3],
  // 135° holds (lower-right, undercling) — ideal weight: Left
  ["up","R",135,"C",2], ["up","L",135,"C",2],
  ["up","R",135,"L",1], ["up","L",135,"L",1],
  ["up","R",135,"R",3], ["up","L",135,"R",3],
  // 180° holds (downward/undercling) — ideal weight: Center
  ["up","R",180,"C",0], ["up","L",180,"C",0],
  ["up","R",180,"L",1], ["up","L",180,"L",1],
  ["up","R",180,"R",1], ["up","L",180,"R",1],
  // 225° holds (lower-left, undercling) — ideal weight: Right
  ["up","R",225,"C",2], ["up","L",225,"C",2],
  ["up","R",225,"L",3], ["up","L",225,"L",3],
  ["up","R",225,"R",1], ["up","L",225,"R",1],
  // 270° holds (left-facing, gaston/sidepull) — ideal weight: Right
  ["up","R",270,"C",2], ["up","L",270,"C",2],
  ["up","R",270,"L",3], ["up","L",270,"L",3],
  ["up","R",270,"R",1], ["up","L",270,"R",1],
  // 315° holds (slight left) — ideal weight: Right
  ["up","R",315,"C",1], ["up","L",315,"C",1],
  ["up","R",315,"L",2], ["up","L",315,"L",2],
  ["up","R",315,"R",0], ["up","L",315,"R",0],

  // === UP-LEFT (up 1, left 1) ===
  // Right hand reaching left = CROSS. Left hand reaching left = natural.
  ["up-left","R",0,"C",2], ["up-left","L",0,"C",1],
  ["up-left","R",0,"L",1], ["up-left","L",0,"L",0],
  ["up-left","R",0,"R",3], ["up-left","L",0,"R",2],
  ["up-left","R",45,"C",3], ["up-left","L",45,"C",1],
  ["up-left","R",45,"L",2], ["up-left","L",45,"L",0],
  ["up-left","R",45,"R",4], ["up-left","L",45,"R",3],
  ["up-left","R",90,"C",3], ["up-left","L",90,"C",2],
  ["up-left","R",90,"L",3], ["up-left","L",90,"L",1],
  ["up-left","R",90,"R",4], ["up-left","L",90,"R",4],
  ["up-left","R",135,"C",3], ["up-left","L",135,"C",2],
  ["up-left","R",135,"L",3], ["up-left","L",135,"L",1],
  ["up-left","R",135,"R",4], ["up-left","L",135,"R",4],
  ["up-left","R",180,"C",3], ["up-left","L",180,"C",1],
  ["up-left","R",180,"L",4], ["up-left","L",180,"L",3],
  ["up-left","R",180,"R",3], ["up-left","L",180,"R",2],
  ["up-left","R",225,"C",4], ["up-left","L",225,"C",1],
  ["up-left","R",225,"L",3], ["up-left","L",225,"L",3],
  ["up-left","R",225,"R",2], ["up-left","L",225,"R",1],
  ["up-left","R",270,"C",2], ["up-left","L",270,"C",1],
  ["up-left","R",270,"L",3], ["up-left","L",270,"L",2],
  ["up-left","R",270,"R",1], ["up-left","L",270,"R",0],
  ["up-left","R",315,"C",2], ["up-left","L",315,"C",1],
  ["up-left","R",315,"L",3], ["up-left","L",315,"L",2],
  ["up-left","R",315,"R",1], ["up-left","L",315,"R",0],

  // === UP-RIGHT (up 1, right 1) ===
  // Left hand reaching right = CROSS. Right hand reaching right = natural.
  // This section is the exact mirror of UP-LEFT.
  ["up-right","R",0,"C",1], ["up-right","L",0,"C",2],
  ["up-right","R",0,"L",2], ["up-right","L",0,"L",3],
  ["up-right","R",0,"R",0], ["up-right","L",0,"R",1],
  ["up-right","R",45,"C",1], ["up-right","L",45,"C",2],
  ["up-right","R",45,"L",0], ["up-right","L",45,"L",1],
  ["up-right","R",45,"R",2], ["up-right","L",45,"R",3],
  ["up-right","R",90,"C",1], ["up-right","L",90,"C",2],
  ["up-right","R",90,"L",0], ["up-right","L",90,"L",1],
  ["up-right","R",90,"R",2], ["up-right","L",90,"R",3],
  ["up-right","R",135,"C",1], ["up-right","L",135,"C",4],
  ["up-right","R",135,"L",1], ["up-right","L",135,"L",2],
  ["up-right","R",135,"R",3], ["up-right","L",135,"R",3],
  ["up-right","R",180,"C",1], ["up-right","L",180,"C",3],
  ["up-right","R",180,"L",2], ["up-right","L",180,"L",3],
  ["up-right","R",180,"R",3], ["up-right","L",180,"R",4],
  ["up-right","R",225,"C",2], ["up-right","L",225,"C",3],
  ["up-right","R",225,"L",4], ["up-right","L",225,"L",4],
  ["up-right","R",225,"R",1], ["up-right","L",225,"R",3],
  ["up-right","R",270,"C",2], ["up-right","L",270,"C",3],
  ["up-right","R",270,"L",4], ["up-right","L",270,"L",4],
  ["up-right","R",270,"R",1], ["up-right","L",270,"R",3],
  ["up-right","R",315,"C",1], ["up-right","L",315,"C",3],
  ["up-right","R",315,"L",3], ["up-right","L",315,"L",4],
  ["up-right","R",315,"R",0], ["up-right","L",315,"R",2],
];
```

#### Key design principles encoded in this table

1. **Gaston and sidepull are NOT inherently penalized.** A 90° hold grabbed with either hand has the same penalty for a given weight — the penalty comes from weight misalignment, not from the gaston/sidepull label. The subtype labels (sidepull, gaston, undercling, cross) are descriptive for player feedback, not penalty sources.

2. **Weight is the primary penalty driver for straight-up moves.** For "up" direction, right-hand and left-hand entries at the same angle and weight are identical. The only thing that matters is whether your weight matches the hold's ideal position.

3. **Crossing adds penalty on lateral moves.** In "up-left", right hand = cross (reaching across body). In "up-right", left hand = cross. The cross adds roughly 1 penalty level to the base weight penalty, but compounds further when combined with unfavorable hold angles.

4. **Instant fall (penalty 4)** represents physically impossible positions — e.g., crossing your right hand far left on a right-facing hold with weight on the wrong side. These are moves to avoid entirely.

5. **The table is fully symmetric:** Up-left mirrors up-right when you swap hand (R↔L), weight (L↔R), and hold angle (45↔315, 90↔270, 135↔225, 0↔0, 180↔180).

#### How to use the table in the MoveResolver

```javascript
function lookupPenalty(direction, hand, holdAngle, weight) {
    // direction: 'up', 'up-left', 'up-right'
    // hand: 'R' or 'L'
    // holdAngle: 0, 45, 90, 135, 180, 225, 270, 315
    // weight: 'L', 'C', 'R'
    const entry = PENALTY_TABLE.find(e =>
        e[0] === direction && e[1] === hand && e[2] === holdAngle && e[3] === weight
    );
    return entry ? entry[4] : 0;
}
```

For performance, convert to a Map keyed by `"${direction}-${hand}-${angle}-${weight}"` at init time.

#### Penalty level → pump cost mapping

The penalty levels need to be converted to actual pump cost multipliers. Suggested mapping:

```javascript
const PENALTY_PUMP_MULTIPLIERS = {
    0: 0,    // No penalty: just the base pumpRating
    1: 1,    // Slight: +1 pump added to base
    2: 3,    // Moderate: +3 pump added to base  
    3: 6,    // Severe: +6 pump added to base
    4: -1,   // Instant fall: climb ends immediately
};
```

So total pump cost = hold.pumpRating + PENALTY_PUMP_MULTIPLIERS[penaltyLevel]. Tune these numbers during playtesting.

#### Extended distance moves

Moves that cover more distance (2 grid spaces horizontally or vertically) use the same table as their short-distance counterparts, with an additional distance penalty:

- **Up 2 Left 1, Up 2 Right 1, Up 1 Left 2, Up 1 Right 2**: Same penalty as "up-left" or "up-right" respectively, PLUS a +2 pump distance surcharge (unless mitigated by dynamic technique).
- **Up 2**: Same penalty as "up", PLUS a +2 pump distance surcharge.
- **3+ grid spaces**: Only reachable with dyno skill.

Dynamic technique negates the distance surcharge but does NOT affect the base table penalty.

#### Additional MoveResolver steps (applied after table lookup)

After looking up the penalty from the table:

**Grip drain:** Apply the hold's `gripDrain` value to `gameState.grip`. Grip drain is driven by hold surface type, not by movement decisions. Apply weather modifiers (humidity +50% drain, dry -20% drain). Grip drain is independent of the penalty table.

**Hold transition cost:** Crimp → Sloper or Sloper → Crimp transition: +2 pump. All other transitions: no cost.

**Technique modifiers:**
- **Static technique** (if active): Reduces the penalty level by 1 (e.g., moderate → slight, severe → moderate). Only consumed and put on cooldown if the penalty level was > 0. Does not affect instant fall.
- **Dynamic technique** (if active): Negates the distance surcharge on extended moves (2+ spaces). Only consumed and put on cooldown on extended moves.

**Consecutive crosses:** Track consecutive cross-body moves. On the second consecutive cross, add +2 additional pump on top of whatever the table says. Third consecutive: +4 additional. This stacks and resets on any non-cross move.

**Weight shift:** After each move, the player's weight shifts one step toward the hold's ideal weight position. Weight cannot jump 2 steps in one move.

**Final application:**
- Add total pump cost to `gameState.pump`
- Subtract grip drain from `gameState.grip`
- If pump >= maxPump OR grip <= 0: player falls
- If penalty was instant fall (4): player falls immediately regardless of pump/grip
- Otherwise: the grab succeeds, player moves to the new hold

#### Grip Drain Reference (by hold type)
Grip drain is driven by hold surface properties, independent of movement decisions:
- Jug: 1 (large positive surface — barely taxes skin)
- Crimp: 2 (small edge, positive contact)
- Edge: 2 (similar to crimp)
- Pinch: 3 (sustained squeeze wears skin)
- Pocket: 2 (concentrated contact on fewer fingers)
- Undercling: 2 (friction-dependent but less than sloper)
- Sloper: 5 (maximum friction required — the grip killer)

Apply weather modifiers: humidity +50% drain, dry -20% drain.

#### Rest Holds
- When landing on a hold marked `isRest: true`, the player can choose to rest
- Resting recovers both resources: reduces pump by 5 AND restores grip by 5
- Resting costs a "turn" — the player doesn't move, just recovers
- Can only rest if arriving in a non-crossed state (consecutiveCrosses = 0)

### Route Data Format

Routes are now hand-crafted arrays. Here's the format:

```javascript
const routes = {
    'boulder-garden': [
        {
            id: 'bg-route-1',
            name: 'The Warm-Up',
            grade: 'V0',
            holdCount: 6,  // for display/tracking
            description: 'A gentle intro. Jugs all the way up.',
            holds: [
                // y=0 is the starting position (player starts here, no hold needed)
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 3 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 4 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 5 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 6 }, matchable: true, isRest: true },
            ],
            // Star challenges can stay, but remove "success rate" star
            stars: {
                completion: true,       // always available
                speed: { timeLimit: 30 }, // seconds
                pumpEfficiency: { maxPump: 8 }, // complete with pump <= 8
                noCross: true,          // complete without any cross-body moves
                flashClimb: true,       // complete on first attempt
                perfectWeight: true,    // never have weight 2 steps off
            }
        },
        {
            id: 'bg-route-2',
            name: 'Left-Right-Left',
            grade: 'V1',
            holdCount: 8,
            description: 'Teaches hand sequencing. Watch your crosses!',
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 2 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 2, gripDrain: 1, position: { x: 3, y: 3 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 5 }, matchable: true, isRest: true },
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 7 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 40 },
                pumpEfficiency: { maxPump: 12 },
                noCross: true,
                flashClimb: true,
                perfectWeight: true,
            }
        },
        {
            id: 'bg-route-3',
            name: 'The Sidepull Shuffle',
            grade: 'V2',
            holdCount: 8,
            description: 'Right-facing holds demand proper weighting. Plan your hands.',
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 90, pumpRating: 2, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                // This 90° hold at x:3 wants right hand (sidepull) with left weight.
                // If player used left hand, it's a gaston — big penalty.
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 3 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 270, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 4 }, matchable: false, isRest: false },
                // This 270° (left-facing) hold at x:1 wants left hand (sidepull) with right weight.
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 5 }, matchable: true, isRest: true },
                { type: 'crimp', label: 'CRIMP', angle: -45, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                // -45° (315°) = slightly left-facing. Prefers left hand. Weight slightly right.
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 2, gripDrain: 1, position: { x: 2, y: 7 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 50 },
                pumpEfficiency: { maxPump: 14 },
                noCross: true,
                flashClimb: true,
                perfectWeight: true,
            }
        },
        {
            id: 'bg-route-4',
            name: 'The Gaston Trap',
            grade: 'V3',
            holdCount: 10,
            description: 'Looks simple, but the angles will punish sloppy hands.',
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'pinch', label: 'PINCH', angle: 45, pumpRating: 3, gripDrain: 3, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                // 45° = slightly right-facing. Right hand = sidepull (good), left = gaston (bad)
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 4, gripDrain: 2, position: { x: 2, y: 3 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 4 }, matchable: false, isRest: false },
                // 315° = slightly left-facing. Left hand = sidepull, right = gaston.
                // Coming from x:2 to x:1 with right hand = cross. So you WANT left hand here.
                // But if you used right on hold 3, reaching left with left = natural. Good.
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 5 }, matchable: true, isRest: true },
                { type: 'sloper', label: 'SLOPER', angle: 150, pumpRating: 3, gripDrain: 5, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                // 150° = mostly facing right with some downward angle. Sloper makes this a grip drain bomb.
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 7 }, matchable: false, isRest: false },
                { type: 'pinch', label: 'PINCH', angle: 270, pumpRating: 3, gripDrain: 3, position: { x: 1, y: 8 }, matchable: false, isRest: false },
                // Big traverse from x:3 to x:1 = 2 spaces. Needs dynamic or takes reach penalty.
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 2, gripDrain: 1, position: { x: 2, y: 9 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 10 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 60 },
                pumpEfficiency: { maxPump: 16 },
                noCross: true,
                flashClimb: true,
                perfectWeight: true,
            }
        },
    ]
};
```

### Creating a routes-data.js file

Create a new file `js/routes-data.js` that contains the hand-crafted routes organized by location. For now, **only the first location ("Boulder Garden") should have routes.** All other 24 locations should exist on the map but show as having 0 routes available, with a message like "No routes set yet" when selected.

Include the 4 example routes above, plus design 2-3 more that progressively teach:
- Route 5: First introduction of underclings (holds at ~180°) — these want upward pressure and work differently from other angles
- Route 6: Combined sidepull + undercling sequences with a key rest in the middle
- Route 7 (the "boss" route): Everything combined — requires reading the whole route and planning hand sequence from the start

### Changes to `constants.js` — Hold Types

Simplify the `holdTypes` array. Remove all GDD formula properties. Keep it as a reference for display and base pump rating:

```javascript
const holdTypes = [
    { type: 'jug',       label: 'JUG',    basePumpRating: 1, baseGripDrain: 1, color: '#a8db60' },
    { type: 'crimp',     label: 'CRIMP',   basePumpRating: 4, baseGripDrain: 2, color: '#f5aaa2' },
    { type: 'sloper',    label: 'SLOPER',  basePumpRating: 3, baseGripDrain: 5, color: '#6dbce3' },
    { type: 'pinch',     label: 'PINCH',   basePumpRating: 3, baseGripDrain: 3, color: '#fad882' },
    { type: 'pocket',    label: 'POCKET',  basePumpRating: 3, baseGripDrain: 2, color: '#c178de' },
    { type: 'edge',      label: 'EDGE',    basePumpRating: 3, baseGripDrain: 2, color: '#738078' },
    { type: 'undercling', label: 'UNDER',  basePumpRating: 4, baseGripDrain: 2, color: '#b06758' },
];
```

Note the design intent: **crimps are pump-heavy** (sustained forearm contraction) while **slopers are grip-heavy** (maximum skin friction). This creates distinct planning challenges — a route with lots of crimps is a pump management puzzle (use shake, watch your body position), while a sloper-heavy route is a grip management puzzle (use chalk, don't chain too many slopers).

Note: `sidepull` and `gaston` are **no longer hold types** — they are derived grip types that emerge from the relationship of hand + angle. A jug at 90° is a jug used as a sidepull. A crimp at 90° is a crimp used as a sidepull. The visual can show the angle with an arrow or rotation indicator.

### Changes to `state.js`

Update `gameState` to include the new state properties:

```javascript
// ADD these new properties
weight: 'center',           // 'left', 'center', 'right'
currentHand: null,          // 'left' or 'right' — which hand is currently on the hold
consecutiveCrosses: 0,      // count of sequential cross-body moves
maxPump: 20,                // pump capacity — fall when reached

// KEEP (but repurpose)
// grip, maxGrip — KEEP. Grip is now driven by hold surface friction, not positional decisions.

// REMOVE these (no longer needed)
// fatiguePenalty — no success chance to penalize
// totalGrabs, successfulGrabs — no success tracking
// holdsGenerated, totalHoldsInRoute — no procedural generation
// comboCount, flowStateActive — reworked (see skills section)
```

### Changes to `climbing.js` — The Core Rewrite

Replace `moveToHold()` with a new function that implements the MoveResolver steps above. The function signature stays similar but the internals are completely different:

```javascript
function moveToHold(row, col) {
    // 1. Validate move (hold exists, hand selected, hold is reachable)
    // 2. Get hold data from the route
    // 3. Run MoveResolver (all the steps above)
    // 4. Apply pump cost
    // 5. Move player to new position
    // 6. Update hand state
    // 7. Shift weight one step toward ideal
    // 8. Display feedback (pump costs, penalties incurred)
    // 9. Check if pump >= maxPump (fall) or reached top (complete)
}
```

**Chalk and Shake** — these stay but serve distinct purposes in the dual-resource system:
- **Chalk**: Restores grip (e.g., +5 grip). Dries your hands, improves skin friction. Has cooldown. Can only be used while on a hold. Does NOT affect pump.
- **Shake**: Reduces pump (e.g., -5 pump). Shaking out lets blood flow back into forearms. Has longer cooldown. Can only be used while on a hold. Does NOT affect grip.
- This clean separation reinforces the two-resource system: chalk for grip management, shake for pump management. Rest holds recover both.

### Changes to `ui.js`

- Remove `triggerBumpAnimation()` and all bump animation code
- **Hold visuals: Use half-circles (semicircles) instead of full circles.** This is critical — a full circle rotated looks the same at any angle. A half-circle clearly communicates the hold's angle because the flat edge and curved edge create an obvious directional indicator. The flat/cut side represents the grabbing surface. At 0° (incut), the flat side faces up. At 90° (right-facing sidepull), the flat side faces right. At 270° (left-facing), flat side faces left. At 180° (sloper/downward), flat side faces down. Use CSS `border-radius` on only 2 corners to create the semicircle, then rotate with `transform: rotate(Xdeg)` based on the hold's `angle` property. Keep the existing hold-type color coding (jug = green, crimp = red, etc.).
- Update the HUD to show:
  - **Both Pump bar and Grip bar** — pump fills up (bad), grip drains down (bad)
  - Current hand indicator (left / right, highlighted)
  - Current weight indicator (left / center / right, with visual showing body position)
  - Technique cooldown indicators (static / dynamic) — show whether they're available and what they'd negate on the current move
- Hold tooltips should show: type, pump rating, grip drain, angle, and ideal hand/weight
- The "next row" highlight should show all reachable holds from current position

### Changes to `main.js`

- `startClimb()` needs to load the route's hold array instead of calling `pregenerateRoute()`
- The grid rendering needs to show a viewport of the full route rather than a scrolling conveyor
- Route selection overlay should show the hand-crafted routes for the current location
- For locations without routes, show "No routes available yet"

### Changes to `camp.js`

- Beta overlay (`showBetaOverlay`) should show the full route's hold sequence with angles and types
- This becomes even more useful as a "route reading" tool — the player studies the route before climbing
- Remove references to `hold.difficulty` and success percentages in the beta display

### Grid Rendering Changes

The grid currently scrolls by shifting rows down and generating new holds at the top. In the new system:

- The full route is loaded at climb start
- The grid viewport shows the player's current position and surrounding holds
- When the player moves up, the viewport scrolls to keep them centered
- Holds below the player that have been passed are still visible but dimmed
- Holds above the player are fully visible (route reading is built in for now — the seer skill can add fog later)

The simplest approach: keep the 5-column grid, but make it taller (show more rows). Player always starts at the bottom. The grid is a direct rendering of the route's hold positions.

---

## Skills Rework (High Priority Adaptations)

Many skills reference `+X% success` which no longer exists. Here's how to adapt the most important ones. **For this pass, just update the skill effect descriptions and the `calculateSkill*` functions. Don't add complex new implementations yet — get the core MoveResolver working first, then layer skills on top.**

### Athletics Skills
- **Dyno**: Still lets you reach holds 2-3 spaces away without the reach penalty. Keep as-is conceptually.
- **Flow State**: Instead of consecutive *successes*, trigger after consecutive moves with 0 penalty (perfectly planned moves). Reduces pump costs when active.
- **Iron Grip**: Reduce grip drain from high-friction holds (slopers, pinches) by X%. This is now a grip-specific skill, which makes thematic sense — strong fingers resist skin wear.
- **Grit**: Instead of "chance to ignore failure", make it: "when pump > 80% of max, reduce pump costs by X%" (clutch performer)
- **Deadpoint**: After chalk, next move costs 0 pump. Stays similar.
- **Ambidextrous**: Reduce or negate cross-body penalties. Perfect fit for the new system.
- **Battle Cry**: Temporary pump cost reduction for X moves.

### Utility Skills
- **Efficient Recovery**: Improve chalk (more grip restored) and shake (more pump reduced) effectiveness. Stays similar.
- **Grappling Hook**: Auto-reach any hold within X spaces, no reach penalty.
- **Piton**: Create a temporary rest point. Stays similar.
- **Climbing Salve**: Reduce pump AND restore grip directly.
- **Stimulant**: Reduce all pump costs by X% for Y moves.
- **Notebook**: On retry, reveal the "optimal" hand sequence for first N holds (like a hint system).

### Magic Skills
- **Transmogrify Hold**: Change a hold's type (lower its pumpRating and/or gripDrain).
- **Seer**: Reveal hold angles and ideal hand/weight for upcoming holds (route reading enhancement).
- **Dilate Time**: Reduce pump accumulation rate for X moves.
- **Sunmark**: Mark holds to reduce their pump cost and grip drain.
- **Transmute**: Swap pump and grip values (if you're high pump but have lots of grip, this can save you).

### Equipment Adaptations
Gear modifiers that reference `holdBonus` (success chance per hold type) should be reinterpreted as pump cost reductions for those hold types. `gripLossReduction` now directly reduces grip drain, which makes more sense than before. For example:
- `holdBonus: { crimp: 0.08 }` → "reduce pump cost on crimps by 8%"
- `gripLossReduction: 0.05` → "reduce grip drain on all holds by 5%"
- `successBonus` → becomes pump cost reduction
- Weather modifiers: humidity increases grip drain (sweaty hands), cold increases pump costs (stiff muscles), wind increases pump costs (fighting to hold on)

---

## Implementation Order

1. **Create `js/routes-data.js`** with hand-crafted routes for Boulder Garden
2. **Rewrite `js/constants.js`** — simplify holdTypes (add baseGripDrain), remove GDD properties
3. **Update `js/state.js`** — add new state properties (weight, currentHand), keep grip/maxGrip, remove old success tracking
4. **Rewrite the core of `js/climbing.js`** — new `moveToHold()` with MoveResolver logic. Remove all success-roll code. Update chalk to restore grip, shake to reduce pump.
5. **Update `js/route.js`** — remove procedural generation, add route loading from routes-data
6. **Update `js/ui.js`** — remove bump animation, render holds as half-circles rotated by angle, add weight/hand indicators, keep both pump and grip bars
7. **Update `js/main.js`** — load routes from routes-data, update grid rendering for static route viewport
8. **Update `js/camp.js`** — update beta overlay for new hold format
9. **Update skill effects** in `js/skills.js` and `js/skills-data.js` — change success% references to pump/grip cost modifiers
10. **Update equipment modifiers** in gear data — reinterpret holdBonus as pump reduction, gripLossReduction as grip drain reduction
11. **Update `css/main.css`** — remove bump animation, add half-circle hold styles with rotation, add weight/angle visual indicators

## Important Notes

- **Test incrementally.** Get a basic route loading and the MoveResolver working before touching skills or equipment. You should be able to climb a simple all-jug route with just hand selection and see pump accumulate and grip drain before adding the weight/angle/crossing systems.
- **The grid viewport** is the trickiest UI change. If it's too complex to make a scrolling viewport immediately, a simpler approach is to keep the current 5-row visible grid and just load holds from the route array instead of generating them procedurally.
- **Half-circle hold rendering**: Use CSS to create semicircles (e.g., `border-radius: 50% 50% 0 0` for a top-half circle, then rotate the entire element by the hold's angle). The flat/cut edge represents the grabbing surface. This is the primary visual indicator of hold angle — it must be clear and readable at a glance. Keep the existing color coding per hold type.
- **Keep the HTML structure** of index.html as much as possible — the layout works, just update what's inside the grid cells and HUD panels.
- **Don't break the save/load system** if one exists — make sure the new state properties are serialized properly.
- **Feedback messages** are critical for the player understanding the puzzle. Every move should clearly show: base pump cost, grip drain, any penalties (cross, weight, gaston, reach, transition), technique effects, total pump and grip change. The player needs to learn cause and effect.
- **Route progress tracking** (highPoint, attempts, completion status, star results) must be preserved through this rework. The tracking keys (`locationId-routeId`) should work with the new route IDs from routes-data.js.
