extends Control

# Manages the 7×7 hold-cell grid, renders from GameState.grid.
# Mirrors renderGrid() in js/ui.js.

signal hold_clicked(row: int, col: int)
signal hold_hovered(hold: Dictionary, row: int, col: int)

const COLS := 7
const ROWS := 7

var _cells: Array = []   # 2D: _cells[row][col]


func _ready() -> void:
	_build_cells()


func _build_cells() -> void:
	# Create a GridContainer child if not already present
	var grid := get_node_or_null("GridContainer")
	if grid == null:
		grid = GridContainer.new()
		grid.name = "GridContainer"
		grid.columns = COLS
		grid.add_theme_constant_override("h_separation", 2)
		grid.add_theme_constant_override("v_separation", 2)
		grid.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		add_child(grid)

	_cells.clear()
	for r in range(ROWS):
		var row_arr: Array = []
		for c in range(COLS):
			var cell: Control = _make_cell(r, c)
			grid.add_child(cell)
			row_arr.append(cell)
		_cells.append(row_arr)


func _make_cell(row: int, col: int) -> Control:
	# Use HoldCell script if the scene is available, otherwise plain Control
	var cell_scene := load("res://scenes/HoldCell.tscn") if ResourceLoader.exists("res://scenes/HoldCell.tscn") else null
	var cell: Control
	if cell_scene:
		cell = cell_scene.instantiate()
		cell.setup(row, col)
	else:
		# Fallback: script-only node
		cell = Control.new()
		cell.set_script(load("res://scripts/HoldCell.gd"))
		cell.setup(row, col)
	cell.custom_minimum_size = Vector2(80, 80)
	cell.pressed.connect(_on_cell_pressed)
	cell.hovered.connect(_on_cell_hovered)
	return cell


func render_grid() -> void:
	if _cells.is_empty():
		return

	var current_row: int = GameState.current_row
	var current_col: int = GameState.current_col
	var current_hand: String = GameState.current_hand
	var dyno_active: bool = GameState.dyno_active
	var max_reach: int = 3 if dyno_active else 2

	for vr in range(ROWS):
		for vc in range(COLS):
			var cell = _cells[vr][vc]
			if cell == null:
				continue

			# Map viewport row → route row (row 6 = bottom, row 0 = top)
			var route_row: int = GameState.viewport_bottom + (6 - vr)

			var hold: Dictionary = {}
			if not GameState.route_grid.is_empty() and route_row < GameState.route_grid.size():
				var cell_val = GameState.route_grid[route_row][vc]
				if cell_val:
					hold = cell_val

			# Is player here?
			var is_player: bool = (route_row == current_row and vc == current_col and not hold.is_empty())

			# Reachability: must be above current row, within reach
			var dy: int = route_row - current_row
			var dx: int = abs(vc - current_col)
			var reachable: bool = (not hold.is_empty() and dy > 0 and dy <= max_reach and dx <= max_reach)

			if is_player:
				cell.set_hold(hold, false)
				cell.set_player_here(current_hand if current_hand != "" else "left")
			else:
				cell.set_hold(hold, reachable)


func _on_cell_pressed(row: int, col: int) -> void:
	emit_signal("hold_clicked", row, col)


func _on_cell_hovered(row: int, col: int) -> void:
	var route_row: int = GameState.viewport_bottom + (6 - row)
	var hold: Dictionary = {}
	if not GameState.route_grid.is_empty() and route_row < GameState.route_grid.size():
		var cell_val = GameState.route_grid[route_row][col]
		if cell_val:
			hold = cell_val
	if not hold.is_empty():
		emit_signal("hold_hovered", hold, row, col)
