function generateHold(holdTypeName, routeDifficultyMultiplier = 1.0, easinessBias = 0) {
    const holdType = holdTypes.find(h => h.type === holdTypeName);
    if (!holdType) {
        console.error(`Unknown hold type: ${holdTypeName}`);
        return generateHold('jug', routeDifficultyMultiplier, easinessBias); // Default to jug
    }
    
    // Calculate difficulty using GDD formula with easiness bias
    const difficulty = generateHoldDifficulty(holdType, routeDifficultyMultiplier, easinessBias);
    
    // Scale grip costs based on hold difficulty
    // Lower difficulty (easier hold) = lower costs
    // Higher difficulty (harder hold) = higher costs
    const difficultyFactor = 1 - difficulty; // Invert: 0 = easy, 1 = hard
    
    // Base costs come from hold type, then scale with individual difficulty
    const gripCost = Math.round(holdType.gripCost * (0.7 + difficultyFactor * 0.6)); // 70%-130% of base
    
    // Pump base is for HOLDING the hold (separate from move difficulty)
    const pumpBase = Math.round(holdType.pumpBase * (0.7 + difficultyFactor * 0.6)); // 70%-130% of base
    
    return {
        type: holdTypeName,
        label: holdType.label, // Use the label from holdTypes (shortened for display)
        difficulty: difficulty, // Success threshold (player must roll under this)
        difficultyDisplay: Math.round((1 - difficulty) * 100), // For display: 0-100 (higher = harder)
        pumpBase: pumpBase, // Base pump for holding this hold
        gripCost: gripCost, // Grip cost determined by hold difficulty
        touchCount: 0, // Track how many times this hold has been used
        degradable: (holdTypeName === 'crimp' || holdTypeName === 'sloper') // Only crimps and slopers degrade
    };
}

// Calculate move difficulty based on distance, direction, and previous hold
function calculateMoveDifficulty(fromRow, fromCol, toRow, toCol, fromHold) {
    // Distance factor
    const horizontalDist = Math.abs(toCol - fromCol);
    const verticalDist = Math.abs(toRow - fromRow);
    const totalDist = Math.sqrt(horizontalDist * horizontalDist + verticalDist * verticalDist);
    
    let distanceFactor = 0;
    if (totalDist === 0) distanceFactor = 0; // No move
    else if (totalDist <= 1.5) distanceFactor = 0.1; // Adjacent (1 space)
    else if (totalDist <= 2.5) distanceFactor = 0.2; // 2 spaces
    else distanceFactor = 0.3; // 3+ spaces (very hard)
    
    // Direction factor (diagonal is harder than straight)
    let directionFactor = 0;
    if (horizontalDist > 0 && verticalDist > 0) {
        directionFactor = 0.05; // Diagonal adds difficulty
    }
    
    // Previous hold quality factor
    let previousHoldFactor = 0;
    if (fromHold) {
        // Moving FROM a hard hold makes the move harder
        const fromDifficulty = 1 - fromHold.difficulty; // 0 = easy hold, 1 = hard hold
        previousHoldFactor = fromDifficulty * 0.1; // Up to 0.1 additional difficulty
    }
    
    const totalMoveDifficulty = distanceFactor + directionFactor + previousHoldFactor;
    return Math.max(0, Math.min(0.5, totalMoveDifficulty)); // Cap at 0.5
}

// Initialize grid
function initGrid() {
    gameState.grid = [];
    for (let row = 0; row < 5; row++) {
        gameState.grid[row] = [];
        for (let col = 0; col < 5; col++) {
            gameState.grid[row][col] = null;
        }
    }
}

