extends Node

signal game_mode_changed(mode: String)

# ============ GAME MODE ============
var game_mode: String = "title"  # title, worldmap, routeselect, climbing, camp

# ============ LOCATION / ROUTE SELECTION ============
var current_location: Dictionary = {}
var current_route: Dictionary = {}

# ============ PROGRESSION ============
var completed_routes: Dictionary = {}   # "locId-routeId": {stars, attempts, star_results}
var route_progress: Dictionary = {}     # "locId-routeId": {attempts, high_point, status}
var hold_familiarity: Dictionary = {}   # "locId-routeId-holdIdx": grab_count

# ============ EQUIPMENT ============
var inventory: Array = []
var equipped_gear: Dictionary = {
	"shoes": null, "chalk_bag": null, "helmet": null, "harness": null,
	"gloves": null, "clothing": null, "food": null, "brush": null,
	"guidebook": null, "watch": null,
}
var collected_loot: Dictionary = {}     # "locId-routeId": true

# ============ TIME & CONDITIONS ============
var time_of_day: String = "morning"     # morning, noon, evening
var climbs_this_period: int = 0
var day: int = 1
var current_conditions: Dictionary = {
	"temperature": "mild",   # cool, mild, hot
	"humidity": "dry",       # dry, moderate, humid
	"wind": "calm",          # calm, moderate, heavy
}

# ============ CHARACTER STATS ============
var endurance: int = 0
var power: int = 0

# ============ CLIMBING STATE (reset each attempt) ============
var weight: String = "center"           # left, center, right
var weight_at_move_start: String = "center"
var current_hand: String = ""           # left, right, or ""

var pump_state: int = 0                 # 0=Fresh 1=Pumped 2=Struggling 3+=Fall
var grip_state: int = 0                 # 0=Chalked 1=Weakening 2=Slipping 3+=Fall
var grip_decay_counter: int = 0         # ticks toward next grip stage (threshold: 3)

var unlocked_skills: Array = []

var skill_state: Dictionary = {
	"just_chalked": false,              # Deadpoint: skip next grip decay
	"just_shook": false,                # Deadpoint: skip next pump gain
}

var commit_cooldown: int = 0
var commit_active: bool = false
var dyno_cooldown: int = 0
var dyno_active: bool = false
var selected_hand: String = ""
var last_hand_used: String = ""
var movement_style: String = "regular"
var cross_active: bool = false
var reach_active: bool = false
var consecutive_crosses: int = 0
var cross_cooldown: int = 0
var reach_cooldown: int = 0
var shake_cooldown: int = 0
var chalk_cooldown: int = 0
var cooldown_length: int = 3
var action_cooldown_length: int = 5

var current_row: int = 0
var current_col: int = 3
var holds_climbed: int = 0
var combo_count: int = 0
var flow_state_active: bool = false

var shakes_used: int = 0
var chalks_used: int = 0
var chalk_remaining: int = 3
var max_chalk: int = 3
var route_attempts: int = 0
var rest_hold_indices: Array = []

var grid: Array = []        # 7x7 viewport grid (display)
var route_grid: Array = []  # Full route grid (variable height)
var viewport_bottom: int = 0

# ============ LOCATION DATA ============
const LOCATION_NAMES: Array = [
	"Boulder Garden", "Crimp Canyon", "Overhang Alley", "Slab Valley", "Jug Junction",
	"Pinch Peak", "Pocket Paradise", "Steep Street", "Face City", "Crack Corner",
	"Arete Avenue", "Traverse Town", "Dyno District", "Rest Ridge", "Pump Plaza",
	"Grip Gorge", "Chalk Cliff", "Shake Summit", "Power Point", "Tech Tower",
	"Endurance End", "Speed Sector", "Flow Falls", "Crispy Crag", "The Sanctuary",
]

