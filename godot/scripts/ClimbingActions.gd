extends Node

# Handles climbing actions: Shake, Chalk, Commit, Dyno.
# Also provides findCurrentHold.
# Mirrors js/climbing-actions.js

signal feedback_added(text: String, type: String)
signal ui_needs_update
signal grid_needs_render


func use_shake() -> void:
	if GameState.shake_cooldown > 0:
		emit_signal("feedback_added",
			"Shake on cooldown! %d moves remaining." % GameState.shake_cooldown, "penalty")
		return

	if GameState.pump_state <= 0:
		emit_signal("feedback_added", "Already fresh — no pump to shake off!", "neutral")
		return

	var old_state: int = GameState.pump_state
	GameState.pump_state = max(0, GameState.pump_state - 1)
	var new_label: String = Constants.PUMP_STATE_LABELS[min(GameState.pump_state, 2)]

	GameState.shakes_used += 1
	GameState.shake_cooldown = GameState.action_cooldown_length

	emit_signal("feedback_added",
		"Shook out! Pump: %s -> %s" % [Constants.PUMP_STATE_LABELS[min(old_state, 2)], new_label],
		"bonus")
	emit_signal("feedback_added", "Cooldown: %d moves" % GameState.shake_cooldown, "neutral")

	if SkillsDB.is_skill_unlocked("deadpoint"):
		GameState.skill_state["justShook"] = true
		emit_signal("feedback_added", "Deadpoint ready! Next move: no pump state change", "bonus")

	# Shake counts as a turn for cooldowns
	if GameState.cross_cooldown > 0:   GameState.cross_cooldown -= 1
	if GameState.reach_cooldown > 0:   GameState.reach_cooldown -= 1
	if GameState.commit_cooldown > 0:  GameState.commit_cooldown -= 1
	if GameState.dyno_cooldown > 0:    GameState.dyno_cooldown -= 1

	emit_signal("ui_needs_update")


func use_chalk() -> void:
	if GameState.chalk_remaining <= 0:
		emit_signal("feedback_added", "Out of chalk! No uses remaining this climb.", "penalty")
		return

	if GameState.chalk_cooldown > 0:
		emit_signal("feedback_added",
			"Chalk on cooldown! %d moves remaining." % GameState.chalk_cooldown, "penalty")
		return

	GameState.chalk_remaining -= 1

	var old_grip_label: String = Constants.GRIP_STATE_LABELS[min(GameState.grip_state, 2)]
	GameState.grip_state = 0
	GameState.grip_decay_counter = 0

	GameState.chalks_used += 1
	GameState.chalk_cooldown = 1

	emit_signal("feedback_added",
		"Chalked up! Grip: %s -> Chalked (%d/%d uses left)" % [
			old_grip_label, GameState.chalk_remaining, GameState.max_chalk],
		"bonus")

	if SkillsDB.is_skill_unlocked("deadpoint"):
		GameState.skill_state["justChalked"] = true
		emit_signal("feedback_added", "Deadpoint ready! Next move: grip decay skipped", "bonus")

	# Chalk counts as a turn for cooldowns
	if GameState.cross_cooldown > 0:   GameState.cross_cooldown -= 1
	if GameState.reach_cooldown > 0:   GameState.reach_cooldown -= 1
	if GameState.commit_cooldown > 0:  GameState.commit_cooldown -= 1
	if GameState.dyno_cooldown > 0:    GameState.dyno_cooldown -= 1

	emit_signal("ui_needs_update")


func activate_commit() -> void:
	if not SkillsDB.is_skill_unlocked("commit"):
		emit_signal("feedback_added", "Commit skill not learned!", "penalty")
		return
	if GameState.commit_cooldown > 0:
		emit_signal("feedback_added",
			"Commit on cooldown! %d moves remaining" % GameState.commit_cooldown, "penalty")
		return
	if GameState.commit_active:
		emit_signal("feedback_added", "Commit already active!", "penalty")
		return
	GameState.commit_active = true
	emit_signal("feedback_added", "COMMIT ACTIVATED! Next move: penalty reduced by 1 level!", "bonus")
	emit_signal("ui_needs_update")


func activate_dyno() -> void:
	if not SkillsDB.is_skill_unlocked("dyno"):
		emit_signal("feedback_added", "Dyno skill not learned!", "penalty")
		return
	if GameState.dyno_cooldown > 0:
		emit_signal("feedback_added",
			"Dyno on cooldown! %d moves remaining" % GameState.dyno_cooldown, "penalty")
		return
	if GameState.dyno_active:
		emit_signal("feedback_added", "Dyno already active!", "penalty")
		return
	GameState.dyno_active = true
	emit_signal("feedback_added", "DYNO ACTIVATED! Next move: reach extended to 3 spaces!", "bonus")
	emit_signal("grid_needs_render")
	emit_signal("ui_needs_update")


func find_current_hold() -> Dictionary:
	if GameState.route_grid.is_empty():
		return {}
	var row: int = GameState.current_row
	if row >= 0 and row < GameState.route_grid.size():
		for col in range(7):
			var cell = GameState.route_grid[row][col]
			if cell and cell.get("col", -1) == GameState.current_col:
				return cell
	return {}
