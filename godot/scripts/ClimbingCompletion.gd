extends Node

# Handles route completion, failure, and the victory screen.
# Mirrors completeRoute(), endGame(), showVictoryScreen() in js/climbing.js.

signal completion_data(stars: int, star_results: Dictionary, new_skills: Array, new_actions: Array,
	loot: Dictionary, time_elapsed: float, time_limit: int)
signal failure_data(message: String, current_row: int, top_row: int, high_point: int,
	is_new_high: bool)
signal victory_data(total_stars: int, routes_completed: int)

@export var equipment_logic: Node
@export var conditions_system: Node


func complete_route() -> void:
	var location: Dictionary = GameState.current_location
	var route: Dictionary = GameState.current_route
	if location.is_empty() or route.is_empty():
		return

	var route_key := "%d-%s" % [location.get("id", -1), route.get("id", "")]

	if conditions_system:
		conditions_system.advance_time()

	# Update route progress
	if not GameState.route_progress.has(route_key):
		GameState.route_progress[route_key] = {"attempts": 0, "highPoint": 0, "status": "not_tried"}
	GameState.route_progress[route_key]["attempts"] += 1
	GameState.route_progress[route_key]["status"] = "completed"
	GameState.route_progress[route_key]["highPoint"] = GameState.current_row

	# Time-based star
	var time_elapsed: float = Time.get_unix_time_from_system() - GameState.climb_start_time
	var time_limit: int = route.get("stars", {}).get("speed", {}).get("timeLimit",
		route.get("holds", []).size() * 5)
	var rounded_time: int = int(round(time_elapsed))

	var star_results := {
		"completion": true,
		"speed": rounded_time <= time_limit,
		"pumpEfficiency": GameState.pump_state == 0,
		"gripEfficiency": GameState.grip_state == 0,
		"flashClimb": GameState.route_attempts <= 1,
	}

	var stars_earned: int = 0
	for v in star_results.values():
		if v:
			stars_earned += 1

	if route.get("bossRoute", false):
		stars_earned = max(stars_earned, 2)

	# Check for final victory
	if location.get("id", -1) == 24 and route.get("name", "") == "The Ascension":
		emit_signal("victory_data", GameState.calculate_total_stars(),
			GameState.completed_routes.size())
		return

	# Save completion (keep best stars, merge individual star results with OR)
	if not GameState.completed_routes.has(route_key):
		GameState.completed_routes[route_key] = {
			"stars": stars_earned,
			"attempts": GameState.route_attempts,
			"starResults": star_results,
		}
	else:
		var prev: Dictionary = GameState.completed_routes[route_key]
		var prev_sr: Dictionary = prev.get("starResults", {})
		var merged_sr := {
			"completion": true,
			"speed": prev_sr.get("speed", false) or star_results["speed"],
			"pumpEfficiency": prev_sr.get("pumpEfficiency", false) or star_results["pumpEfficiency"],
			"gripEfficiency": prev_sr.get("gripEfficiency", false) or star_results["gripEfficiency"],
			"flashClimb": prev_sr.get("flashClimb", false) or star_results["flashClimb"],
		}
		var merged_stars: int = 0
		for v in merged_sr.values():
			if v:
				merged_stars += 1
		GameState.completed_routes[route_key]["stars"] = merged_stars
		GameState.completed_routes[route_key]["starResults"] = merged_sr
		star_results = merged_sr
		stars_earned = merged_stars

	# Award loot
	var loot: Dictionary = {}
	if equipment_logic:
		loot = equipment_logic.award_route_loot(location, route)

	# Check skill and action unlocks
	var new_skills: Array = SkillsDB.try_unlock_skill_on_completion(location.get("id", -1))
	var new_actions: Array = SkillsDB.try_unlock_action_on_completion(
		location.get("id", -1), route.get("id", ""))

	emit_signal("completion_data", stars_earned, star_results, new_skills, new_actions, loot,
		float(rounded_time), time_limit)


func end_game(victory: bool, message: String) -> void:
	var location: Dictionary = GameState.current_location
	var route: Dictionary = GameState.current_route
	if location.is_empty() or route.is_empty():
		return

	if conditions_system:
		conditions_system.advance_time()

	var route_key := "%d-%s" % [location.get("id", -1), route.get("id", "")]
	if not GameState.route_progress.has(route_key):
		GameState.route_progress[route_key] = {"attempts": 0, "highPoint": 0, "status": "not_tried"}

	GameState.route_progress[route_key]["attempts"] += 1
	GameState.route_progress[route_key]["status"] = "attempted"

	if GameState.current_row > GameState.route_progress[route_key].get("highPoint", 0):
		GameState.route_progress[route_key]["highPoint"] = GameState.current_row

	var high_point: int = GameState.route_progress[route_key].get("highPoint", 0)
	var top_row: int = route.get("topRow", 1)
	var is_new_high: bool = (GameState.current_row == high_point and GameState.current_row > 0)

	emit_signal("failure_data", message, GameState.current_row, top_row, high_point, is_new_high)


func retry_route() -> void:
	if GameState.current_location.is_empty() or GameState.current_route.is_empty():
		return
	# Signal to Main/ClimbingScreen to restart the current climb
	# The actual restart is handled by the scene controller
	emit_signal("completion_data", -1, {}, [], [], {}, 0.0, 0)  # Sentinel for retry


func return_to_route_selection() -> void:
	# Signal handled by Main.gd / ClimbingScreen.gd
	pass
