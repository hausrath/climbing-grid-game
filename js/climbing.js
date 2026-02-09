function useShake() {
    // === EFFICIENT RECOVERY: Reduced cooldowns ===
    const effRecRank = getSkillRank('efficientRecovery');
    let cooldownReduction = effRecRank >= 5 ? 999 : effRecRank >= 4 ? 4 : effRecRank >= 3 ? 3 : effRecRank >= 2 ? 2 : effRecRank >= 1 ? 1 : 0;
    let effectivenessBonus = effRecRank >= 5 ? 0.50 : effRecRank >= 4 ? 0.30 : effRecRank >= 3 ? 0.20 : effRecRank >= 2 ? 0.10 : 0;
    let reducedFatigue = effRecRank >= 4;
    let bonusGripRestore = effRecRank >= 4 ? 5 : 0;
    
    // Check stimulant effect
    if (gameState.skillState.stimulant.active && gameState.skillState.stimulant.movesLeft > 0) {
        cooldownReduction = 999;
    }
    
    if (gameState.shakeCooldown > 0) {
        addFeedback(`Shake on cooldown! ${gameState.shakeCooldown} moves remaining.`, 'penalty');
        return;
    }
    
    // Find current hold to apply costs
    let holdCost = { pumpBase: 2, gripCost: 1 };
    let currentHold = null;
    for (let col = 0; col < 5; col++) {
        if (gameState.grid[4][col]) {
            const potentialHold = gameState.grid[4][col];
            if (potentialHold.col === gameState.currentCol) {
                holdCost = potentialHold;
                currentHold = potentialHold;
                break;
            }
        }
    }
    
    // Calculate pump reduction with effectiveness bonus
    const basePumpReduction = 20;
    const pumpReduction = Math.round(basePumpReduction * (1 + effectivenessBonus));
    gameState.pump = Math.max(0, gameState.pump - pumpReduction);
    
    // Track shake usage for star challenge
    gameState.shakesUsed++;
    
    // Apply hold costs while shaking
    gameState.pump += holdCost.pumpBase;
    gameState.grip -= holdCost.gripCost;
    
    // Bonus grip restore from Efficient Recovery rank 4+
    if (bonusGripRestore > 0) {
        gameState.grip = Math.min(gameState.maxGrip, gameState.grip + bonusGripRestore);
        addFeedback(`Efficient Recovery: +${bonusGripRestore} grip`, 'bonus');
    }
    
    // Calculate cooldown
    const onRestHold = currentHold && currentHold.isRestHold;
    let actualCooldown = gameState.actionCooldownLength;
    if (cooldownReduction >= 999) {
        actualCooldown = 0;
    } else {
        actualCooldown = Math.max(0, actualCooldown - cooldownReduction);
    }
    
    if (!onRestHold && actualCooldown > 0) {
        gameState.shakeCooldown = actualCooldown;
    }
    
    addFeedback(`Shook out! -${pumpReduction} pump, but +${holdCost.pumpBase} pump, -${holdCost.gripCost} grip from holding on`, 'bonus');
    if (onRestHold) {
        addFeedback(`⚓ Rest hold - no cooldown!`, 'bonus');
    } else if (actualCooldown > 0) {
        addFeedback(`Net: -${pumpReduction - holdCost.pumpBase} pump. Cooldown: ${actualCooldown} moves`, 'neutral');
    } else {
        addFeedback(`Net: -${pumpReduction - holdCost.pumpBase} pump. No cooldown!`, 'bonus');
    }
    
    // === DEADPOINT TRACKING ===
    if (getSkillRank('deadpoint') >= 1) {
        gameState.skillState.justShook = true;
        addFeedback(`🎯 Deadpoint ready! Next move: 0 grip cost, +8% success`, 'bonus');
    }
    
    // === EFFICIENT RECOVERY RANK 5: +10% success on next move ===
    if (effRecRank >= 5) {
        gameState.skillState.recoveryBonus = 1;
        addFeedback(`Perfect Execution: +10% success on next move!`, 'bonus');
    }
    
    // Add fatigue penalty if on bad hold - unless Efficient Recovery rank 4+
    if (currentHold && currentHold.degradable && !reducedFatigue) {
        let fatiguePenalty = 0.02;
        if (effRecRank >= 3) fatiguePenalty = 0.01;
        gameState.fatiguePenalty += fatiguePenalty;
        const totalFatigue = Math.round(gameState.fatiguePenalty * 100);
        addFeedback(`⚠️ Fatigued from shaking on ${currentHold.label}! -${totalFatigue}% on next move`, 'penalty');
        renderGrid();
    }
    
    updateUI();
}

