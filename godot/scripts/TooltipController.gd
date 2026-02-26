extends Control

# Tooltip panel for hold hover, location hover, and skill hover.
# Mirrors showHoldTooltip() / refreshTooltip() in js/ui-tooltip.js.

@onready var tooltip_panel: PanelContainer = $TooltipPanel
@onready var tooltip_label: RichTextLabel = $TooltipPanel/MarginContainer/TooltipLabel


func _ready() -> void:
	if tooltip_panel:
		tooltip_panel.hide()
	mouse_filter = Control.MOUSE_FILTER_IGNORE


# --- Hold tooltip ---

func show_hold_tooltip(hold: Dictionary, viewport_row: int, viewport_col: int) -> void:
	if not tooltip_panel or not tooltip_label:
		return
	tooltip_label.bbcode_enabled = true
	tooltip_label.text = _build_hold_text(hold)
	tooltip_panel.show()
	_position_tooltip(viewport_col, viewport_row)


func _build_hold_text(hold: Dictionary) -> String:
	var hold_type: String = hold.get("type", "jug")
	var angle: int = hold.get("angle", 0)
	var grip_cost: int = Constants.HOLD_GRIP_COST.get(hold_type, 1)

	var lines := PackedStringArray()
	lines.append("[b]%s[/b] @ %d°" % [hold_type.to_upper(), angle])
	lines.append("Grip cost: %d tick(s)/move" % grip_cost)

	if hold.get("matchable", false):
		lines.append("[color=yellow]Matchable[/color]")

	lines.append("")
	lines.append("[b]Penalty breakdown:[/b]")

	for hand in ["left", "right"]:
		for weight in ["left", "center", "right"]:
			var base: int = RouteDB.lookup_penalty("up", hand, angle, weight)
			var label_str := "%s hand / %s wt" % [hand.capitalize(), weight.capitalize()]
			var level_name: String = Constants.PENALTY_LEVEL_NAMES[min(base, 4)]
			var color := _penalty_color(base)
			lines.append("[color=%s]%s: %s[/color]" % [color, label_str, level_name])

	return "\n".join(lines)


func _penalty_color(level: int) -> String:
	match level:
		0: return "88ff88"
		1: return "ffff44"
		2: return "ff8844"
		_: return "ff4444"


# --- Location tooltip ---

func show_location_tooltip(location: Dictionary) -> void:
	if not tooltip_panel or not tooltip_label:
		return
	tooltip_label.bbcode_enabled = true
	tooltip_label.text = _build_location_text(location)
	tooltip_panel.show()


func _build_location_text(location: Dictionary) -> String:
	var lines := PackedStringArray()
	lines.append("[b]%s[/b]" % location.get("name", "Unknown"))

	var loc_id: int = location.get("id", -1)
	var stars: int = GameState.calculate_location_stars(loc_id)
	lines.append("Stars: %d" % stars)

	var modifier = location.get("modifier", {})
	if not modifier.is_empty():
		var mod_name: String = modifier.get("name", "")
		var mod_desc: String = modifier.get("description", "")
		if mod_name:
			lines.append("Modifier: %s" % mod_name)
		if mod_desc:
			lines.append(mod_desc)

	return "\n".join(lines)


# --- Skill tooltip ---

func show_skill_tooltip(skill: Dictionary) -> void:
	if not tooltip_panel or not tooltip_label:
		return
	tooltip_label.bbcode_enabled = true
	tooltip_label.text = _build_skill_text(skill)
	tooltip_panel.show()


func _build_skill_text(skill: Dictionary) -> String:
	var lines := PackedStringArray()
	lines.append("[b]%s[/b]" % skill.get("name", ""))
	lines.append(skill.get("description", ""))
	lines.append("")
	lines.append("[b]Effect:[/b] %s" % skill.get("effect", ""))
	if skill.has("cooldown") and int(skill.get("cooldown", 0)) > 0:
		lines.append("Cooldown: %d moves" % int(skill.get("cooldown", 0)))
	return "\n".join(lines)


# --- Shared ---

func hide_tooltip() -> void:
	if tooltip_panel:
		tooltip_panel.hide()


func _position_tooltip(col: int, row: int) -> void:
	if not tooltip_panel:
		return
	# Place tooltip to the right of the hold; clamp to screen
	var cell_size := Vector2(82, 82)
	var pos := Vector2(col * cell_size.x + cell_size.x + 10,
		row * cell_size.y)
	var vp_size := get_viewport_rect().size
	tooltip_panel.position = pos.clamp(
		Vector2.ZERO,
		vp_size - tooltip_panel.size)
