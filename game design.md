# Climbing Grid Prototype - Game Design

## Teaching Progression by Area

### Area 0: Boulder Garden
- **Skill Unlock:** Cross (unlocks after completing the first route)
- **Teaches:** Route 1 teaches basic hand selection and direction. Routes 2-3 introduce cross-body penalties now that Cross is available.
- **Design Note:** Without Cross, routes are either trivially solvable (pick the right starting hand) or impossible (unavoidable crosses accumulate to fall). Cross must unlock early to create meaningful puzzle depth.

### Area 1: Crimp Canyon
- **Skill Unlock:** Reach (negates the +1 distance penalty on extended moves, cooldown 3)
- **Teaches:** Extended moves (dy >= 2 or dx >= 2), distance penalty management

### Area 2: Overhang Alley
- **Skill Unlock:** Weight Shift (manually set weight to L/C/R before a move instead of relying on auto-shift)
- **Teaches:** Weight positioning, how hold angles shift weight, pre-move weight management

### Area 3: Slab Valley
- **Skill Unlock:** Match (reset hand sequence on matchable holds)
- **Teaches:** Hand sequence planning, using match points to set up optimal hand for next section

### Area 4: Jug Junction
- **Skill Unlock:** Deadpoint (shake before a move = no pump change; chalk before a move = no grip decay)
- **Teaches:** Recovery timing, combining shake/chalk with Deadpoint for hard moves

### Area 5: Pinch Peak
- **Skill Unlock:** Commit (reduce effective penalty by 1, cooldown 10)
- **Teaches:** Crux identification, strategic one-shot skill usage on the hardest move

### Area 6: Pocket Paradise
- **Skill Unlock:** Bump (reposition laterally without changing hands)
- **Teaches:** Lateral repositioning to set up better approach angles
- **Note:** Bump is not yet implemented in game code

### Area 7: Steep Street
- **Skill Unlock:** None (mastery area combining all skills)
- **Teaches:** Full skill integration across complex routes

---

## Implicit Mechanics (Not Tied to Skill Unlocks)

- **Shake timing** - Pump recovery (pump -1), 5-move cooldown. Taught implicitly in areas 0-1.
- **Chalk management** - Grip reset (grip = 0, decay counter = 0), 3 uses per climb, 1-move cooldown. Becomes critical on longer routes (10+ holds).
- **Hold angles / weight awareness** - Angles shift your weight; wrong weight = penalty. Taught in area 0 but deepens throughout.
- **Grip decay** - Every 3rd move (for jugs/edges), grip state advances (0 -> 1 -> 2 -> 3 = fall). Chalk resets. Rate depends on hold type (see table below).
- **Rest holds** - `isRest: true` on final holds. Mid-route rest holds could be a future teachable concept.

---

## Hold Types & Grip Cost

Hold types affect grip decay rate via `HOLD_GRIP_COST` in `js/constants.js`. Grip decays 1 stage when the counter reaches 3 ticks.

| Hold Type | Grip Cost (ticks/move) | Effective Moves per Decay |
|-----------|:----------------------:|:-------------------------:|
| Jug       | 1                      | 3                         |
| Edge      | 1                      | 3                         |
| Pocket    | 2                      | 1.5                       |
| Undercling | 2                     | 1.5                       |
| Pinch     | 3                      | 1                         |
| Gaston    | 3                      | 1                         |
| Sidepull  | 3                      | 1                         |
| Crimp     | 4                      | 0.75                      |
| Sloper    | 4                      | 0.75                      |

---

## Route Design Progression per Area

Each area has 3 routes following this pattern:
1. **Tutorial** - Introduces the new skill in isolation
2. **Practice** - Combines the new skill with 1-2 prior skills
3. **Mastery** - Requires the new skill plus all prior skills

### Design Principles
1. **Each area teaches one new skill** via its first route (gentle tutorial)
2. **Route 2** combines the new skill with 1-2 prior skills
3. **Route 3** is a mastery test requiring ALL skills learned so far
4. **Every route is mathematically verified** via the route editor's auto-solver
5. **Star challenges** use the existing format: completion, speed, pumpEfficiency (finish pump=0), noRecovery (no shakes/chalks), flashClimb (first try)
6. **Branching routes** supported — solver finds paths through forks, holdCount auto-computed as shortest path