// Use chalk to increase grip
function useChalk() {
    // Check chalk limit
    if (gameState.chalkRemaining <= 0) {
        addFeedback(`Out of chalk! No uses remaining this climb.`, 'penalty');
        return;
    }
    
    // === EFFICIENT RECOVERY: Reduced cooldowns ===
    const effRecRank = getSkillRank('efficientRecovery');
    let cooldownReduction = effRecRank >= 5 ? 999 : effRecRank >= 4 ? 4 : effRecRank >= 3 ? 3 : effRecRank >= 2 ? 2 : effRecRank >= 1 ? 1 : 0;
    let effectivenessBonus = effRecRank >= 5 ? 0.50 : effRecRank >= 4 ? 0.30 : effRecRank >= 3 ? 0.20 : effRecRank >= 2 ? 0.10 : 0;
    let reducedFatigue = effRecRank >= 4; // No fatigue at rank 4+
    let bonusPumpReduction = effRecRank >= 4 ? 5 : 0; // Chalk also reduces pump at rank 4+
    
    // Check stimulant effect (0 cooldowns)
    if (gameState.skillState.stimulant.active && gameState.skillState.stimulant.movesLeft > 0) {
        cooldownReduction = 999;
    }
    
    if (gameState.chalkCooldown > 0) {
        addFeedback(`Chalk on cooldown! ${gameState.chalkCooldown} moves remaining.`, 'penalty');
        return;
    }
    
    // Find current hold to apply costs
    let holdCost = { pumpBase: 2, gripCost: 1 }; // Default minimal cost
    let currentHold = null;
    for (let col = 0; col < 5; col++) {
        if (gameState.grid[4][col]) {
            const potentialHold = gameState.grid[4][col];
            if (potentialHold.col === gameState.currentCol) {
                holdCost = potentialHold;
                currentHold = potentialHold;
                break;
            }
        }
    }
    
    // Use chalk
    gameState.chalkRemaining--;
    
    // Calculate grip increase with effectiveness bonus
    const baseGripIncrease = 20;
    const gripIncrease = Math.round(baseGripIncrease * (1 + effectivenessBonus));
    gameState.grip = Math.min(gameState.maxGrip, gameState.grip + gripIncrease);
    
    // Track chalk usage for star challenge
    gameState.chalksUsed++;
    
    // Apply hold costs while chalking
    gameState.pump += holdCost.pumpBase;
    gameState.grip -= holdCost.gripCost;
    
    // Bonus pump reduction from Efficient Recovery rank 4+
    if (bonusPumpReduction > 0) {
        gameState.pump = Math.max(0, gameState.pump - bonusPumpReduction);
        addFeedback(`Efficient Recovery: -${bonusPumpReduction} pump`, 'bonus');
    }
    
    // Check if on rest hold - if so, no cooldown!
    const onRestHold = currentHold && currentHold.isRestHold;
    let actualCooldown = gameState.actionCooldownLength;
    if (cooldownReduction >= 999) {
        actualCooldown = 0;
    } else {
        actualCooldown = Math.max(0, actualCooldown - cooldownReduction);
    }
    
    if (!onRestHold && actualCooldown > 0) {
        gameState.chalkCooldown = actualCooldown;
    }
    
    addFeedback(`Chalked up! +${gripIncrease} grip (${gameState.chalkRemaining}/${gameState.maxChalk} uses left)`, 'bonus');
    if (onRestHold) {
        addFeedback(`⚓ Rest hold - no cooldown!`, 'bonus');
    } else if (actualCooldown > 0) {
        addFeedback(`Cooldown: ${actualCooldown} moves`, 'neutral');
    } else {
        addFeedback(`No cooldown!`, 'bonus');
    }
    
    // === DEADPOINT TRACKING ===
    if (getSkillRank('deadpoint') >= 1) {
        gameState.skillState.justChalked = true;
        addFeedback(`🎯 Deadpoint ready! Next move: 0 pump, +10% success`, 'bonus');
    }
    
    // === EFFICIENT RECOVERY RANK 5: +10% success on next move ===
    if (effRecRank >= 5) {
        gameState.skillState.recoveryBonus = 1;
        addFeedback(`Perfect Execution: +10% success on next move!`, 'bonus');
    }
    
    // Add fatigue penalty if on a bad hold (crimps/slopers) - unless Efficient Recovery rank 4+
    if (currentHold && currentHold.degradable && !reducedFatigue) {
        let fatiguePenalty = 0.02;
        if (effRecRank >= 3) fatiguePenalty = 0.01; // Reduced fatigue at rank 3
        gameState.fatiguePenalty += fatiguePenalty;
        const totalFatigue = Math.round(gameState.fatiguePenalty * 100);
        addFeedback(`⚠️ Fatigued from chalking on ${currentHold.label}! -${totalFatigue}% on next move`, 'penalty');
        renderGrid();
    }
    
    updateUI();
}

// ============ HOLD FAMILIARITY SYSTEM ============

// Get familiarity key for a specific hold on a route
function getHoldFamiliarityKey(locationId, routeId, holdIndex) {
    return `${locationId}-${routeId}-${holdIndex}`;
}

// Get familiarity bonus for a hold (+2% per successful grab, capped at 10%)
function getHoldFamiliarityBonus(holdIndex) {
    if (!gameState.currentLocation || !gameState.currentRoute) return 0;
    
    const key = getHoldFamiliarityKey(
        gameState.currentLocation.id,
        gameState.currentRoute.id,
        holdIndex
    );
    
    const grabs = gameState.holdFamiliarity[key] || 0;
    // +2% per grab, capped at 10% (5 grabs max effect)
    return Math.min(0.10, grabs * 0.02);
}

