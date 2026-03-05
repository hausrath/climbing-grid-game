extends Control

# 3-panel climbing screen. Wires all logic-script signals to UI methods.
# Mirrors the climbing mode sections of js/main.js and js/ui.js.

@onready var climbing_grid: Control = $ClimbingUI/CenterPanel/GridWrapper/ClimbingGrid
@onready var climbing_ui: Control = $ClimbingUI
@onready var tooltip_ctrl: Control = $TooltipController
@onready var game_over_popup: Control = $GameOverPopup
@onready var route_name_label: Label = $ClimbingUI/CenterPanel/RouteNameLabel
@onready var camp_btn: Button = $ClimbingUI/RightPanel/CampBtn
@onready var guidebook_btn: Button = $ClimbingUI/RightPanel/GuidebookBtn
@onready var skills_btn: Button = $ClimbingUI/RightPanel/SkillsBtn

# Logic node references (set by Main.gd via assign_logic_nodes)
var climbing_logic: Node = null
var climbing_actions: Node = null
var climbing_completion: Node = null
var route_loader: Node = null


func _ready() -> void:
	hide()


func assign_logic_nodes(logic: Node, actions: Node, completion: Node, loader: Node) -> void:
	climbing_logic = logic
	climbing_actions = actions
	climbing_completion = completion
	route_loader = loader
	_connect_signals()


func _connect_signals() -> void:
	if climbing_logic:
		if not climbing_logic.feedback_added.is_connected(_on_feedback):
			climbing_logic.feedback_added.connect(_on_feedback)
		if not climbing_logic.move_resolved.is_connected(_on_move_resolved):
			climbing_logic.move_resolved.connect(_on_move_resolved)
		if not climbing_logic.game_ended.is_connected(_on_game_ended):
			climbing_logic.game_ended.connect(_on_game_ended)
		if not climbing_logic.route_completed_signal.is_connected(_on_route_completed):
			climbing_logic.route_completed_signal.connect(_on_route_completed)

	if climbing_actions:
		if not climbing_actions.feedback_added.is_connected(_on_feedback):
			climbing_actions.feedback_added.connect(_on_feedback)
		if not climbing_actions.ui_needs_update.is_connected(_on_ui_needs_update):
			climbing_actions.ui_needs_update.connect(_on_ui_needs_update)
		if not climbing_actions.grid_needs_render.is_connected(_on_grid_needs_render):
			climbing_actions.grid_needs_render.connect(_on_grid_needs_render)

	if climbing_completion:
		if not climbing_completion.completion_data.is_connected(_on_completion_data):
			climbing_completion.completion_data.connect(_on_completion_data)
		if not climbing_completion.failure_data.is_connected(_on_failure_data):
			climbing_completion.failure_data.connect(_on_failure_data)
		if not climbing_completion.victory_data.is_connected(_on_victory_data):
			climbing_completion.victory_data.connect(_on_victory_data)

	if climbing_grid:
		if not climbing_grid.hold_clicked.is_connected(_on_hold_clicked):
			climbing_grid.hold_clicked.connect(_on_hold_clicked)
		if not climbing_grid.hold_hovered.is_connected(_on_hold_hovered):
			climbing_grid.hold_hovered.connect(_on_hold_hovered)

	if game_over_popup:
		if not game_over_popup.retry_requested.is_connected(_on_retry):
			game_over_popup.retry_requested.connect(_on_retry)
		if not game_over_popup.map_requested.is_connected(_on_map_from_popup):
			game_over_popup.map_requested.connect(_on_map_from_popup)

	if camp_btn and not camp_btn.pressed.is_connected(_on_camp_btn):
		camp_btn.pressed.connect(_on_camp_btn)
	if guidebook_btn and not guidebook_btn.pressed.is_connected(_on_guidebook_btn):
		guidebook_btn.pressed.connect(_on_guidebook_btn)
	if skills_btn and not skills_btn.pressed.is_connected(_on_skills_btn):
		skills_btn.pressed.connect(_on_skills_btn)


