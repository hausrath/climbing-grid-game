extends Control

# Guidebook overlay: accordion list of all locations with routes and star counts.
# Mirrors showGuidebook() in js/camp.js.

signal closed
signal climb_requested(location: Dictionary, route: Dictionary)

@onready var close_btn: Button = $Panel/MarginContainer/VBox/CloseButton
@onready var title_label: Label = $Panel/MarginContainer/VBox/TitleLabel
@onready var scroll: ScrollContainer = $Panel/MarginContainer/VBox/Scroll
@onready var locations_container: VBoxContainer = $Panel/MarginContainer/VBox/Scroll/LocationsContainer

var _expanded_location: int = -1


func _ready() -> void:
	if title_label:
		title_label.text = "Guidebook"
	if close_btn:
		close_btn.pressed.connect(_on_close)
	hide()


func show_guidebook() -> void:
	_render_guidebook()
	show()


func _render_guidebook() -> void:
	if not locations_container:
		return
	for child in locations_container.get_children():
		child.queue_free()

	for i in range(GameState.locations.size()):
		var loc: Dictionary = GameState.locations[i]
		var loc_id: int = loc.get("id", i)
		if not GameState.is_location_unlocked(loc):
			continue
		_add_location_block(loc, loc_id)


func _add_location_block(loc: Dictionary, loc_id: int) -> void:
	var loc_stars: int = GameState.calculate_location_stars(loc_id)
	var routes: Array = RouteDB.get_routes_for_location(loc_id)

	# Header button (toggle expand)
	var header_btn := Button.new()
	var expand_char := "▼" if _expanded_location == loc_id else "►"
	header_btn.text = "%s %s — ★ %d" % [expand_char, loc.get("name", "?"), loc_stars]
	header_btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
	header_btn.pressed.connect(_toggle_location.bind(loc_id))
	locations_container.add_child(header_btn)

	# Routes sub-panel (only if expanded)
	if _expanded_location == loc_id:
		var sub := VBoxContainer.new()
		sub.add_theme_constant_override("separation", 4)

		# Modifier info
		var modifier = loc.get("modifier", {})
		if not modifier.is_empty():
			var mod_lbl := Label.new()
			mod_lbl.text = "  Modifier: %s — %s" % [modifier.get("name", ""), modifier.get("description", "")]
			mod_lbl.modulate = Color(0.7, 0.9, 1.0)
			mod_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
			sub.add_child(mod_lbl)

		for route in routes:
			var route_key := "%d-%s" % [loc_id, route.get("id", "")]
			var completion: Dictionary = GameState.completed_routes.get(route_key, {})
			var stars_earned: int = completion.get("stars", 0)

			var route_row := HBoxContainer.new()
			var name_lbl := Label.new()
			name_lbl.text = "  %s [%s] — %s" % [
				route.get("name", ""), route.get("grade", ""),
				"★ %d" % stars_earned if not completion.is_empty() else "Not tried"]
			name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			route_row.add_child(name_lbl)

			# Climb shortcut button
			var climb_btn := Button.new()
			climb_btn.text = "CLIMB"
			climb_btn.custom_minimum_size = Vector2(60, 0)
			climb_btn.pressed.connect(_on_climb_from_guidebook.bind(loc, route))
			route_row.add_child(climb_btn)
			sub.add_child(route_row)

		locations_container.add_child(sub)

	locations_container.add_child(HSeparator.new())


func _toggle_location(loc_id: int) -> void:
	if _expanded_location == loc_id:
		_expanded_location = -1
	else:
		_expanded_location = loc_id
	_render_guidebook()


func _on_climb_from_guidebook(loc: Dictionary, route: Dictionary) -> void:
	hide()
	emit_signal("climb_requested", loc, route)


func _on_close() -> void:
	hide()
	emit_signal("closed")
