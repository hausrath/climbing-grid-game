extends Node

# Initializes and manages the route grid and 7x7 viewport into it.
# Mirrors js/route.js

func load_route(route: Dictionary) -> void:
	if not route.has("holds") or route["holds"].is_empty():
		push_error("RouteLoader: Invalid route data")
		return

	# Find max y value (top row index)
	var max_y := 0
	for hold_data in route["holds"]:
		var y: int = hold_data["position"]["y"]
		if y > max_y:
			max_y = y
	route["topRow"] = max_y

	# Build full route grid (rows 0..max_y, 7 columns)
	GameState.route_grid = []
	for row in range(max_y + 1):
		GameState.route_grid.append([])
		for _col in range(7):
			GameState.route_grid[row].append(null)

	# Place holds into route grid
	for index in range(route["holds"].size()):
		var hold_data: Dictionary = route["holds"][index]
		var row: int = hold_data["position"]["y"]
		var col: int = hold_data["position"]["x"]

		var hold_type_info: Dictionary = Constants.get_hold_type(hold_data["type"])

		GameState.route_grid[row][col] = {
			"type": hold_data["type"],
			"label": hold_data.get("label", hold_data["type"].to_upper()),
			"angle": hold_data.get("angle", 0),
			"pumpRating": hold_data.get("pumpRating", 1),
			"gripDrain": hold_data.get("gripDrain", 1),
			"matchable": hold_data.get("matchable", false),
			"isRest": hold_data.get("isRest", false),
			"holdIndex": index + 1,
			"row": row,
			"col": col,
			"color": hold_type_info.get("color", Color(0.45, 0.5, 0.47)),
		}

	# Initialize 7x7 viewport
	_init_grid()

	# Set player start position
	GameState.current_row = 0
	GameState.current_col = route.get("startCol", 2)
	GameState.viewport_bottom = 0

	update_viewport()


func update_viewport() -> void:
	var player_route_row: int = GameState.current_row
	var max_route_row: int = (GameState.route_grid.size() - 1) if GameState.route_grid else 0

	# Player stays at viewport row 5 (one from bottom), viewing 5 rows above
	var desired_bottom: int = player_route_row - 1
	desired_bottom = max(0, desired_bottom)

	if max_route_row >= 6 and desired_bottom + 6 > max_route_row:
		desired_bottom = max_route_row - 6
	desired_bottom = max(0, desired_bottom)

	GameState.viewport_bottom = desired_bottom

	if GameState.route_grid.is_empty():
		return

	for v_row in range(7):
		var route_row: int = GameState.viewport_bottom + (6 - v_row)
		for col in range(7):
			if route_row >= 0 and route_row <= max_route_row and route_row < GameState.route_grid.size():
				GameState.grid[v_row][col] = GameState.route_grid[route_row][col]
			else:
				GameState.grid[v_row][col] = null


func route_row_to_viewport_row(route_row: int) -> int:
	return 6 - (route_row - GameState.viewport_bottom)


func viewport_row_to_route_row(viewport_row: int) -> int:
	return GameState.viewport_bottom + (6 - viewport_row)


func _init_grid() -> void:
	GameState.grid = []
	for _row in range(7):
		GameState.grid.append([])
		for _col in range(7):
			GameState.grid[-1].append(null)
