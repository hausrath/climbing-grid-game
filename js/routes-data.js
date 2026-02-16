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

// ============ HAND-CRAFTED ROUTES ============

const routeDatabase = {
    // Location index 0: Boulder Garden
    0: [
        {
            id: 'bg-route-1',
            name: 'The Warm-Up',
            grade: 'V0',
            holdCount: 6,
            description: 'A gentle intro. Jugs all the way up.',
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 3 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 4 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 5 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 6 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 30 },
                pumpEfficiency: { maxPump: 8 },
                noCross: true,
                flashClimb: true,
                perfectWeight: true,
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
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 3 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 270, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 5 }, matchable: true, isRest: true },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 6 }, matchable: false, isRest: false },
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
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 4, gripDrain: 2, position: { x: 2, y: 3 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 315, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 4 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 5 }, matchable: true, isRest: true },
                { type: 'sloper', label: 'SLOPER', angle: 135, pumpRating: 3, gripDrain: 5, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 7 }, matchable: false, isRest: false },
                { type: 'pinch', label: 'PINCH', angle: 270, pumpRating: 3, gripDrain: 3, position: { x: 1, y: 8 }, matchable: false, isRest: false },
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
        {
            id: 'bg-route-5',
            name: 'The Undercling Ladder',
            grade: 'V3',
            holdCount: 10,
            description: 'Underclings want upward pressure. Keep your weight centered and pull up, not out.',
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 2, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                // 180 degree hold - pure undercling. Center weight is ideal.
                { type: 'undercling', label: 'UNDER', angle: 180, pumpRating: 4, gripDrain: 2, position: { x: 2, y: 3 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 4 }, matchable: true, isRest: true },
                // 135 degree - lower-right undercling. Wants left weight.
                { type: 'undercling', label: 'UNDER', angle: 135, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 5 }, matchable: false, isRest: false },
                // 225 degree - lower-left undercling. Wants right weight.
                { type: 'undercling', label: 'UNDER', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 1, y: 6 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 7 }, matchable: true, isRest: true },
                // Pure undercling again - test if they've learned center weight
                { type: 'undercling', label: 'UNDER', angle: 180, pumpRating: 5, gripDrain: 2, position: { x: 3, y: 8 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 9 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 10 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 60 },
                pumpEfficiency: { maxPump: 18 },
                noCross: true,
                flashClimb: true,
                perfectWeight: true,
            }
        },
        {
            id: 'bg-route-6',
            name: 'The Sandwich',
            grade: 'V4',
            holdCount: 12,
            description: 'Sidepulls above, underclings below, and you in the middle. Read the angles carefully.',
            holds: [
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                // Right-facing sidepull. Wants left weight.
                { type: 'crimp', label: 'CRIMP', angle: 90, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                // Pure undercling after sidepull - weight needs to shift to center
                { type: 'undercling', label: 'UNDER', angle: 180, pumpRating: 4, gripDrain: 2, position: { x: 2, y: 3 }, matchable: false, isRest: false },
                // Left-facing hold. Wants right weight.
                { type: 'pinch', label: 'PINCH', angle: 270, pumpRating: 3, gripDrain: 3, position: { x: 1, y: 4 }, matchable: false, isRest: false },
                // Lower-left undercling at x:2. Wants right weight - matches!
                { type: 'undercling', label: 'UNDER', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 2, y: 5 }, matchable: false, isRest: false },
                // Rest hold - recover from the sandwich
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 6 }, matchable: true, isRest: true },
                // Now the top half: more angles, sloper for grip pressure
                { type: 'sloper', label: 'SLOPER', angle: 45, pumpRating: 3, gripDrain: 5, position: { x: 3, y: 7 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 4, gripDrain: 2, position: { x: 1, y: 8 }, matchable: false, isRest: false },
                // Lower-right undercling
                { type: 'undercling', label: 'UNDER', angle: 135, pumpRating: 5, gripDrain: 2, position: { x: 3, y: 9 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 2, gripDrain: 1, position: { x: 2, y: 10 }, matchable: false, isRest: false },
                { type: 'crimp', label: 'CRIMP', angle: 270, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 11 }, matchable: false, isRest: false },
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 12 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 75 },
                pumpEfficiency: { maxPump: 22 },
                noCross: true,
                flashClimb: true,
                perfectWeight: true,
            }
        },
        {
            id: 'bg-route-7',
            name: 'The Grand Problem',
            grade: 'V5',
            holdCount: 14,
            description: 'The boss route. Every angle, every hold type. Read the whole wall before you start.',
            isBoss: true,
            holds: [
                // Start - easy jug to settle in
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
                // Right-facing pinch - teaches weight shift early
                { type: 'pinch', label: 'PINCH', angle: 90, pumpRating: 3, gripDrain: 3, position: { x: 3, y: 2 }, matchable: false, isRest: false },
                // Sloper - grip drain test after pinch
                { type: 'sloper', label: 'SLOPER', angle: 45, pumpRating: 3, gripDrain: 5, position: { x: 2, y: 3 }, matchable: false, isRest: false },
                // Left-facing crimp - weight must shift right
                { type: 'crimp', label: 'CRIMP', angle: 270, pumpRating: 4, gripDrain: 2, position: { x: 1, y: 4 }, matchable: false, isRest: false },
                // Rest hold - first checkpoint
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 5 }, matchable: true, isRest: true },
                // Undercling section begins
                { type: 'undercling', label: 'UNDER', angle: 180, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 6 }, matchable: false, isRest: false },
                // Lower-left undercling - must manage weight carefully
                { type: 'undercling', label: 'UNDER', angle: 225, pumpRating: 5, gripDrain: 2, position: { x: 1, y: 7 }, matchable: false, isRest: false },
                // Pocket for variety - moderate pump but low grip drain
                { type: 'pocket', label: 'POCKET', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 8 }, matchable: false, isRest: false },
                // The crux: sloper at awkward angle with big traverse
                { type: 'sloper', label: 'SLOPER', angle: 315, pumpRating: 4, gripDrain: 5, position: { x: 3, y: 9 }, matchable: false, isRest: false },
                // Edge to recover grip drain from sloper
                { type: 'edge', label: 'EDGE', angle: 90, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 10 }, matchable: false, isRest: false },
                // Final push - traverse left with right-facing crimp
                { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 4, gripDrain: 2, position: { x: 1, y: 11 }, matchable: false, isRest: false },
                // Lower-right undercling - tests end-game weight management
                { type: 'undercling', label: 'UNDER', angle: 135, pumpRating: 5, gripDrain: 2, position: { x: 3, y: 12 }, matchable: false, isRest: false },
                // Back to center for the finish
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 2, gripDrain: 1, position: { x: 2, y: 13 }, matchable: true, isRest: false },
                // Top out - rest hold
                { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 14 }, matchable: true, isRest: true },
            ],
            stars: {
                completion: true,
                speed: { timeLimit: 90 },
                pumpEfficiency: { maxPump: 28 },
                noCross: true,
                flashClimb: true,
                perfectWeight: true,
            }
        },
    ],
};

// Get routes for a location by index
function getRoutesForLocation(locationIndex) {
    return routeDatabase[locationIndex] || [];
}
