extends Control

# Beta overlay: shows a route's hold sequence, conditions, and overview.
# Mirrors showBeta() / climbFromBeta() in js/camp.js.

signal closed
signal climb_requested(location: Dictionary, route: Dictionary)

@onready var close_btn: Button = $Panel/MarginContainer/VBox/CloseButton
@onready var title_label: Label = $Panel/MarginContainer/VBox/TitleLabel
@onready var overview_label: Label = $Panel/MarginContainer/VBox/OverviewLabel
@onready var conditions_label: Label = $Panel/MarginContainer/VBox/ConditionsLabel
@onready var holds_container: VBoxContainer = $Panel/MarginContainer/VBox/Scroll/HoldsContainer
@onready var climb_btn: Button = $Panel/MarginContainer/VBox/ClimbBtn

var _current_location: Dictionary = {}
var _current_route: Dictionary = {}


func _ready() -> void:
	if title_label:
		title_label.text = "Beta"
	if close_btn:
		close_btn.pressed.connect(_on_close)
	if climb_btn:
		climb_btn.pressed.connect(_on_climb)
	hide()


func show_beta(location: Dictionary, route: Dictionary) -> void:
	_current_location = location
	_current_route = route
	_render_beta()
	show()


func _render_beta() -> void:
	var route := _current_route
	var loc := _current_location

	if title_label:
		title_label.text = "Beta: %s [%s]" % [route.get("name", ""), route.get("grade", "")]

	if overview_label:
		var loc_id: int = loc.get("id", -1)
		var route_key := "%d-%s" % [loc_id, route.get("id", "")]
		var completion: Dictionary = GameState.completed_routes.get(route_key, {})
		var progress: Dictionary = GameState.route_progress.get(route_key, {})
		var attempts: int = progress.get("attempts", 0)
		var high_point: int = progress.get("highPoint", 0)
		var top_row: int = route.get("topRow", 1)
		var overview_text: String
		if completion.is_empty():
			overview_text = "Not yet completed — Attempts: %d — High point: row %d / %d" % [
				attempts, high_point, top_row]
		else:
			overview_text = "Completed! Stars: %d/5 — Attempts: %d" % [
				completion.get("stars", 0), attempts]
		overview_label.text = overview_text

	if conditions_label:
		var weather: String = GameState.daily_conditions.get("weather", "mild")
		conditions_label.text = "Current: %s | %s" % [
			weather.capitalize(), GameState.time_of_day.capitalize()]

	if not holds_container:
		return
	for child in holds_container.get_children():
		child.queue_free()

	var holds: Array = route.get("holds", [])
	for hold in holds:
		var lbl := Label.new()
		var h_type: String = hold.get("type", "jug")
		var angle: int = hold.get("angle", 0)
		var grip_cost: int = Constants.HOLD_GRIP_COST.get(h_type, 1)
		var ideal_wt: String = RouteDB.get_ideal_weight(angle)
		lbl.text = "Row %d Col %d — %s @ %d° (grip cost %d, ideal wt: %s)%s" % [
			hold.get("row", 0), hold.get("col", 0),
			h_type.to_upper(), angle, grip_cost, ideal_wt,
			" [matchable]" if hold.get("matchable", false) else ""]
		holds_container.add_child(lbl)

	if climb_btn:
		climb_btn.text = "CLIMB THIS ROUTE"


func _on_climb() -> void:
	hide()
	emit_signal("climb_requested", _current_location, _current_route)


func _on_close() -> void:
	hide()
	emit_signal("closed")
