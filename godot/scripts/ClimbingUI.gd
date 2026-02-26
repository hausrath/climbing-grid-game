extends Control

# Manages all climbing-screen UI: hand buttons, weight, action buttons,
# pump/grip bars, move counter, feedback log, sidebar conditions.
# Mirrors updateUI() and addFeedback() in js/ui.js.

const MAX_FEEDBACK := 15

@onready var left_hand_btn: Button = $LeftPanel/HandButtons/LeftHandBtn
@onready var right_hand_btn: Button = $LeftPanel/HandButtons/RightHandBtn
@onready var weight_section: Control = $LeftPanel/WeightSection
@onready var weight_left_btn: Button = $LeftPanel/WeightSection/WeightRow/WeightLeftBtn
@onready var weight_center_btn: Button = $LeftPanel/WeightSection/WeightRow/WeightCenterBtn
@onready var weight_right_btn: Button = $LeftPanel/WeightSection/WeightRow/WeightRightBtn
@onready var weight_indicator: Label = $LeftPanel/WeightSection/WeightIndicator

@onready var pump_bar: ProgressBar = $RightPanel/PumpBar
@onready var pump_label: Label = $RightPanel/PumpLabel
@onready var grip_bar: ProgressBar = $RightPanel/GripBar
@onready var grip_label: Label = $RightPanel/GripLabel

@onready var shake_btn: Button = $CenterPanel/Actions/ActionsMargin/ActionsVBox/Row1/ShakeBtn
@onready var chalk_btn: Button = $CenterPanel/Actions/ActionsMargin/ActionsVBox/Row1/ChalkBtn
@onready var cross_btn: Button = $CenterPanel/Actions/ActionsMargin/ActionsVBox/SkillRow/CrossBtn
@onready var regular_btn: Button = $CenterPanel/Actions/ActionsMargin/ActionsVBox/SkillRow/RegularBtn
@onready var reach_btn: Button = $CenterPanel/Actions/ActionsMargin/ActionsVBox/SkillRow/ReachBtn
@onready var commit_btn: Button = $CenterPanel/Actions/ActionsMargin/ActionsVBox/SkillRow/CommitBtn
@onready var dyno_btn: Button = $CenterPanel/Actions/ActionsMargin/ActionsVBox/SkillRow/DynoBtn

@onready var move_count_label: Label = $CenterPanel/MoveCount
@onready var feedback_container: VBoxContainer = $RightPanel/FeedbackScroll/FeedbackContainer
@onready var sidebar_conditions: PanelContainer = $RightPanel/SidebarConditions
@onready var conditions_label: Label = $RightPanel/SidebarConditions/ConditionsLabel


func update_ui() -> void:
	_update_hand_buttons()
	_update_weight_section()
	_update_action_buttons()
	_update_resource_bars()
	_update_move_count()
	_update_conditions_sidebar()


func _update_hand_buttons() -> void:
	if not left_hand_btn or not right_hand_btn:
		return
	var sel := GameState.selected_hand
	left_hand_btn.text = "SELECT (A)" if sel != "left" else "LEFT ✓"
	right_hand_btn.text = "SELECT (D)" if sel != "right" else "RIGHT ✓"
	left_hand_btn.modulate = Color(0.4, 1.0, 0.4) if sel == "left" else Color.WHITE
	right_hand_btn.modulate = Color(0.4, 1.0, 0.4) if sel == "right" else Color.WHITE


func _update_weight_section() -> void:
	if not weight_section:
		return
	var shift_unlocked := SkillsDB.is_skill_unlocked("weightShift")
	weight_section.visible = shift_unlocked
	if not shift_unlocked:
		return
	var w := GameState.weight
	if weight_left_btn:   weight_left_btn.modulate   = Color(0.4, 1.0, 0.4) if w == "left"   else Color.WHITE
	if weight_center_btn: weight_center_btn.modulate = Color(0.4, 1.0, 0.4) if w == "center" else Color.WHITE
	if weight_right_btn:  weight_right_btn.modulate  = Color(0.4, 1.0, 0.4) if w == "right"  else Color.WHITE
	if weight_indicator:  weight_indicator.text = "Weight: %s" % w.capitalize()