// Generate next hold at the top of the grid
// Pre-generate all holds for a route (for static routes)
function pregenerateRoute(route) {
    // Check for cached route in gameState.pregeneratedRoutes
    if (!gameState.pregeneratedRoutes) {
        gameState.pregeneratedRoutes = {};
    }
    
    if (gameState.pregeneratedRoutes[route.id]) {
        route.generatedHolds = gameState.pregeneratedRoutes[route.id];
        console.log(`Using cached route ${route.name}: ${route.generatedHolds.length} holds`);
        return route.generatedHolds;
    }
    
    console.log(`Generating new route ${route.name}: ${route.holdCount} holds requested`);
    
    const holds = [];
    let currentCol = 2; // Start at center
    
    // Get location difficulty tier for hold type selection
    const locationTier = gameState.currentLocation?.difficultyTier || 'easy';
    
    // Track hard hold usage for easy locations
    // Easy locations: only ONE crimp OR sloper total, never both
    let hardHoldUsed = null; // 'crimp', 'sloper', or null
    
    // Determine crux configuration based on route length
    const cruxConfig = generateCruxConfig(route.holdCount);
    route.cruxInfo = cruxConfig; // Store for display
    
    // Track which rows have been used (for dual hold generation)
    let lastRowIndex = -1;
    
    for (let i = 0; i < route.holdCount; i++) {
        const holdNum = i + 1;
        
        // Check if this hold is in a crux section
        const isCruxHold = cruxConfig.cruxIndices.includes(holdNum);
        
        // Determine if this is a short or long move (50/50 split)
        const isShortMove = Math.random() < 0.5;
        
        // Determine possible positions based on short/long move
        const possiblePositions = [];
        
        if (isShortMove) {
            // SHORT MOVE: Adjacent only (row -1, up to 1 column away)
            if (currentCol > 0) possiblePositions.push({ row: -1, col: currentCol - 1 });
            possiblePositions.push({ row: -1, col: currentCol });
            if (currentCol < 4) possiblePositions.push({ row: -1, col: currentCol + 1 });
        } else {
            // LONG MOVE: Skip at least 1 row (row -2 or further)
            // Row -2 with various column positions
            if (currentCol > 0) possiblePositions.push({ row: -2, col: currentCol - 1 });
            possiblePositions.push({ row: -2, col: currentCol });
            if (currentCol < 4) possiblePositions.push({ row: -2, col: currentCol + 1 });
            if (currentCol > 1) possiblePositions.push({ row: -2, col: currentCol - 2 });
            if (currentCol < 3) possiblePositions.push({ row: -2, col: currentCol + 2 });
            
            // Occasionally even longer moves (row -3)
            if (Math.random() < 0.2) {
                if (currentCol > 0) possiblePositions.push({ row: -3, col: currentCol - 1 });
                possiblePositions.push({ row: -3, col: currentCol });
                if (currentCol < 4) possiblePositions.push({ row: -3, col: currentCol + 1 });
            }
        }
        
        // Random selection from possible positions
        const selectedPos = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
        
        // Select hold type based on location difficulty and crux status
        // Pass hardHoldUsed to enforce crimp/sloper limits in easy locations
        const holdTypeName = selectHoldTypeWithLimits(locationTier, isCruxHold, hardHoldUsed);
        
        // Track hard hold usage
        if (locationTier === 'easy' && (holdTypeName === 'crimp' || holdTypeName === 'sloper')) {
            hardHoldUsed = holdTypeName;
        }
        
        // Calculate difficulty multiplier (crux holds are harder)
        let difficultyMult = route.difficultyMultiplier || 1.0;
        if (isCruxHold) {
            difficultyMult *= 1.3; // Crux holds are 30% harder
        }
        
        // Calculate easiness bias based on location tier
        // STRONGER BIAS for easy locations - top 30% of range means easinessBias ~0.9
        // easinessBias of 0.9 means values heavily skewed toward max
        let easinessBias = 0;
        if (locationTier === 'easy') {
            easinessBias = isCruxHold ? 0.6 : 0.9; // Easy: top 30% for normal, top 50% for crux
        } else if (locationTier === 'intermediate') {
            easinessBias = isCruxHold ? 0.2 : 0.5; // Intermediate: moderate bias
        } else {
            easinessBias = isCruxHold ? 0 : 0.3; // Expert: slight bias for non-crux
        }
        
        const hold = generateHold(holdTypeName, difficultyMult, easinessBias);
        
        // Mark crux holds for display
        hold.isCrux = isCruxHold;
        
        // Push the main hold
        holds.push({
            ...hold,
            matchable: Math.random() < 0.3,
            targetCol: selectedPos.col,
            col: selectedPos.col, // Add col directly for beta display
            conceptualDistance: Math.abs(selectedPos.row),
            holdIndex: holdNum,
            rowIndex: lastRowIndex + 1 // Track which conceptual row this is on
        });
        
        // Update row index tracker
        lastRowIndex++;
        
        // 50% chance to add a second hold on the same row (but not during crux, first hold, or final hold)
        const isFirstHold = (i === 0);
        const isLastHold = (i === route.holdCount - 1);
        if (!isCruxHold && !isFirstHold && !isLastHold && Math.random() < 0.5) {
            // Generate alternate column position (different from main hold)
            const alternateColumns = [];
            for (let c = 0; c <= 4; c++) {
                if (c !== selectedPos.col) {
                    alternateColumns.push(c);
                }
            }
            
            // Pick random alternate column
            const altCol = alternateColumns[Math.floor(Math.random() * alternateColumns.length)];
            
            // Generate a second hold (similar difficulty)
            const altHoldType = selectHoldTypeWithLimits(locationTier, false, hardHoldUsed);
            const altHold = generateHold(altHoldType, difficultyMult, easinessBias);
            
            // Increment hold count for this second hold
            i++;
            const altHoldNum = i + 1;
            
            // Add the alternate hold
            holds.push({
                ...altHold,
                matchable: Math.random() < 0.3,
                targetCol: altCol,
                col: altCol,
                conceptualDistance: Math.abs(selectedPos.row), // Same distance as main hold
                holdIndex: altHoldNum,
                rowIndex: lastRowIndex, // Same row as main hold
                isAlternate: true // Mark as alternate choice
            });
        }
        
        currentCol = selectedPos.col;
    }
    
    // Store in route object and cache
    route.generatedHolds = holds;
    gameState.pregeneratedRoutes[route.id] = holds;
    console.log(`Generated ${holds.length} holds for ${route.name}`);
    return holds;
}

