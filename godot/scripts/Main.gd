extends Control

# Root controller. Handles keyboard input, mode switching, and climb start.
# Mirrors js/main.js.

# Child node references
@onready var title_screen: Control       = $TitleScreen
@onready var world_map: Control          = $GameContainer/WorldMap
@onready var climbing_screen: Control    = $GameContainer/ClimbingScreen
@onready var route_select: Control       = $RouteSelectOverlay
@onready var camp_ui: Control            = $CampOverlay
@onready var guidebook_ui: Control       = $GuidebookOverlay
@onready var beta_ui: Control            = $BetaOverlay
@onready var equipment_ui: Control       = $EquipmentOverlay
@onready var skills_ui: Control          = $SkillsOverlay
@onready var help_modal: Control         = $HelpModal

# Logic nodes (children of ClimbingScreen or separate)
@onready var route_loader: Node          = $ClimbingLogicNodes/RouteLoader
@onready var climbing_logic: Node        = $ClimbingLogicNodes/ClimbingLogic
@onready var climbing_actions: Node      = $ClimbingLogicNodes/ClimbingActions
@onready var climbing_completion: Node   = $ClimbingLogicNodes/ClimbingCompletion
@onready var equipment_logic: Node       = $ClimbingLogicNodes/EquipmentLogic
@onready var conditions_system: Node     = $ClimbingLogicNodes/ConditionsSystem
@onready var familiarity_system: Node    = $ClimbingLogicNodes/FamiliaritySystem

var _help_visible: bool = false


func _ready() -> void:
	_set_game_mode("title")
	_wire_overlay_signals()
	_wire_logic_refs()

	if equipment_logic and equipment_logic.has_method("give_starting_gear"):
		equipment_logic.give_starting_gear()
	if conditions_system and conditions_system.has_method("generate_daily_conditions"):
		conditions_system.generate_daily_conditions()


func _wire_logic_refs() -> void:
	# Inject exported refs into logic nodes
	if climbing_logic:
		climbing_logic.set("route_loader", route_loader)
		climbing_logic.set("familiarity_system", familiarity_system)
	if climbing_completion:
		climbing_completion.set("equipment_logic", equipment_logic)
		climbing_completion.set("conditions_system", conditions_system)
	if climbing_screen and climbing_screen.has_method("assign_logic_nodes"):
		climbing_screen.assign_logic_nodes(
			climbing_logic, climbing_actions, climbing_completion, route_loader)


func _wire_overlay_signals() -> void:
	if world_map:
		world_map.location_selected.connect(_on_location_selected)
	if route_select:
		route_select.route_selected.connect(_on_route_selected)
		route_select.closed.connect(show_world_map)
	if camp_ui:
		camp_ui.closed.connect(_resume_climbing)
		camp_ui.guidebook_requested.connect(_show_guidebook)
		camp_ui.equipment_requested.connect(_show_equipment)
		camp_ui.skills_requested.connect(_show_skills)
	if guidebook_ui:
		guidebook_ui.closed.connect(func(): _return_from_guidebook())
		guidebook_ui.climb_requested.connect(_on_guidebook_climb)
	if beta_ui:
		beta_ui.closed.connect(func(): _return_from_beta())
		beta_ui.climb_requested.connect(_on_route_selected)
	if equipment_ui:
		equipment_ui.closed.connect(func(): _return_from_equipment())
	if skills_ui:
		skills_ui.closed.connect(func(): _return_from_skills())


# --- Mode switching ---

func _set_game_mode(mode: String) -> void:
	GameState.game_mode = mode
	if title_screen:    title_screen.visible    = (mode == "title")
	if world_map:       world_map.visible        = (mode == "worldmap")
	if climbing_screen: climbing_screen.visible  = (mode == "climbing")


func start_game() -> void:
	_set_game_mode("worldmap")
	if world_map and world_map.has_method("render_world_map"):
		world_map.render_world_map()


func show_world_map() -> void:
	_close_all_overlays()
	_set_game_mode("worldmap")
	if world_map and world_map.has_method("render_world_map"):
		world_map.render_world_map()


func _close_all_overlays() -> void:
	for overlay in [route_select, camp_ui, guidebook_ui, beta_ui, equipment_ui, skills_ui]:
		if overlay:
			overlay.hide()


func _on_location_selected(location: Dictionary) -> void:
	GameState.current_location = location
	if conditions_system and conditions_system.has_method("generate_daily_conditions"):
		conditions_system.generate_daily_conditions()
	if route_select and route_select.has_method("show_route_selection"):
		route_select.show_route_selection(location)


func _on_route_selected(route: Dictionary) -> void:
	_start_climb(route)


func _on_guidebook_climb(location: Dictionary, route: Dictionary) -> void:
	GameState.current_location = location
	_start_climb(route)


