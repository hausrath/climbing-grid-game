const holdTypes = [
    { type: 'jug',       label: 'JUG',    basePumpRating: 1, baseGripDrain: 1, color: '#a8db60' },
    { type: 'crimp',     label: 'CRIMP',   basePumpRating: 4, baseGripDrain: 2, color: '#f5aaa2' },
    { type: 'sloper',    label: 'SLOPER',  basePumpRating: 3, baseGripDrain: 5, color: '#6dbce3' },
    { type: 'pinch',     label: 'PINCH',   basePumpRating: 3, baseGripDrain: 3, color: '#fad882' },
    { type: 'pocket',    label: 'POCKET',  basePumpRating: 3, baseGripDrain: 2, color: '#c178de' },
    { type: 'edge',      label: 'EDGE',    basePumpRating: 3, baseGripDrain: 2, color: '#738078' },
    { type: 'undercling', label: 'UNDER',  basePumpRating: 4, baseGripDrain: 2, color: '#b06758' }
];

// ============ PUMP/GRIP SEPARATION SYSTEM ============

// HAND-HOLD PUMP MODIFIERS
// Maps (holdType, hand, angle) → pump modifier
// Pump represents muscular cost - affected by which hand grabs which hold
const HAND_HOLD_PUMP_RAW = [
    // Jugs - minimal hand preference (easy for both hands)
    ['jug', 'L', 0, 0], ['jug', 'R', 0, 0],
    ['jug', 'L', 45, 0], ['jug', 'R', 45, 0],
    ['jug', 'L', 90, 0], ['jug', 'R', 90, 0],
    ['jug', 'L', 135, 0], ['jug', 'R', 135, 0],
    ['jug', 'L', 180, 0], ['jug', 'R', 180, 0],
    ['jug', 'L', 225, 0], ['jug', 'R', 225, 0],
    ['jug', 'L', 270, 0], ['jug', 'R', 270, 0],
    ['jug', 'L', 315, 0], ['jug', 'R', 315, 0],

    // Crimps - significant hand-angle interaction (hard when mis-matched)
    ['crimp', 'L', 0, 0], ['crimp', 'R', 0, 0],
    ['crimp', 'L', 45, 1], ['crimp', 'R', 45, 0],  // Right hand easier on left-facing
    ['crimp', 'L', 90, 1], ['crimp', 'R', 90, 0],
    ['crimp', 'L', 135, 1], ['crimp', 'R', 135, 0],
    ['crimp', 'L', 180, 0], ['crimp', 'R', 180, 0],
    ['crimp', 'L', 225, 0], ['crimp', 'R', 225, 1], // Left hand easier on right-facing
    ['crimp', 'L', 270, 0], ['crimp', 'R', 270, 1],
    ['crimp', 'L', 315, 0], ['crimp', 'R', 315, 1],

    // Slopers - moderate hand preference
    ['sloper', 'L', 0, 0], ['sloper', 'R', 0, 0],
    ['sloper', 'L', 45, 1], ['sloper', 'R', 45, 0],
    ['sloper', 'L', 90, 1], ['sloper', 'R', 90, 0],
    ['sloper', 'L', 135, 1], ['sloper', 'R', 135, 0],
    ['sloper', 'L', 180, 0], ['sloper', 'R', 180, 0],
    ['sloper', 'L', 225, 0], ['sloper', 'R', 225, 1],
    ['sloper', 'L', 270, 0], ['sloper', 'R', 270, 1],
    ['sloper', 'L', 315, 0], ['sloper', 'R', 315, 1],

    // Pinches, Pockets, Edges - moderate hand preference
    ['pinch', 'L', 0, 0], ['pinch', 'R', 0, 0],
    ['pinch', 'L', 45, 1], ['pinch', 'R', 45, 0],
    ['pinch', 'L', 90, 1], ['pinch', 'R', 90, 0],
    ['pinch', 'L', 135, 1], ['pinch', 'R', 135, 0],
    ['pinch', 'L', 180, 0], ['pinch', 'R', 180, 0],
    ['pinch', 'L', 225, 0], ['pinch', 'R', 225, 1],
    ['pinch', 'L', 270, 0], ['pinch', 'R', 270, 1],
    ['pinch', 'L', 315, 0], ['pinch', 'R', 315, 1],

    ['pocket', 'L', 0, 0], ['pocket', 'R', 0, 0],
    ['pocket', 'L', 45, 1], ['pocket', 'R', 45, 0],
    ['pocket', 'L', 90, 1], ['pocket', 'R', 90, 0],
    ['pocket', 'L', 135, 1], ['pocket', 'R', 135, 0],
    ['pocket', 'L', 180, 0], ['pocket', 'R', 180, 0],
    ['pocket', 'L', 225, 0], ['pocket', 'R', 225, 1],
    ['pocket', 'L', 270, 0], ['pocket', 'R', 270, 1],
    ['pocket', 'L', 315, 0], ['pocket', 'R', 315, 1],

    ['edge', 'L', 0, 0], ['edge', 'R', 0, 0],
    ['edge', 'L', 45, 1], ['edge', 'R', 45, 0],
    ['edge', 'L', 90, 1], ['edge', 'R', 90, 0],
    ['edge', 'L', 135, 1], ['edge', 'R', 135, 0],
    ['edge', 'L', 180, 0], ['edge', 'R', 180, 0],
    ['edge', 'L', 225, 0], ['edge', 'R', 225, 1],
    ['edge', 'L', 270, 0], ['edge', 'R', 270, 1],
    ['edge', 'L', 315, 0], ['edge', 'R', 315, 1],

    // Underclings - hand dependent
    ['undercling', 'L', 0, 0], ['undercling', 'R', 0, 0],
    ['undercling', 'L', 45, 1], ['undercling', 'R', 45, 0],
    ['undercling', 'L', 90, 1], ['undercling', 'R', 90, 0],
    ['undercling', 'L', 135, 1], ['undercling', 'R', 135, 0],
    ['undercling', 'L', 180, 0], ['undercling', 'R', 180, 0],
    ['undercling', 'L', 225, 0], ['undercling', 'R', 225, 1],
    ['undercling', 'L', 270, 0], ['undercling', 'R', 270, 1],
    ['undercling', 'L', 315, 0], ['undercling', 'R', 315, 1],
];

