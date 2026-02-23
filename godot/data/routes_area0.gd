class_name RoutesArea0

static func get_routes() -> Array:
	return [
		{
			"id": "bg1", "name": "Hands", "grade": "V0", "holdCount": 8,
			"description": "A simple route", "startCol": 3,
			"holds": [
				{"type": "jug", "label": "JUG", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 2, "y": 1}, "matchable": false, "isRest": false},
				{"type": "edge", "label": "EDGE", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 2, "y": 2}, "matchable": false, "isRest": false},
				{"type": "pocket", "label": "POCKET", "angle": 0, "pumpRating": 2, "gripDrain": 2, "position": {"x": 3, "y": 3}, "matchable": false, "isRest": false},
				{"type": "pocket", "label": "POCKET", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 2, "y": 4}, "matchable": false, "isRest": false},
				{"type": "jug", "label": "JUG", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 2, "y": 5}, "matchable": false, "isRest": false},
				{"type": "jug", "label": "JUG", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 1, "y": 6}, "matchable": false, "isRest": false},
				{"type": "edge", "label": "EDGE", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 2, "y": 7}, "matchable": false, "isRest": false},
				{"type": "jug", "label": "JUG", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 2, "y": 8}, "matchable": false, "isRest": false},
			],
			"stars": {
				"completion": true,
				"speed": {"timeLimit": 30},
				"pumpEfficiency": {"maxPump": 0},
				"gripEfficiency": true,
				"flashClimb": true,
			},
		},
		{
			"id": "bg2", "name": "Zig Zag", "grade": "V0", "holdCount": 6,
			"description": "", "startCol": 3,
			"holds": [
				{"type": "jug", "label": "JUG", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 3, "y": 1}, "matchable": false, "isRest": false},
				{"type": "pocket", "label": "POCKET", "angle": 0, "pumpRating": 2, "gripDrain": 1, "position": {"x": 4, "y": 2}, "matchable": false, "isRest": false},
				{"type": "jug", "label": "JUG", "angle": 0, "pumpRating": 2, "gripDrain": 1, "position": {"x": 3, "y": 3}, "matchable": false, "isRest": false},
				{"type": "pocket", "label": "POCKET", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 4, "y": 4}, "matchable": false, "isRest": false},
				{"type": "edge", "label": "EDGE", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 4, "y": 5}, "matchable": false, "isRest": false},
				{"type": "jug", "label": "JUG", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 3, "y": 6}, "matchable": false, "isRest": false},
			],
			"stars": {
				"completion": true,
				"speed": {"timeLimit": 30},
				"pumpEfficiency": {"maxPump": 0},
				"gripEfficiency": true,
				"flashClimb": true,
			},
		},
		{
			"id": "bg3", "name": "Little Ladder", "grade": "V0", "holdCount": 8,
			"description": "", "startCol": 3,
			"holds": [
				{"type": "pocket", "label": "POCKET", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 1, "y": 1}, "matchable": false, "isRest": false},
				{"type": "edge", "label": "EDGE", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 2, "y": 2}, "matchable": false, "isRest": false},
				{"type": "jug", "label": "JUG", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 2, "y": 3}, "matchable": false, "isRest": false},
				{"type": "edge", "label": "EDGE", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 1, "y": 4}, "matchable": false, "isRest": false},
				{"type": "pocket", "label": "POCKET", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 2, "y": 5}, "matchable": false, "isRest": false},
				{"type": "jug", "label": "JUG", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 1, "y": 6}, "matchable": false, "isRest": false},
				{"type": "pinch", "label": "PINCH", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 2, "y": 7}, "matchable": false, "isRest": false},
				{"type": "jug", "label": "JUG", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 3, "y": 8}, "matchable": false, "isRest": false},
			],
			"stars": {
				"completion": true,
				"speed": {"timeLimit": 30},
				"pumpEfficiency": {"maxPump": 0},
				"gripEfficiency": true,
				"flashClimb": true,
			},
		},
		{
			"id": "bg4", "name": "Snek", "grade": "V1", "holdCount": 9,
			"description": "Can you climb the danger noodle?", "startCol": 3,
			"holds": [
				{"type": "pocket", "label": "POCKET", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 1, "y": 1}, "matchable": false, "isRest": false},
				{"type": "pocket", "label": "POCKET", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 0, "y": 2}, "matchable": false, "isRest": false},
				{"type": "pinch", "label": "PINCH", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 1, "y": 3}, "matchable": false, "isRest": false},
				{"type": "edge", "label": "EDGE", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 2, "y": 4}, "matchable": false, "isRest": false},
				{"type": "jug", "label": "JUG", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 1, "y": 5}, "matchable": false, "isRest": false},
				{"type": "pocket", "label": "POCKET", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 0, "y": 6}, "matchable": false, "isRest": false},
				{"type": "jug", "label": "JUG", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 1, "y": 7}, "matchable": false, "isRest": false},
				{"type": "edge", "label": "EDGE", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 2, "y": 8}, "matchable": false, "isRest": false},
				{"type": "jug", "label": "JUG", "angle": 0, "pumpRating": 1, "gripDrain": 1, "position": {"x": 2, "y": 9}, "matchable": false, "isRest": false},
			],
			"stars": {
				"completion": true,
				"speed": {"timeLimit": 40},
				"pumpEfficiency": {"maxPump": 0},
				"gripEfficiency": true,
				"flashClimb": true,
			},
		},
	]