func _start_climb(route: Dictionary) -> void:
	_close_all_overlays()
	# Reset all climbing state
	GameState.pump_state = 0
	GameState.pump_decay_counter = 0
	GameState.grip_state = 0
	GameState.selected_hand = ""
	GameState.current_hand = ""
	GameState.last_hand_used = ""
	GameState.holds_climbed = 0
	GameState.consecutive_crosses = 0
	GameState.shakes_used = 0
	GameState.chalks_used = 0
	GameState.chalk_remaining = GameState.max_chalk
	GameState.cross_cooldown = 0
	GameState.reach_cooldown = 0
	GameState.shake_cooldown = 0
	GameState.chalk_cooldown = 0
	GameState.commit_cooldown = 0
	GameState.dyno_cooldown = 0
	GameState.bump_cooldown = 0
	GameState.match_cooldown = 0
	GameState.commit_active = false
	GameState.dyno_active = false
	GameState.bump_active = false
	GameState.cross_active = false
	GameState.reach_active = false
	GameState.movement_style = "regular"
	GameState.skill_state = {"just_shook": false, "just_chalked": false}
	GameState.climb_start_time = Time.get_unix_time_from_system()
	GameState.route_attempts += 1
	GameState.climbs_this_period += 1

	_set_game_mode("climbing")
	if climbing_screen and climbing_screen.has_method("start_climb"):
		climbing_screen.start_climb(route)


func _resume_climbing() -> void:
	_close_all_overlays()
	if GameState.game_mode != "climbing":
		_set_game_mode("climbing")


# Overlay open helpers

func _show_guidebook() -> void:
	if guidebook_ui and guidebook_ui.has_method("show_guidebook"):
		guidebook_ui.show_guidebook()


func _show_equipment() -> void:
	if equipment_ui and equipment_ui.has_method("show_equipment"):
		equipment_ui.show_equipment(equipment_logic)


func _show_skills() -> void:
	if skills_ui and skills_ui.has_method("show_skills"):
		skills_ui.show_skills()


func _return_from_guidebook() -> void:
	if camp_ui and camp_ui.visible:
		pass  # stay in camp
	elif GameState.game_mode == "climbing":
		_resume_climbing()


func _return_from_beta() -> void:
	_return_from_guidebook()


func _return_from_equipment() -> void:
	if camp_ui and camp_ui.visible:
		pass


func _return_from_skills() -> void:
	if camp_ui and camp_ui.visible:
		pass


# Camp access from climbing screen
func open_camp() -> void:
	if camp_ui and camp_ui.has_method("show_camp"):
		camp_ui.show_camp()


# --- Keyboard input ---

func _input(event: InputEvent) -> void:
	if not (event is InputEventKey and event.pressed and not event.echo):
		return

	# Help modal: TAB toggles, ESC closes
	if event.keycode == KEY_TAB:
		_toggle_help()
		return

	if _help_visible:
		if event.keycode == KEY_ESCAPE:
			_toggle_help()
		return

	match GameState.game_mode:
		"title":
			start_game()
		"worldmap":
			if event.keycode == KEY_ESCAPE:
				pass  # already at top level
		"climbing":
			_handle_climbing_input(event)


func _handle_climbing_input(event: InputEventKey) -> void:
	# Check if an overlay is visible — let it handle input
	for overlay in [camp_ui, guidebook_ui, beta_ui, equipment_ui, skills_ui]:
		if overlay and overlay.visible:
			return

	match event.keycode:
		KEY_A: _select_hand("left")
		KEY_D: _select_hand("right")
		KEY_Q:
			if climbing_actions and climbing_actions.has_method("use_shake"):
				climbing_actions.use_shake()
		KEY_E:
			if climbing_actions and climbing_actions.has_method("use_chalk"):
				climbing_actions.use_chalk()
		KEY_R:
			if climbing_actions and climbing_actions.has_method("activate_commit"):
				climbing_actions.activate_commit()
		KEY_T:
			if climbing_actions and climbing_actions.has_method("activate_dyno"):
				climbing_actions.activate_dyno()
		KEY_B:
			if climbing_actions and climbing_actions.has_method("activate_bump"):
				climbing_actions.activate_bump()
		KEY_1: _select_movement_style("reach")
		KEY_2: _select_movement_style("regular")
		KEY_3: _select_movement_style("cross")
		KEY_Z: _set_weight("left")
		KEY_X: _set_weight("center")
		KEY_C: _set_weight("right")
		KEY_ESCAPE: show_world_map()
		KEY_F1: open_camp()


func _select_hand(hand: String) -> void:
	# Alternation enforcement: same hand twice is allowed but warns
	GameState.selected_hand = hand
	if climbing_screen and climbing_screen.has_node("ClimbingUI"):
		climbing_screen.get_node("ClimbingUI").update_ui()


func _select_movement_style(style: String) -> void:
	if style == "reach" and not SkillsDB.is_skill_unlocked("reach"):
		return
	if style == "cross" and not SkillsDB.is_skill_unlocked("cross"):
		return
	GameState.movement_style = style
	GameState.cross_active = (style == "cross")
	GameState.reach_active = (style == "reach")
	if climbing_screen and climbing_screen.has_node("ClimbingUI"):
		climbing_screen.get_node("ClimbingUI").update_ui()


func _set_weight(direction: String) -> void:
	if not SkillsDB.is_skill_unlocked("weightShift"):
		return
	GameState.weight = direction
	if climbing_screen and climbing_screen.has_node("ClimbingUI"):
		climbing_screen.get_node("ClimbingUI").update_ui()


func _toggle_help() -> void:
	_help_visible = not _help_visible
	if help_modal:
		help_modal.visible = _help_visible
