extends Control

# Camp overlay: rest, stats, and navigation hub.
# Mirrors showCamp() / updateCampUI() / campRest() in js/camp.js.

signal closed
signal guidebook_requested
signal equipment_requested
signal skills_requested

@onready var title_label: Label = $Panel/MarginContainer/VBox/TitleLabel
@onready var location_label: Label = $Panel/MarginContainer/VBox/LocationLabel
@onready var conditions_label: Label = $Panel/MarginContainer/VBox/ConditionsLabel
@onready var stats_label: Label = $Panel/MarginContainer/VBox/StatsLabel
@onready var gear_points_label: Label = $Panel/MarginContainer/VBox/GearPointsLabel
@onready var rest_btn: Button = $Panel/MarginContainer/VBox/ButtonRow/RestBtn
@onready var guidebook_btn: Button = $Panel/MarginContainer/VBox/ButtonRow/GuidebookBtn
@onready var equipment_btn: Button = $Panel/MarginContainer/VBox/ButtonRow/EquipmentBtn
@onready var skills_btn: Button = $Panel/MarginContainer/VBox/ButtonRow/SkillsBtn
@onready var leave_btn: Button = $Panel/MarginContainer/VBox/LeaveBtn


func _ready() -> void:
	if title_label:
		title_label.text = "Camp"
	if rest_btn:
		rest_btn.pressed.connect(_on_rest)
	if guidebook_btn:
		guidebook_btn.pressed.connect(func(): emit_signal("guidebook_requested"))
	if equipment_btn:
		equipment_btn.pressed.connect(func(): emit_signal("equipment_requested"))
	if skills_btn:
		skills_btn.pressed.connect(func(): emit_signal("skills_requested"))
	if leave_btn:
		leave_btn.pressed.connect(_on_leave)
	hide()


func show_camp() -> void:
	_update_camp_ui()
	show()


func _update_camp_ui() -> void:
	var loc: Dictionary = GameState.current_location
	if location_label:
		location_label.text = "Location: %s" % loc.get("name", "Unknown")

	if conditions_label:
		var weather: String = GameState.daily_conditions.get("weather", "mild")
		var time_str: String = GameState.time_of_day
		conditions_label.text = "Weather: %s | Time: %s" % [
			weather.capitalize(), time_str.capitalize()]

	if stats_label:
		var total_stars := GameState.calculate_total_stars()
		var loc_id: int = loc.get("id", -1)
		var loc_stars := GameState.calculate_location_stars(loc_id)
		stats_label.text = "Total Stars: %d | Area Stars: %d" % [total_stars, loc_stars]

	if gear_points_label:
		gear_points_label.text = "Gear Points: %d" % GameState.gear_points

	# Rest button availability: limited by climbs_this_period
	if rest_btn:
		var can_rest: bool = GameState.climbs_this_period > 0
		rest_btn.disabled = not can_rest
		rest_btn.text = "Rest (advance time)" if can_rest else "Rest (must climb first)"


func _on_rest() -> void:
	# Advance time period, refresh conditions
	GameState.climbs_this_period = 0
	_cycle_time_of_day()
	_update_camp_ui()
	_on_feedback("Rested. Time advanced.")


func _cycle_time_of_day() -> void:
	var order := ["morning", "noon", "evening", "night"]
	var idx: int = order.find(GameState.time_of_day)
	if idx >= 0:
		GameState.time_of_day = order[(idx + 1) % order.size()]
	else:
		GameState.time_of_day = "morning"
	# Regenerate conditions for new time
	var conditions_node := get_node_or_null("/root/Main/ClimbingLogicNodes/ConditionsSystem")
	if conditions_node and conditions_node.has_method("generate_conditions_for_time"):
		conditions_node.generate_conditions_for_time()


func _on_feedback(text: String) -> void:
	# Brief feedback; just update stats label as confirmation
	if stats_label:
		stats_label.text += "\n" + text


func _on_leave() -> void:
	hide()
	emit_signal("closed")
