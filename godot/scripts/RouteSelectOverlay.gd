extends Control

# Route-selection overlay shown after clicking a location on the world map.
# Mirrors showRouteSelection() in js/main.js.

signal route_selected(route: Dictionary)
signal closed

@onready var location_label: Label = $Panel/MarginContainer/VBox/LocationLabel
@onready var conditions_label: Label = $Panel/MarginContainer/VBox/ConditionsLabel
@onready var routes_container: VBoxContainer = $Panel/MarginContainer/VBox/RoutesContainer
@onready var close_btn: Button = $Panel/MarginContainer/VBox/CloseButton

var _current_location: Dictionary = {}


func _ready() -> void:
	if close_btn:
		close_btn.pressed.connect(_on_close)
	hide()


func show_route_selection(location: Dictionary) -> void:
	_current_location = location
	_render(location)
	show()


func _render(location: Dictionary) -> void:
	if location_label:
		location_label.text = location.get("name", "Unknown Location")

	if conditions_label:
		var weather: String = GameState.current_conditions.get("temperature", "mild")
		var time_str: String = GameState.time_of_day
		conditions_label.text = "Conditions: %s | %s" % [weather.capitalize(), time_str.capitalize()]

	if not routes_container:
		return
	for child in routes_container.get_children():
		child.queue_free()

	var loc_id: int = location.get("id", -1)
	var routes: Array = RouteDB.get_routes_for_location(loc_id)

	for route in routes:
		var route_key := "%d-%s" % [loc_id, route.get("id", "")]
		var completion: Dictionary = GameState.completed_routes.get(route_key, {})
		var stars_earned: int = completion.get("stars", 0)
		var star_results: Dictionary = completion.get("starResults", {})
		var completed: bool = not completion.is_empty()
		var loot_collected: bool = GameState.collected_loot.get(route_key, false)

		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 12)

		# Route info column
		var info_col := VBoxContainer.new()
		info_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL

		var name_lbl := Label.new()
		name_lbl.text = "%s [%s]" % [route.get("name", ""), route.get("grade", "")]
		info_col.add_child(name_lbl)

		if completed:
			var star_str := _build_star_string(star_results)
			var star_lbl := Label.new()
			star_lbl.text = star_str
			star_lbl.modulate = Color(1.0, 0.85, 0.1)
			info_col.add_child(star_lbl)

		var desc_lbl := Label.new()
		desc_lbl.text = route.get("description", "")
		desc_lbl.modulate = Color(0.7, 0.7, 0.7)
		desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		info_col.add_child(desc_lbl)

		row.add_child(info_col)

		# Climb button
		var climb_btn := Button.new()
		climb_btn.text = "CLIMB"
		if loot_collected:
			climb_btn.text += " [L]"
		climb_btn.custom_minimum_size = Vector2(70, 0)
		climb_btn.pressed.connect(_on_route_selected.bind(route))
		row.add_child(climb_btn)

		routes_container.add_child(row)
		routes_container.add_child(HSeparator.new())


func _build_star_string(star_results: Dictionary) -> String:
	var parts := PackedStringArray()
	var keys := ["completion", "speed", "pumpEfficiency", "gripEfficiency", "flashClimb"]
	var icons := {"completion": "✓", "speed": "⚡", "pumpEfficiency": "💪", "gripEfficiency": "🤌", "flashClimb": "⚡F"}
	for k in keys:
		if star_results.get(k, false):
			parts.append(icons.get(k, "★"))
		else:
			parts.append("○")
	return " ".join(parts)


func _on_route_selected(route: Dictionary) -> void:
	hide()
	emit_signal("route_selected", route)


func _on_close() -> void:
	hide()
	emit_signal("closed")
