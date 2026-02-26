// AREA 1: CRIMP CANYON (Unlocks Cross — reduces gaston/cross penalty by 1)
const ROUTES_AREA_1 = [
    {
        id: 'cc1',
        name: 'Monkey Arms',
        grade: 'V1',
        holdCount: 8,
        description: 'Reach wide to start and move up good holds to the finish',
        startCol: 3,
        holds: [
            { type: 'pocket', label: 'POCKET', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 4, y: 1 }, matchable: false, isRest: false },
            { type: 'edge', label: 'EDGE', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
            { type: 'edge', label: 'EDGE', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 3 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 4 }, matchable: false, isRest: false },
            { type: 'pocket', label: 'POCKET', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 5 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 6 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 7 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 8 }, matchable: false, isRest: false },
        ],
        stars: {
            completion: true,
            speed: { timeLimit: 30 },
            pumpEfficiency: { maxPump: 0 },
            gripEfficiency: true,
            flashClimb: true,
        }
    },
    {
        id: 'cc2',
        name: 'Reach a Cross',
        grade: 'V2',
        holdCount: 8,
        description: 'Pockets down low lead to a reachy pinch move up top',
        startCol: 1,
        holds: [
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 1 }, matchable: false, isRest: false },
            { type: 'pocket', label: 'POCKET', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 2 }, matchable: false, isRest: false },
            { type: 'pocket', label: 'POCKET', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 3 }, matchable: false, isRest: false },
            { type: 'edge', label: 'EDGE', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 4 }, matchable: false, isRest: false },
            { type: 'pinch', label: 'PINCH', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 5 }, matchable: false, isRest: false },
            { type: 'pinch', label: 'PINCH', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 0, y: 6 }, matchable: false, isRest: false },
            { type: 'edge', label: 'EDGE', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 7 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 8 }, matchable: false, isRest: false },
        ],
        stars: {
            completion: true,
            speed: { timeLimit: 30 },
            pumpEfficiency: { maxPump: 0 },
            gripEfficiency: true,
            flashClimb: true,
        }
    },
    {
        id: 'cc3',
        name: 'Careful Planning',
        grade: 'V2',
        holdCount: 9,
        description: 'Survive tenuous holds to reach for a juggy end',
        startCol: 4,
        holds: [
            { type: 'edge', label: 'EDGE', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 1 }, matchable: false, isRest: false },
            { type: 'pocket', label: 'POCKET', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 4, y: 2 }, matchable: false, isRest: false },
            { type: 'pinch', label: 'PINCH', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 4, y: 3 }, matchable: false, isRest: false },
            { type: 'pocket', label: 'POCKET', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 4 }, matchable: false, isRest: false },
            { type: 'pocket', label: 'POCKET', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 2, y: 5 }, matchable: false, isRest: false },
            { type: 'pinch', label: 'PINCH', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 3, y: 6 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 1, y: 7 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 0, y: 8 }, matchable: false, isRest: false },
            { type: 'jug', label: 'JUG', angle: 0, pumpRating: 1, gripDrain: 1, position: { x: 0, y: 9 }, matchable: false, isRest: false },
        ],
        stars: {
            completion: true,
            speed: { timeLimit: 40 },
            pumpEfficiency: { maxPump: 0 },
            gripEfficiency: true,
            flashClimb: true,
        }
    },
];
