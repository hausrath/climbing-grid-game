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

    // === LEFT (same row, moving left) — mirrors up-left ===
    ["left","R",0,"C",1], ["left","L",0,"C",0],
    ["left","R",0,"L",2], ["left","L",0,"L",2],
    ["left","R",0,"R",2], ["left","L",0,"R",2],
    ["left","R",45,"C",3], ["left","L",45,"C",1],
    ["left","R",45,"L",2], ["left","L",45,"L",0],
    ["left","R",45,"R",4], ["left","L",45,"R",3],
    ["left","R",90,"C",3], ["left","L",90,"C",2],
    ["left","R",90,"L",3], ["left","L",90,"L",1],
    ["left","R",90,"R",4], ["left","L",90,"R",4],
    ["left","R",135,"C",3], ["left","L",135,"C",2],
    ["left","R",135,"L",3], ["left","L",135,"L",1],
    ["left","R",135,"R",4], ["left","L",135,"R",4],
    ["left","R",180,"C",3], ["left","L",180,"C",1],
    ["left","R",180,"L",4], ["left","L",180,"L",3],
    ["left","R",180,"R",3], ["left","L",180,"R",2],
    ["left","R",225,"C",4], ["left","L",225,"C",1],
    ["left","R",225,"L",3], ["left","L",225,"L",3],
    ["left","R",225,"R",2], ["left","L",225,"R",1],
    ["left","R",270,"C",2], ["left","L",270,"C",1],
    ["left","R",270,"L",4], ["left","L",270,"L",4],
    ["left","R",270,"R",1], ["left","L",270,"R",0],
    ["left","R",315,"C",2], ["left","L",315,"C",1],
    ["left","R",315,"L",3], ["left","L",315,"L",2],
    ["left","R",315,"R",1], ["left","L",315,"R",0],

    // === RIGHT (same row, moving right) — mirrors up-right ===
    ["right","R",0,"C",0], ["right","L",0,"C",1],
    ["right","R",0,"L",2], ["right","L",0,"L",2],
    ["right","R",0,"R",2], ["right","L",0,"R",2],
    ["right","R",45,"C",1], ["right","L",45,"C",2],
    ["right","R",45,"L",0], ["right","L",45,"L",1],
    ["right","R",45,"R",2], ["right","L",45,"R",3],
    ["right","R",90,"C",1], ["right","L",90,"C",2],
    ["right","R",90,"L",0], ["right","L",90,"L",1],
    ["right","R",90,"R",4], ["right","L",90,"R",4],
    ["right","R",135,"C",1], ["right","L",135,"C",4],
    ["right","R",135,"L",1], ["right","L",135,"L",2],
    ["right","R",135,"R",3], ["right","L",135,"R",3],
    ["right","R",180,"C",1], ["right","L",180,"C",3],
    ["right","R",180,"L",2], ["right","L",180,"L",3],
    ["right","R",180,"R",3], ["right","L",180,"R",4],
    ["right","R",225,"C",2], ["right","L",225,"C",3],
    ["right","R",225,"L",4], ["right","L",225,"L",4],
    ["right","R",225,"R",1], ["right","L",225,"R",3],
    ["right","R",270,"C",2], ["right","L",270,"C",3],
    ["right","R",270,"L",4], ["right","L",270,"L",4],
    ["right","R",270,"R",1], ["right","L",270,"R",3],
    ["right","R",315,"C",1], ["right","L",315,"C",3],
    ["right","R",315,"L",3], ["right","L",315,"L",4],
    ["right","R",315,"R",0], ["right","L",315,"R",2],
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
    const dy = toY - fromY;
    const dx = toX - fromX;
    if (dy === 0) {
        return dx < 0 ? 'left' : 'right';
    }
    if (dx < 0) return 'up-left';
    if (dx > 0) return 'up-right';
    return 'up';
}

// Check if a move is a cross-body move
function isCrossMove(hand, direction) {
    // Right hand reaching left = cross, left hand reaching right = cross
    if (hand === 'right' && (direction === 'up-left' || direction === 'left')) return true;
    if (hand === 'left' && (direction === 'up-right' || direction === 'right')) return true;
    return false;
}

// ============ ROUTE DATABASE ============
// Route data is defined in routes-area0.js through routes-area7.js
// Those files must be loaded before this one in index.html.
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

const routeDatabase = {
    0: ROUTES_AREA_0,
    1: ROUTES_AREA_1,
    2: ROUTES_AREA_2,
    3: ROUTES_AREA_3,
    4: ROUTES_AREA_4,
    5: ROUTES_AREA_5,
    6: ROUTES_AREA_6,
    7: ROUTES_AREA_7,
};

// Get routes for a location by index
function getRoutesForLocation(locationIndex) {
    return routeDatabase[locationIndex] || [];
}
