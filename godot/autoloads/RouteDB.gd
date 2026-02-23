extends Node

var _penalty_map: Dictionary = {}
var route_database: Dictionary = {}

func _ready() -> void:
	_build_penalty_map()
	_assemble_route_database()
	_populate_location_routes()

func _build_penalty_map() -> void:
	for entry in Constants.PENALTY_TABLE_RAW:
		var key := "%s-%s-%d-%s" % [entry[0], entry[1], entry[2], entry[3]]
		_penalty_map[key] = entry[4]

func _assemble_route_database() -> void:
	route_database = {
		0: RoutesArea0.get_routes(),
		1: RoutesArea1.get_routes(),
		2: RoutesArea2.get_routes(),
		3: RoutesArea3.get_routes(),
		4: RoutesArea4.get_routes(),
		5: RoutesArea5.get_routes(),
		6: RoutesArea6.get_routes(),
		7: RoutesArea7.get_routes(),
	}

func _populate_location_routes() -> void:
	for loc in GameState.locations:
		var crafted := get_routes_for_location(loc["id"])
		if crafted.size() > 0:
			loc["routes"] = crafted
		else:
			loc["routes"] = [{
				"id": "placeholder", "name": "Coming Soon",
				"grade": "?", "hold_count": 0,
				"description": "Routes for this location are not yet available.",
				"placeholder": true,
			}]

# ============ LOOKUPS ============

func get_routes_for_location(location_id: int) -> Array:
	return route_database.get(location_id, [])

func lookup_penalty(direction: String, hand: String, hold_angle: int, weight: String) -> int:
	var normalized := Constants.normalize_angle(float(hold_angle))
	var hand_code := "L" if hand == "left" else "R"
	var weight_code: String
	if weight == "left":
		weight_code = "L"
	elif weight == "right":
		weight_code = "R"
	else:
		weight_code = "C"
	var key := "%s-%s-%d-%s" % [direction, hand_code, normalized, weight_code]
	return _penalty_map.get(key, 0)

func get_move_direction(from_x: int, _from_y: int, to_x: int, _to_y: int) -> String:
	var dx := to_x - from_x
	if dx < 0:
		return "up-left"
	elif dx > 0:
		return "up-right"
	return "up"

func is_cross_move(hand: String, direction: String) -> bool:
	if hand == "right" and direction == "up-left":
		return true
	if hand == "left" and direction == "up-right":
		return true
	return false

func get_ideal_weight(hold_angle: int) -> String:
	var a := Constants.normalize_angle(float(hold_angle))
	if a == 0 or a == 180:
		return "center"
	if a == 45 or a == 90 or a == 135:
		return "left"
	return "right"
