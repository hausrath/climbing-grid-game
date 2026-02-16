# Changelog — Skill System Rework

## Goal
Replace 31 RPG-style skills with ~7 deterministic puzzle tools, unlocked by location progression. Inspired by puzzle games (Portal, The Witness, Talos Principle) where mechanics are taught through level design.

---

## Implementation Steps

### Step 1: Rename movement styles (static → cross, dynamic → reach) ✅
- [x] Renamed in `js/climbing.js` — movementStyle checks, variables, feedback text
- [x] Renamed in `js/ui.js` — selectMovementStyle, button IDs, cooldown display
- [x] Renamed in `js/ui-tooltip.js` — tooltip display text
- [x] Renamed in `js/state.js` — cooldown names (crossCooldown, reachCooldown)
- [x] Renamed in `js/main.js` — keyboard bindings, cooldown resets
- [x] Renamed in `js/climbing-actions.js` — cooldown ticks
- [x] Renamed in `index.html` — button labels, IDs, onclick handlers

### Step 2: Replace skills-data.js ✅
- [x] Replaced entire skillDatabase with 7 new skill definitions (Cross, Reach, Weight Shift, Match, Deadpoint, Commit, Bump)
- [x] Each skill: single rank, location-gated, deterministic effect
- [x] Added SKILL_UNLOCK_ORDER, isSkillUnlocked(), tryUnlockSkillAtLocation()

### Step 3: Strip skills.js ✅
- [x] Removed: calculateSkillPumpReduction, calculateSkillGripReduction, checkIronGripProc, checkAdrenalineRush, getSkillCrossBodyModifier
- [x] Removed: all magic/utility action functions (31 functions total)
- [x] Simplified: resetSkillState (only justChalked/justShook), updateSkillStateAfterMove (clears deadpoint flags)
- [x] Added compatibility getSkillRank() that returns 1/0 based on isSkillUnlocked()
- [x] Kept: getSlotDisplayName, getRarityColor (equipment helpers)

### Step 4: Simplify state.js ✅
- [x] Replaced gameState.skills (31-field object) with gameState.unlockedSkills (array)
- [x] Simplified gameState.skillState to only: justChalked, justShook

### Step 5: Clean climbing-actions.js and other callers ✅
- [x] Stripped shake of efficientRecovery and stimulant references
- [x] Stripped chalk of efficientRecovery and stimulant references
- [x] Updated commit check: `gameState.skills.commit` → `isSkillUnlocked('commit')`
- [x] Removed Iron Grip proc call from climbing.js
- [x] Updated deadpoint checks to use `isSkillUnlocked('deadpoint')`
- [x] Cleaned camp.js: removed weatherReading/salve references, updated commit button
- [x] Cleaned equipment.js: replaced skill shop with progression list, safe learnSkill/showSkillDetail

### Step 6: Rework UI ✅
- [x] Removed MOVEMENT STYLE section from left panel (index.html)
- [x] Added Cross/Reach/Regular as action buttons in Actions panel (shown when unlocked)
- [x] Added Commit button in Actions panel (shown when unlocked)
- [x] Hidden BODY WEIGHT section until Weight Shift is unlocked
- [x] Removed Player Stats section (stat system removed)
- [x] Removed Skills learn section (no more star purchasing)
- [x] Removed Combo Indicator (flow state removed)
- [x] Removed Level & XP box
- [x] Removed old utility/magic skill button row (salve, stimulant, hook, piton, etc.)

### Step 7: Add location-based unlock system ✅
- [x] Added unlock check in selectLocation() in main.js
- [x] Fires feedback notification when new skill is gained
- [x] Skills defined with unlockLocation IDs in skills-data.js

### Step 8: Update camp/skill screen ✅
- [x] Replaced skill tree/shop with progression list (camp.js updateCampSkillsPreview)
- [x] Shows locked skills (greyed, which location unlocks them)
- [x] Shows unlocked skills (highlighted, description + effect)
- [x] Replaced equipment.js skill screen with same progression list

### Step 9: Test ✅
- [x] Verified no references to removed functions (checkIronGripProc, useSalve, etc.)
- [x] Verified no references to removed state (gameState.skills, gameState.level, etc.)
- [x] Verified script load order correct (skills-data.js → state.js → skills.js)
- [x] Fixed victory screen reference to gameState.level

---

## New Skill Progression

