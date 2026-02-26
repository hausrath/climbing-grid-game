extends Node

# Core move resolver. Handles penalty lookup, resource tracking, and win/loss.
# Mirrors moveToHold() in js/climbing.js.

signal feedback_added(text: String, type: String)
signal move_resolved   # Triggers viewport update + grid render + UI update
signal game_ended(victory: bool, message: String)
signal route_completed_signal

@export var route_loader: Node
@export var familiarity_system: Node


func move_to_hold(row: int, col: int) -> void:
	# Convert viewport row to route row
	var route_row: int = GameState.viewport_bottom + (6 - row)
	var route_col: int = col

	# Look up hold in route grid
	var hold: Dictionary = {}
	if not GameState.route_grid.is_empty() and route_row < GameState.route_grid.size():
		var cell = GameState.route_grid[route_row][route_col]
		if cell:
			hold = cell

	if hold.is_empty():
		emit_signal("feedback_added", "No hold there!", "penalty")
		return

	if GameState.pump_state >= 3:
		emit_signal("game_ended", false, "Pump maxed out! Your forearms gave out.")
		return

	if GameState.selected_hand == "":
		emit_signal("feedback_added", "Select a hand first (A or D)!", "penalty")
		return

	if route_row <= GameState.current_row:
		emit_signal("feedback_added", "Can only climb upward!", "penalty")
		return

	var dy: int = route_row - GameState.current_row
	var dx: int = abs(route_col - GameState.current_col)
	var max_reach: int = 3 if GameState.dyno_active else 2
	if dy > max_reach or dx > max_reach:
		emit_signal("feedback_added", "Too far to reach!", "penalty")
		return

	var is_extended_move: bool = (dy >= 2 or dx >= 2)

	# Step 1: Direction and cross-body
	var direction: String = RouteDB.get_move_direction(
		GameState.current_col, GameState.current_row, route_col, route_row)
	var hand: String = GameState.selected_hand
	var cross_move: bool = RouteDB.is_cross_move(hand, direction)

	var feedback: Array = []

	# Step 2: Calculate effective penalty level
	var base_penalty: int = RouteDB.lookup_penalty(
		direction, hand, hold.get("angle", 0), GameState.weight)

	if base_penalty == 4:
		emit_signal("feedback_added", "Impossible position! You fell!", "penalty")
		emit_signal("game_ended", false,
			"The combination of direction, hand, angle, and weight made the hold impossible.")
		return

	var effective_level: int = base_penalty
	var level_bumps: Array = []

	# Distance surcharge
	var reach_used := false
	if is_extended_move:
		if GameState.reach_active:
			reach_used = true
			feedback.append({"text": "Reach: distance penalty negated!", "type": "bonus"})
		else:
			effective_level += 1
			level_bumps.append("distance")

	# Cross skill (reduces cross-body / gaston by 1)
	var cross_used := false
	if cross_move:
		if GameState.cross_active:
			cross_used = true
			effective_level = max(0, effective_level - 1)
			feedback.append({"text": "Cross: cross-body penalty negated!", "type": "bonus"})
		else:
			level_bumps.append("cross-body")

	# Commit (one-shot -1)
	if GameState.commit_active and effective_level > 0:
		effective_level = max(0, effective_level - 1)
		feedback.append({"text": "COMMIT: penalty reduced!", "type": "bonus"})

	effective_level = min(effective_level, 4)

	# Step 3: Map level to pump change
	var pump_change := 0
	if effective_level >= 3:
		feedback.append({"text": "Severe penalty — you fell!", "type": "penalty"})
		for f in feedback:
			emit_signal("feedback_added", f["text"], f["type"])
		emit_signal("game_ended", false, "Severe penalty! The move was too much for your body.")
		return
	elif effective_level == 2:
		pump_change = 2
	elif effective_level == 1:
		pump_change = 1

	# Deadpoint: justShook blocks pump change
	if SkillsDB.is_skill_unlocked("deadpoint") and GameState.skill_state.get("justShook", false) \
			and pump_change > 0:
		feedback.append({"text": "Deadpoint! Pump penalty negated after shake", "type": "bonus"})
		pump_change = 0

	# Pump feedback
	if pump_change > 0:
		var level_name: String = Constants.PENALTY_LEVEL_NAMES[min(effective_level, 4)]
		var bump_str := (" (%s)" % ", ".join(level_bumps)) if not level_bumps.is_empty() else ""
		feedback.append({"text": "%s penalty%s: pump +%d state" % [level_name, bump_str, pump_change],
			"type": "penalty" if pump_change >= 2 else "neutral"})
	elif effective_level == 0 and base_penalty == 0:
		feedback.append({"text": "Clean move!", "type": "bonus"})

	var new_pump: int = GameState.pump_state + pump_change

	# Step 4: Grip decay
	var grip_advanced := false
	var grip_blocked := false

	if SkillsDB.is_skill_unlocked("deadpoint") and GameState.skill_state.get("justChalked", false):
		grip_blocked = true
		feedback.append({"text": "Deadpoint! Grip decay blocked after chalk", "type": "bonus"})

	if not grip_blocked:
		var grip_cost: int = Constants.HOLD_GRIP_COST.get(hold.get("type", "jug"), 1)
		GameState.grip_decay_counter += grip_cost
		while GameState.grip_decay_counter >= 3:
			GameState.grip_decay_counter -= 3
			GameState.grip_state += 1
			grip_advanced = true

	if grip_advanced:
		var grip_label: String = Constants.GRIP_STATE_LABELS[min(GameState.grip_state, 2)]
		feedback.append({"text": "Grip decayed to: %s" % grip_label,
			"type": "penalty" if GameState.grip_state >= 2 else "neutral"})
	else:
		feedback.append({"text": "Grip decay: %d/3 ticks" % GameState.grip_decay_counter,
			"type": "neutral"})

	# Step 5: Apply pump
	GameState.pump_state = new_pump

	var pump_label: String = Constants.PUMP_STATE_LABELS[min(GameState.pump_state, 2)]
	var grip_label2: String = Constants.GRIP_STATE_LABELS[min(GameState.grip_state, 2)]
	feedback.append({"text": "%s (%d°) — Pump: %s, Grip: %s" % [
		hold.get("label","?"), hold.get("angle",0), pump_label, grip_label2], "type": "neutral"})

	# Step 6: Decrement cooldowns
	if GameState.cross_cooldown > 0:  GameState.cross_cooldown -= 1
	if GameState.reach_cooldown > 0:  GameState.reach_cooldown -= 1
	if GameState.shake_cooldown > 0:  GameState.shake_cooldown -= 1
	if GameState.chalk_cooldown > 0:  GameState.chalk_cooldown -= 1
	if GameState.commit_cooldown > 0: GameState.commit_cooldown -= 1
	if GameState.dyno_cooldown > 0:   GameState.dyno_cooldown -= 1

	if GameState.dyno_active:
		GameState.dyno_active = false
		GameState.dyno_cooldown = 5
		feedback.append({"text": "Dyno used! Cooldown: 5 moves", "type": "neutral"})

	if GameState.commit_active:
		GameState.commit_active = false
		GameState.commit_cooldown = 10
		feedback.append({"text": "Commit used! Cooldown: 10 moves", "type": "neutral"})

	if cross_used:
		GameState.cross_cooldown = GameState.cooldown_length
		feedback.append({"text": "Cross cooldown: %d moves" % GameState.cooldown_length, "type": "neutral"})
	if reach_used:
		GameState.reach_cooldown = GameState.cooldown_length
		feedback.append({"text": "Reach cooldown: %d moves" % GameState.cooldown_length, "type": "neutral"})

	# Step 7: Update state
	if cross_move:
		GameState.consecutive_crosses += 1
	else:
		GameState.consecutive_crosses = 0

	GameState.current_hand = GameState.selected_hand
	GameState.last_hand_used = GameState.selected_hand
	GameState.current_row = route_row
	GameState.current_col = route_col
	GameState.holds_climbed += 1

	if familiarity_system:
		familiarity_system.record_successful_grab(hold.get("holdIndex", 0))

	# Handle matching
	if hold.get("matchable", false) and SkillsDB.is_skill_unlocked("match") \
			and GameState.last_hand_used != "" and GameState.last_hand_used != GameState.selected_hand:
		feedback.append({"text": "Matched! Both hands & crosses reset", "type": "bonus"})
		GameState.last_hand_used = ""
		GameState.consecutive_crosses = 0

	_update_skill_state_after_move()

	for f in feedback:
		emit_signal("feedback_added", f["text"], f["type"])

	# Reset per-move toggles
	GameState.selected_hand = ""
	GameState.cross_active = false
	GameState.reach_active = false

	# Step 8: Update viewport + render + UI
	if route_loader:
		route_loader.update_viewport()
	emit_signal("move_resolved")

	# Step 9: Check win/loss
	if GameState.pump_state >= 3:
		emit_signal("game_ended", false, "Pump maxed out! Your forearms gave out.")
	elif GameState.grip_state >= 3:
		emit_signal("game_ended", false, "Grip depleted! Your skin couldn't hold on.")
	elif GameState.current_route and GameState.current_row >= GameState.current_route.get("topRow", 0):
		emit_signal("route_completed_signal")


func _update_skill_state_after_move() -> void:
	GameState.skill_state["justShook"] = false
	GameState.skill_state["justChalked"] = false
