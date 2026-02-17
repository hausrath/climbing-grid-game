// ============ ROUTE EDITOR: PENALTY DATA & HELPERS ============
// Standalone copy of game logic — no dependency on main game files

// Hold type definitions with colors
const holdTypes = [
    { type: 'jug',       label: 'JUG',    color: '#a8db60' },
    { type: 'crimp',     label: 'CRIMP',   color: '#f5aaa2' },
    { type: 'sloper',    label: 'SLOPER',  color: '#6dbce3' },
    { type: 'pinch',     label: 'PINCH',   color: '#fad882' },
    { type: 'pocket',    label: 'POCKET',  color: '#c178de' },
    { type: 'edge',      label: 'EDGE',    color: '#738078' },
    { type: 'undercling', label: 'UNDER',  color: '#b06758' }
];

// State labels
const PUMP_STATE_LABELS = ['Fresh', 'Pumped', 'Struggling'];
const GRIP_STATE_LABELS = ['Chalked', 'Weakening', 'Slipping'];
const PENALTY_LEVEL_NAMES = ['None', 'Slight', 'Moderate', 'Severe', 'Fall'];

// Normalize any angle to nearest 45-degree increment
function normalizeAngle(angle) {
    let a = ((angle % 360) + 360) % 360;
    return Math.round(a / 45) * 45 % 360;
}

// ============ PENALTY TABLE ============
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

// Build O(1) lookup Map
const PENALTY_MAP = new Map();
PENALTY_TABLE_RAW.forEach(entry => {
    const key = `${entry[0]}-${entry[1]}-${entry[2]}-${entry[3]}`;
    PENALTY_MAP.set(key, entry[4]);
});

function lookupPenalty(direction, hand, holdAngle, weight) {
    const normalized = normalizeAngle(holdAngle);
    const handCode = hand === 'left' ? 'L' : 'R';
    const weightCode = weight === 'left' ? 'L' : weight === 'right' ? 'R' : 'C';
    const key = `${direction}-${handCode}-${normalized}-${weightCode}`;
    const result = PENALTY_MAP.get(key);
    return result !== undefined ? result : 0;
}