### Pump/Grip Economy Reference
- **Pump states**: Fresh (0), Pumped (1), Struggling (2), Fall (3+). Shake = -1 state, cooldown 5 moves.
- **Grip states**: Chalked (0), Weakening (1), Slipping (2), Fall (3+). Grip decays based on hold type (see table above). Chalk resets to 0, 3 uses per climb.
- **Routes ≤4 holds**: No chalk needed (grip reaches 1 at move 4 on jugs)
- **Routes 5-8 holds**: 1 chalk may be needed (grip reaches 2 at move 8 on jugs)
- **Routes 9+ holds**: Chalk management becomes critical

---

## Route Details by Area

### Area 0 — Boulder Garden (Unlocks Cross + Reach)
**Teaches**: Hand selection, direction-to-hand matching, angle awareness
**Cross** unlocks after completing the first route. **Reach** unlocks after completing all routes.

#### Route 0-1: "First Steps" (V0, 6 holds)
- All straight UP, angle 0, center column
- Every move is penalty 0 with any hand
- Pure controls tutorial — learn hand alternation
- Completing this route unlocks **Cross**

#### Route 0-2: "Zig-Zag" (V1, 8 holds)
- Alternating UP-LEFT / UP-RIGHT moves, all angle 0
- Natural hand (L for left, R for right) = penalty 0; wrong hand = cross-body penalty
- Teaches: direction determines optimal hand, Cross skill negates cross-body

#### Route 0-3: "Reading the Wall" (V2, 8 holds)
- Introduces non-zero angles (45, 315) and extended (2-space) moves
- Teaches: angles affect penalty through weight, distance penalty exists
- Completing this (last) route unlocks **Reach**

---

### Area 1 — Crimp Canyon (Unlocks Weight Shift)
**Teaches**: Manual weight positioning overrides default center weight

#### Route 1-1: "Weight Lesson" (V1, 6 holds)
- Holds with angled positions where center weight causes penalty
- Weight Shift to left/right before moves = clean
- Teaches: weight affects penalty, Weight Shift allows pre-positioning

#### Route 1-2: "Reach a Cross" (V2, 7 holds, startCol: 0)
- Mix of cross-body moves and extended reaches
- Requires coordinating Weight Shift, Cross, and Reach
- Skills tested: Weight Shift, Cross, Reach

#### Route 1-3: "Careful Planning" (V2, 9 holds, startCol: 3)
- Complex sequences requiring weight, hand, and direction mastery
- Skills required: **Weight Shift, Cross, Reach**

---

### Area 2 — Overhang Alley (Unlocks Match)
**Teaches**: Matching on matchable holds resets hand tracking

#### Route 2-1: "Show You the Weigh" (V2, 7 holds, startCol: 2)
- Angled holds (45, 315, 270, 90) requiring weight management
- Teaches: weight must be opposite of hold direction

#### Route 2-2: "Don't Fall A Weigh" (V0, 7 holds, startCol: 3)
- Mixed hold types (crimp, jug, sloper, pocket) with angled holds
- Big start, big finish

#### Route 2-3: "Match Point" (V2, 10 holds)
- Hand sequence gets stuck without matching
- Key matchable holds at turning points reset hand alternation
- Skills tested: Match, Weight Shift

#### Route 2-4: "The Overhang" (V3, 10 holds)
- Combines matching with weight and cross management
- Skills required: **Match, Weight Shift, Cross, Reach**

---

### Area 3 — Slab Valley (Unlocks Deadpoint)
**Teaches**: Recovery actions empower your next move

#### Route 3-1: "Dead On" (V2, 8 holds)
- Shake+Deadpoint combo needed for high-penalty section
- Chalk+Deadpoint blocks grip decay on critical moves
- Teaches: strategic recovery timing