// Record a successful grab for familiarity tracking
function recordSuccessfulGrab(holdIndex) {
    if (!gameState.currentLocation || !gameState.currentRoute) return;
    
    const key = getHoldFamiliarityKey(
        gameState.currentLocation.id,
        gameState.currentRoute.id,
        holdIndex
    );
    
    // Initialize if not exists
    if (!gameState.holdFamiliarity[key]) {
        gameState.holdFamiliarity[key] = 0;
    }
    
    // Only increment if not already at max (5 grabs = 10% bonus)
    if (gameState.holdFamiliarity[key] < 5) {
        gameState.holdFamiliarity[key]++;
    }
}

// Activate Commit skill
function activateCommit() {
    if (!gameState.skills.commit) {
        addFeedback('Commit skill not learned!', 'penalty');
        return;
    }
    
    if (gameState.commitCooldown > 0) {
        addFeedback(`Commit on cooldown! ${gameState.commitCooldown} moves remaining`, 'penalty');
        return;
    }
    
    if (gameState.commitActive) {
        addFeedback('Commit already active!', 'penalty');
        return;
    }
    
    gameState.commitActive = true;
    addFeedback('⚠️ COMMIT ACTIVATED! Next move: 2x success OR instant fall!', 'bonus');
    updateUI();
}