// Generate crux configuration based on route length
function generateCruxConfig(holdCount) {
    let cruxCount, cruxPositions;
    
    if (holdCount < 10) {
        // Short routes: 1-2 crux holds
        cruxCount = Math.random() < 0.5 ? 1 : 2;
        // Position: random third (bottom, middle, top)
        const section = Math.floor(Math.random() * 3);
        const sectionStart = Math.floor(holdCount * section / 3) + 1;
        const sectionEnd = Math.floor(holdCount * (section + 1) / 3);
        cruxPositions = [{ start: sectionStart, count: cruxCount }];
    } else if (holdCount <= 20) {
        // Medium routes: 3-4 crux holds in one section
        cruxCount = Math.random() < 0.5 ? 3 : 4;
        // Position: weighted toward middle or top
        const section = Math.random() < 0.3 ? 0 : (Math.random() < 0.5 ? 1 : 2);
        const sectionStart = Math.floor(holdCount * section / 3) + 1;
        cruxPositions = [{ start: sectionStart, count: cruxCount }];
    } else {
        // Long routes (20+): Two separate crux sections OR one large one
        const hasTwoCruxes = Math.random() < 0.4;
        if (hasTwoCruxes) {
            // Two crux sections
            const crux1Start = Math.floor(holdCount * 0.25);
            const crux2Start = Math.floor(holdCount * 0.7);
            cruxPositions = [
                { start: crux1Start, count: 2 },
                { start: crux2Start, count: 2 }
            ];
            cruxCount = 4;
        } else {
            // One large crux section
            cruxCount = Math.random() < 0.5 ? 3 : 4;
            const section = Math.random() < 0.4 ? 1 : 2; // Middle or top
            const sectionStart = Math.floor(holdCount * section / 3) + 1;
            cruxPositions = [{ start: sectionStart, count: cruxCount }];
        }
    }
    
    // Generate actual crux indices
    const cruxIndices = [];
    for (const pos of cruxPositions) {
        for (let i = 0; i < pos.count; i++) {
            cruxIndices.push(pos.start + i);
        }
    }
    
    // Generate description
    let cruxDescription = '';
    if (cruxPositions.length === 1) {
        const start = cruxPositions[0].start;
        const end = start + cruxPositions[0].count - 1;
        cruxDescription = `Crux: Holds ${start}-${end}`;
    } else {
        cruxDescription = cruxPositions.map((pos, idx) => {
            const start = pos.start;
            const end = start + pos.count - 1;
            return `Crux ${idx + 1}: Holds ${start}-${end}`;
        }).join(', ');
    }
    
    return {
        cruxIndices,
        cruxDescription,
        cruxCount
    };
}

// Select hold type based on location difficulty and whether it's a crux
function selectHoldType(locationTier, isCruxHold) {
    return selectHoldTypeWithLimits(locationTier, isCruxHold, null);
}

