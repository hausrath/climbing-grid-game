// AREA 6: POCKET PARADISE (Unlocks Commit — reduce penalty by 1, 10-move CD)
const ROUTES_AREA_6 = [
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
            gripEfficiency: true,
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
            gripEfficiency: true,
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
            gripEfficiency: true,
            flashClimb: true,
        }
    },
];