function moveToHold(row, col) {
    const hold = gameState.grid[row][col];
    if (!hold) {
        addFeedback('No hold there!', 'penalty');
        return;
    }
    
    // Can only move to the hold directly above (row 3)
    if (row !== 3) {
        addFeedback('Can only climb to holds in the highlighted row (directly above you)!', 'penalty');
        return;
    }
    
    if (!gameState.selectedHand) {
        addFeedback('Select a hand first (A or D)!', 'penalty');
        return;
    }
    
    // Calculate horizontal distance
    const horizontalDistance = Math.abs(col - gameState.currentCol);
    
    // Calculate base success chance from hold's difficulty (GDD system)
    // hold.difficulty is the threshold - player must roll UNDER it to succeed
    let successChance = hold.difficulty;
    
    // Apply fatigue penalty from shaking/chalking on bad holds
    if (gameState.fatiguePenalty > 0) {
        successChance -= gameState.fatiguePenalty;
        successChance = Math.max(0.05, successChance); // Don't go below 5%
    }
    
    // Apply movement style modifiers based on distance
    let movementBonus = 0;
    const techniqueMultiplier = 1 + (gameState.technique * 0.1); // 10% increase per point
    
    if (gameState.movementStyle === 'static') {
        if (horizontalDistance <= 1) {
            // Static on close/medium move: +10% success (improved by technique)
            movementBonus = 0.10 * techniqueMultiplier;
        } else {
            // Static on far move: no benefit (0% bonus)
            movementBonus = 0;
        }
    } else if (gameState.movementStyle === 'regular') {
        // Regular: no bonus or penalty
        movementBonus = 0;
    } else if (gameState.movementStyle === 'dynamic') {
        if (horizontalDistance >= 2) {
            // Dynamic on far move: +10% success (improved by technique)
            movementBonus = 0.10 * techniqueMultiplier;
        } else {
            // Dynamic on close/medium move: no benefit (0% bonus)
            movementBonus = 0;
        }
    }
    
    successChance += movementBonus;
    
    // Sidepull penalty: approaching from directly below reduces success
    // Real climbing: sidepulls work best when you pull sideways, not straight down
    if (hold.type === 'sidepull' && col === gameState.currentCol) {
        const sidepullPenalty = 0.10; // -10% for approaching straight up
        successChance -= sidepullPenalty;
        addFeedback(`↑ Straight approach: -10% (sidepull)`, 'penalty');
    }
    
    // Apply hold familiarity bonus (+2% per previous successful grab, max 10%)
    // The holdIndex is gameState.holdsClimbed + 1 (the NEXT hold we're trying to grab)
    const targetHoldIndex = gameState.holdsClimbed + 1;
    const familiarityBonus = getHoldFamiliarityBonus(targetHoldIndex);
    if (familiarityBonus > 0) {
        successChance += familiarityBonus;
        addFeedback(`🧠 Familiar hold: +${Math.round(familiarityBonus * 100)}% success`, 'bonus');
    }
    
    // === SKILL BONUSES ===
    const skillBonus = calculateSkillSuccessBonus(hold);
    if (skillBonus > 0) {
        successChance += skillBonus;
        addFeedback(`⚔️ Skill bonuses: +${Math.round(skillBonus * 100)}%`, 'bonus');
    }
    
    // Apply Commit skill if active (doubles success chance)
    if (gameState.commitActive) {
        successChance *= 2;
        successChance = Math.max(0.05, Math.min(0.99, successChance)); // Clamp after doubling
        addFeedback(`⚠️ COMMIT: Success chance doubled!`, 'bonus');
    } else {
        successChance = Math.max(0.05, Math.min(0.99, successChance)); // Clamp between 5% and 99%
    }
    
    // Roll for success (GDD system: roll must be UNDER successChance)
    const roll = Math.random();
    let success = roll <= successChance;
    
    // === GRIT: Chance to ignore failure ===
    if (!success && checkGritProc()) {
        // Grit procced - don't move but don't apply failure penalties
        gameState.fatiguePenalty = 0;
        updateSkillStateAfterMove(false);
        renderGrid();
        updateUI();
        return;
    }
    
    // === BATTLE CRY: Fail immunity ===
    if (!success && gameState.skillState.battleCryActive && gameState.skillState.battleCryFailImmunity) {
        gameState.skillState.battleCryFailImmunity = false;
        addFeedback('🛡️ Battle Cry absorbed the failure!', 'bonus');
        updateSkillStateAfterMove(false);
        renderGrid();
        updateUI();
        return;
    }
    
    // Track total grab attempts
    gameState.totalGrabs++;
    if (success) {
        gameState.successfulGrabs++;
    }
    
    // Find the current hold player is on (for move difficulty calculation)
    let currentHold = null;
    for (let c = 0; c < 5; c++) {
        const checkHold = gameState.grid[gameState.currentRow][c];
        if (checkHold && checkHold.col === gameState.currentCol) {
            currentHold = checkHold;
            break;
        }
    }
    
    // Calculate move difficulty (affects pump only)
    const moveDifficulty = calculateMoveDifficulty(
        gameState.currentRow, 
        gameState.currentCol, 
        row, 
        col, 
        currentHold
    );
    
    // Calculate costs with stat modifiers and move difficulty
    // GRIP: Determined by hold difficulty only
    let gripCost = hold.gripCost;
    gripCost *= (1 - gameState.power * 0.02); // Power stat reduces grip loss
    
    // === SKILL GRIP REDUCTION ===
    const skillGripReduction = calculateSkillGripReduction(hold);
    gripCost *= (1 - skillGripReduction);
    
    // === IRON GRIP PROC ===
    if (checkIronGripProc()) {
        gripCost = 0;
    }
    
    // PUMP: Base from hold + scaled by move difficulty
    let pumpCost = hold.pumpBase;
    const basePumpCost = pumpCost; // Store base for feedback calculation
    pumpCost *= (1 + moveDifficulty * 2); // Move difficulty multiplies pump cost (0-100% increase)
    pumpCost *= (1 - gameState.endurance * 0.02); // Endurance stat reduces pump gain
    
    // === SKILL PUMP REDUCTION ===
    const skillPumpReduction = calculateSkillPumpReduction();
    pumpCost *= (1 - skillPumpReduction);
    
    // === DEADPOINT: Zero cost after chalk/shake ===
    if (getSkillRank('deadpoint') >= 1) {
        if (gameState.skillState.justChalked) pumpCost = 0;
        if (gameState.skillState.justShook) gripCost = 0;
    }
    
    // Apply conditions modifiers (time of day + weather)
    const conditionsMods = getConditionsModifiers();
    gripCost *= conditionsMods.gripMult;
    pumpCost *= conditionsMods.pumpMult;
    
    // Apply location modifier (if any)
    if (gameState.currentLocation?.modifier) {
        const locMod = gameState.currentLocation.modifier;
        if (locMod.gripMult) gripCost *= locMod.gripMult;
        if (locMod.pumpMult) pumpCost *= locMod.pumpMult;
    }
    
    // Initialize feedback array BEFORE any usage
    const feedback = [];
    
    // Movement styles no longer affect pump - they only affect success chance
    // Show feedback about success bonus when using correct style
    if (gameState.movementStyle === 'static') {
        if (horizontalDistance <= 1) {
            feedback.push({ text: `Static on close move: +10% success!`, type: 'bonus' });
        } else {
            feedback.push({ text: `Static on far move: no bonus`, type: 'neutral' });
        }
    } else if (gameState.movementStyle === 'dynamic') {
        if (horizontalDistance >= 2) {
            feedback.push({ text: `Dynamic on far move: +10% success!`, type: 'bonus' });
        } else {
            feedback.push({ text: `Dynamic on close move: no bonus`, type: 'neutral' });
        }
    }
    
    // Apply Flow State bonus if active (50% pump AND grip reduction)
    if (gameState.flowStateActive) {
        pumpCost *= 0.5;
        gripCost *= 0.5;
        feedback.push({ text: `🌊 Flow State! 50% pump & grip reduction`, type: 'bonus' });
        // Flow state persists as long as combo continues (not consumed)
    }
    
    // Round costs to integers to avoid floating point precision issues
    gripCost = Math.round(gripCost);
    pumpCost = Math.round(pumpCost);
    const pumpFromMove = Math.round(basePumpCost * moveDifficulty * 2 * (1 - gameState.endurance * 0.02));
    
    // Move difficulty feedback - show actual pump cost, not percentage
    if (moveDifficulty > 0.2) {
        feedback.push({ text: `Hard move! +${pumpFromMove} pump from distance`, type: 'penalty' });
    } else if (moveDifficulty > 0.1) {
        feedback.push({ text: `Moderate move, +${pumpFromMove} pump from distance`, type: 'neutral' });
    } else if (moveDifficulty > 0) {
        feedback.push({ text: `Easy move, +${pumpFromMove} pump from distance`, type: 'bonus' });
    }
    
    // Determine if this would be a crossover
    const direction = col - gameState.currentCol; // -1 = left, 0 = center, 1 = right
    const isCrossover = (direction < 0 && gameState.selectedHand === 'right') || 
                      (direction > 0 && gameState.selectedHand === 'left');
    
    // Success/failure feedback
    if (success) {
        feedback.push({ text: `✓ Grabbed hold! (${Math.round(successChance * 100)}% chance)`, type: 'bonus' });
        
        // Handle crossover - ALL crosses incur penalty unless using static
        if (isCrossover) {
            if (gameState.movementStyle === 'static') {
                feedback.push({ text: `Cross-over but Static negates penalty!`, type: 'bonus' });
            } else {
                // Apply cross-body modifier from Ambidextrous skill
                const crossMod = getSkillCrossBodyModifier();
                const crossPumpPenalty = Math.round(3 * crossMod);
                const crossGripPenalty = Math.round(2 * crossMod);
                
                if (crossMod > 0) {
                    pumpCost += crossPumpPenalty;
                    gripCost += crossGripPenalty;
                    feedback.push({ text: `Cross-over! +${crossPumpPenalty} pump, +${crossGripPenalty} grip loss`, type: 'penalty' });
                } else {
                    feedback.push({ text: `Cross-over (Ambidextrous negates penalty!)`, type: 'bonus' });
                }
            }
            gameState.consecutiveCrosses++;
        } else {
            // Natural reach - reset counter
            gameState.consecutiveCrosses = 0;
            if (direction !== 0) {
                feedback.push({ text: `Natural reach!`, type: 'bonus' });
            }
        }
    } else {
        feedback.push({ text: `✗ Failed to grab! (${Math.round(successChance * 100)}% chance)`, type: 'penalty' });
        
        // COMMIT INSTANT FALL
        if (gameState.commitActive) {
            gameState.commitActive = false;
            // Output all feedback before game over
            feedback.forEach(fb => addFeedback(fb.text, fb.type));
            addFeedback(`💨 COMMIT FAILED - You fell!`, 'penalty');
            endGame(false, `You failed to commit, and you fell!`);
            return; // Stop execution immediately
        }
        
        // NO FALL ZONE INSTANT DEATH
        if (gameState.currentRoute.noFallZone && 
            gameState.holdsClimbed >= gameState.currentRoute.noFallZone) {
            // Output all feedback before game over
            feedback.forEach(fb => addFeedback(fb.text, fb.type));
            addFeedback(`💀 NO FALL ZONE - You fell to your death!`, 'penalty');
            endGame(false, `Failed in the no fall zone! The ground was too far below...`);
            return; // Stop execution immediately
        }
        
        pumpCost += 2; // Extra pump cost for failed attempt
        feedback.push({ text: `Failed attempt: +2 pump`, type: 'penalty' });
        // Reset combo and flow state on failure
        if (gameState.flowStateActive) {
            addFeedback(`Flow State broken!`, 'penalty');
        }
        gameState.comboCount = 0;
        gameState.flowStateActive = false;
        // Note: consecutiveCrosses NOT incremented on failure!
    }
    
    // Apply costs
    gameState.pump += pumpCost;
    gameState.grip -= gripCost;
    
    // Decrement cooldowns on EVERY attempt (successful or failed)
    if (gameState.staticCooldown > 0) {
        gameState.staticCooldown--;
    }
    if (gameState.dynamicCooldown > 0) {
        gameState.dynamicCooldown--;
    }
    if (gameState.shakeCooldown > 0) {
        gameState.shakeCooldown--;
    }
    if (gameState.chalkCooldown > 0) {
        gameState.chalkCooldown--;
    }
    if (gameState.commitCooldown > 0) {
        gameState.commitCooldown--;
    }
    
    // Handle Commit skill cooldown (only if it was active)
    if (gameState.commitActive) {
        gameState.commitActive = false;
        gameState.commitCooldown = 10; // 10 move cooldown
        addFeedback(`Commit used! Cooldown: 10 moves`, 'neutral');
    }
    
    // Set cooldowns for special movement styles (regardless of success/failure)
    if (gameState.movementStyle === 'static') {
        gameState.staticCooldown = gameState.cooldownLength;
        addFeedback(`Static used! Cooldown: ${gameState.cooldownLength} moves`, 'neutral');
    } else if (gameState.movementStyle === 'dynamic') {
        gameState.dynamicCooldown = gameState.cooldownLength;
        addFeedback(`Dynamic used! Cooldown: ${gameState.cooldownLength} moves`, 'neutral');
    }
    
    // Display feedback
    feedback.forEach(f => addFeedback(f.text, f.type));
    addFeedback(`Pump +${pumpCost}, Grip -${gripCost}`, 'neutral');
    
    // === UPDATE SKILL STATE ===
    updateSkillStateAfterMove(success);
    
    // Only move if successful
    if (success) {
        // Grant XP for successful hold grab
        gainXP(10, 'Successful hold grab');
        
        // Record successful grab for hold familiarity (AFTER incrementing holdsClimbed later)
        // We record for the hold we just grabbed, which is holdsClimbed + 1 at this point
        recordSuccessfulGrab(gameState.holdsClimbed + 1);
        
        // Increment combo counter
        gameState.comboCount++;
        
        // Track flow state hold completion for star challenge
        if (gameState.flowStateActive) {
            gameState.holdsCompletedInFlowState++;
        }
        
        // Check for flow state trigger (3 consecutive successes)
        if (gameState.comboCount >= 3) {
            if (!gameState.flowStateActive) {
                // First time reaching flow state
                gameState.flowStateActive = true;
                gameState.holdsCompletedInFlowState++; // Count this hold too
                addFeedback(`🌊 FLOW STATE ACTIVATED! 50% pump & grip on all moves!`, 'bonus');
            } else {
                // Already in flow state, maintaining
                addFeedback(`🌊 Flow State continues! Combo: ${gameState.comboCount}`, 'bonus');
            }
        } else {
            // Building toward flow state
            addFeedback(`Combo: ${gameState.comboCount}/3`, 'neutral');
        }
        
        // Check if matching (both hands used on a matchable hold)
        const bothHandsUsed = gameState.lastHandUsed !== null && 
                              gameState.lastHandUsed !== gameState.selectedHand;
        
        if (hold.matchable && bothHandsUsed) {
            feedback.push({ text: `Matched! Both hands reset`, type: 'bonus' });
            addFeedback(`Matched! Both hands & crosses reset`, 'bonus');
            gameState.lastHandUsed = null; // Reset - both hands now available
            gameState.consecutiveCrosses = 0; // Reset crosses on match
        } else {
            // Update last hand used
            gameState.lastHandUsed = gameState.selectedHand;
        }
        
        // Update player column position
        gameState.currentCol = col;
        gameState.holdsClimbed++;
        
        // Check if just entered no-fall zone
        if (gameState.currentRoute.noFallZone && 
            gameState.holdsClimbed === gameState.currentRoute.noFallZone) {
            addFeedback(`⚠️ NO FALL ZONE - One mistake = death!`, 'penalty');
        }
        
        // Bonus XP for milestone holds
        if (gameState.holdsClimbed % 5 === 0) {
            gainXP(25, `Milestone: ${gameState.holdsClimbed} holds!`);
        }
        
        // Shift all holds down by one row
        // First, move the hold at row 3 (just grabbed) to row 4
        for (let c = 0; c < 5; c++) {
            gameState.grid[4][c] = gameState.grid[3][c];
            if (gameState.grid[4][c]) {
                gameState.grid[4][c].row = 4;
            }
        }
        // Then shift rows 2→3, 1→2, 0→1
        for (let r = 3; r >= 1; r--) {
            for (let c = 0; c < 5; c++) {
                gameState.grid[r][c] = gameState.grid[r - 1][c];
                if (gameState.grid[r][c]) {
                    gameState.grid[r][c].row = r;
                }
            }
        }
        // Clear top row before generating new hold
        for (let c = 0; c < 5; c++) {
            gameState.grid[0][c] = null;
        }
        
        // Generate next hold at the top
        generateNextHold();
    }
    
    // Reset selected hand and movement style to regular after use
    gameState.selectedHand = null;
    gameState.movementStyle = 'regular';
    gameState.fatiguePenalty = 0; // Reset fatigue after move
    
    // Store failed grab target for bump animation (if it was a failure)
    const failedGrabTarget = success ? null : { row, col };
    
    renderGrid();
    updateUI();
    
    // Trigger bump animation AFTER grid is re-rendered (on next frame)
    // This ensures the player element exists
    if (failedGrabTarget) {
        requestAnimationFrame(() => {
            triggerBumpAnimation(failedGrabTarget.row, failedGrabTarget.col);
        });
    }
    
    // Check win/loss/completion
    console.log(`Victory check: holdsClimbed=${gameState.holdsClimbed}, holdCount=${gameState.currentRoute?.holdCount}`);
    if (gameState.pump >= gameState.maxPump) {
        endGame(false, `Pump reached ${gameState.maxPump}!`);
    } else if (gameState.grip <= 0) {
        endGame(false, `Grip depleted!`);
    } else if (gameState.currentRoute && gameState.holdsClimbed >= gameState.currentRoute.holdCount) {
        // Route completed!
        console.log('ROUTE COMPLETED - calling completeRoute()');
        completeRoute();
    }
}

