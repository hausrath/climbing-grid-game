const holdTypes = [
    { type: 'jug',       label: 'JUG',    color: '#a8db60' },
    { type: 'crimp',     label: 'CRIMP',   color: '#f5aaa2' },
    { type: 'sloper',    label: 'SLOPER',  color: '#6dbce3' },
    { type: 'pinch',     label: 'PINCH',   color: '#fad882' },
    { type: 'pocket',    label: 'POCKET',  color: '#c178de' },
    { type: 'edge',      label: 'EDGE',    color: '#738078' },
    { type: 'undercling', label: 'UNDER',  color: '#b06758' }
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

    // Crimps - only gaston angles penalized (L@135, R@225)
    ['crimp', 'L', 0, 0], ['crimp', 'R', 0, 0],
    ['crimp', 'L', 45, 0], ['crimp', 'R', 45, 0],
    ['crimp', 'L', 90, 0], ['crimp', 'R', 90, 0],
    ['crimp', 'L', 135, 1], ['crimp', 'R', 135, 0],
    ['crimp', 'L', 180, 0], ['crimp', 'R', 180, 0],
    ['crimp', 'L', 225, 0], ['crimp', 'R', 225, 1],
    ['crimp', 'L', 270, 0], ['crimp', 'R', 270, 0],
    ['crimp', 'L', 315, 0], ['crimp', 'R', 315, 0],

    // Slopers - only gaston angles penalized
    ['sloper', 'L', 0, 0], ['sloper', 'R', 0, 0],
    ['sloper', 'L', 45, 0], ['sloper', 'R', 45, 0],
    ['sloper', 'L', 90, 0], ['sloper', 'R', 90, 0],
    ['sloper', 'L', 135, 1], ['sloper', 'R', 135, 0],
    ['sloper', 'L', 180, 0], ['sloper', 'R', 180, 0],
    ['sloper', 'L', 225, 0], ['sloper', 'R', 225, 1],
    ['sloper', 'L', 270, 0], ['sloper', 'R', 270, 0],
    ['sloper', 'L', 315, 0], ['sloper', 'R', 315, 0],

    // Pinches, Pockets, Edges - only gaston angles penalized
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

    // Underclings - only gaston angles penalized
    ['undercling', 'L', 0, 0], ['undercling', 'R', 0, 0],
    ['undercling', 'L', 45, 0], ['undercling', 'R', 45, 0],
    ['undercling', 'L', 90, 0], ['undercling', 'R', 90, 0],
    ['undercling', 'L', 135, 1], ['undercling', 'R', 135, 0],
    ['undercling', 'L', 180, 0], ['undercling', 'R', 180, 0],
    ['undercling', 'L', 225, 0], ['undercling', 'R', 225, 1],
    ['undercling', 'L', 270, 0], ['undercling', 'R', 270, 0],
    ['undercling', 'L', 315, 0], ['undercling', 'R', 315, 0],
];

// Build O(1) lookup map for hand-hold pump
const HAND_HOLD_PUMP_MAP = new Map();
HAND_HOLD_PUMP_RAW.forEach(entry => {
    const key = `${entry[0]}-${entry[1]}-${entry[2]}`;
    HAND_HOLD_PUMP_MAP.set(key, entry[3]);
});


// Helper function to get hand-hold pump modifier
function getHandHoldPumpModifier(holdType, hand, angle) {
    const normalized = normalizeAngle(angle);
    const handCode = hand === 'left' ? 'L' : 'R';
    const key = `${holdType}-${handCode}-${normalized}`;
    return HAND_HOLD_PUMP_MAP.get(key) || 0;
}

// Normalize any angle to nearest 45-degree increment (0, 45, 90, ..., 315)
function normalizeAngle(angle) {
    // Handle negative angles
    let a = ((angle % 360) + 360) % 360;
    // Round to nearest 45
    return Math.round(a / 45) * 45 % 360;
}