#### Route 3-2: "Recovery Master" (V3, 10 holds)
- Sustained crux requiring Deadpoint for pump management
- Skills tested: Deadpoint, Weight Shift, Match, Cross

#### Route 3-3: "The Slab Master" (V4, 12 holds)
- Complex route requiring all skills learned so far
- Skills required: **Deadpoint, Match, Weight Shift, Cross, Reach**

---

### Area 4 — Jug Junction (Unlocks Commit)
**Teaches**: One-shot penalty reduction for crux moves (10-move cooldown)

#### Route 4-1: "Committed" (V3, 10 holds)
- One very hard crux move; Commit makes it survivable
- Without Commit: crux is effective penalty 3 = fall

#### Route 4-2: "Pick Your Battle" (V3, 12 holds)
- Multiple hard moves, Commit's 10-move cooldown means strategic targeting
- Skills tested: Commit, Cross, Weight Shift, Reach

#### Route 4-3: "The Junction Test" (V4, 12 holds)
- Skills required: **Commit, Deadpoint, Match, Weight Shift, Cross, Reach**

---

### Area 5 — Pinch Peak (Unlocks Bump)
**Teaches**: Reposition laterally without changing hands

#### Route 5-1: "Bump and Go" (V3, 12 holds)
- Lateral repositioning needed for clean approach angles
- Without Bump: forced into cross-body or wrong weight

#### Route 5-2: "Street Smarts" (V4, 12 holds)
- Bump repositioning + weight management + gaston avoidance
- Skills tested: Bump, Commit, Weight Shift, Cross, Match

#### Route 5-3: "Peak Performance" (V5, 14 holds)
- Skills required: **Bump, Commit, Deadpoint, Match, Weight Shift, Cross, Reach**

---

### Area 6 — Pocket Paradise (No New Skill — Mastery Test)
**Purpose**: Test mastery of all 7 skills without introducing anything new

#### Route 6-1: "Skill Check" (V4, 12 holds)
- Requires strategic use of all skills in moderate difficulty

#### Route 6-2: "The Gauntlet" (V5, 14 holds)
- Sustained difficulty with tight cooldown management
- Every skill must be used optimally

#### Route 6-3: "Paradise Lost" (V5, 16 holds)
- **Capstone mastery route** — longest route so far
- Tests resource management (chalk/shake economy) across 16 holds
- Skills required: **All 7 skills** (Bump, Commit, Deadpoint, Match, Weight Shift, Cross, Reach)

---

### Area 7 — Steep Street (Unlocks Dyno)
**Teaches**: Jumping to holds beyond normal reach (3 spaces, 5-move cooldown)

#### Route 7-1: "Launch Pad" (V4, 12 holds)
- Gaps that are unreachable without Dyno (dy=3 or dx=3)
- Teaches: Dyno timing and when to activate

#### Route 7-2: "Sky High" (V5, 14 holds)
- Multiple Dyno-required gaps with careful cooldown management
- Can be combined with Cross/Reach for the same move
- Skills tested: Dyno, Commit, Weight Shift, Cross, Reach

#### Route 7-3: "The Grand Wall" (V6, 16 holds)
- **Ultimate capstone route requiring ALL 8 skills**
- Branching path options — multiple valid solutions
- Longest route, requires strategic chalk/shake management
- Skills required: **Dyno, Bump, Commit, Deadpoint, Match, Weight Shift, Cross, Reach**

---

## Verification Checklist
- [ ] Each route is completable with optimal play (verified via auto-solver)
- [ ] Area 0 routes completable without any skills (except route 3 benefits from Cross)
- [ ] Each area's route 3 requires all prior skills
- [ ] Grip/chalk economy works for longer routes
- [ ] Star challenges achievable with perfect play
- [ ] Branching routes have correct holdCount (shortest path)
- [ ] All routes tested in browser

---

## Areas 8+ (Future)

6 of 7 skill slots are assigned to areas 0-6. Area 7 is a mastery area with no new skill. Future areas would need to teach skill combinations or introduce new mechanics beyond the current system.
