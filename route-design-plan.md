# Route Redesign Plan: Areas 0-7 (24 Routes)

## Context
The climbing system was reworked from random rolls to a deterministic puzzle system with penalty tables. Routes need to be redesigned as genuine puzzles that teach skills progressively. Each area unlocks a new skill, and routes must require skills from previous areas to complete.

## File to Modify
- `js/routes-data.js` — Replace all routes in `routeDatabase` for locations 0-7 (3 routes each, 24 total). Remove the existing 7 routes at location 0.

## Design Principles
1. **Each area teaches one new skill** via its first route (gentle tutorial)
2. **Route 2** combines the new skill with 1-2 prior skills
3. **Route 3** is a mastery test requiring ALL skills learned so far
4. **Every route is mathematically verified** — optimal solution avoids fall, poor play = fall
5. **pumpRating/gripDrain kept** for visual display (used as progress bars)
6. **Star challenges** use the existing format: completion, speed, pumpEfficiency (finish pump=0), noRecovery (no shakes/chalks), flashClimb (first try)

## Pump/Grip Economy Reference
- **Pump budget**: 2 points before fall. Shake = -1, cooldown 5 moves.
- **Grip budget**: Falls at move 9 without chalk. Chalk resets grip, 5 uses per climb.
- **Routes ≤8 holds**: No chalk needed (grip reaches 2 at move 6, survives)
- **Routes 9-14 holds**: 1 chalk needed
- **Routes 15+ holds**: 2+ chalks needed

## Skill Unlock Progression
| Area | Location | Skill | Key Mechanic |
|------|----------|-------|-------------|
| 0 | Boulder Garden | (none) | Hand selection, direction |
| 1 | Crimp Canyon | Cross | Reduces cross-body/gaston penalty by 1 |
| 2 | Overhang Alley | Reach | Negates +1 distance penalty for 2+ space moves |
| 3 | Slab Valley | Weight Shift | Manually set weight before a move |
| 4 | Jug Junction | Match | Both hands on matchable hold, reset hand tracking |
| 5 | Pinch Peak | Deadpoint | After shake: no pump change. After chalk: no grip decay. |
| 6 | Pocket Paradise | Commit | Reduce penalty by 1, 10-move cooldown |
| 7 | Steep Street | Bump | Reposition without changing hands |

---

## Area 0 — Boulder Garden (No Skill)
**Teaches**: Hand selection, direction-to-hand matching, angle awareness

### Route 0-1: "First Steps" (V0, 6 holds)
- All straight UP, angle 0, center column
- Every move is penalty 0 with any hand
- Pure controls tutorial

### Route 0-2: "Zig-Zag" (V1, 8 holds)
- Alternating UP-LEFT / UP-RIGHT moves, all angle 0
- Natural hand (L for left, R for right) = penalty 0; wrong hand = penalty 1
- Teaches: direction determines optimal hand

### Route 0-3: "Reading the Wall" (V2, 8 holds)
- Introduces non-zero angles (45 and 315)
- Some unavoidable penalty-1 from weight mismatch (no Weight Shift yet)
- Teaches: angles affect penalty through weight
- 2 penalty-1 moves, survivable with 1 shake

---

## Area 1 — Crimp Canyon (Unlocks Cross)
**Teaches**: Gaston penalty (L@135, R@225) and how Cross negates it

### Route 1-1: "Gaston Lesson" (V1, 8 holds)
- Introduces 225 holds where R hand gets gaston (+1 penalty)
- Player learns: L hand avoids gaston, OR activate Cross on R hand

### Route 1-2: "Cross Country" (V2, 10 holds)
- Multiple gaston opportunities (225 and 135 holds)
- Without Cross: accumulated gaston penalties = fall
- With Cross: manageable with 1 shake

### Route 1-3: "The Crimp Crux" (V3, 10 holds)
- Back-to-back gaston holds in crux section
- Route is impossible without Cross
- Skills required: **Cross**

---

## Area 2 — Overhang Alley (Unlocks Reach)
**Teaches**: Extended moves (2+ spaces) incur +1 penalty, Reach negates it