// Build O(1) lookup map for hand-hold pump
const HAND_HOLD_PUMP_MAP = new Map();
HAND_HOLD_PUMP_RAW.forEach(entry => {
    const key = `${entry[0]}-${entry[1]}-${entry[2]}`;
    HAND_HOLD_PUMP_MAP.set(key, entry[3]);
});

// WEIGHT-DIRECTION GRIP MODIFIERS
// Maps (weight, direction, angle) → grip modifier (+0 or +1)
// 0 = good/neutral weight position, 1 = bad weight position (+1 extra grip drain)
const WEIGHT_DIRECTION_GRIP_RAW = [
    // UP - straight up movement
    ['L', 'up', 0, 0], ['C', 'up', 0, 0], ['R', 'up', 0, 0],
    ['L', 'up', 45, 0], ['C', 'up', 45, 0], ['R', 'up', 45, 1],
    ['L', 'up', 90, 0], ['C', 'up', 90, 1], ['R', 'up', 90, 1],
    ['L', 'up', 135, 0], ['C', 'up', 135, 1], ['R', 'up', 135, 1],
    ['L', 'up', 180, 0], ['C', 'up', 180, 0], ['R', 'up', 180, 0],
    ['L', 'up', 225, 1], ['C', 'up', 225, 1], ['R', 'up', 225, 0],
    ['L', 'up', 270, 1], ['C', 'up', 270, 1], ['R', 'up', 270, 0],
    ['L', 'up', 315, 1], ['C', 'up', 315, 0], ['R', 'up', 315, 0],

    // UP-LEFT - diagonal left movement
    ['L', 'up-left', 0, 0], ['C', 'up-left', 0, 0], ['R', 'up-left', 0, 1],
    ['L', 'up-left', 45, 0], ['C', 'up-left', 45, 0], ['R', 'up-left', 45, 1],
    ['L', 'up-left', 90, 0], ['C', 'up-left', 90, 1], ['R', 'up-left', 90, 1],
    ['L', 'up-left', 135, 0], ['C', 'up-left', 135, 1], ['R', 'up-left', 135, 1],
    ['L', 'up-left', 180, 1], ['C', 'up-left', 180, 1], ['R', 'up-left', 180, 1],
    ['L', 'up-left', 225, 1], ['C', 'up-left', 225, 0], ['R', 'up-left', 225, 1],
    ['L', 'up-left', 270, 1], ['C', 'up-left', 270, 0], ['R', 'up-left', 270, 0],
    ['L', 'up-left', 315, 1], ['C', 'up-left', 315, 0], ['R', 'up-left', 315, 0],

    // UP-RIGHT - diagonal right movement
    ['L', 'up-right', 0, 1], ['C', 'up-right', 0, 0], ['R', 'up-right', 0, 0],
    ['L', 'up-right', 45, 0], ['C', 'up-right', 45, 0], ['R', 'up-right', 45, 0],
    ['L', 'up-right', 90, 0], ['C', 'up-right', 90, 0], ['R', 'up-right', 90, 0],
    ['L', 'up-right', 135, 1], ['C', 'up-right', 135, 0], ['R', 'up-right', 135, 0],
    ['L', 'up-right', 180, 1], ['C', 'up-right', 180, 1], ['R', 'up-right', 180, 1],
    ['L', 'up-right', 225, 1], ['C', 'up-right', 225, 1], ['R', 'up-right', 225, 1],
    ['L', 'up-right', 270, 1], ['C', 'up-right', 270, 1], ['R', 'up-right', 270, 0],
    ['L', 'up-right', 315, 1], ['C', 'up-right', 315, 0], ['R', 'up-right', 315, 0],
];

// Build O(1) lookup map for weight-direction grip
const WEIGHT_DIRECTION_GRIP_MAP = new Map();
WEIGHT_DIRECTION_GRIP_RAW.forEach(entry => {
    const key = `${entry[0]}-${entry[1]}-${entry[2]}`;
    WEIGHT_DIRECTION_GRIP_MAP.set(key, entry[3]);
});

// Helper function to get hand-hold pump modifier
function getHandHoldPumpModifier(holdType, hand, angle) {
    const normalized = normalizeAngle(angle);
    const handCode = hand === 'left' ? 'L' : 'R';
    const key = `${holdType}-${handCode}-${normalized}`;
    return HAND_HOLD_PUMP_MAP.get(key) || 0;
}

// Helper function to get weight-direction grip modifier (+0 or +1)
function getWeightDirectionGripModifier(weight, direction, angle) {
    const normalized = normalizeAngle(angle);
    const weightCode = weight === 'left' ? 'L' : weight === 'right' ? 'R' : 'C';
    const key = `${weightCode}-${direction}-${normalized}`;
    return WEIGHT_DIRECTION_GRIP_MAP.get(key) || 0;
}

// Normalize any angle to nearest 45-degree increment (0, 45, 90, ..., 315)
function normalizeAngle(angle) {
    // Handle negative angles
    let a = ((angle % 360) + 360) % 360;
    // Round to nearest 45
    return Math.round(a / 45) * 45 % 360;
}
