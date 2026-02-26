extends Control

# 5×5 world map of 25 locations. Mirrors renderWorldMap() / selectLocation() in js/main.js.

signal location_selected(location: Dictionary)

@onready var grid_container: GridContainer = $MapPanel/MarginContainer/VBox/MapGrid
@onready var title_label: Label = $MapPanel/MarginContainer/VBox/TitleLabel
@onready var stars_label: Label = $MapPanel/MarginContainer/VBox/StarsLabel
@onready var tooltip_panel: PanelContainer = $TooltipPanel
@onready var tooltip_label: Label = $TooltipPanel/MarginContainer/TooltipLabel

var _location_buttons: Array = []


func _ready() -> void:
	if title_label:
		title_label.text = "World Map"
	if tooltip_panel:
		tooltip_panel.hide()
	_build_grid()


func show_world_map() -> void:
	show()
	render_world_map()


func render_world_map() -> void:
	_refresh_buttons()
	_update_stars_label()


func _build_grid() -> void:
	if not grid_container:
		return
	grid_container.columns = 5
	grid_container.add_theme_constant_override("h_separation", 8)
	grid_container.add_theme_constant_override("v_separation", 8)
	_location_buttons.clear()

	for i in range(25):
		var btn := Button.new()
		btn.custom_minimum_size = Vector2(100, 80)
		btn.pressed.connect(_on_location_pressed.bind(i))
		btn.mouse_entered.connect(_on_location_hovered.bind(i))
		btn.mouse_exited.connect(_on_location_unhovered)
		grid_container.add_child(btn)
		_location_buttons.append(btn)


func _refresh_buttons() -> void:
	for i in range(min(_location_buttons.size(), GameState.locations.size())):
		var loc: Dictionary = GameState.locations[i]
		var btn: Button = _location_buttons[i]
		var loc_id: int = loc.get("id", i)
		var unlocked: bool = GameState.is_location_unlocked(loc)
		var stars: int = GameState.calculate_location_stars(loc_id)
		var row_pos: int = loc.get("row", i / 5)
		var col_pos: int = loc.get("col", i % 5)
		var tier: int = loc.get("tier", 0)

		if unlocked:
			btn.text = "%s\n(%d,%d) T%d\n★ %d" % [loc.get("name", "?"), row_pos, col_pos, tier, stars]
			btn.disabled = false
			btn.modulate = Color.WHITE if GameState.current_location.get("id", -1) != loc_id else Color(0.8, 1.0, 0.8)
		else:
			btn.text = "???\n(%d,%d)" % [row_pos, col_pos]
			btn.disabled = true
			btn.modulate = Color(0.35, 0.35, 0.35)


func _update_stars_label() -> void:
	if stars_label:
		stars_label.text = "Total Stars: %d / 125" % GameState.calculate_total_stars()


func _on_location_pressed(index: int) -> void:
	if index >= GameState.locations.size():
		return
	var loc: Dictionary = GameState.locations[index]
	if GameState.is_location_unlocked(loc):
		emit_signal("location_selected", loc)


func _on_location_hovered(index: int) -> void:
	if index >= GameState.locations.size():
		return
	var loc: Dictionary = GameState.locations[index]
	if not GameState.is_location_unlocked(loc):
		return
	if tooltip_panel and tooltip_label:
		var loc_id: int = loc.get("id", index)
		var stars: int = GameState.calculate_location_stars(loc_id)
		var modifier = loc.get("modifier", {})
		var mod_text := ""
		if not modifier.is_empty():
			mod_text = "\nModifier: %s\n%s" % [modifier.get("name", ""), modifier.get("description", "")]
		tooltip_label.text = "%s\nStars: %d%s" % [loc.get("name", "?"), stars, mod_text]
		tooltip_panel.show()
		tooltip_panel.position = get_global_mouse_position() + Vector2(12, 4)


func _on_location_unhovered() -> void:
	if tooltip_panel:
		tooltip_panel.hide()


func _process(_delta: float) -> void:
	if tooltip_panel and tooltip_panel.visible:
		tooltip_panel.position = get_global_mouse_position() + Vector2(12, 4)
