# Modifier System for New Puzzle Mechanics

## Overview
This document maps out which modifiers from the gear and skills systems are compatible with our new puzzle-focused progression system.

---

## REMOVED SYSTEMS & MODIFIERS

### Completely Removed (No Longer Exists)
- ❌ **XP-related modifiers**: `+XP from route completion`, `+XP from first grab`, `+XP from flash`, etc.
- ❌ **Level-related modifiers**: Any references to leveling up
- ❌ **Stat points**: Endurance, Power, Speed, Technique stats
- ❌ **Skill points**: `unspentSkillPoints` - replaced with star system
- ❌ **Energy system**: `+max energy`, `energy cost reduction`, `+climbs before time` - replaced with fatigue
- ❌ **Familiarity XP bonuses**: The familiarity system itself stays, but XP bonuses are removed

### Replaced Systems
- 🔄 **Max Pump/Grip bonuses**: Gear can no longer grant flat `+max pump/grip` - progression now comes from completing routes
  - Exception: Legendary gear with "permanent increase" perks (like Second Wind, Titan's Strength) can still work
- 🔄 **Energy pips** → **Fatigue system**: Modifiers affecting energy need to be adapted to fatigue

---

## VALID MODIFIERS (Grouped by Type)

### A. Pump Modifiers (Still Valid)
These affect pump accumulation during climbs:

**From Gear:**
- `-X% pump gain per move` (clothing, harness)
- `-X% hot weather pump penalty` (clothing)
- `-X% wind pump penalty` (clothing, jacket)
- `+X% pump recovery when shaking` (harness, chalk bag)
- `-X% pump gain from dynamic moves` (clothing)
- `-X% pump cost from cross-body moves` (harness, footwork skills)
- `Chalking also reduces pump by X` (chalk bags)
- `Shake cooldown reduced by X` (watch, harness)

**From Skills:**
- `-X% pump gain per move` (Precision Footwork)
- `-X% pump cost from cross-body moves` (Ambidextrous, Footwork)
- `No cross-body penalty` (Ambidextrous Rank 2, Ascendant's Harness)
- `-X% pump cost from dynamic moves` (Dynamic Movement skill)
- `Dynamic moves cost 0 pump` with specific conditions (Deadpoint)
- `-X% pump gain while in flow` (Flow State)
- `Every 3rd move costs 0 pump` (Precision Footwork Rank 4)

---

### B. Grip Modifiers (Still Valid)
These affect grip depletion:

**From Gear:**
- `-X% grip loss per move` (shoes, gloves)
- `-X% grip degradation on [hold type]` (gloves, tape)
- `-X% humid weather grip penalty` (clothing)
- `-X% cold weather grip penalty` (gloves)
- `-X% dry condition penalties` (chameleon cloak)
- `+X% grip restoration from chalk` (chalk bags)
- `Chalk cooldown reduced by X` (watch, chalk bag)
- `-X grip loss on [hold type]` (shoes, gloves)
- `Grip loss reduced by 50% on crimps/slopers` (Dragonscale Gloves)
- `Starting grip increased to X%` (food items)

**From Skills:**
- `X% chance to negate grip cost` (Iron Grip)
- `-X% grip loss per move` (Iron Grip)
- `+X% max grip capacity` (Iron Grip Rank 3)
- `Grip loss reduced by 15% while in flow` (Flow State Rank 4)
- `First move after chalking costs 0 grip` (Deadpoint)
- `Temporary invulnerability to grip loss (X moves)` (Phoenix Chalk)
- `Phantom grips restore 5 grip` (Phantom Grip Rank 3)

---

### C. Success Chance Modifiers (Still Valid)
These modify the probability of successful hold grabs:

**From Gear (Hold-Type Specific):**
- `+X% success on jugs` (shoes)
- `+X% success on crimps` (shoes, gloves, tape)
- `+X% success on edges` (shoes, gloves)
- `+X% success on slopers` (shoes)
- `+X% success on pockets` (shoes)
- `+X% success on pinches` (gloves)
- `+X% success on slabs` (approach shoes)

**From Gear (Situational):**
- `+X% success when grip below Y%` (chalk bags)
- `+X% success when pump above Y%` (helmets)
- `+X% success on crux holds` (helmets)
- `+X% success in upper third of route` (helmets)
- `+X% success after chalking` (alchemist's chalk)
- `+X% success on previously grabbed holds` (brush)
- `+X% success on first X holds of route` (legendary shoes)

**From Skills:**
- `+X% success bonus` (Flow State combo system)
- `+X% success on all holds during effect` (Battle Cry, Time Dilation)
- `+X% success when pump/grip in specific ranges` (Grit)
- `+X% success after recovery actions` (Efficient Recovery Rank 5)
- `+X% success for next X moves after trigger` (various)
- `+X% success from alternating hands` (Ambidextrous)

---

### D. Movement/Technique Modifiers (Still Valid)
These affect how movement works:

**From Gear:**
- `+X% dynamic movement bonus` (shoes)
- `+X% static movement bonus` (shoes)
- `Dynamic/Static cooldowns eliminated` (legendary shoes)
- `Dynamic works on closer moves (distance ≥X)` (shoes)
- `Static works on farther moves (distance ≤X)` (shoes)
- `No penalty for straight approach to sidepulls` (legendary shoes)

**From Skills:**
- `Can skip X adjacent holds when moving` (Dynamic Movement)
- `+X% dynamic movement bonus` (Dynamic Movement)
- `Dynamic moves don't break combo/flow` (Dynamic Movement Rank 4)
- `No cooldown on dynamic moves` (Dynamic Movement Rank 5)
- `Landing dynamic gives +X% success on next hold` (Dynamic Movement Rank 5)

---

### E. Cooldown Modifiers (Still Valid)
These affect action cooldowns:

**From Gear:**
- `Shake cooldown reduced by X` (watch, harness)
- `Chalk cooldown reduced by X` (watch, chalk bag)
- `Static cooldown reduced by X` (precision timer)
- `Dynamic cooldown reduced by X` (precision timer)
- `All action cooldowns reduced to 0` (Chronos Watch)

**From Skills:**
- `All cooldowns reduced by X for Y moves` (Stimulant)
- `All cooldowns become 0 for X moves` (Stimulant Rank 2)
- `No cooldowns on chalk or shake` (Efficient Recovery Rank 5)
- `Can use chalk and shake simultaneously` (Efficient Recovery Rank 5, Chronos Watch)

---

### F. Weather/Conditions Modifiers (Still Valid)
These modify weather penalty effects:

**From Gear:**
- `-X% hot weather pump penalty` (clothing)
- `-X% humid weather grip penalty` (clothing, chalk bags)
- `-X% wind pump penalty` (clothing)
- `-X% cold weather penalties` (gloves)
- `-X% dry condition penalties` (chameleon cloak)
- `All weather penalties become bonuses` (Chameleon Cloak perk)
- `Gain bonus from favorable weather` (chameleon cloak)

**From Skills:**
- `-X% penalties from all weather conditions` (Weather Reading)
- `Temporary immunity to weather penalties for X moves` (Climbing Salve Rank 3)
- `Gain small bonus from each weather type` (Weather Reading Rank 3)

---

### G. Special Mechanics (Still Valid)
These are unique abilities that still work:

**Fall Prevention:**
- `X% chance to catch yourself on fall` (helmet, gloves)
- `When you would fall, restore X pump and X grip` (Guardian's Crown, Crown of Mountain King)
- `Crash pads return you to last hold with X% resources` (Crash Pad skill)

**Vision/Information:**
- `See hold types/difficulties ahead` (Headlamp, Seer)
- `See exact success percentages` (Sage's Tome, Seer)
- `See optimal path` (Crown of Mountain King, Headlamp Rank 3)
- `See crux locations` (Guardian's Crown)

**Resource Manipulation:**
- `Swap pump and grip values` (Transmute skill)
- `Restore X pump and X grip` (Climbing Salve)
- `Every Xth successful grab restores resources` (Energy Siphon)

**Hold Manipulation:**
- `Create new holds` (Rockcreate skill)
- `Change hold types` (Transmogrify skill)
- `Mark holds for bonuses` (Sunmark skill)

**Movement Abilities:**
- `Teleport to holds` (Teleport, Grappling Hook, Wingsuit)
- `Freeze pump and grip for X moves` (Time Dilation skill)
- `Treat overhangs as slabs` (Gravity Shift)

**Perks That Permanently Increase Max Pump/Grip:**
- ✅ `Second Wind`: When complete route with pump >80%, permanently gain +5 max pump (Elixir of Eternal Stamina)
- ✅ `Titan's Strength`: Every 5 holds grabbed successfully: permanently gain +2 max pump and +2 max grip (Atlas Harness)

---

## NEEDS ADAPTATION

### Time/Period System
**Old modifiers that need rework:**
- `+X climbs before advancing time` (food) → Could become: `-X fatigue gain per attempt`
- `+X bonus energy on route completion` (food) → Could become: `Restore X fatigue on route completion`
- `+10 climbs before advancing time` (Chronos Watch) → Could become: `-50% fatigue gain rate`

**Recommendation:** Convert "climbs before time" into fatigue reduction modifiers.

### Retry/Persistence Modifiers
**Old modifiers:**
- `Keep X% pump/grip on retry` (harness)

**Status:** ❓ Need to decide - do retries still exist? Or is every attempt completely fresh?
- If retries stay: These modifiers are valid
- If no retries: Remove these modifiers

---

## MODIFIER SUMMARY BY SLOT

### Shoes
- ✅ Success bonuses on hold types
- ✅ Grip loss reduction
- ✅ Movement bonuses (dynamic/static)
- ✅ Cooldown manipulation
- ✅ Special perks (flow state, gravity defiance)

### Chalk Bag
- ✅ Grip restoration bonuses
- ✅ Chalk cooldown reduction
- ✅ Pump reduction from chalking
- ✅ Success bonuses when low grip
- ✅ Weather resistance (humid)
- ✅ Special perks (chalk cloud, eternal chalk)

### Helmet
- ✅ Fall catch chances
- ✅ Success bonuses (crux, high pump, upper route)
- ✅ Vision/information abilities
- ✅ Special perks (last stand, indomitable will)
- ❌ `+X max energy` → REMOVED

### Harness
- ✅ Pump gain reduction
- ✅ Pump recovery bonuses
- ✅ Cross-body penalty reduction
- ✅ Shake cooldown reduction
- ✅ Special perks (endless endurance, boundless energy)
- ❌ `+X max energy` → REMOVED
- ❌ `Reduce energy cost per climb` → REMOVED (or adapt to fatigue)
- ❓ `Keep X% pump/grip on retry` → NEEDS DECISION

### Gloves/Tape
- ✅ Success bonuses on hold types
- ✅ Grip degradation reduction
- ✅ Weather resistance (cold)
- ✅ Fall catch chances
- ✅ Special perks (iron grip proc)

### Clothing
- ✅ Weather penalty reduction (all types)
- ✅ Pump gain reduction
- ✅ Weather bonus conversion
- ✅ Special perks (weatherproof)

### Food
- ❌ `+X max pump capacity` → REMOVED (progression comes from routes)
- ❌ `+X max grip capacity` → REMOVED (progression comes from routes)
- ❌ `+X climbs before time` → ADAPT to fatigue system
- ❌ `+X bonus energy on completion` → ADAPT to fatigue system
- ❌ `+X% XP from completion` → REMOVED
- ✅ `Starting grip increased to X%` → KEEP
- ✅ `Permanent max pump increases` (legendary perk) → KEEP
- ✅ `-X% pump gain from all sources` → KEEP

### Brush
- ✅ Success bonuses on familiar/cleaned holds
- ❌ `Hold degradation rate` → REMOVED (no degradation system)
- ✅ Familiarity bonus effects → KEEP (non-XP parts)

### Guidebook
- ❌ `+X% familiarity bonus per grab` → KEEP (mechanic stays, just no XP)
- ❌ `+X% XP from completion/first grabs` → REMOVED
- ❌ `Familiarity cap increased` → KEEP if familiarity system stays
- ✅ `Combo threshold lowered` → KEEP
- ✅ `See exact success percentages` → KEEP
- ✅ `Route memory bonuses` → KEEP (non-XP parts)

### Watch
- ✅ All cooldown reductions → KEEP
- ✅ Speed challenge bonuses → KEEP
- ✅ Simultaneous action use → KEEP
- ✅ Time manipulation abilities → KEEP
- ❌ `+X climbs before time` → ADAPT to fatigue

---

## RECOMMENDATION: NEW FOOD SLOT MODIFIERS

Since food loses most of its old bonuses, here are new modifier ideas:

1. **Fatigue Mitigation:**
   - `-X fatigue gain per attempt`
   - `Restore X fatigue on route completion`
   - `-X% fatigue accumulation rate`

2. **Starting Bonuses:**
   - `Starting grip increased to X%` ✅ (already exists)
   - `Start routes with -X pump`
   - `Start with X% success bonus for first Y holds`

3. **Resource Efficiency:**
   - `-X% pump gain from all sources`
   - `-X% grip loss from all sources`
   - `+X% effectiveness for shake and chalk`

4. **Conditional Bonuses:**
   - `When complete route with pump >X%, gain Y benefit`
   - `Permanent increases to max pump/grip` (legendary only)

---

## NEXT STEPS

1. ✅ Remove all XP/energy/stat modifiers from gear database
2. ✅ Convert food modifiers to fatigue/efficiency bonuses
3. ✅ Decide on retry system (keep or remove)
4. ✅ Update skill costs to star-based system
5. ✅ Ensure all gear modifiers align with new pump/grip separation
