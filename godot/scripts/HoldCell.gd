extends Control

# Single hold cell in the 7×7 climbing grid.
# Custom _draw() produces a semicircle rotated to the hold's angle.
# Mirrors the CSS semicircle holds in index.html / renderGrid() in js/ui.js.

signal pressed(row: int, col: int)
signal hovered(row: int, col: int)

const HOLD_COLORS := {
	"jug": Color(0.2, 0.7, 0.2),
	"edge": Color(0.8, 0.8, 0.2),
	"pocket": Color(0.2, 0.6, 0.9),
	"crimp": Color(0.9, 0.3, 0.2),
	"sloper": Color(0.7, 0.4, 0.9),
	"pinch": Color(0.9, 0.6, 0.2),
	"undercling": Color(0.2, 0.9, 0.8),
	"gaston": Color(0.9, 0.2, 0.6),
	"sidepull": Color(0.5, 0.8, 0.5),
	"start": Color(0.4, 0.9, 0.4),
	"top": Color(1.0, 0.85, 0.1),
}
const DEFAULT_COLOR := Color(0.5, 0.5, 0.5)

var grid_row: int = 0
var grid_col: int = 0
var hold_data: Dictionary = {}
var is_reachable: bool = false
var player_hand: String = ""   # "" | "left" | "right"
var _hover: bool = false


func setup(row: int, col: int) -> void:
	grid_row = row
	grid_col = col
	custom_minimum_size = Vector2(80, 80)
	mouse_filter = Control.MOUSE_FILTER_PASS


func set_hold(data: Dictionary, reachable: bool) -> void:
	hold_data = data
	is_reachable = reachable
	player_hand = ""
	queue_redraw()


func set_player_here(hand: String) -> void:
	player_hand = hand
	queue_redraw()


func clear() -> void:
	hold_data = {}
	is_reachable = false
	player_hand = ""
	queue_redraw()


func _draw() -> void:
	var center := size / 2.0
	var radius: float = min(size.x, size.y) / 2.0 - 4.0

	# Background
	draw_rect(Rect2(Vector2.ZERO, size), Color(0.08, 0.08, 0.08))

	if hold_data.is_empty():
		# Draw subtle grid dot
		draw_circle(center, 3.0, Color(0.2, 0.2, 0.2))
		return

	var hold_type: String = hold_data.get("type", "jug")
	var angle_deg: int = hold_data.get("angle", 0)
	var base_color: Color = HOLD_COLORS.get(hold_type, DEFAULT_COLOR)

	if not is_reachable and player_hand.is_empty():
		base_color = base_color.darkened(0.55)
	elif _hover:
		base_color = base_color.lightened(0.15)

	# Semicircle: flat edge faces the angle direction
	var start_rad := deg_to_rad(float(angle_deg) - 90.0)
	var pts := PackedVector2Array()
	pts.append(center)
	for i in range(33):
		var a := start_rad + (PI / 32.0) * float(i)
		pts.append(center + Vector2(cos(a), sin(a)) * radius)
	draw_colored_polygon(pts, base_color)

	# Outer ring
	draw_arc(center, radius, 0.0, TAU, 48, base_color.darkened(0.4), 1.5)

	# Hold type label
	var label_text: String = hold_type.to_upper()
	if hold_data.get("type") == "start":
		label_text = "START"
	elif hold_data.get("type") == "top":
		label_text = "TOP"
	draw_string(ThemeDB.fallback_font, center + Vector2(-18, 6), label_text,
		HORIZONTAL_ALIGNMENT_LEFT, -1, 10, Color(0.0, 0.0, 0.0, 0.8))

	# Angle label
	var angle_text := "%d°" % angle_deg
	draw_string(ThemeDB.fallback_font, center + Vector2(-10, 18), angle_text,
		HORIZONTAL_ALIGNMENT_LEFT, -1, 9, Color(0.0, 0.0, 0.0, 0.7))

	# Player marker
	if not player_hand.is_empty():
		var hand_char := "L" if player_hand == "left" else "R"
		draw_string(ThemeDB.fallback_font, center + Vector2(-8, -10), hand_char,
			HORIZONTAL_ALIGNMENT_LEFT, -1, 20, Color.WHITE)

	# Matchable indicator
	if hold_data.get("matchable", false):
		draw_circle(center + Vector2(radius - 6, -radius + 6), 4.0, Color(1.0, 1.0, 0.0, 0.8))

	# Reachability highlight border
	if is_reachable and player_hand.is_empty():
		draw_arc(center, radius + 2.0, 0.0, TAU, 48, Color(1.0, 1.0, 1.0, 0.4), 2.0)


func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		emit_signal("pressed", grid_row, grid_col)


func _mouse_entered() -> void:
	_hover = true
	queue_redraw()
	if not hold_data.is_empty():
		emit_signal("hovered", grid_row, grid_col)


func _mouse_exited() -> void:
	_hover = false
	queue_redraw()
