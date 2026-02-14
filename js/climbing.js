// ============ CORE MOVE RESOLVER ============
function moveToHold(row, col) {
    console.log('moveToHold called:', row, col);

    // Convert viewport click to route coordinates
    const routeRow = viewportRowToRouteRow(row);
    const routeCol = col;

    console.log('routeRow:', routeRow, 'routeCol:', routeCol);

    // Find the hold in the route grid
    const hold = gameState.routeGrid && gameState.routeGrid[routeRow]
        ? gameState.routeGrid[routeRow][routeCol]
        : null;

    console.log('hold found:', hold);
    if (hold) {
        console.log('hold.pumpRating:', hold.pumpRating);
        console.log('hold.gripDrain:', hold.gripDrain);
        console.log('hold.type:', hold.type);
        console.log('hold.angle:', hold.angle);
    }

    if (!hold) {
        addFeedback('No hold there!', 'penalty');
        return;
    }

    if (gameState.pump >= getAvailablePump()) {
        endGame(false, `Pump maxed out! Your forearms gave out.`);
        return;
    }

    // Safety: ensure pump and grip are valid numbers
    if (isNaN(gameState.pump)) {
        console.error('gameState.pump is NaN! Resetting to 0');
        gameState.pump = 0;
    }
    if (isNaN(gameState.grip)) {
        console.error('gameState.grip is NaN! Resetting to maxGrip');
        gameState.grip = gameState.maxGrip;
    }

    // Must select a hand first
    if (!gameState.selectedHand) {
        addFeedback('Select a hand first (A or D)!', 'penalty');
        return;
    }

    // Validate reachability: hold must be above current position
    if (routeRow <= gameState.currentRow) {
        addFeedback('Can only climb upward!', 'penalty');
        return;
    }

    // Check distance constraints
    const dy = routeRow - gameState.currentRow;
    const dx = Math.abs(routeCol - gameState.currentCol);
    if (dy > 2 || dx > 2) {
        addFeedback('Too far to reach!', 'penalty');
        return;
    }

    // Determine if this is an extended move (2+ spaces in any direction)
    const isExtendedMove = (dy >= 2 || dx >= 2);

    // ---- Step 1: Determine direction ----
    const direction = getMoveDirection(gameState.currentCol, gameState.currentRow, routeCol, routeRow);

    // ---- Step 2: Determine if cross ----
    const hand = gameState.selectedHand; // 'left' or 'right'
    const crossMove = isCrossMove(hand === 'left' ? 'L' : 'R', direction);

    const feedback = [];

    // ---- Step 3: Calculate PUMP cost (hold type + hand choice + penalty table) ----
    // Base hold pump cost (DISABLED for testing - keeping for future use)
    // let pumpCost = (typeof hold.pumpRating === 'number' && !isNaN(hold.pumpRating)) ? hold.pumpRating : 0;
    let pumpCost = 0;

    // Add hand-hold pump modifier (how hand choice affects pump for this hold angle)
    const handHoldModifier = getHandHoldPumpModifier(hold.type, hand, hold.angle) || 0;
    pumpCost += handHoldModifier;

    if (handHoldModifier > 0) {
        feedback.push({ text: `Awkward hand placement: +${handHoldModifier} pump`, type: 'penalty' });
    }

    // Apply penalty table (direction + hand + angle + weight)
    const penaltyLevel = lookupPenalty(direction, hand, hold.angle, gameState.weight);
    if (penaltyLevel === 4) {
        // Instant fall
        addFeedback(`Impossible position! You fell!`, 'penalty');
        endGame(false, `The combination of direction, hand, angle, and weight made the hold impossible.`);
        return;
    }
    const penaltyPumpCost = PENALTY_PUMP_MULTIPLIERS[penaltyLevel] || 0;
    pumpCost += penaltyPumpCost;

    const penaltyNames = ['Perfect', 'Slight', 'Moderate', 'Severe'];
    if (penaltyLevel > 0) {
        feedback.push({ text: `${penaltyNames[penaltyLevel]} penalty: +${penaltyPumpCost} pump`, type: penaltyLevel >= 3 ? 'penalty' : 'neutral' });
    }

    // Technique: Static reduces penalty level by 1 on awkward positions
    let staticUsed = false;
    if (gameState.movementStyle === 'static' && handHoldModifier > 0) {
        pumpCost = Math.max(0, pumpCost - 1);
        staticUsed = true;
        feedback.push({ text: `Static technique: pump reduced!`, type: 'bonus' });
    }

    // Hold transition cost: crimp <-> sloper = +2 pump
    if (gameState.currentHand !== null) {
        const prevHold = findCurrentHold();
        if (prevHold) {
            const transition = [prevHold.type, hold.type].sort().join('-');
            if (transition === 'crimp-sloper') {
                pumpCost += 2;
                feedback.push({ text: `Crimp/sloper transition: +2 pump`, type: 'penalty' });
            }
        }
    }

    // Distance surcharge: +2 pump for extended moves
    let dynamicUsed = false;
    if (isExtendedMove) {
        if (gameState.movementStyle === 'dynamic') {
            dynamicUsed = true;
            feedback.push({ text: `Dynamic technique: distance surcharge negated!`, type: 'bonus' });
        } else {
            pumpCost += 2;
            feedback.push({ text: `Extended reach: +2 pump`, type: 'penalty' });
        }
    }

    // Cross-body: tracked for grip penalty (applied in grip section below)
    if (crossMove) {
        feedback.push({ text: `Cross-body move`, type: 'neutral' });
    }

    // ---- Step 4: Calculate GRIP drain ----
    // Base grip drain from hold type + subtype
    const baseGrip = getBaseGripDrain(hold.type, hold.angle);
    let gripDrain = baseGrip.total;

    if (baseGrip.subtypeName) {
        feedback.push({ text: `${hold.type} ${baseGrip.subtypeName}: ${baseGrip.typeGrip}+${baseGrip.subtypePenalty} grip`, type: 'neutral' });
    }

    // Cross-body grip penalty: +2 first cross, +4 second consecutive cross
    if (crossMove) {
        if (gameState.movementStyle === 'static') {
            if (!staticUsed) staticUsed = true;
            feedback.push({ text: `Static technique: cross-body grip penalty negated!`, type: 'bonus' });
        } else {
            const crossGrip = gameState.consecutiveCrosses >= 1 ? 4 : 2;
            gripDrain += crossGrip;
            feedback.push({ text: `Cross-body: +${crossGrip} grip drain`, type: 'penalty' });
        }
    }

    // Apply weight-direction grip modifier (how body position affects grip security)
    const weightDirModifier = getWeightDirectionGripModifier(gameState.weight, direction, hold.angle) || 0;
    gripDrain += weightDirModifier;

    if (weightDirModifier > 0) {
        feedback.push({ text: `Poor weight position: +${weightDirModifier} grip drain`, type: 'penalty' });
    }

    // Apply penalty table to grip (reduced rate vs pump)
    const penaltyGripCost = PENALTY_GRIP_MULTIPLIERS[penaltyLevel] || 0;
    gripDrain += penaltyGripCost;

    if (penaltyGripCost > 0) {
        feedback.push({ text: `${penaltyNames[penaltyLevel]} penalty: +${penaltyGripCost} grip drain`, type: 'penalty' });
    }

    // Apply weather modifiers to grip drain (DISABLED - keeping for future use)
    // if (gameState.currentConditions) {
    //     if (gameState.currentConditions.humidity === 'humid') {
    //         gripDrain = Math.round(gripDrain * 1.5);
    //         feedback.push({ text: `Humid: +50% grip drain`, type: 'penalty' });
    //     } else if (gameState.currentConditions.humidity === 'dry') {
    //         gripDrain = Math.round(gripDrain * 0.8);
    //         feedback.push({ text: `Dry conditions: -20% grip drain`, type: 'bonus' });
    //     }
    // }

    // Apply weather modifiers to pump (DISABLED - keeping for future use)
    // if (gameState.currentConditions) {
    //     if (gameState.currentConditions.temperature === 'hot') {
    //         pumpCost = Math.round(pumpCost * 1.15);
    //     }
    //     if (gameState.currentConditions.wind === 'heavy') {
    //         pumpCost = Math.round(pumpCost * 1.1);
    //     }
    // }

    // ---- Step 7: Apply skill modifiers ----
    const skillPumpReduction = calculateSkillPumpReduction();
    if (skillPumpReduction > 0) {
        pumpCost = Math.round(pumpCost * (1 - skillPumpReduction));
    }

    const skillGripReduction = calculateSkillGripReduction(hold);
    if (skillGripReduction > 0) {
        gripDrain = Math.round(gripDrain * (1 - skillGripReduction));
    }

    // Iron Grip proc
    if (checkIronGripProc()) {
        gripDrain = 0;
        feedback.push({ text: `Iron Grip! No grip drain`, type: 'bonus' });
    }

    // Deadpoint: reduced costs after shake/chalk
    if (getSkillRank('deadpoint') >= 1) {
        if (gameState.skillState.justChalked) pumpCost = 0;
        if (gameState.skillState.justShook) gripDrain = 0;
    }

    // Stat modifiers
    const endurance = gameState.endurance || 0;
    const power = gameState.power || 0;
    pumpCost = Math.round(pumpCost * (1 - endurance * 0.02));
    gripDrain = Math.round(gripDrain * (1 - power * 0.02));

    // Commit: halve pump cost
    if (gameState.commitActive) {
        pumpCost = Math.round(pumpCost * 0.5);
        feedback.push({ text: `COMMIT: pump cost halved!`, type: 'bonus' });
    }

    // Climbing fatigue: pump and grip costs accelerate over the climb
    // +5% per hold climbed (hold 1 = +5%, hold 10 = +50%, etc.)
    const fatigueMultiplier = 1 + (gameState.holdsClimbed * 0.05);
    if (gameState.holdsClimbed > 0) {
        pumpCost = Math.round(pumpCost * fatigueMultiplier);
        gripDrain = Math.round(gripDrain * fatigueMultiplier);
        if (fatigueMultiplier >= 1.2) {
            feedback.push({ text: `Climbing fatigue: +${Math.round((fatigueMultiplier - 1) * 100)}% costs`, type: 'penalty' });
        }
    }

    // Ensure minimums and handle NaN
    if (isNaN(pumpCost)) {
        console.error('pumpCost is NaN! Resetting to 0. Hold:', hold);
        pumpCost = 0;
    } else {
        pumpCost = Math.max(0, pumpCost);
    }

    if (isNaN(gripDrain)) {
        console.error('gripDrain is NaN! Resetting to 0. Hold:', hold);
        gripDrain = 0;
    } else {
        gripDrain = Math.max(0, gripDrain);
    }

    console.log('Final pumpCost:', pumpCost, 'gripDrain:', gripDrain);

    // ---- Step 8: Calculate penalty level for flow state ----
    // Penalty is based on total modifiers applied to the move
    let penalty = 0;
    if (handHoldModifier > 0) penalty++;
    if (weightDirModifier > 0) penalty++;
    if (crossMove && gameState.consecutiveCrosses > 0) penalty++;
    if (isExtendedMove && !dynamicUsed) penalty++;
    // Cap penalty at 0-3 range
    penalty = Math.min(3, penalty);

    // ---- Step 9: Apply costs ----
    gameState.pump += pumpCost;
    gameState.grip -= gripDrain;

    // Main move feedback
    feedback.push({ text: `${hold.label} (${hold.angle}°) — Pump +${pumpCost}, Grip -${gripDrain}`, type: 'neutral' });

    // ---- Step 10: Decrement cooldowns ----
    if (gameState.staticCooldown > 0) gameState.staticCooldown--;
    if (gameState.dynamicCooldown > 0) gameState.dynamicCooldown--;
    if (gameState.shakeCooldown > 0) gameState.shakeCooldown--;
    if (gameState.chalkCooldown > 0) gameState.chalkCooldown--;
    if (gameState.commitCooldown > 0) gameState.commitCooldown--;

    // Handle Commit cooldown
    if (gameState.commitActive) {
        gameState.commitActive = false;
        gameState.commitCooldown = 10;
        feedback.push({ text: `Commit used! Cooldown: 10 moves`, type: 'neutral' });
    }

    // Set technique cooldowns
    if (staticUsed) {
        gameState.staticCooldown = gameState.cooldownLength;
        feedback.push({ text: `Static cooldown: ${gameState.cooldownLength} moves`, type: 'neutral' });
    }
    if (dynamicUsed) {
        gameState.dynamicCooldown = gameState.cooldownLength;
        feedback.push({ text: `Dynamic cooldown: ${gameState.cooldownLength} moves`, type: 'neutral' });
    }

    // ---- Step 11: Update state ----
    // Update consecutive crosses
    if (crossMove) {
        gameState.consecutiveCrosses++;
    } else {
        gameState.consecutiveCrosses = 0;
    }

    // Weight shift: move one step toward hold's ideal weight
    const idealWeight = getIdealWeight(hold.angle);
    const weightOrder = ['left', 'center', 'right'];
    const currentWeightIdx = weightOrder.indexOf(gameState.weight);
    const idealWeightIdx = weightOrder.indexOf(idealWeight);
    if (currentWeightIdx < idealWeightIdx) {
        gameState.weight = weightOrder[currentWeightIdx + 1];
    } else if (currentWeightIdx > idealWeightIdx) {
        gameState.weight = weightOrder[currentWeightIdx - 1];
    }

    // Update hand tracking
    gameState.currentHand = gameState.selectedHand;
    gameState.lastHandUsed = gameState.selectedHand;

    // Update position
    gameState.currentRow = routeRow;
    gameState.currentCol = routeCol;
    gameState.holdsClimbed++;

    // Record familiarity
    recordSuccessfulGrab(hold.holdIndex);

    // Handle matching
    if (hold.matchable && gameState.lastHandUsed !== null && gameState.lastHandUsed !== gameState.selectedHand) {
        feedback.push({ text: `Matched! Both hands & crosses reset`, type: 'bonus' });
        gameState.lastHandUsed = null;
        gameState.consecutiveCrosses = 0;
    }

    // Update skill state (pass penalty for flow state tracking)
    updateSkillStateAfterMove(true, penalty);

    // Display all feedback
    feedback.forEach(f => addFeedback(f.text, f.type));

    // Reset per-move state
    gameState.selectedHand = null;
    gameState.movementStyle = 'regular';
    gameState.weightAtMoveStart = gameState.weight;

    // Update viewport and render
    updateViewport();
    renderGrid();
    updateUI();

    // ---- Step 12: Check win/loss ----
    if (gameState.pump >= getAvailablePump()) {
        endGame(false, `Pump maxed out! Your forearms gave out.`);
    } else if (gameState.grip <= 0) {
        endGame(false, `Grip depleted! Your skin couldn't hold on.`);
    } else if (gameState.currentRoute && gameState.holdsClimbed >= gameState.currentRoute.holdCount) {
        completeRoute();
    }
}
