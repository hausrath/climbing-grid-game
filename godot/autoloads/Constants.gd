extends Node

# ============ HOLD TYPES ============
const HOLD_TYPES: Array = [
	{ "type": "jug",       "label": "JUG",    "color": Color("#a8db60") },
	{ "type": "crimp",     "label": "CRIMP",  "color": Color("#f5aaa2") },
	{ "type": "sloper",    "label": "SLOPER", "color": Color("#6dbce3") },
	{ "type": "pinch",     "label": "PINCH",  "color": Color("#fad882") },
	{ "type": "pocket",    "label": "POCKET", "color": Color("#c178de") },
	{ "type": "edge",      "label": "EDGE",   "color": Color("#738078") },
	{ "type": "undercling","label": "UNDER",  "color": Color("#b06758") },
]

# Maps hold type -> pump ticks per move. 3 ticks = 1 pump stage advance.
const HOLD_PUMP_COST: Dictionary = {
	"jug": 1,
	"edge": 2,
	"pocket": 2,
	"undercling": 2,
	"pinch": 3,
	"crimp": 4,
	"sloper": 4,
}

const PUMP_STATE_LABELS: Array = ["Fresh", "Pumped", "Struggling"]
const GRIP_STATE_LABELS: Array = ["Chalked", "Weakening", "Slipping"]
const PENALTY_LEVEL_NAMES: Array = ["None", "Slight", "Moderate", "Severe", "Fall"]

# Rarity colors
const RARITY_COLORS: Dictionary = {
	"common":    Color("#738078"),
	"uncommon":  Color("#a8db60"),
	"rare":      Color("#6dbce3"),
	"exquisite": Color("#c178de"),
	"legendary": Color("#fad882"),
}