func start_climb(route: Dictionary) -> void:
	GameState.current_route = route
	if route_loader:
		route_loader.load_route(route)
	if route_name_label:
		route_name_label.text = "%s [%s]" % [route.get("name", ""), route.get("grade", "")]
	if climbing_ui:
		climbing_ui.clear_feedback()
		climbing_ui.update_ui()
	if climbing_grid:
		climbing_grid.render_grid()
	if game_over_popup:
		game_over_popup.hide()
	show()


# --- Signal handlers ---

func _on_feedback(text: String, type: String) -> void:
	if climbing_ui:
		climbing_ui.add_feedback(text, type)


func _on_move_resolved() -> void:
	if climbing_grid:
		climbing_grid.render_grid()
	if climbing_ui:
		climbing_ui.update_ui()
	if tooltip_ctrl:
		tooltip_ctrl.hide_tooltip()


func _on_ui_needs_update() -> void:
	if climbing_ui:
		climbing_ui.update_ui()


func _on_grid_needs_render() -> void:
	if climbing_grid:
		climbing_grid.render_grid()


func _on_game_ended(_victory: bool, message: String) -> void:
	if climbing_completion:
		climbing_completion.end_game(_victory, message)


func _on_route_completed() -> void:
	if climbing_completion:
		climbing_completion.complete_route()


func _on_hold_clicked(row: int, col: int) -> void:
	if climbing_logic:
		climbing_logic.move_to_hold(row, col)


func _on_hold_hovered(hold: Dictionary, row: int, col: int) -> void:
	if tooltip_ctrl:
		tooltip_ctrl.show_hold_tooltip(hold, row, col)


func _on_completion_data(stars: int, star_results: Dictionary, new_skills: Array,
		new_actions: Array, loot: Dictionary, time_elapsed: float, time_limit: int) -> void:
	_show_game_over(true, stars, star_results, new_skills, new_actions, loot, time_elapsed, time_limit, "")


func _on_failure_data(message: String, current_row: int, top_row: int,
		high_point: int, is_new_high: bool) -> void:
	_show_game_over(false, 0, {}, [], [], {}, 0.0, 0, message)


func _on_victory_data(total_stars: int, routes_completed: int) -> void:
	_show_final_victory(total_stars, routes_completed)


func _show_game_over(success: bool, stars: int, star_results: Dictionary,
		new_skills: Array, new_actions: Array, loot: Dictionary, time_elapsed: float,
		time_limit: int, message: String) -> void:
	if game_over_popup and game_over_popup.has_method("show_result"):
		game_over_popup.show_result(success, stars, star_results, new_skills, new_actions, loot,
			time_elapsed, time_limit, message)
	elif game_over_popup:
		game_over_popup.show()


func _show_final_victory(total_stars: int, routes_completed: int) -> void:
	if game_over_popup and game_over_popup.has_method("show_victory"):
		game_over_popup.show_victory(total_stars, routes_completed)


func _on_retry() -> void:
	if GameState.current_route.is_empty(): return
	var main := get_tree().root.get_node_or_null("Main")
	if main and main.has_method("_start_climb"):
		main._start_climb(GameState.current_route)


func _on_map_from_popup() -> void:
	var main := get_tree().root.get_node_or_null("Main")
	if main and main.has_method("show_world_map"):
		main.show_world_map()


func _on_camp_btn() -> void:
	var main := get_tree().root.get_node_or_null("Main")
	if main and main.has_method("open_camp"):
		main.open_camp()


func _on_guidebook_btn() -> void:
	var main := get_tree().root.get_node_or_null("Main")
	if main and main.has_method("_show_guidebook"):
		main._show_guidebook()


func _on_skills_btn() -> void:
	var main := get_tree().root.get_node_or_null("Main")
	if main and main.has_method("_show_skills"):
		main._show_skills()