func _update_action_buttons() -> void:
	# Shake
	if shake_btn:
		if GameState.shake_cooldown > 0:
			shake_btn.text = "SHAKE (%d)" % GameState.shake_cooldown
		else:
			shake_btn.text = "SHAKE (Q)"
		shake_btn.disabled = GameState.shake_cooldown > 0

	# Chalk
	if chalk_btn:
		if GameState.chalk_cooldown > 0:
			chalk_btn.text = "CHALK CD"
		elif GameState.chalk_remaining <= 0:
			chalk_btn.text = "NO CHALK"
		else:
			chalk_btn.text = "CHALK (%d) (E)" % GameState.chalk_remaining
		chalk_btn.disabled = (GameState.chalk_cooldown > 0 or GameState.chalk_remaining <= 0)

	# Movement style buttons
	_update_style_btn(cross_btn,   "cross",   "CROSS (3)",   GameState.cross_cooldown)
	_update_style_btn(regular_btn, "",        "REGULAR (2)", 0)
	_update_style_btn(reach_btn,   "reach",   "REACH (1)",   GameState.reach_cooldown)

	# Commit
	if commit_btn:
		var commit_unlocked := SkillsDB.is_skill_unlocked("commit")
		commit_btn.visible = commit_unlocked
		if commit_unlocked:
			if GameState.commit_active:
				commit_btn.text = "COMMIT ✓ (R)"
				commit_btn.modulate = Color(0.4, 1.0, 0.4)
			elif GameState.commit_cooldown > 0:
				commit_btn.text = "COMMIT (%d)" % GameState.commit_cooldown
				commit_btn.modulate = Color.WHITE
			else:
				commit_btn.text = "COMMIT (R)"
				commit_btn.modulate = Color.WHITE
			commit_btn.disabled = (GameState.commit_cooldown > 0 or GameState.commit_active)

	# Dyno
	if dyno_btn:
		var dyno_unlocked := SkillsDB.is_skill_unlocked("dyno")
		dyno_btn.visible = dyno_unlocked
		if dyno_unlocked:
			if GameState.dyno_active:
				dyno_btn.text = "DYNO ✓ (T)"
				dyno_btn.modulate = Color(0.4, 1.0, 0.4)
			elif GameState.dyno_cooldown > 0:
				dyno_btn.text = "DYNO (%d)" % GameState.dyno_cooldown
				dyno_btn.modulate = Color.WHITE
			else:
				dyno_btn.text = "DYNO (T)"
				dyno_btn.modulate = Color.WHITE
			dyno_btn.disabled = (GameState.dyno_cooldown > 0 or GameState.dyno_active)

	# Style selection highlight
	var style := GameState.movement_style
	if cross_btn:   cross_btn.modulate   = Color(0.4, 1.0, 0.4) if style == "cross"   else Color.WHITE
	if regular_btn: regular_btn.modulate = Color(0.4, 1.0, 0.4) if style == "regular" else Color.WHITE
	if reach_btn:   reach_btn.modulate   = Color(0.4, 1.0, 0.4) if style == "reach"   else Color.WHITE


func _update_style_btn(btn: Button, style_id: String, label: String, cooldown: int) -> void:
	if not btn:
		return
	if style_id != "" and not SkillsDB.is_skill_unlocked(style_id):
		btn.visible = (style_id == "")
		return
	btn.visible = true
	if cooldown > 0:
		btn.text = label.split("(")[0].strip_edges() + " (%d)" % cooldown
		btn.disabled = true
	else:
		btn.text = label
		btn.disabled = false


func _update_resource_bars() -> void:
	if pump_bar:
		pump_bar.max_value = 3
		pump_bar.value = GameState.pump_state
	if pump_label:
		pump_label.text = "Pump: %s (%d/3)" % [
			Constants.PUMP_STATE_LABELS[min(GameState.pump_state, 2)], GameState.pump_state]

	if grip_bar:
		grip_bar.max_value = 3
		grip_bar.value = GameState.grip_state
	if grip_label:
		grip_label.text = "Grip: %s | decay %d/3" % [
			Constants.GRIP_STATE_LABELS[min(GameState.grip_state, 2)], GameState.grip_decay_counter]


func _update_move_count() -> void:
	if move_count_label:
		move_count_label.text = "Moves: %d" % GameState.holds_climbed


func _update_conditions_sidebar() -> void:
	if not sidebar_conditions or not conditions_label:
		return
	if GameState.current_location.is_empty():
		sidebar_conditions.visible = false
		return
	sidebar_conditions.visible = true
	var weather: String = GameState.current_conditions.get("temperature", "mild")
	var time_of_day: String = GameState.time_of_day
	conditions_label.text = "Weather: %s\nTime: %s" % [weather.capitalize(), time_of_day.capitalize()]


func add_feedback(text: String, type: String) -> void:
	if not feedback_container:
		return

	# Prune old feedback
	while feedback_container.get_child_count() >= MAX_FEEDBACK:
		feedback_container.get_child(0).queue_free()

	var lbl := Label.new()
	lbl.text = text
	lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	match type:
		"bonus":   lbl.modulate = Color(0.4, 1.0, 0.4)
		"penalty": lbl.modulate = Color(1.0, 0.4, 0.4)
		_:         lbl.modulate = Color(0.85, 0.85, 0.85)
	feedback_container.add_child(lbl)

	# Scroll to bottom
	await get_tree().process_frame
	var scroll := feedback_container.get_parent()
	if scroll is ScrollContainer:
		scroll.scroll_vertical = scroll.get_v_scroll_bar().max_value


func clear_feedback() -> void:
	if feedback_container:
		for child in feedback_container.get_children():
			child.queue_free()