const LOCATION_MODIFIERS: Array = [
	{ "name": "Polished Holds",   "effect": "Heavy use: +15% grip loss",       "grip_mult": 1.15 },
	{ "name": "Overhang Wall",    "effect": "Steep: +15% pump on moves",        "pump_mult": 1.15 },
	{ "name": "Slab Climbing",    "effect": "Low angle: -10% pump on moves",    "pump_mult": 0.9 },
	{ "name": "Humid Climate",    "effect": "Sweaty: +5 grip cost per move",    "grip_cost": 5 },
	{ "name": "Desert Heat",      "effect": "Hot & dry: +15% pump gain",        "pump_mult": 1.15 },
	{ "name": "Windy Exposure",   "effect": "Gusts: -5% success on far moves",  "far_penalty": 0.05 },
	{ "name": "Sharp Limestone",  "effect": "Crimps: +5% success",              "crimp_bonus": 0.05 },
	{ "name": "Smooth Granite",   "effect": "Slopers: +5% success",             "sloper_bonus": 0.05 },
	{ "name": "Textured Sandstone","effect":"Pinches: +5% success",             "pinch_bonus": 0.05 },
	{ "name": "Pocketed Rock",    "effect": "Pockets: +5% success",             "pocket_bonus": 0.05 },
	{ "name": "Cold Weather",     "effect": "Crisp air: Better grip recovery",  "grip_recovery": 5 },
	{ "name": "Cool & Dry",       "effect": "Comfortable: -10% grip loss",      "grip_mult": 0.9 },
	{ "name": "Morning Dew",      "effect": "Slippery: +10% grip loss",         "grip_mult": 1.1 },
	{ "name": "Perfect Conditions","effect": "Ideal: +3% success all holds",    "all_bonus": 0.03 },
]

var locations: Array = []

func _ready() -> void:
	_generate_locations()

func _generate_locations() -> void:
	locations.clear()
	var rng := RandomNumberGenerator.new()
	rng.seed = 42  # Fixed seed so modifiers are consistent per session
	for i in range(25):
		var row := i / 5
		var col := i % 5
		var difficulty_tier: String
		if row == 0 or col == 0:
			difficulty_tier = "easy"
		elif row <= 2 and col <= 2:
			difficulty_tier = "intermediate"
		else:
			difficulty_tier = "expert"
		var is_boss := (row == 4 and col == 4)
		var modifier := LOCATION_MODIFIERS[rng.randi() % LOCATION_MODIFIERS.size()]
		locations.append({
			"id": i, "name": LOCATION_NAMES[i],
			"row": row, "col": col,
			"difficulty_tier": difficulty_tier,
			"is_boss": is_boss,
			"discovered": (row == 0 and col == 0),
			"modifier": modifier,
			"routes": [],  # Populated by RouteDB after autoloads are ready
		})

# ============ STAR CALCULATIONS ============

func calculate_total_stars() -> int:
	var total := 0
	for key in completed_routes:
		total += completed_routes[key].get("stars", 0)
	return total

func calculate_location_stars(location_id: int) -> int:
	var total := 0
	for key in completed_routes:
		var parts := key.split("-")
		if parts.size() >= 1 and int(parts[0]) == location_id:
			total += completed_routes[key].get("stars", 0)
	return total

func is_location_unlocked(location: Dictionary) -> bool:
	if location["row"] == 0 and location["col"] == 0:
		return true
	if location.get("discovered", false):
		return true
	var offsets := [[-1, 0], [1, 0], [0, -1], [0, 1]]
	for offset in offsets:
		var adj_row := location["row"] + offset[0]
		var adj_col := location["col"] + offset[1]
		if adj_row >= 0 and adj_row < 5 and adj_col >= 0 and adj_col < 5:
			var adj_loc := locations[adj_row * 5 + adj_col]
			if calculate_location_stars(adj_loc["id"]) >= 8:
				return true
	return false

func set_game_mode(mode: String) -> void:
	game_mode = mode
	emit_signal("game_mode_changed", mode)
