const holdTypes = [
    { type: 'jug',       label: 'JUG',    color: '#a8db60' },
    { type: 'crimp',     label: 'CRIMP',   color: '#f5aaa2' },
    { type: 'sloper',    label: 'SLOPER',  color: '#6dbce3' },
    { type: 'pinch',     label: 'PINCH',   color: '#fad882' },
    { type: 'pocket',    label: 'POCKET',  color: '#c178de' },
    { type: 'edge',      label: 'EDGE',    color: '#738078' },
    { type: 'undercling', label: 'UNDER',  color: '#b06758' }
];

// ============ HOLD PUMP COST ============
// Maps hold type → pump accumulation ticks per move. Threshold is 3 ticks = 1 pump stage advance.
const HOLD_PUMP_COST = {
    jug: 1,
    edge: 2,
    pocket: 2,
    undercling: 2,
    pinch: 3,
    crimp: 4,
    sloper: 4
};

// Normalize any angle to nearest 45-degree increment (0, 45, 90, ..., 315)
function normalizeAngle(angle) {
    // Handle negative angles
    let a = ((angle % 360) + 360) % 360;
    // Round to nearest 45
    return Math.round(a / 45) * 45 % 360;
}
