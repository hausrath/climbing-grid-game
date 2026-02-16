// ============ PUZZLE CLIMBING: PENALTY TABLE & ROUTE DATA ============

// Penalty lookup: [direction, hand(R/L), holdAngle, weight(L/C/R)] -> penalty level (0-4)
// 0 = no penalty, 1 = slight, 2 = moderate, 3 = severe, 4 = instant fall
const PENALTY_TABLE_RAW = [
    // === UP (directly above) ===
    ["up","R",0,"C",0], ["up","L",0,"C",0],
    ["up","R",0,"L",1], ["up","L",0,"L",1],
    ["up","R",0,"R",1], ["up","L",0,"R",1],
    ["up","R",45,"C",1], ["up","L",45,"C",1],
    ["up","R",45,"L",0], ["up","L",45,"L",0],
    ["up","R",45,"R",2], ["up","L",45,"R",2],
    ["up","R",90,"C",2], ["up","L",90,"C",2],
    ["up","R",90,"L",1], ["up","L",90,"L",1],
    ["up","R",90,"R",3], ["up","L",90,"R",3],
    ["up","R",135,"C",2], ["up","L",135,"C",2],
    ["up","R",135,"L",1], ["up","L",135,"L",1],
    ["up","R",135,"R",3], ["up","L",135,"R",3],
    ["up","R",180,"C",0], ["up","L",180,"C",0],
    ["up","R",180,"L",1], ["up","L",180,"L",1],
    ["up","R",180,"R",1], ["up","L",180,"R",1],
    ["up","R",225,"C",2], ["up","L",225,"C",2],
    ["up","R",225,"L",3], ["up","L",225,"L",3],
    ["up","R",225,"R",1], ["up","L",225,"R",1],
    ["up","R",270,"C",2], ["up","L",270,"C",2],
    ["up","R",270,"L",3], ["up","L",270,"L",3],
    ["up","R",270,"R",1], ["up","L",270,"R",1],
    ["up","R",315,"C",1], ["up","L",315,"C",1],
    ["up","R",315,"L",2], ["up","L",315,"L",2],
    ["up","R",315,"R",0], ["up","L",315,"R",0],

    // === UP-LEFT (up 1, left 1) ===
    ["up-left","R",0,"C",1], ["up-left","L",0,"C",0],
    ["up-left","R",0,"L",2], ["up-left","L",0,"L",2],
    ["up-left","R",0,"R",2], ["up-left","L",0,"R",2],
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
    ["up-left","R",270,"L",4], ["up-left","L",270,"L",4],
    ["up-left","R",270,"R",1], ["up-left","L",270,"R",0],
    ["up-left","R",315,"C",2], ["up-left","L",315,"C",1],
    ["up-left","R",315,"L",3], ["up-left","L",315,"L",2],
    ["up-left","R",315,"R",1], ["up-left","L",315,"R",0],

    // === UP-RIGHT (up 1, right 1) ===
    ["up-right","R",0,"C",0], ["up-right","L",0,"C",1],
    ["up-right","R",0,"L",2], ["up-right","L",0,"L",2],
    ["up-right","R",0,"R",2], ["up-right","L",0,"R",2],
    ["up-right","R",45,"C",1], ["up-right","L",45,"C",2],
    ["up-right","R",45,"L",0], ["up-right","L",45,"L",1],
    ["up-right","R",45,"R",2], ["up-right","L",45,"R",3],
    ["up-right","R",90,"C",1], ["up-right","L",90,"C",2],
    ["up-right","R",90,"L",0], ["up-right","L",90,"L",1],
    ["up-right","R",90,"R",4], ["up-right","L",90,"R",4],
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

// Build O(1) lookup Map from the raw table
const PENALTY_MAP = new Map();
PENALTY_TABLE_RAW.forEach(entry => {
    const key = `${entry[0]}-${entry[1]}-${entry[2]}-${entry[3]}`;
    PENALTY_MAP.set(key, entry[4]);
});

// Penalty level names for UI display
const PENALTY_LEVEL_NAMES = ['None', 'Slight', 'Moderate', 'Severe', 'Fall'];

// Look up penalty for a given move configuration
function lookupPenalty(direction, hand, holdAngle, weight) {
    // Normalize angle to nearest 45 increment
    const normalized = normalizeAngle(holdAngle);
    const handCode = hand === 'left' ? 'L' : 'R';
    const weightCode = weight === 'left' ? 'L' : weight === 'right' ? 'R' : 'C';
    const key = `${direction}-${handCode}-${normalized}-${weightCode}`;
    const result = PENALTY_MAP.get(key);
    return result !== undefined ? result : 0;
}

// normalizeAngle defined in constants.js (loaded first)

// Get the ideal weight position for a given hold angle
function getIdealWeight(holdAngle) {
    const a = normalizeAngle(holdAngle);
    // 0, 180 = center; 45, 90, 135 = left (hold faces right, lean left); 225, 270, 315 = right
    if (a === 0 || a === 180) return 'center';
    if (a === 45 || a === 90 || a === 135) return 'left';
    return 'right'; // 225, 270, 315
}

// Determine move direction based on position change
function getMoveDirection(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    if (dx < 0) return 'up-left';
    if (dx > 0) return 'up-right';
    return 'up';
}

// Check if a move is a cross-body move
function isCrossMove(hand, direction) {
    // Right hand reaching left = cross, left hand reaching right = cross
    if (hand === 'right' && direction === 'up-left') return true;
    if (hand === 'left' && direction === 'up-right') return true;
    return false;
}

// ============ HAND-CRAFTED ROUTES (Areas 0-7) ============
// Each area has 3 routes: tutorial, practice, mastery
// Routes teach the new skill for that area and reinforce prior skills
//
// PENALTY QUICK REFERENCE (clean moves = penalty 0):
// UP + any hand + 0°/180° + center weight = 0
// UP + any + 45° + left weight = 0
// UP + any + 315° + right weight = 0
// UL + L + 0° + center = 0    |  UR + R + 0° + center = 0
// UL + L + 45° + left = 0     |  UR + R + 45° + left = 0
// UL + L + 270° + right = 0   |  UR + R + 90° + left = 0
// UL + L + 315° + right = 0   |  UR + R + 315° + right = 0
//
// GASTON: L hand @ 135° or R hand @ 225° → +1 effective penalty
// DISTANCE: 2+ spaces in any direction → +1 effective penalty (Reach negates)
// PUMP: 0=Fresh, 1=Pumped, 2=Struggling, 3+=Fall
// GRIP: decays every 3 moves. 0→1→2→3(fall). Chalk resets.

const routeDatabase = {

    // ================================================================
    // AREA 0: BOULDER GARDEN (No skill — teaches hand selection, direction)
    // ================================================================
    0: [
        {
            id: 'bg-1',
            name: 'First Steps',
            grade: 'V0',
            holdCount: 6,
            description: 'Straight up the center. Select a hand and grab each hold.',
            // SOLUTION: Any hand works. All moves UP + 0° + center = penalty 0.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 2 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 3 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 4 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 5 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 6 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 30 },
                pumpEfficiency: { maxPump: 0 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'bg-2',
            name: 'Zig-Zag',
            grade: 'V1',
            holdCount: 8,
            description: 'Left hand for left moves, right hand for right. Wrong hand = penalty!',
            // SOLUTION: L-R-L-R-R-L-L-R = all penalty 0.
            // Wrong hand = penalty 1 each (UL+R or UR+L at 0° center = 1).
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 1 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 2 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 3 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 4 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 5 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 7 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 40 },
                pumpEfficiency: { maxPump: 0 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'bg-3',
            name: 'Reading the Wall',
            grade: 'V2',
            holdCount: 8,
            description: 'Angled holds change the penalty. Watch how weight shifts after each grab.',
            // SOLUTION: R-any-any-L-any-any-any-any. Pump: 0,0,1,0,0,1,0,0 = max 2.
            // Move 3 (45° center) = penalty 1, shifts weight→L.
            // Move 4 (45° left via UL+L) = penalty 0. Weight stays L.
            // Move 6 (0° left) = penalty 1, shifts weight→C.
            // With shake after move 3: end pump=1. Without shake: pump=2.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 3 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 2, y: 5 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 7 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 45 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
    ],

    // ================================================================
    // AREA 1: CRIMP CANYON (Unlocks Cross — reduces gaston/cross penalty by 1)
    // ================================================================
    1: [
        {
            id: 'cc-1',
            name: 'Gaston Lesson',
            grade: 'V1',
            holdCount: 8,
            description: 'A 225° hold punishes R hand with gaston. Use L hand — or activate Cross!',
            // SOLUTION: any-L-R-R-R(+Cross)-any-L-any. Pump=0,0,0,1,1,1,1,1.
            // Move 4: 315° center = penalty 1, shifts weight→R. Shake: pump→0.
            // Move 5: UR to 225°. R hand forced (going right). Gaston!
            //   R without Cross: eff 2 (base 1 + gaston 1). Pump 0→2.
            //   R with Cross: eff 1. Pump 0→1.
            //   L hand: UR,L,225°,R = 3 → FALL.
            // With Cross: end pump=1. Without Cross: end pump=2 (tight).
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 2 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 3 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 2, gripDrain: 1, position: { x: 3, y: 4 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 4, y: 5 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 4, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 7 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 8 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 45 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'cc-2',
            name: 'Cross Country',
            grade: 'V2',
            holdCount: 10,
            description: 'Two gaston cruxes. Time your Cross skill carefully — cooldown is 3 moves.',
            // SOLUTION: Shake after move 3. Cross at moves 4 and 7.
            // Move 3: 315° center = P1. Shake→0.
            // Move 4: UR 225° R weight. R+Cross eff 1 (vs eff 2 without). CrossCD=3.
            // Move 7: UL 225° R weight. L hand, base=1 no gaston. P=1. Pump→2.
            //   (Cross available but L hand has no gaston, so base penalty only)
            // Without Cross at move 4: eff 2 → pump=2. Move 7 P=1 → pump=3 FALL!
            // Cross IS REQUIRED for this route.
            // Chalk needed (10 holds). Shake after move 8 for comfort.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 3 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 4, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 4, y: 5 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 4, y: 6 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 7 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 8 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 9 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 10 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 60 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'cc-3',
            name: 'The Crimp Crux',
            grade: 'V3',
            holdCount: 10,
            description: 'Back-to-back gastons. Cross is essential — time it for both cruxes.',
            // SOLUTION: Cross at move 4 (CrossCD=3), Cross again at move 7 (CD ready).
            // Move 3: P1 (315° center). Shake→0.
            // Move 4: UR 225° R. R+Cross eff 1. Pump=1.
            // Move 5-6: clean (315° R weight).
            // Move 7: UR 225° R. R+Cross eff 1. Pump=2.
            // Move 8: clean. Shake→1.
            // Without Cross: Move 4 eff 2, pump=2. Move 7 eff 2, pump=4 → FALL.
            // Cross REQUIRED.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 3 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 5 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 4, y: 7 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 4, y: 8 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 9 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 10 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 60 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
    ],

    // ================================================================
    // AREA 2: OVERHANG ALLEY (Unlocks Reach — negates distance +1 penalty)
    // ================================================================
    2: [
        {
            id: 'oa-1',
            name: 'The Long Reach',
            grade: 'V2',
            holdCount: 8,
            description: 'Big moves between holds. Reach negates the distance penalty.',
            // SOLUTION: Reach on move 1, Reach on move 5. 2 extended moves covered.
            // Move 1: dy=2, extended. With Reach: P0. Without: P1.
            // Move 3: normal. Move 5: dy=2 extended. Reach available (CD=0 by then).
            // Without Reach: 2 × P1 = pump 2. Tight but survivable.
            // With Reach: pump 0. Clean.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 2 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 3 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 5 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 7 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 9 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 10 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 45 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'oa-2',
            name: 'Stretch and Cross',
            grade: 'V3',
            holdCount: 10,
            description: 'Distance AND gaston penalties stack. Coordinate Reach and Cross.',
            // Extended moves to gaston holds.
            // Move 3: dy=2 extended to 315°, center weight = P1+1(dist) = eff 2. Reach: eff 1.
            // Move 5: UR 225° R weight. Gaston! R+Cross: eff 1.
            // Requires both Reach and Cross to survive.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 5 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 4, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 4, y: 7 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 8 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 9 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 10 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 11 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 60 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'oa-3',
            name: 'The Overhang',
            grade: 'V4',
            holdCount: 12,
            description: 'Extended gaston cruxes. Without both Reach and Cross, you will fall.',
            // 3 extended moves, 2 gaston cruxes.
            // Without Reach: distance penalties accumulate beyond pump budget.
            // Without Cross: gaston penalties accumulate beyond pump budget.
            // Both REQUIRED. 1 chalk needed (12 holds).
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 2, gripDrain: 1, position: { x: 2, y: 5 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 7 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: true, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 10 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 11 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 12 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 13 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 14 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 75 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
    ],

    // ================================================================
    // AREA 3: SLAB VALLEY (Unlocks Weight Shift — manually set weight)
    // ================================================================
    3: [
        {
            id: 'sv-1',
            name: 'Weight Control',
            grade: 'V2',
            holdCount: 8,
            description: 'Auto-shift leaves you at wrong weight. Use Z/X/C to pre-shift!',
            // SOLUTION: Weight Shift before moves where auto-shift misaligns.
            // Move 3: 45° at center = P1. After: weight→L.
            // Move 4: 315° at L weight = P2! With Weight Shift to R first: P0.
            // Move 5: 0° at R = P1. With Weight Shift to C first: P0.
            // Without Weight Shift: P1+P2+P1 = pump 4 → FALL.
            // With Weight Shift: P1+P0+P0 = pump 1. Manageable.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 3 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 5 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 7 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 45 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'sv-2',
            name: 'Balanced Traverse',
            grade: 'V3',
            holdCount: 10,
            description: 'Alternating angles demand constant weight adjustment. Cross for the gaston.',
            // Weight Shift + Cross needed. Angles alternate 45°/315°.
            // Gaston hold mid-route requires Cross.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 3 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 5 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 7 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 9 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 10 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 60 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'sv-3',
            name: 'The Slab Master',
            grade: 'V4',
            holdCount: 12,
            description: 'Weight traps, gastons, and distance. All three skills needed.',
            // Weight Shift + Cross + Reach ALL REQUIRED.
            // Extended move to gaston hold at wrong weight = triple threat.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 4 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 5 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 7 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: true, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 9 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 11 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 12 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 13 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 14 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 75 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
    ],

    // ================================================================
    // AREA 4: JUG JUNCTION (Unlocks Match — reset hands on matchable holds)
    // ================================================================
    4: [
        {
            id: 'jj-1',
            name: 'Match Point',
            grade: 'V2',
            holdCount: 10,
            description: 'Matching resets your hand sequence. Use it to pick the right hand for the next section.',
            // Route goes right then left. Matching at the turning point
            // lets you choose the optimal hand for the new direction.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 4, y: 3 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 4, y: 4 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 5 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 7 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 8 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 9 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 10 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 55 },
                pumpEfficiency: { maxPump: 0 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'jj-2',
            name: 'Match and Shift',
            grade: 'V3',
            holdCount: 12,
            description: 'Match at key points, shift weight for the angles. Cross for the gastons.',
            // Match + Weight Shift + Cross.
            // Match point lets player reset before a weight-demanding section.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 3 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 4 }, matchable: true, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 5 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 7 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 9 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 10 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 11 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 12 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 75 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'jj-3',
            name: 'The Junction Test',
            grade: 'V4',
            holdCount: 12,
            description: 'Match, Weight Shift, Cross, and Reach — all four skills tested.',
            // All 4 skills required. Extended gaston at wrong weight with hand trap.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 5 }, matchable: true, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 6 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 7 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 8 }, matchable: true, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 9 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 10 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 11 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 12 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 13 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 75 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
    ],

    // ================================================================
    // AREA 5: PINCH PEAK (Unlocks Deadpoint — shake→no pump, chalk→no grip decay)
    // ================================================================
    5: [
        {
            id: 'pp-1',
            name: 'Dead On',
            grade: 'V3',
            holdCount: 12,
            description: 'Shake before a hard move: Deadpoint negates the pump penalty!',
            // Deadpoint teaching: shake→next move free from pump change.
            // High-penalty move after shake = no pump increase (Deadpoint).
            // Without Deadpoint: pump budget exceeded on the hard moves.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 3 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 4, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 4, y: 5 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 7 }, matchable: true, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 8 }, matchable: false, isRest: false },
                { type: 'pinch', label: 'PINCH', angle: 225, pumpRating: 3, gripDrain: 3, position: { x: 3, y: 9 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 10 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 11 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 12 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 75 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'pp-2',
            name: 'Peak Performance',
            grade: 'V4',
            holdCount: 12,
            description: 'Deadpoint, Cross, and Weight Shift in concert. Time your recovery.',
            // Deadpoint + Cross + Weight Shift needed.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 3 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 5 }, matchable: true, isRest: false },
                { type: 'pinch', label: 'PINCH', angle: 45, pumpRating: 3, gripDrain: 3, position: { x: 2, y: 6 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 7 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 8 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 9 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 10 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 11 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 12 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 75 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'pp-3',
            name: 'The Pinch Gauntlet',
            grade: 'V5',
            holdCount: 14,
            description: 'All five skills. Deadpoint, Match, Weight Shift, Cross, Reach.',
            // All 5 skills required. Extended gaston at bad weight + deadpoint window.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 4 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 5 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 7 }, matchable: true, isRest: false },
                { type: 'pinch', label: 'PINCH', angle: 45, pumpRating: 3, gripDrain: 3, position: { x: 2, y: 8 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 9 }, matchable: false, isRest: false },
                { type: 'pinch', label: 'PINCH', angle: 225, pumpRating: 3, gripDrain: 3, position: { x: 3, y: 10 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 11 }, matchable: true, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 12 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 13 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 14 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 15 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 90 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
    ],

    // ================================================================
    // AREA 6: POCKET PARADISE (Unlocks Commit — reduce penalty by 1, 10-move CD)
    // ================================================================
    6: [
        {
            id: 'ppa-1',
            name: 'Committed',
            grade: 'V3',
            holdCount: 12,
            description: 'One brutal crux move. Commit reduces it from deadly to survivable.',
            // Commit teaching: single high-penalty move that Commit handles.
            // Without Commit: crux is eff 2, blowing pump budget.
            // With Commit: crux is eff 1, manageable.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 3 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 2, gripDrain: 1, position: { x: 3, y: 4 }, matchable: false, isRest: false },
                { type: 'pocket', label: 'POCKET', angle: 225, pumpRating: 3, gripDrain: 2, position: { x: 4, y: 5 }, matchable: false, isRest: false },
                { type: 'pocket', label: 'POCKET', angle: 225, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 7 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 9 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 10 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 11 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 12 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 75 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'ppa-2',
            name: 'Pick Your Battle',
            grade: 'V4',
            holdCount: 14,
            description: 'Multiple hard moves, one Commit. Choose wisely — cooldown is 10.',
            // Commit + Cross + Weight Shift + Reach.
            // Two crux moves but Commit only covers one. Other needs Cross.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 4 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 5 }, matchable: false, isRest: false },
                { type: 'pocket', label: 'POCKET', angle: 225, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 7 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 9 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 10 }, matchable: false, isRest: false },
                { type: 'pocket', label: 'POCKET', angle: 225, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 11 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 12 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 13 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 14 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 15 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 90 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'ppa-3',
            name: 'Paradise Lost',
            grade: 'V5',
            holdCount: 14,
            description: 'All six skills. Commit, Deadpoint, Match, Weight Shift, Cross, Reach.',
            // All 6 skills required.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 4 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 5 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 7 }, matchable: true, isRest: false },
                { type: 'pinch', label: 'PINCH', angle: 45, pumpRating: 3, gripDrain: 3, position: { x: 2, y: 8 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 9 }, matchable: false, isRest: false },
                { type: 'pocket', label: 'POCKET', angle: 225, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 10 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 11 }, matchable: true, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 12 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 13 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 14 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 15 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 90 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
    ],

    // ================================================================
    // AREA 7: STEEP STREET (Unlocks Bump — reposition without changing hands)
    // NOTE: Bump is not yet implemented in code. Routes designed for future use.
    // ================================================================
    7: [
        {
            id: 'ss-1',
            name: 'Bump and Go',
            grade: 'V3',
            holdCount: 12,
            description: 'Bump lets you reposition laterally without changing hands. Set up better angles.',
            // Bump teaching: situations where lateral repositioning avoids penalty.
            // Without Bump: forced cross-body or bad weight approach.
            // With Bump: reposition to better column, then make clean move.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 3 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 5 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 6 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 7 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 2, gripDrain: 1, position: { x: 3, y: 8 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 2, gripDrain: 1, position: { x: 3, y: 9 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 10 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 11 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 12 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 75 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'ss-2',
            name: 'Street Smarts',
            grade: 'V4',
            holdCount: 14,
            description: 'Bump repositioning, weight management, gaston control. Street wise climbing.',
            // Bump + Weight Shift + Cross + Match + Reach.
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 2 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 3 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 4 }, matchable: true, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 6 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 7 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 4, y: 8 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 4, y: 9 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 10 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 2, y: 11 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 12 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 13 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 14 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 15 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 90 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
        {
            id: 'ss-3',
            name: 'The Grand Wall',
            grade: 'V5',
            holdCount: 16,
            description: 'The capstone. ALL seven skills required. Read the entire wall first.',
            // ALL 7 SKILLS: Bump, Commit, Deadpoint, Match, Weight Shift, Cross, Reach.
            // Longest route. 2 chalks needed. Strategic skill usage throughout.
            holds: [
                // Opening: clean approach
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                // Reach section: extended move
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 4 }, matchable: false, isRest: false },
                // Weight + Cross section
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 5 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                // Match point for hand reset
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 7 }, matchable: true, isRest: false },
                // Bump section: reposition for better angle
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 9 }, matchable: false, isRest: false },
                // Deadpoint section: shake then hard move
                { type: 'pinch', label: 'PINCH', angle: 45, pumpRating: 3, gripDrain: 3, position: { x: 1, y: 10 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 11 }, matchable: true, isRest: false },
                // Commit section: ultra-hard crux
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 12 }, matchable: false, isRest: false },
                { type: 'pocket', label: 'POCKET', angle: 225, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 13 }, matchable: false, isRest: false },
                // Extended finish
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 14 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 15 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 16 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 17 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 120 },
                pumpEfficiency: { maxPump: 2 },
                noRecovery: true,
                flashClimb: true,
            }
        },
    ],
};

// Get routes for a location by index
function getRoutesForLocation(locationIndex) {
    return routeDatabase[locationIndex] || [];
}
