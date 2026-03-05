extends Node

# Handles climbing actions: Shake, Chalk, Commit, Dyno, Bump.
# Also provides find_current_hold.
# Mirrors js/climbing-actions.js

signal feedback_added(text: String, type: String)
signal ui_needs_update
signal grid_needs_render


func use_shake() -> void:
	if GameState.shake_cooldown > 0:
		emit_signal("feedback_added",
			"Shake on cooldown! %d moves remaining." % GameState.shake_cooldown, "penalty")
		return

	var current_hold := find_current_hold()
	if current_hold.is_empty() or not current_hold.get("shakable", false):
		emit_signal("feedback_added", "No rest position to shake from!", "penalty")
		return

	if GameState.pump_state <= 0 and GameState.pump_decay_counter <= 0:
		emit_signal("feedback_added", "Already fresh — no pump to shake off!", "neutral")
		return

	var old_state: int = GameState.pump_state
	GameState.pump_state = 0
	GameState.pump_decay_counter = 0
	var new_label: String = Constants.PUMP_STATE_LABELS[0]

	GameState.shakes_used += 1
	GameState.shake_cooldown = 1

	emit_signal("feedback_added",
		"Shook out! Pump fully reset: %s -> %s" % [Constants.PUMP_STATE_LABELS[min(old_state, 2)], new_label],
		"bonus")
	emit_signal("feedback_added", "Cooldown: 1 move", "neutral")

	if SkillsDB.is_skill_unlocked("deadpoint"):
		GameState.skill_state["just_shook"] = true
		emit_signal("feedback_added", "Deadpoint ready! Next move: pump decay blocked", "bonus")

	emit_signal("ui_needs_update")


func use_chalk() -> void:
	if GameState.chalk_remaining <= 0:
		emit_signal("feedback_added", "Out of chalk! No uses remaining this climb.", "penalty")
		return

	if GameState.chalk_cooldown > 0:
		emit_signal("feedback_added",
			"Chalk on cooldown! %d moves remaining." % GameState.chalk_cooldown, "penalty")
		return

	var current_hold := find_current_hold()
	if current_hold.is_empty() or not current_hold.get("chalkable", false):
		emit_signal("feedback_added", "No chalk bucket here!", "penalty")
		return

	GameState.chalk_remaining -= 1

	var old_grip_label: String = Constants.GRIP_STATE_LABELS[min(GameState.grip_state, 2)]
	GameState.grip_state = 0

	GameState.chalks_used += 1
	GameState.chalk_cooldown = 1

	emit_signal("feedback_added",
		"Chalked up! Grip: %s -> Chalked (%d/%d uses left)" % [
			old_grip_label, GameState.chalk_remaining, GameState.max_chalk],
		"bonus")

	if SkillsDB.is_skill_unlocked("deadpoint"):
		GameState.skill_state["just_chalked"] = true
		emit_signal("feedback_added", "Deadpoint ready! Next move: grip state change blocked", "bonus")

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


func activate_bump() -> void:
	if not SkillsDB.is_skill_unlocked("bump"):
		emit_signal("feedback_added", "Bump skill not learned!", "penalty")
		return
	if GameState.bump_cooldown > 0:
		emit_signal("feedback_added",
			"Bump on cooldown! %d moves remaining" % GameState.bump_cooldown, "penalty")
		return
	if GameState.bump_active:
		emit_signal("feedback_added", "Bump already active!", "penalty")
		return
	GameState.bump_active = true
	emit_signal("feedback_added", "BUMP ACTIVATED! Lateral move ready (same hand OK)!", "bonus")
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