// Update UI

function completeRoute() {
    const location = gameState.currentLocation;
    const route = gameState.currentRoute;
    const routeKey = `${location.id}-${route.id}`;
    
    // Advance time after completing a climb
    advanceTime();
    
    // Update route progress to completed
    if (!gameState.routeProgress[routeKey]) {
        gameState.routeProgress[routeKey] = {
            attempts: 0,
            highPoint: route.holdCount,
            status: 'completed'
        };
    }
    gameState.routeProgress[routeKey].attempts++;
    gameState.routeProgress[routeKey].status = 'completed';
    gameState.routeProgress[routeKey].highPoint = route.holdCount; // Completed = reached top
    
    // Calculate time elapsed
    const timeElapsed = (Date.now() - gameState.climbStartTime) / 1000; // seconds
    const timeLimit = route.holdCount * 5; // 5 seconds per hold
    const roundedTime = Math.round(timeElapsed); // Round for display AND comparison
    
    // Calculate success rate
    const successRate = gameState.successfulGrabs / gameState.totalGrabs;
    const failedGrabs = gameState.totalGrabs - gameState.successfulGrabs;
    
    // Calculate flow master requirement (half the holds)
    const flowRequirement = Math.ceil(route.holdCount / 2);
    
    // Check each star challenge (6 stars total)
    const starResults = {
        completion: true, // Always earned on route completion
        speed: roundedTime <= timeLimit, // Use rounded time for fair comparison
        flow: gameState.holdsCompletedInFlowState >= flowRequirement,
        efficient: successRate >= 0.8,
        noRecovery: gameState.shakesUsed === 0 && gameState.chalksUsed === 0,
        perfect: failedGrabs === 0
    };
    
    let starsEarned = Object.values(starResults).filter(v => v).length;
    
    // Boss routes award minimum 2 stars on completion
    if (route.bossRoute) {
        starsEarned = Math.max(starsEarned, 2);
    }
    
    // Check for victory (The Spire completion)
    if (location.id === 24 && route.name === "The Ascension") {
        showVictoryScreen();
        return; // Don't show normal completion screen
    }
    
    // Save completion (update if better)
    if (!gameState.completedRoutes[routeKey]) {
        gameState.completedRoutes[routeKey] = {
            stars: starsEarned,
            attempts: gameState.routeAttempts,
            starResults: starResults
        };
    } else {
        // Update if more stars earned
        if (starsEarned > gameState.completedRoutes[routeKey].stars) {
            gameState.completedRoutes[routeKey].stars = starsEarned;
        }
        // Merge star results (keep best of each)
        gameState.completedRoutes[routeKey].starResults = {
            completion: true, // Always true once completed
            speed: gameState.completedRoutes[routeKey].starResults?.speed || starResults.speed,
            flow: gameState.completedRoutes[routeKey].starResults?.flow || starResults.flow,
            efficient: gameState.completedRoutes[routeKey].starResults?.efficient || starResults.efficient,
            noRecovery: gameState.completedRoutes[routeKey].starResults?.noRecovery || starResults.noRecovery,
            perfect: gameState.completedRoutes[routeKey].starResults?.perfect || starResults.perfect
        };
        // Recalculate total stars
        gameState.completedRoutes[routeKey].stars = Object.values(gameState.completedRoutes[routeKey].starResults).filter(v => v).length;
    }
    
    // Grant bonus XP (10 XP per star)
    const bonusXP = 50 + (starsEarned * 10);
    gainXP(bonusXP, `Route completed with ${starsEarned} stars!`);
    
    // Award loot if route has it and not already collected
    const loot = awardRouteLoot(location, route);
    let lootHtml = '';
    if (loot) {
        lootHtml = `
            <div style="margin: 15px 0; padding: 15px; background: rgba(250, 216, 130, 0.2); border: 2px solid ${getRarityColor(loot.rarity)}; border-radius: 8px;">
                <div style="color: #fad882; font-weight: bold; margin-bottom: 5px;">🎁 LOOT FOUND!</div>
                <div style="color: ${getRarityColor(loot.rarity)}; font-size: 1.1em;">${loot.name}</div>
                <div style="color: #738078; font-size: 0.85em;">${loot.rarity.toUpperCase()} ${getSlotDisplayName(loot.slot)}</div>
            </div>
        `;
    }
    
    // Unlock adjacent locations
    unlockAdjacentLocations(location);
    
    // Build star display HTML
    const starDisplay = `
        <div style="font-size: 1.2em; margin-bottom: 15px;">
            ${starResults.completion ? '⭐' : '☆'} Completion ${starResults.completion ? '✓' : '✗'}
            <div style="font-size: 0.7em; color: #bdb9ae;">Route completed!</div>
        </div>
        <div style="font-size: 1.2em; margin-bottom: 15px;">
            ${starResults.speed ? '⭐' : '☆'} Speed Climber ${starResults.speed ? '✓' : '✗'}
            <div style="font-size: 0.7em; color: #bdb9ae;">${roundedTime}s / ${timeLimit}s limit</div>
        </div>
        <div style="font-size: 1.2em; margin-bottom: 15px;">
            ${starResults.flow ? '⭐' : '☆'} Flow Master ${starResults.flow ? '✓' : '✗'}
            <div style="font-size: 0.7em; color: #bdb9ae;">${gameState.holdsCompletedInFlowState} / ${flowRequirement} flow holds</div>
        </div>
        <div style="font-size: 1.2em; margin-bottom: 15px;">
            ${starResults.efficient ? '⭐' : '☆'} Efficient Climber ${starResults.efficient ? '✓' : '✗'}
            <div style="font-size: 0.7em; color: #bdb9ae;">${Math.round(successRate * 100)}% success (need 80%)</div>
        </div>
        <div style="font-size: 1.2em; margin-bottom: 15px;">
            ${starResults.noRecovery ? '⭐' : '☆'} No Recovery ${starResults.noRecovery ? '✓' : '✗'}
            <div style="font-size: 0.7em; color: #bdb9ae;">${gameState.shakesUsed + gameState.chalksUsed} recovery uses</div>
        </div>
        <div style="font-size: 1.2em; margin-bottom: 15px;">
            ${starResults.perfect ? '⭐' : '☆'} Perfect Route ${starResults.perfect ? '✓' : '✗'}
            <div style="font-size: 0.7em; color: #bdb9ae;">${failedGrabs} failed grabs</div>
        </div>
    `;
    
    // Show completion message
    const gameOver = document.getElementById('game-over');
    const title = document.getElementById('game-over-title');
    const msg = document.getElementById('game-over-message');
    
    title.textContent = '🎉 ROUTE COMPLETED!';
    msg.innerHTML = `
        <div style="font-size: 2em; margin-bottom: 20px;">${starsEarned}/6 ⭐</div>
        ${lootHtml}
        ${starDisplay}
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #738078;">
            <button class="back-button" onclick="retryRoute()">↻ Retry for More Stars</button>
            <button class="back-button" onclick="returnToRouteSelection()">Routes</button>
            <button class="back-button" onclick="returnToWorldMap()">◄ World Map</button>
        </div>
    `;
    gameOver.classList.add('show');
}

