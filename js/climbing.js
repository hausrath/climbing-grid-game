// ============ CORE MOVE RESOLVER ============
function moveToHold(row, col) {
    // Convert viewport click to route coordinates
    const routeRow = viewportRowToRouteRow(row);
    const routeCol = col;

    // Find the hold in the route grid
    const hold = gameState.routeGrid && gameState.routeGrid[routeRow]
        ? gameState.routeGrid[routeRow][routeCol]
        : null;

    if (!hold) {
        addFeedback('No hold there!', 'penalty');
        return;
    }

    // Check resource states before move
    if (gameState.gripState >= 3) {
        endGame(false, `Grip failed! Mismatched technique cost you the hold.`);
        return;
    }
    if (gameState.pumpState >= 3) {
        endGame(false, `Pump maxed out! Your forearms gave out.`);
        return;
    }

    // Must select a hand first
    if (!gameState.selectedHand) {
        addFeedback('Select a hand first (A or D)!', 'penalty');
        return;
    }

    // Validate reachability: hold must be above or on same row (lateral)
    if (routeRow < gameState.currentRow) {
        addFeedback('Can only climb upward!', 'penalty');
        return;
    }
    if (routeRow === gameState.currentRow && routeCol === gameState.currentCol) {
        addFeedback('Already on this hold!', 'penalty');
        return;
    }

    // Check distance constraints
    const dy = routeRow - gameState.currentRow;
    const dx = Math.abs(routeCol - gameState.currentCol);
    const maxReach = gameState.dynoActive ? 3 : 2;
    if (dy > maxReach || dx > maxReach || (!gameState.dynoActive && dy === 2 && dx === 2)) {
        addFeedback('Too far to reach!', 'penalty');
        return;
    }

    const isExtendedMove = (dy >= 2 || dx >= 2);

    // ---- Step 1: Direction and cross-body ----
    const direction = getMoveDirection(gameState.currentCol, gameState.currentRow, routeCol, routeRow);
    const hand = gameState.selectedHand;
    const crossMove = isCrossMove(hand, direction);

    const feedback = [];

    // ---- Step 2: Calculate EFFECTIVE PENALTY LEVEL for grip ----
    // Base penalty from the table (direction + hand + angle + weight)
    const basePenaltyLevel = lookupPenalty(direction, hand, hold.angle, gameState.weight);

    // Level 4 = instant fall regardless of modifiers
    if (basePenaltyLevel === 4) {
        addFeedback(`Impossible position! You fell!`, 'penalty');
        endGame(false, `The combination of direction, hand, angle, and weight made the hold impossible.`);
        return;
    }

    // Calculate modifier bumps to effective penalty level
    let effectiveLevel = basePenaltyLevel;
    let levelBumps = [];

    // Extended moves require Reach skill — no skill = instant fall
    let reachUsed = false;
    if (isExtendedMove) {
        if (gameState.reachActive) {
            reachUsed = true;
            feedback.push({ text: `Reach: distance penalty negated!`, type: 'bonus' });
        } else {
            feedback.push({ text: `Extended move without Reach — you fell!`, type: 'penalty' });
            feedback.forEach(f => addFeedback(f.text, f.type));
            endGame(false, `Extended moves require the Reach skill!`);
            return;
        }
    }

    // Cross-body moves require Cross skill — no skill = instant fall
    let crossUsed = false;
    if (crossMove) {
        if (gameState.crossActive) {
            crossUsed = true;
            effectiveLevel = Math.max(0, effectiveLevel - 1);
            feedback.push({ text: `Cross: cross-body penalty negated!`, type: 'bonus' });
        } else {
            feedback.push({ text: `Cross-body move without Cross skill — you fell!`, type: 'penalty' });
            feedback.forEach(f => addFeedback(f.text, f.type));
            endGame(false, `Cross-body moves require the Cross skill!`);
            return;
        }
    }

    // Commit: reduce effective penalty level by 1
    if (gameState.commitActive && effectiveLevel > 0) {
        effectiveLevel = Math.max(0, effectiveLevel - 1);
        feedback.push({ text: `COMMIT: penalty reduced!`, type: 'bonus' });
    }

    // Clamp effective level
    effectiveLevel = Math.min(effectiveLevel, 4);

    // ---- Step 3: Map effective level to grip state change ----
    let gripStateChange = 0;
    if (effectiveLevel >= 3) {
        feedback.push({ text: `Severe penalty — you fell!`, type: 'penalty' });
        addFeedback(`Severe penalty — you fell!`, 'penalty');
        feedback.forEach(f => addFeedback(f.text, f.type));
        endGame(false, `Severe penalty! The move was too much for your body.`);
        return;
    } else if (effectiveLevel === 2) {
        gripStateChange = 2;
    } else if (effectiveLevel === 1) {
        gripStateChange = 1;
    }
    // effectiveLevel 0 = no grip state change

    // Deadpoint: after chalk, no grip state change
    if (isSkillUnlocked('deadpoint') && gameState.skillState.justChalked && gripStateChange > 0) {
        feedback.push({ text: `Deadpoint! Grip penalty negated after chalk`, type: 'bonus' });
        gripStateChange = 0;
    }

    // Show penalty feedback
    if (gripStateChange > 0) {
        const levelName = PENALTY_LEVEL_NAMES[effectiveLevel] || 'Unknown';
        const bumpStr = levelBumps.length > 0 ? ` (${levelBumps.join(', ')})` : '';
        feedback.push({ text: `${levelName} penalty${bumpStr}: grip +${gripStateChange} state`, type: gripStateChange >= 2 ? 'penalty' : 'neutral' });
    } else if (effectiveLevel === 0 && basePenaltyLevel === 0) {
        feedback.push({ text: `Clean move!`, type: 'bonus' });
    }

    // Apply grip state change
    const newGripState = gameState.gripState + gripStateChange;

    // ---- Step 4: Pump decay (hold-type ticks) ----
    let pumpAdvanced = false;
    let pumpDecayBlocked = false;

    // Deadpoint: after shake, no pump decay this move
    if (isSkillUnlocked('deadpoint') && gameState.skillState.justShook) {
        pumpDecayBlocked = true;
        feedback.push({ text: `Deadpoint! Pump decay blocked after shake`, type: 'bonus' });
    }

    if (!pumpDecayBlocked) {
        const pumpCost = HOLD_PUMP_COST[hold.type] || 1;
        gameState.pumpDecayCounter += pumpCost;
        while (gameState.pumpDecayCounter >= 3) {
            gameState.pumpDecayCounter -= 3;
            gameState.pumpState++;
            pumpAdvanced = true;
        }
    }

    // Pump decay feedback
    if (pumpAdvanced) {
        const pumpLabel = PUMP_STATE_LABELS[gameState.pumpState] || 'Critical';
        feedback.push({ text: `Pump increased to: ${pumpLabel}`, type: gameState.pumpState >= 2 ? 'penalty' : 'neutral' });
    } else {
        feedback.push({ text: `Pump ticks: ${gameState.pumpDecayCounter}/3`, type: 'neutral' });
    }

    // ---- Step 5: Apply grip state ----
    gameState.gripState = newGripState;

    // Main move summary
    const pumpLabel = PUMP_STATE_LABELS[gameState.pumpState] || 'Critical';
    const gripLabel = GRIP_STATE_LABELS[gameState.gripState] || 'Critical';
    feedback.push({ text: `${hold.label} (${hold.angle}°) — Grip: ${gripLabel}, Pump: ${pumpLabel}`, type: 'neutral' });

    // ---- Step 6: Decrement cooldowns ----
    if (gameState.crossCooldown > 0) gameState.crossCooldown--;
    if (gameState.reachCooldown > 0) gameState.reachCooldown--;
    if (gameState.shakeCooldown > 0) gameState.shakeCooldown--;
    if (gameState.chalkCooldown > 0) gameState.chalkCooldown--;
    if (gameState.commitCooldown > 0) gameState.commitCooldown--;
    if (gameState.dynoCooldown > 0) gameState.dynoCooldown--;
    if (gameState.bumpCooldown > 0) gameState.bumpCooldown--;
    if (gameState.matchCooldown > 0) gameState.matchCooldown--;

    // Handle Dyno cooldown
    if (gameState.dynoActive) {
        gameState.dynoActive = false;
        gameState.dynoCooldown = 5;
        feedback.push({ text: `Dyno used! Cooldown: 5 moves`, type: 'neutral' });
    }

    // Handle Commit cooldown
    if (gameState.commitActive) {
        gameState.commitActive = false;
        gameState.commitCooldown = 10;
        feedback.push({ text: `Commit used! Cooldown: 10 moves`, type: 'neutral' });
    }

    // Handle Bump cooldown
    if (gameState.bumpActive) {
        gameState.bumpCooldown = 3;
        feedback.push({ text: `Bump used! Cooldown: 3 moves`, type: 'neutral' });
    }

    // Set technique cooldowns
    if (crossUsed) {
        gameState.crossCooldown = gameState.cooldownLength;
        feedback.push({ text: `Cross cooldown: ${gameState.cooldownLength} moves`, type: 'neutral' });
    }
    if (reachUsed) {
        gameState.reachCooldown = gameState.cooldownLength;
        feedback.push({ text: `Reach cooldown: ${gameState.cooldownLength} moves`, type: 'neutral' });
    }

    // ---- Step 7: Update state ----
    if (crossMove) {
        gameState.consecutiveCrosses++;
    } else {
        gameState.consecutiveCrosses = 0;
    }

    // Weight only changes via manual Weight Shift skill (unlocked at Area 1)

    // Update hand tracking
    const prevHand = gameState.lastHandUsed;
    gameState.currentHand = gameState.selectedHand;
    gameState.lastHandUsed = gameState.selectedHand;

    // Update position
    gameState.currentRow = routeRow;
    gameState.currentCol = routeCol;
    gameState.holdsClimbed++;

    // Record familiarity
    recordSuccessfulGrab(hold.holdIndex);

    // Handle matching
    if (hold.matchable && isSkillUnlocked('match') && gameState.matchCooldown === 0 && prevHand !== null && prevHand !== gameState.selectedHand) {
        feedback.push({ text: `Matched! Both hands & crosses reset`, type: 'bonus' });
        gameState.lastHandUsed = null;
        gameState.consecutiveCrosses = 0;
        gameState.matchCooldown = 3;
    }

    // Update skill state
    updateSkillStateAfterMove(true, effectiveLevel);

    // Display all feedback
    feedback.forEach(f => addFeedback(f.text, f.type));

    // Reset per-move state
    gameState.selectedHand = null;
    gameState.crossActive = false;
    gameState.reachActive = false;
    gameState.bumpActive = false;
    gameState.weightAtMoveStart = gameState.weight;

    // Update viewport and render
    updateViewport();
    renderGrid();
    updateUI();

    // ---- Step 8: Check win/loss ----
    if (gameState.gripState >= 3) {
        endGame(false, `Grip failed! Mismatched technique cost you the hold.`);
    } else if (gameState.pumpState >= 3) {
        endGame(false, `Pump maxed out! Your forearms gave out.`);
    } else if (gameState.currentRoute && gameState.currentRow >= gameState.currentRoute.topRow) {
        completeRoute();
    }
}
