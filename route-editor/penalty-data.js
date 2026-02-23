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

// Hold grip cost — ticks per move. Threshold is 3 ticks = 1 grip stage advance.
const HOLD_GRIP_COST = {
    jug: 1,
    edge: 1,
    pocket: 2,
    undercling: 2,
    pinch: 3,
    crimp: 4,
    sloper: 4
};

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