// Unlock adjacent locations
function unlockAdjacentLocations(currentLocation) {
    // Don't unlock adjacent locations - let the 8-star system handle it
    // This function is kept for legacy but does nothing now
    return;
    
    const adjacentOffsets = [
        [-1, 0], [1, 0], [0, -1], [0, 1], // orthogonal
        [-1, -1], [-1, 1], [1, -1], [1, 1] // diagonal
    ];
    
    adjacentOffsets.forEach(([dr, dc]) => {
        const newRow = currentLocation.row + dr;
        const newCol = currentLocation.col + dc;
        
        if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
            const adjacentLocation = locations[newRow * 5 + newCol];
            adjacentLocation.discovered = true;
        }
    });
}

// End game (fall/failure)
function endGame(victory, message) {
    // Advance time after a failed climb attempt
    advanceTime();
    
    // Track route progress and high point
    const routeKey = `${gameState.currentLocation.id}-${gameState.currentRoute.id}`;
    if (!gameState.routeProgress[routeKey]) {
        gameState.routeProgress[routeKey] = {
            attempts: 0,
            highPoint: 0,
            status: 'not_tried'
        };
    }
    
    gameState.routeProgress[routeKey].attempts++;
    gameState.routeProgress[routeKey].status = 'attempted';
    
    // Update high point if this attempt went higher
    if (gameState.holdsClimbed > gameState.routeProgress[routeKey].highPoint) {
        gameState.routeProgress[routeKey].highPoint = gameState.holdsClimbed;
    }
    
    const highPoint = gameState.routeProgress[routeKey].highPoint;
    const isNewHighPoint = gameState.holdsClimbed === highPoint && gameState.holdsClimbed > 0;
    
    const gameOver = document.getElementById('game-over');
    const title = document.getElementById('game-over-title');
    const msg = document.getElementById('game-over-message');
    
    title.textContent = 'YOU FELL!';
    msg.innerHTML = `
        <div style="margin-bottom: 20px;">${message}</div>
        <div>Holds Climbed: ${gameState.holdsClimbed} / ${gameState.currentRoute.holdCount}</div>
        ${isNewHighPoint ? `<div style="color: #fad882; margin: 10px 0;">🏔️ NEW HIGH POINT!</div>` : 
            (highPoint > 0 ? `<div style="color: #738078; margin: 10px 0;">High Point: ${highPoint}</div>` : '')}
        <div style="margin-bottom: 20px;">Level ${gameState.level} | ${gameState.xp} XP</div>
        <div style="margin-bottom: 10px; color: #bdb9ae;">⚡ Energy: ${gameState.energy}/${gameState.maxEnergy}</div>
        <button class="back-button" onclick="retryRoute()">↻ Retry</button>
        <button class="back-button" onclick="returnToRouteSelection()">Routes</button>
        <button class="back-button" onclick="returnToWorldMap()">◄ World Map</button>
    `;
    gameOver.classList.add('show');
}