### Route 2-1: "The Long Reach" (V2, 8 holds)
- Several 2-space gaps between holds
- Teaches: Reach skill timing around cooldown

### Route 2-2: "Stretch and Cross" (V3, 10 holds)
- Mix of extended moves AND gaston holds
- Requires coordinating Reach and Cross cooldowns

### Route 2-3: "The Overhang" (V4, 12 holds)
- Long route with both distance challenges and gaston cruxes
- Skills required: **Reach, Cross**

---

## Area 3 — Slab Valley (Unlocks Weight Shift)
**Teaches**: Manual weight positioning overrides auto-shift

### Route 3-1: "Weight Control" (V2, 8 holds)
- Auto-weight-shift leaves player at wrong weight for next hold
- Weight Shift allows pre-positioning for clean moves

### Route 3-2: "Balanced Traverse" (V3, 10 holds)
- Weight-demanding route with 45/315/180 angle holds
- Requires Weight Shift + Cross for gastons

### Route 3-3: "The Slab Master" (V4, 12 holds)
- Complex angle sequences requiring weight, hand, and direction mastery
- Skills required: **Weight Shift, Cross, Reach**

---

## Area 4 — Jug Junction (Unlocks Match)
**Teaches**: Matching on matchable holds resets hand tracking

### Route 4-1: "Match Point" (V2, 10 holds)
- Hand sequence gets stuck without matching
- Key matchable holds at turning points

### Route 4-2: "Match and Shift" (V3, 12 holds)
- Combines matching with weight management and Cross
- Skills tested: Match, Weight Shift, Cross

### Route 4-3: "The Junction Test" (V4, 12 holds)
- Skills required: **Match, Weight Shift, Cross, Reach**

---

## Area 5 — Pinch Peak (Unlocks Deadpoint)
**Teaches**: Recovery actions empower next move

### Route 5-1: "Dead On" (V3, 12 holds)
- Shake+Deadpoint combo needed for high-penalty section
- Chalk+Deadpoint blocks grip decay

### Route 5-2: "Peak Performance" (V4, 12 holds)
- Sustained crux requiring Deadpoint for pump management
- Skills tested: Deadpoint, Weight Shift, Cross, Match

### Route 5-3: "The Pinch Gauntlet" (V5, 14 holds)
- Skills required: **All 5 skills** (Deadpoint, Match, Weight Shift, Cross, Reach)

---

## Area 6 — Pocket Paradise (Unlocks Commit)
**Teaches**: One-shot penalty reduction for crux moves (10-move cooldown)

### Route 6-1: "Committed" (V3, 12 holds)
- One very hard crux move; Commit makes it survivable

### Route 6-2: "Pick Your Battle" (V4, 14 holds)
- Multiple hard moves, Commit's cooldown means strategic targeting
- Skills tested: Commit, Cross, Weight Shift, Reach

### Route 6-3: "Paradise Lost" (V5, 14 holds)
- Skills required: **All 6 skills**

---

## Area 7 — Steep Street (Unlocks Bump)
**Teaches**: Reposition laterally without changing hands

### Route 7-1: "Bump and Go" (V3, 12 holds)
- Lateral repositioning needed for clean approach angles
- Without Bump: forced into cross-body or wrong weight

### Route 7-2: "Street Smarts" (V4, 14 holds)
- Bump repositioning + weight management + gaston avoidance
- Skills tested: Bump, Weight Shift, Cross, Match, Reach

### Route 7-3: "The Grand Wall" (V5, 16 holds)
- **Capstone route requiring ALL 7 skills**
- Longest route, requires strategic chalk/shake management
- Skills required: **Bump, Commit, Deadpoint, Match, Weight Shift, Cross, Reach**

---

## Verification Checklist
- [ ] Each route is completable with optimal play
- [ ] Area 0 routes completable without any skills
- [ ] Each area's route 3 requires all prior skills
- [ ] Grip/chalk economy works for longer routes
- [ ] Star challenges achievable with perfect play
- [ ] All routes tested in browser
