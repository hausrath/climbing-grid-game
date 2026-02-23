extends Node

# Tracks how many times a player has grabbed each specific hold.
# Each successful grab increments a counter (max 5), granting up to +10% bonus.
# Mirrors the familiarity functions in js/climbing-actions.js.


func get_hold_familiarity_key(location_id: int, route_id: String, hold_index: int) -> String:
	return "%d-%s-%d" % [location_id, route_id, hold_index]


func get_hold_familiarity_bonus(hold_index: int) -> float:
	if not GameState.current_location or not GameState.current_route:
		return 0.0
	var key := get_hold_familiarity_key(
		GameState.current_location.get("id", -1),
		GameState.current_route.get("id", ""),
		hold_index
	)
	var grabs: int = GameState.hold_familiarity.get(key, 0)
	return minf(0.10, grabs * 0.02)


func record_successful_grab(hold_index: int) -> void:
	if not GameState.current_location or not GameState.current_route:
		return
	var key := get_hold_familiarity_key(
		GameState.current_location.get("id", -1),
		GameState.current_route.get("id", ""),
		hold_index
	)
	if not GameState.hold_familiarity.has(key):
		GameState.hold_familiarity[key] = 0
	if GameState.hold_familiarity[key] < 5:
		GameState.hold_familiarity[key] += 1
