// AREA 7: STEEP STREET (Unlocks Bump — reposition without changing hands)
// NOTE: Bump is not yet implemented in code. Routes designed for future use.
const ROUTES_AREA_7 = [
    {
        id: 'ss-1',
        name: 'Bump and Go',
        grade: 'V3',
        holdCount: 12,
        description: 'Bump lets you reposition laterally without changing hands. Set up better angles.',
        // Bump teaching: situations where lateral repositioning avoids penalty.
        // Without Bump: forced cross-body or bad weight approach.
        // With Bump: reposition to better column, then make clean move.
        holds: [
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: true, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 3 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 4 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 5 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 6 }, matchable: true, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 7 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 315, pumpRating: 2, gripDrain: 1, position: { x: 3, y: 8 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 315, pumpRating: 2, gripDrain: 1, position: { x: 3, y: 9 }, matchable: true, isRest: false },
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
        id: 'ss-2',
        name: 'Street Smarts',
        grade: 'V4',
        holdCount: 14,
        description: 'Bump repositioning, weight management, gaston control. Street wise climbing.',
        // Bump + Weight Shift + Cross + Match + Reach.
        holds: [
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 2 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 45, pumpRating: 3, gripDrain: 2, position: { x: 1, y: 3 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 4 }, matchable: true, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 6 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 7 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 4, y: 8 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 4, y: 9 }, matchable: true, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 10 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 2, y: 11 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 12 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 13 }, matchable: false, isRest: false },
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
        id: 'ss-3',
        name: 'The Grand Wall',
        grade: 'V5',
        holdCount: 16,
        description: 'The capstone. ALL seven skills required. Read the entire wall first.',
        // ALL 7 SKILLS: Bump, Commit, Deadpoint, Match, Weight Shift, Cross, Reach.
        // Longest route. 2 chalks needed. Strategic skill usage throughout.
        holds: [
            // Opening: clean approach
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
            // Reach section: extended move
            { type: 'crimp', label: 'CRIMP', angle: 0, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 4 }, matchable: false, isRest: false },
            // Weight + Cross section
            { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 5 }, matchable: false, isRest: false },
            { type: 'crimp', label: 'CRIMP', angle: 225, pumpRating: 4, gripDrain: 2, position: { x: 3, y: 6 }, matchable: false, isRest: false },
            // Match point for hand reset
            { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 7 }, matchable: true, isRest: false },
            // Bump section: reposition for better angle
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 45, pumpRating: 2, gripDrain: 1, position: { x: 1, y: 9 }, matchable: false, isRest: false },
            // Deadpoint section: shake then hard move
            { type: 'pinch', label: 'PINCH', angle: 45, pumpRating: 3, gripDrain: 3, position: { x: 1, y: 10 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 11 }, matchable: true, isRest: false },
            // Commit section: ultra-hard crux
            { type: 'crimp', label: 'CRIMP', angle: 315, pumpRating: 3, gripDrain: 2, position: { x: 2, y: 12 }, matchable: false, isRest: false },
            { type: 'pocket', label: 'POCKET', angle: 225, pumpRating: 3, gripDrain: 2, position: { x: 3, y: 13 }, matchable: false, isRest: false },
            // Extended finish
            { type: 'jug', label: 'JUG', angle: 315, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 14 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 15 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 16 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 17 }, matchable: true, isRest: true },
        ],
        stars: {
            completion: true,
            speed: { timeLimit: 120 },
            pumpEfficiency: { maxPump: 2 },
            gripEfficiency: true,
            flashClimb: true,
        }
    },
];