// ============ HAND-HOLD PUMP MODIFIERS (Gaston) ============
const HAND_HOLD_PUMP_RAW = [
    ['jug', 'L', 0, 0], ['jug', 'R', 0, 0],
    ['jug', 'L', 45, 0], ['jug', 'R', 45, 0],
    ['jug', 'L', 90, 0], ['jug', 'R', 90, 0],
    ['jug', 'L', 135, 0], ['jug', 'R', 135, 0],
    ['jug', 'L', 180, 0], ['jug', 'R', 180, 0],
    ['jug', 'L', 225, 0], ['jug', 'R', 225, 0],
    ['jug', 'L', 270, 0], ['jug', 'R', 270, 0],
    ['jug', 'L', 315, 0], ['jug', 'R', 315, 0],
    ['crimp', 'L', 0, 0], ['crimp', 'R', 0, 0],
    ['crimp', 'L', 45, 0], ['crimp', 'R', 45, 0],
    ['crimp', 'L', 90, 0], ['crimp', 'R', 90, 0],
    ['crimp', 'L', 135, 1], ['crimp', 'R', 135, 0],
    ['crimp', 'L', 180, 0], ['crimp', 'R', 180, 0],
    ['crimp', 'L', 225, 0], ['crimp', 'R', 225, 1],
    ['crimp', 'L', 270, 0], ['crimp', 'R', 270, 0],
    ['crimp', 'L', 315, 0], ['crimp', 'R', 315, 0],
    ['sloper', 'L', 0, 0], ['sloper', 'R', 0, 0],
    ['sloper', 'L', 45, 0], ['sloper', 'R', 45, 0],
    ['sloper', 'L', 90, 0], ['sloper', 'R', 90, 0],
    ['sloper', 'L', 135, 1], ['sloper', 'R', 135, 0],
    ['sloper', 'L', 180, 0], ['sloper', 'R', 180, 0],
    ['sloper', 'L', 225, 0], ['sloper', 'R', 225, 1],
    ['sloper', 'L', 270, 0], ['sloper', 'R', 270, 0],
    ['sloper', 'L', 315, 0], ['sloper', 'R', 315, 0],
    ['pinch', 'L', 0, 0], ['pinch', 'R', 0, 0],
    ['pinch', 'L', 45, 0], ['pinch', 'R', 45, 0],
    ['pinch', 'L', 90, 0], ['pinch', 'R', 90, 0],
    ['pinch', 'L', 135, 1], ['pinch', 'R', 135, 0],
    ['pinch', 'L', 180, 0], ['pinch', 'R', 180, 0],
    ['pinch', 'L', 225, 0], ['pinch', 'R', 225, 1],
    ['pinch', 'L', 270, 0], ['pinch', 'R', 270, 0],
    ['pinch', 'L', 315, 0], ['pinch', 'R', 315, 0],
    ['pocket', 'L', 0, 0], ['pocket', 'R', 0, 0],
    ['pocket', 'L', 45, 0], ['pocket', 'R', 45, 0],
    ['pocket', 'L', 90, 0], ['pocket', 'R', 90, 0],
    ['pocket', 'L', 135, 1], ['pocket', 'R', 135, 0],
    ['pocket', 'L', 180, 0], ['pocket', 'R', 180, 0],
    ['pocket', 'L', 225, 0], ['pocket', 'R', 225, 1],
    ['pocket', 'L', 270, 0], ['pocket', 'R', 270, 0],
    ['pocket', 'L', 315, 0], ['pocket', 'R', 315, 0],
    ['edge', 'L', 0, 0], ['edge', 'R', 0, 0],
    ['edge', 'L', 45, 0], ['edge', 'R', 45, 0],
    ['edge', 'L', 90, 0], ['edge', 'R', 90, 0],
    ['edge', 'L', 135, 1], ['edge', 'R', 135, 0],
    ['edge', 'L', 180, 0], ['edge', 'R', 180, 0],
    ['edge', 'L', 225, 0], ['edge', 'R', 225, 1],
    ['edge', 'L', 270, 0], ['edge', 'R', 270, 0],
    ['edge', 'L', 315, 0], ['edge', 'R', 315, 0],
    ['undercling', 'L', 0, 0], ['undercling', 'R', 0, 0],
    ['undercling', 'L', 45, 0], ['undercling', 'R', 45, 0],
    ['undercling', 'L', 90, 0], ['undercling', 'R', 90, 0],
    ['undercling', 'L', 135, 1], ['undercling', 'R', 135, 0],
    ['undercling', 'L', 180, 0], ['undercling', 'R', 180, 0],
    ['undercling', 'L', 225, 0], ['undercling', 'R', 225, 1],
    ['undercling', 'L', 270, 0], ['undercling', 'R', 270, 0],
    ['undercling', 'L', 315, 0], ['undercling', 'R', 315, 0],
];

const HAND_HOLD_PUMP_MAP = new Map();
HAND_HOLD_PUMP_RAW.forEach(entry => {
    const key = `${entry[0]}-${entry[1]}-${entry[2]}`;
    HAND_HOLD_PUMP_MAP.set(key, entry[3]);
});

function getHandHoldPumpModifier(holdType, hand, angle) {
    const normalized = normalizeAngle(angle);
    const handCode = hand === 'left' ? 'L' : 'R';
    const key = `${holdType}-${handCode}-${normalized}`;
    return HAND_HOLD_PUMP_MAP.get(key) || 0;
}

// ============ DIRECTION & MOVE HELPERS ============

function getMoveDirection(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    if (dx < 0) return 'up-left';
    if (dx > 0) return 'up-right';
    return 'up';
}

function isCrossMove(hand, direction) {
    if (hand === 'right' && direction === 'up-left') return true;
    if (hand === 'left' && direction === 'up-right') return true;
    return false;
}

function getIdealWeight(holdAngle) {
    const a = normalizeAngle(holdAngle);
    if (a === 0 || a === 180) return 'center';
    if (a === 45 || a === 90 || a === 135) return 'left';
    return 'right';
}