// Select hold type with optional crimp/sloper limit tracking for easy locations
function selectHoldTypeWithLimits(locationTier, isCruxHold, hardHoldUsed) {
    // Define hold pools by difficulty tier
    // Easy tier: More jugs, NO crimps/slopers in regular pool (handled separately)
    // Intermediate tier: Balanced
    // Expert tier: Fewer jugs, more hard holds
    
    let holdPool;
    
    if (isCruxHold) {
        // Crux holds: harder types, but scaled to location
        if (locationTier === 'easy') {
            // Easy crux: NO crimps/slopers in base pool - we add one below if allowed
            holdPool = [
                { type: 'jug', weight: 20 },      // Even jugs can be hard
                { type: 'pinch', weight: 30 },    // Pinches are challenging
                { type: 'sidepull', weight: 20 }, // Technical
                { type: 'undercling', weight: 15 }, // Requires technique
                { type: 'edge', weight: 15 }      // Small edges
            ];
            
            // Only add ONE hard hold type if none used yet
            if (hardHoldUsed === null) {
                // 30% chance to add a crimp, 30% chance to add a sloper
                const roll = Math.random();
                if (roll < 0.15) {
                    holdPool.push({ type: 'crimp', weight: 15 });
                } else if (roll < 0.30) {
                    holdPool.push({ type: 'sloper', weight: 15 });
                }
            }
        } else if (locationTier === 'intermediate') {
            // Intermediate crux: mix of everything
            holdPool = [
                { type: 'crimp', weight: 25 },
                { type: 'sloper', weight: 20 },
                { type: 'pinch', weight: 20 },
                { type: 'edge', weight: 15 },
                { type: 'sidepull', weight: 10 },
                { type: 'undercling', weight: 10 }
            ];
        } else {
            // Expert crux: crimps, slopers, pockets
            holdPool = [
                { type: 'crimp', weight: 35 },
                { type: 'sloper', weight: 30 },
                { type: 'pinch', weight: 15 },
                { type: 'pocket', weight: 10 },
                { type: 'edge', weight: 10 }
            ];
        }
    } else {
        // Non-crux holds: generally easier
        if (locationTier === 'easy') {
            // Easy routes: lots of jugs, NO crimps/slopers
            holdPool = [
                { type: 'jug', weight: 55 },
                { type: 'pinch', weight: 15 },
                { type: 'sidepull', weight: 12 },
                { type: 'undercling', weight: 10 },
                { type: 'edge', weight: 8 }
            ];
            // NO crimps or slopers in easy non-crux holds
        } else if (locationTier === 'intermediate') {
            // Intermediate routes: balanced
            holdPool = [
                { type: 'jug', weight: 30 },
                { type: 'pinch', weight: 18 },
                { type: 'sidepull', weight: 15 },
                { type: 'edge', weight: 12 },
                { type: 'crimp', weight: 10 },
                { type: 'sloper', weight: 8 },
                { type: 'undercling', weight: 7 }
            ];
        } else {
            // Expert routes: fewer jugs, more technical
            holdPool = [
                { type: 'jug', weight: 15 },
                { type: 'crimp', weight: 20 },
                { type: 'sloper', weight: 18 },
                { type: 'pinch', weight: 15 },
                { type: 'edge', weight: 12 },
                { type: 'sidepull', weight: 10 },
                { type: 'pocket', weight: 10 }
            ];
        }
    }
    
    // Weighted random selection
    const totalWeight = holdPool.reduce((sum, h) => sum + h.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const hold of holdPool) {
        random -= hold.weight;
        if (random <= 0) {
            return hold.type;
        }
    }
    
    return 'jug'; // Fallback
}

function generateNextHold() {
    console.log(`generateNextHold: holdsGenerated=${gameState.holdsGenerated}, totalHoldsInRoute=${gameState.totalHoldsInRoute}, generatedHolds.length=${gameState.currentRoute?.generatedHolds?.length}`);
    
    // Check if we've already generated all holds for this route
    if (gameState.holdsGenerated >= gameState.totalHoldsInRoute) {
        console.log('No more holds to generate - route should be complete');
        return; // Don't generate any more holds
    }
    
    // Get next hold from pre-generated route
    const holdData = gameState.currentRoute.generatedHolds[gameState.holdsGenerated];
    
    // Safety check - if holdData is undefined, we've run out of holds
    if (!holdData) {
        console.error(`No hold data at index ${gameState.holdsGenerated}. Route has ${gameState.currentRoute.generatedHolds.length} holds.`);
        addFeedback('No hold there!', 'penalty');
        return;
    }
    
    const targetRow = 0;
    const currentRowIndex = holdData.rowIndex;
    
    // Place this hold
    const targetCol = holdData.targetCol;
    const holdIndex = gameState.holdsGenerated + 1;
    const isRestHold = gameState.restHoldIndices.includes(holdIndex);
    
    gameState.grid[targetRow][targetCol] = {
        ...holdData,
        isRestHold: isRestHold,
        row: targetRow,
        col: targetCol
    };
    
    gameState.holdsGenerated++;
    
    // Check if the NEXT hold is on the same row (alternate hold)
    if (gameState.holdsGenerated < gameState.totalHoldsInRoute) {
        const nextHold = gameState.currentRoute.generatedHolds[gameState.holdsGenerated];
        
        if (nextHold && nextHold.rowIndex === currentRowIndex) {
            // Place the alternate hold on the same row
            const altCol = nextHold.targetCol;
            const altHoldIndex = gameState.holdsGenerated + 1;
            const altIsRestHold = gameState.restHoldIndices.includes(altHoldIndex);
            
            gameState.grid[targetRow][altCol] = {
                ...nextHold,
                isRestHold: altIsRestHold,
                row: targetRow,
                col: altCol
            };
            
            gameState.holdsGenerated++;
        }
    }
}
