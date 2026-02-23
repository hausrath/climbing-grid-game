// AREA 3: SLAB VALLEY (Unlocks Weight Shift — manually set weight)
const ROUTES_AREA_3 = [
    {
        id: 'sv-1',
        name: 'Weight Control',
        grade: 'V2',
        holdCount: 8,
        description: 'Wrong weight means higher pump. Use Z/X/C to position your weight before each move.',
        // SOLUTION: Weight Shift before moves where default center weight misaligns.
        // Move 3: 45° at center = P1. After: weight→L.
        // Move 4: 315° at L weight = P2! With Weight Shift to R first: P0.
        // Move 5: 0° at R = P1. With Weight Shift to C first: P0.
        // Without Weight Shift: P1+P2+P1 = pump 4 → FALL.
        // With Weight Shift: P1+P0+P0 = pump 1. Manageable.
        holds: [
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 2 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 3 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 4 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 5 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 6 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 7 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: false, isRest: true },
        ],
        stars: {
            completion: true,
            speed: { timeLimit: 45 },
            pumpEfficiency: { maxPump: 2 },
            gripEfficiency: true,
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
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 2 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 3 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 4 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 5 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 6 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 7 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 9 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 10 }, matchable: false, isRest: true },
        ],
        stars: {
            completion: true,
            speed: { timeLimit: 60 },
            pumpEfficiency: { maxPump: 2 },
            gripEfficiency: true,
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
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 2 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 4 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 5 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 6 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 7 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 9 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 11 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 12 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 13 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 14 }, matchable: false, isRest: true },
        ],
        stars: {
            completion: true,
            speed: { timeLimit: 75 },
            pumpEfficiency: { maxPump: 2 },
            gripEfficiency: true,
            flashClimb: true,
        }
    },
];