| # | Skill | Unlock Location | Key | Effect |
|---|-------|----------------|-----|--------|
| 1 | Cross | Crimp Canyon (1) | 3 | Reduce cross-body/gaston penalty by 1. 3-move CD. |
| 2 | Reach | Overhang Alley (2) | 1 | Negate distance +1 penalty. 3-move CD. |
| 3 | Weight Shift | Slab Valley (3) | Z/X/C | Manual weight control (was auto-only). |
| 4 | Match | Jug Junction (4) | — | Both hands on matchable hold, resets alternation. |
| 5 | Deadpoint | Pinch Peak (5) | — | After shake: no pump change. After chalk: skip grip decay. |
| 6 | Commit | Location 6 | R | Reduce penalty by 1. 10-move CD. |
| 7 | Bump | Location 7 | B | Reposition without changing hands. |

---

## Completed Changes (Pre-Rework Bug Fixes)

### isCrossMove bug fix
- **File:** `js/climbing.js` line 48
- **Was:** `isCrossMove(hand === 'left' ? 'L' : 'R', direction)` — passed 'L'/'R' but function expected 'left'/'right'
- **Fix:** `isCrossMove(hand, direction)` — pass hand directly (already 'left'/'right')
- **Also fixed:** Same bug in `js/ui-tooltip.js` line 52

### Cross-body double-counting fix
- **File:** `js/climbing.js` lines 86-96
- **Was:** +1 penalty added for cross-body ON TOP of penalty table (which already includes cross penalty). Static only negated the extra +1.
- **Fix:** No +1 added. Static now reduces effective penalty by 1 when crossing (counteracts table's built-in cross penalty).
- **Also fixed:** Same logic in `js/ui-tooltip.js`

### Penalty table sync
- **File:** `js/routes-data.js`
- **Fixed 4 entries** to match corrected Excel table (all 90° angle values for diagonal directions):
  - `up-left, R, 90, L`: 0 → 3
  - `up-left, R, 90, R`: 1 → 4
  - `up-right, R, 90, L`: 1 → 0
  - `up-right, L, 90, L`: 0 → 1

### Removed unused holdType fields
- **File:** `js/constants.js`
- Removed `basePumpRating` and `baseGripDrain` from holdTypes array (unused in deterministic system)

---

## Route Redesign: Areas 0-7 (24 Hand-Crafted Puzzle Routes)

### Overview
Replaced 7 placeholder routes in Area 0 with 24 skill-teaching puzzle routes across Areas 0-7 (3 routes per area). Each route is a verified solvable puzzle that teaches the area's new skill while reinforcing prior skills.

### Route Structure Per Area
- **Route 1 (Tutorial)**: Gentle introduction to the new skill
- **Route 2 (Practice)**: Combines new skill with 1-2 prior skills
- **Route 3 (Mastery)**: Requires ALL skills learned up to that area

### Area Breakdown
| Area | Location | Skill Taught | Routes | Hold Range |
|------|----------|-------------|--------|------------|
| 0 | Boulder Garden | Hand selection, direction | First Steps, Zig-Zag, Reading the Wall | 6-8 |
| 1 | Crimp Canyon | Cross (gaston/cross-body -1) | Gaston Lesson, Cross Country, The Crimp Crux | 8-10 |
| 2 | Overhang Alley | Reach (negate distance +1) | The Long Reach, Stretch and Cross, The Overhang | 8-12 |
| 3 | Slab Valley | Weight Shift (manual weight) | Weight Control, Balanced Traverse, The Slab Master | 8-12 |
| 4 | Jug Junction | Match (reset hands) | Match Point, Match and Shift, The Junction Test | 10-12 |
| 5 | Pinch Peak | Deadpoint (recovery empowers) | Dead On, Peak Performance, The Pinch Gauntlet | 12-14 |
| 6 | Pocket Paradise | Commit (penalty -1, 10-CD) | Committed, Pick Your Battle, Paradise Lost | 12-14 |
| 7 | Steep Street | Bump (reposition) | Bump and Go, Street Smarts, The Grand Wall | 12-16 |

### Design Principles
- Every route verified solvable with optimal play
- Penalty math based on direction + hand + angle + weight lookup table
- Gaston modifier (L@135°, R@225°) creates key Cross teaching moments
- Weight auto-shift creates traps that Weight Shift resolves
- Extended moves (2+ spaces) create Reach teaching moments
- `pumpRating`/`gripDrain` kept on holds for visual progress bar display
- Star challenges: completion, speed, pump efficiency, no recovery, flash climb

### Notes
- Bump skill (Area 7) is not yet implemented in code — routes designed for future implementation
- Match triggers automatically on matchable holds (not gated behind skill unlock in current code)
