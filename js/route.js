// Initialize grid (7 columns, dynamic rows based on route height)
function initGrid() {
    gameState.grid = [];
    for (let row = 0; row < 7; row++) {
        gameState.grid[row] = [];
        for (let col = 0; col < 7; col++) {
            gameState.grid[row][col] = null;
        }
    }
}

// Load a hand-crafted route into the grid
// Route holds use position: { x: col, y: row } where y=0 is start, y increases upward
function loadRoute(route) {
    if (!route || !route.holds || route.holds.length === 0) {
        console.error('loadRoute: Invalid route data', route);
        return;
    }

    // Find the max y value to determine grid height and completion row
    const maxY = Math.max(...route.holds.map(h => h.position.y));
    route.topRow = maxY;

    // Create a grid tall enough for the route (maxY + 1 rows, plus row 0 for player start)
    // We store the full route grid, and the viewport will show a window into it
    gameState.routeGrid = [];
    for (let row = 0; row <= maxY; row++) {
        gameState.routeGrid[row] = [];
        for (let col = 0; col < 7; col++) {
            gameState.routeGrid[row][col] = null;
        }
    }

    // Place all holds into the route grid
    route.holds.forEach((holdData, index) => {
        const row = holdData.position.y;
        const col = holdData.position.x;

        // Look up the hold type info from constants
        const holdTypeInfo = holdTypes.find(h => h.type === holdData.type);

        gameState.routeGrid[row][col] = {
            type: holdData.type,
            label: holdData.label || (holdTypeInfo ? holdTypeInfo.label : holdData.type.toUpperCase()),
            angle: holdData.angle || 0,
            pumpRating: holdData.pumpRating,
            gripDrain: holdData.gripDrain,
            matchable: holdData.matchable || false,
            isRest: holdData.isRest || false,
            shakable: holdData.shakable || false,
            chalkable: holdData.chalkable || false,
            holdIndex: index + 1,
            row: row,
            col: col,
            color: holdTypeInfo ? holdTypeInfo.color : '#738078'
        };
    });

    // Initialize the 7x7 viewport grid from the bottom of the route
    initGrid();

    // Player starts at bottom of route (conceptual row 0)
    gameState.currentRow = 0;
    gameState.currentCol = route.startCol !== undefined ? route.startCol : 2;
    gameState.viewportBottom = 0; // Which route row is at the bottom of the viewport

    // Copy the initial viewport from the route grid
    updateViewport();
}

// Update the 7x7 viewport grid based on current player position
function updateViewport() {
    // Player should stay near the bottom of the viewport (viewport row 5)
    // so that upcoming holds above are visible in rows 0-4.
    // viewportBottom = the route row that maps to viewport row 6 (bottom of screen)
    const playerRouteRow = gameState.currentRow;
    const maxRouteRow = gameState.routeGrid ? gameState.routeGrid.length - 1 : 0;

    // Place the player at viewport row 5 (one from bottom), so we see 5 rows above
    // vRow 5 maps to routeRow = viewportBottom + (6-5) = viewportBottom + 1
    // So viewportBottom = playerRouteRow - 1
    let desiredBottom = playerRouteRow - 1;

    // Clamp so we don't go below the start of the route
    desiredBottom = Math.max(0, desiredBottom);

    // Also clamp so we don't show too far beyond the top of the route
    if (maxRouteRow >= 6 && desiredBottom + 6 > maxRouteRow) {
        desiredBottom = maxRouteRow - 6;
    }
    desiredBottom = Math.max(0, desiredBottom);

    gameState.viewportBottom = desiredBottom;

    // If route grid exists, copy relevant rows into viewport
    if (!gameState.routeGrid) return;

    for (let vRow = 0; vRow < 7; vRow++) {
        const routeRow = gameState.viewportBottom + (6 - vRow); // Flip: viewport row 0 = top = highest route row
        for (let col = 0; col < 7; col++) {
            if (routeRow >= 0 && routeRow <= maxRouteRow && gameState.routeGrid[routeRow]) {
                gameState.grid[vRow][col] = gameState.routeGrid[routeRow][col];
            } else {
                gameState.grid[vRow][col] = null;
            }
        }
    }
}

// Get the viewport row for a given route row
function routeRowToViewportRow(routeRow) {
    return 6 - (routeRow - gameState.viewportBottom);
}

// Get the route row for a given viewport row
function viewportRowToRouteRow(viewportRow) {
    return gameState.viewportBottom + (6 - viewportRow);
}