# ============ PENALTY TABLE ============
# [direction, hand(R/L), holdAngle, weight(L/C/R), penalty]
const PENALTY_TABLE_RAW: Array = [
	# === UP (directly above) ===
	["up","R",0,"C",0], ["up","L",0,"C",0],
	["up","R",0,"L",1], ["up","L",0,"L",1],
	["up","R",0,"R",1], ["up","L",0,"R",1],
	["up","R",45,"C",1], ["up","L",45,"C",1],
	["up","R",45,"L",0], ["up","L",45,"L",0],
	["up","R",45,"R",2], ["up","L",45,"R",2],
	["up","R",90,"C",2], ["up","L",90,"C",2],
	["up","R",90,"L",1], ["up","L",90,"L",1],
	["up","R",90,"R",3], ["up","L",90,"R",3],
	["up","R",135,"C",2], ["up","L",135,"C",2],
	["up","R",135,"L",1], ["up","L",135,"L",1],
	["up","R",135,"R",3], ["up","L",135,"R",3],
	["up","R",180,"C",0], ["up","L",180,"C",0],
	["up","R",180,"L",1], ["up","L",180,"L",1],
	["up","R",180,"R",1], ["up","L",180,"R",1],
	["up","R",225,"C",2], ["up","L",225,"C",2],
	["up","R",225,"L",3], ["up","L",225,"L",3],
	["up","R",225,"R",1], ["up","L",225,"R",1],
	["up","R",270,"C",2], ["up","L",270,"C",2],
	["up","R",270,"L",3], ["up","L",270,"L",3],
	["up","R",270,"R",1], ["up","L",270,"R",1],
	["up","R",315,"C",1], ["up","L",315,"C",1],
	["up","R",315,"L",2], ["up","L",315,"L",2],
	["up","R",315,"R",0], ["up","L",315,"R",0],
	# === UP-LEFT ===
	["up-left","R",0,"C",1], ["up-left","L",0,"C",0],
	["up-left","R",0,"L",2], ["up-left","L",0,"L",2],
	["up-left","R",0,"R",2], ["up-left","L",0,"R",2],
	["up-left","R",45,"C",3], ["up-left","L",45,"C",1],
	["up-left","R",45,"L",2], ["up-left","L",45,"L",0],
	["up-left","R",45,"R",4], ["up-left","L",45,"R",3],
	["up-left","R",90,"C",3], ["up-left","L",90,"C",2],
	["up-left","R",90,"L",3], ["up-left","L",90,"L",1],
	["up-left","R",90,"R",4], ["up-left","L",90,"R",4],
	["up-left","R",135,"C",3], ["up-left","L",135,"C",2],
	["up-left","R",135,"L",3], ["up-left","L",135,"L",1],
	["up-left","R",135,"R",4], ["up-left","L",135,"R",4],
	["up-left","R",180,"C",3], ["up-left","L",180,"C",1],
	["up-left","R",180,"L",4], ["up-left","L",180,"L",3],
	["up-left","R",180,"R",3], ["up-left","L",180,"R",2],
	["up-left","R",225,"C",4], ["up-left","L",225,"C",1],
	["up-left","R",225,"L",3], ["up-left","L",225,"L",3],
	["up-left","R",225,"R",2], ["up-left","L",225,"R",1],
	["up-left","R",270,"C",2], ["up-left","L",270,"C",1],
	["up-left","R",270,"L",4], ["up-left","L",270,"L",4],
	["up-left","R",270,"R",1], ["up-left","L",270,"R",0],
	["up-left","R",315,"C",2], ["up-left","L",315,"C",1],
	["up-left","R",315,"L",3], ["up-left","L",315,"L",2],
	["up-left","R",315,"R",1], ["up-left","L",315,"R",0],
	# === UP-RIGHT ===
	["up-right","R",0,"C",0], ["up-right","L",0,"C",1],
	["up-right","R",0,"L",2], ["up-right","L",0,"L",2],
	["up-right","R",0,"R",2], ["up-right","L",0,"R",2],
	["up-right","R",45,"C",1], ["up-right","L",45,"C",2],
	["up-right","R",45,"L",0], ["up-right","L",45,"L",1],
	["up-right","R",45,"R",2], ["up-right","L",45,"R",3],
	["up-right","R",90,"C",1], ["up-right","L",90,"C",2],
	["up-right","R",90,"L",0], ["up-right","L",90,"L",1],
	["up-right","R",90,"R",4], ["up-right","L",90,"R",4],
	["up-right","R",135,"C",1], ["up-right","L",135,"C",4],
	["up-right","R",135,"L",1], ["up-right","L",135,"L",2],
	["up-right","R",135,"R",3], ["up-right","L",135,"R",3],
	["up-right","R",180,"C",1], ["up-right","L",180,"C",3],
	["up-right","R",180,"L",2], ["up-right","L",180,"L",3],
	["up-right","R",180,"R",3], ["up-right","L",180,"R",4],
	["up-right","R",225,"C",2], ["up-right","L",225,"C",3],
	["up-right","R",225,"L",4], ["up-right","L",225,"L",4],
	["up-right","R",225,"R",1], ["up-right","L",225,"R",3],
	["up-right","R",270,"C",2], ["up-right","L",270,"C",3],
	["up-right","R",270,"L",4], ["up-right","L",270,"L",4],
	["up-right","R",270,"R",1], ["up-right","L",270,"R",3],
	["up-right","R",315,"C",1], ["up-right","L",315,"C",3],
	["up-right","R",315,"L",3], ["up-right","L",315,"L",4],
	["up-right","R",315,"R",0], ["up-right","L",315,"R",2],
	# === LEFT (lateral, mirrors up-left) ===
	["left","R",0,"C",1], ["left","L",0,"C",0],
	["left","R",0,"L",2], ["left","L",0,"L",2],
	["left","R",0,"R",2], ["left","L",0,"R",2],
	["left","R",45,"C",3], ["left","L",45,"C",1],
	["left","R",45,"L",2], ["left","L",45,"L",0],
	["left","R",45,"R",4], ["left","L",45,"R",3],
	["left","R",90,"C",3], ["left","L",90,"C",2],
	["left","R",90,"L",3], ["left","L",90,"L",1],
	["left","R",90,"R",4], ["left","L",90,"R",4],
	["left","R",135,"C",3], ["left","L",135,"C",2],
	["left","R",135,"L",3], ["left","L",135,"L",1],
	["left","R",135,"R",4], ["left","L",135,"R",4],
	["left","R",180,"C",3], ["left","L",180,"C",1],
	["left","R",180,"L",4], ["left","L",180,"L",3],
	["left","R",180,"R",3], ["left","L",180,"R",2],
	["left","R",225,"C",4], ["left","L",225,"C",1],
	["left","R",225,"L",3], ["left","L",225,"L",3],
	["left","R",225,"R",2], ["left","L",225,"R",1],
	["left","R",270,"C",2], ["left","L",270,"C",1],
	["left","R",270,"L",4], ["left","L",270,"L",4],
	["left","R",270,"R",1], ["left","L",270,"R",0],
	["left","R",315,"C",2], ["left","L",315,"C",1],
	["left","R",315,"L",3], ["left","L",315,"L",2],
	["left","R",315,"R",1], ["left","L",315,"R",0],
	# === RIGHT (lateral, mirrors up-right) ===
	["right","R",0,"C",0], ["right","L",0,"C",1],
	["right","R",0,"L",2], ["right","L",0,"L",2],
	["right","R",0,"R",2], ["right","L",0,"R",2],
	["right","R",45,"C",1], ["right","L",45,"C",2],
	["right","R",45,"L",0], ["right","L",45,"L",1],
	["right","R",45,"R",2], ["right","L",45,"R",3],
	["right","R",90,"C",1], ["right","L",90,"C",2],
	["right","R",90,"L",0], ["right","L",90,"L",1],
	["right","R",90,"R",4], ["right","L",90,"R",4],
	["right","R",135,"C",1], ["right","L",135,"C",4],
	["right","R",135,"L",1], ["right","L",135,"L",2],
	["right","R",135,"R",3], ["right","L",135,"R",3],
	["right","R",180,"C",1], ["right","L",180,"C",3],
	["right","R",180,"L",2], ["right","L",180,"L",3],
	["right","R",180,"R",3], ["right","L",180,"R",4],
	["right","R",225,"C",2], ["right","L",225,"C",3],
	["right","R",225,"L",4], ["right","L",225,"L",4],
	["right","R",225,"R",1], ["right","L",225,"R",3],
	["right","R",270,"C",2], ["right","L",270,"C",3],
	["right","R",270,"L",4], ["right","L",270,"L",4],
	["right","R",270,"R",1], ["right","L",270,"R",3],
	["right","R",315,"C",1], ["right","L",315,"C",3],
	["right","R",315,"L",3], ["right","L",315,"L",4],
	["right","R",315,"R",0], ["right","L",315,"R",2],
]

# ============ HELPERS ============

func get_hold_type(type_name: String) -> Dictionary:
	for ht in HOLD_TYPES:
		if ht["type"] == type_name:
			return ht
	return { "type": type_name, "label": type_name.to_upper(), "color": Color("#738078") }

func normalize_angle(angle: float) -> int:
	var a := fmod(fmod(angle, 360.0) + 360.0, 360.0)
	return int(round(a / 45.0) * 45) % 360