// Victory screen for completing The Spire
function showVictoryScreen() {
    const totalStars = calculateTotalStars();
    const gameOver = document.getElementById('game-over');
    const title = document.getElementById('game-over-title');
    const msg = document.getElementById('game-over-message');
    
    title.textContent = '🎉 VICTORY! 🎉';
    title.style.color = '#fad882';
    title.style.textShadow = '0 0 20px rgba(250, 216, 130, 0.8)';
    
    msg.innerHTML = `
        <div style="font-size: 1.8em; margin-bottom: 20px; color: #fad882;">
            You conquered The Spire!
        </div>
        <div style="font-size: 1.2em; margin-bottom: 10px;">
            The summit is yours. The view is breathtaking.
        </div>
        <div style="margin: 20px 0; padding: 15px; background: rgba(168, 219, 96, 0.2); border-radius: 8px;">
            <div style="font-size: 1.1em; margin-bottom: 8px;">Final Stats:</div>
            <div>Level: ${gameState.level}</div>
            <div>Total Stars: ${totalStars} ⭐</div>
            <div>Routes Completed: ${Object.keys(gameState.completedRoutes).length}</div>
        </div>
        <div style="margin-top: 30px;">
            <button class="back-button" onclick="returnToWorldMap()" style="background: linear-gradient(135deg, #a8db60, #428764); border-color: #fad882;">
                Continue Exploring
            </button>
        </div>
    `;
    gameOver.classList.add('show');
}

// Retry current route
function retryRoute() {
    document.getElementById('game-over').classList.remove('show');
    startClimb(gameState.currentLocation, gameState.currentRoute);
}

// Return to route selection for current location
function returnToRouteSelection() {
    document.getElementById('game-over').classList.remove('show');
    showRouteSelection(gameState.currentLocation);
}
