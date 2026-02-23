// AREA 5: PINCH PEAK (Unlocks Deadpoint — shake→no pump, chalk→no grip decay)
const ROUTES_AREA_5 = [
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
            gripEfficiency: true,
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
            gripEfficiency: true,
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
            gripEfficiency: true,
            flashClimb: true,
        }
    },
];
