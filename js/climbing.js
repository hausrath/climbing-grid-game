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

    // Check pump state before move
    if (gameState.pumpState >= 3) {
        endGame(false, `Pump maxed out! Your forearms gave out.`);
        return;
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
    const maxReach = gameState.dynoActive ? 3 : 2;
    if (dy > maxReach || dx > maxReach) {
        addFeedback('Too far to reach!', 'penalty');
        return;
    }

    const isExtendedMove = (dy >= 2 || dx >= 2);

    // ---- Step 1: Direction and cross-body ----
    const direction = getMoveDirection(gameState.currentCol, gameState.currentRow, routeCol, routeRow);
    const hand = gameState.selectedHand;
    const crossMove = isCrossMove(hand, direction);

    const feedback = [];

    // ---- Step 2: Calculate EFFECTIVE PENALTY LEVEL for pump ----
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

    // +1 from hand-hold awkwardness (gaston at 135/225)
    const handHoldModifier = getHandHoldPumpModifier(hold.type, hand, hold.angle) || 0;
    if (handHoldModifier > 0) {
        effectiveLevel += 1;
        levelBumps.push('gaston');
    }

    // +1 from distance surcharge (2+ spaces)
    let reachUsed = false;
    if (isExtendedMove) {
        if (gameState.movementStyle === 'reach') {
            reachUsed = true;
            feedback.push({ text: `Reach: distance penalty negated!`, type: 'bonus' });
        } else {
            effectiveLevel += 1;
            levelBumps.push('distance');
        }
    }

    // Cross-body: penalty is already in the base table, Cross reduces it by 1
    let crossUsed = false;
    if (crossMove) {
        if (gameState.movementStyle === 'cross') {
            crossUsed = true;
            effectiveLevel = Math.max(0, effectiveLevel - 1);
            feedback.push({ text: `Cross: cross-body penalty negated!`, type: 'bonus' });
        } else {
            levelBumps.push('cross-body');
        }
    }

    // Cross can also reduce gaston if not already used for cross-body
    if (!crossUsed && gameState.movementStyle === 'cross' && handHoldModifier > 0) {
        effectiveLevel = Math.max(0, effectiveLevel - 1);
        crossUsed = true;
        feedback.push({ text: `Cross: gaston penalty reduced!`, type: 'bonus' });
    }

    // Commit: reduce effective penalty level by 1
    if (gameState.commitActive && effectiveLevel > 0) {
        effectiveLevel = Math.max(0, effectiveLevel - 1);
        feedback.push({ text: `COMMIT: penalty reduced!`, type: 'bonus' });
    }

    // Clamp effective level
    effectiveLevel = Math.min(effectiveLevel, 4);

    // ---- Step 3: Map effective level to pump state change ----
    let pumpStateChange = 0;
    if (effectiveLevel >= 3) {
        // Severe or worse = instant fall
        feedback.push({ text: `Severe penalty — you fell!`, type: 'penalty' });
        addFeedback(`Severe penalty — you fell!`, 'penalty');
        feedback.forEach(f => addFeedback(f.text, f.type));
        endGame(false, `Severe penalty! The move was too much for your body.`);
        return;
    } else if (effectiveLevel === 2) {
        pumpStateChange = 2;
    } else if (effectiveLevel === 1) {
        pumpStateChange = 1;
    }
    // effectiveLevel 0 = no pump state change

    // Deadpoint: after shake, no pump state change
    if (isSkillUnlocked('deadpoint') && gameState.skillState.justShook && pumpStateChange > 0) {
        feedback.push({ text: `Deadpoint! Pump penalty negated after shake`, type: 'bonus' });
        pumpStateChange = 0;
    }

    // Show penalty feedback
    if (pumpStateChange > 0) {
        const levelName = PENALTY_LEVEL_NAMES[effectiveLevel] || 'Unknown';
        const bumpStr = levelBumps.length > 0 ? ` (${levelBumps.join(', ')})` : '';
        feedback.push({ text: `${levelName} penalty${bumpStr}: pump +${pumpStateChange} state`, type: pumpStateChange >= 2 ? 'penalty' : 'neutral' });
    } else if (effectiveLevel === 0 && basePenaltyLevel === 0) {
        feedback.push({ text: `Clean move!`, type: 'bonus' });
    }

    // Apply pump state change
    const newPumpState = gameState.pumpState + pumpStateChange;

    // ---- Step 4: Grip decay (time-based) ----
    let gripAdvanced = false;
    let gripDecayBlocked = false;

    // Deadpoint: after chalk, no grip decay this move
    if (isSkillUnlocked('deadpoint') && gameState.skillState.justChalked) {
        gripDecayBlocked = true;
        feedback.push({ text: `Deadpoint! Grip decay blocked after chalk`, type: 'bonus' });
    }

    if (!gripDecayBlocked) {
        const gripCost = HOLD_GRIP_COST[hold.type] || 1;
        gameState.gripDecayCounter += gripCost;
        while (gameState.gripDecayCounter >= 3) {
            gameState.gripDecayCounter -= 3;
            gameState.gripState++;
            gripAdvanced = true;
        }
    }

    // Grip decay feedback
    if (gripAdvanced) {
        const gripLabel = GRIP_STATE_LABELS[gameState.gripState] || 'Critical';
        feedback.push({ text: `Grip decayed to: ${gripLabel}`, type: gameState.gripState >= 2 ? 'penalty' : 'neutral' });
    } else {
        feedback.push({ text: `Grip decay: ${gameState.gripDecayCounter}/3 ticks`, type: 'neutral' });
    }

    // ---- Step 5: Apply pump state ----
    gameState.pumpState = newPumpState;

    // Main move summary
    const pumpLabel = PUMP_STATE_LABELS[gameState.pumpState] || 'Critical';
    const gripLabel = GRIP_STATE_LABELS[gameState.gripState] || 'Critical';
    feedback.push({ text: `${hold.label} (${hold.angle}°) — Pump: ${pumpLabel}, Grip: ${gripLabel}`, type: 'neutral' });

    // ---- Step 6: Decrement cooldowns ----
    if (gameState.crossCooldown > 0) gameState.crossCooldown--;
    if (gameState.reachCooldown > 0) gameState.reachCooldown--;
    if (gameState.shakeCooldown > 0) gameState.shakeCooldown--;
    if (gameState.chalkCooldown > 0) gameState.chalkCooldown--;
    if (gameState.commitCooldown > 0) gameState.commitCooldown--;
    if (gameState.dynoCooldown > 0) gameState.dynoCooldown--;

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

    // Weight only changes via manual Weight Shift skill (unlocked in Area 3)
    // No auto-shift — weight stays at center until player learns to control it

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
    if (hold.matchable && isSkillUnlocked('match') && gameState.lastHandUsed !== null && gameState.lastHandUsed !== gameState.selectedHand) {
        feedback.push({ text: `Matched! Both hands & crosses reset`, type: 'bonus' });
        gameState.lastHandUsed = null;
        gameState.consecutiveCrosses = 0;
    }

    // Update skill state
    updateSkillStateAfterMove(true, effectiveLevel);

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

    // ---- Step 8: Check win/loss ----
    if (gameState.pumpState >= 3) {
        endGame(false, `Pump maxed out! Your forearms gave out.`);
    } else if (gameState.gripState >= 3) {
        endGame(false, `Grip depleted! Your skin couldn't hold on.`);
    } else if (gameState.currentRoute && gameState.currentRow >= gameState.currentRoute.topRow) {
        completeRoute();
    }
}
