// ============ SHAKE (reduces pump) ============
function useShake() {
    const effRecRank = getSkillRank('efficientRecovery');
    let cooldownReduction = effRecRank >= 5 ? 999 : effRecRank >= 4 ? 4 : effRecRank >= 3 ? 3 : effRecRank >= 2 ? 2 : effRecRank >= 1 ? 1 : 0;
    let effectivenessBonus = effRecRank >= 5 ? 0.50 : effRecRank >= 4 ? 0.30 : effRecRank >= 3 ? 0.20 : effRecRank >= 2 ? 0.10 : 0;

    // Check stimulant effect
    if (gameState.skillState.stimulant.active && gameState.skillState.stimulant.movesLeft > 0) {
        cooldownReduction = 999;
    }

    if (gameState.shakeCooldown > 0) {
        addFeedback(`Shake on cooldown! ${gameState.shakeCooldown} moves remaining.`, 'penalty');
        return;
    }

    // Calculate pump reduction (diminishing returns: -1 per shake used)
    const basePumpReduction = Math.max(1, 5 - gameState.shakesUsed);
    const pumpReduction = Math.round(basePumpReduction * (1 + effectivenessBonus));
    gameState.pump = Math.max(0, gameState.pump - pumpReduction);

    gameState.shakesUsed++;

    // Calculate cooldown
    let actualCooldown = gameState.actionCooldownLength;
    if (cooldownReduction >= 999) {
        actualCooldown = 0;
    } else {
        actualCooldown = Math.max(0, actualCooldown - cooldownReduction);
    }

    if (actualCooldown > 0) {
        gameState.shakeCooldown = actualCooldown;
    }

    addFeedback(`Shook out! -${pumpReduction} pump`, 'bonus');
    if (actualCooldown > 0) {
        addFeedback(`Cooldown: ${actualCooldown} moves`, 'neutral');
    } else {
        addFeedback(`No cooldown!`, 'bonus');
    }

    // Deadpoint tracking
    if (getSkillRank('deadpoint') >= 1) {
        gameState.skillState.justShook = true;
        addFeedback(`Deadpoint ready! Next move: reduced grip drain`, 'bonus');
    }

    // Efficient Recovery rank 5 bonus
    if (effRecRank >= 5) {
        gameState.skillState.recoveryBonus = 1;
        addFeedback(`Perfect Execution: reduced pump on next move!`, 'bonus');
    }

    // Shake counts as a turn for cooldown purposes
    if (gameState.staticCooldown > 0) gameState.staticCooldown--;
    if (gameState.dynamicCooldown > 0) gameState.dynamicCooldown--;
    if (gameState.commitCooldown > 0) gameState.commitCooldown--;

    updateUI();
}

// ============ CHALK (restores grip) ============
function useChalk() {
    if (gameState.chalkRemaining <= 0) {
        addFeedback(`Out of chalk! No uses remaining this climb.`, 'penalty');
        return;
    }

    const effRecRank = getSkillRank('efficientRecovery');
    let cooldownReduction = effRecRank >= 5 ? 999 : effRecRank >= 4 ? 4 : effRecRank >= 3 ? 3 : effRecRank >= 2 ? 2 : effRecRank >= 1 ? 1 : 0;
    let effectivenessBonus = effRecRank >= 5 ? 0.50 : effRecRank >= 4 ? 0.30 : effRecRank >= 3 ? 0.20 : effRecRank >= 2 ? 0.10 : 0;

    // Check stimulant effect
    if (gameState.skillState.stimulant.active && gameState.skillState.stimulant.movesLeft > 0) {
        cooldownReduction = 999;
    }

    if (gameState.chalkCooldown > 0) {
        addFeedback(`Chalk on cooldown! ${gameState.chalkCooldown} moves remaining.`, 'penalty');
        return;
    }

    gameState.chalkRemaining--;

    // Calculate grip increase
    const baseGripIncrease = 5;
    const gripIncrease = Math.round(baseGripIncrease * (1 + effectivenessBonus));
    gameState.grip = Math.min(gameState.maxGrip, gameState.grip + gripIncrease);

    gameState.chalksUsed++;

    // Calculate cooldown (chalk has 1-turn cooldown)
    let actualCooldown = 1;
    if (cooldownReduction >= 999) {
        actualCooldown = 0;
    } else {
        actualCooldown = Math.max(0, actualCooldown - cooldownReduction);
    }

    if (actualCooldown > 0) {
        gameState.chalkCooldown = actualCooldown;
    }

    addFeedback(`Chalked up! +${gripIncrease} grip (${gameState.chalkRemaining}/${gameState.maxChalk} uses left)`, 'bonus');

    // Deadpoint tracking
    if (getSkillRank('deadpoint') >= 1) {
        gameState.skillState.justChalked = true;
        addFeedback(`Deadpoint ready! Next move: reduced pump`, 'bonus');
    }

    // Efficient Recovery rank 5 bonus
    if (effRecRank >= 5) {
        gameState.skillState.recoveryBonus = 1;
        addFeedback(`Perfect Execution: reduced pump on next move!`, 'bonus');
    }

    // Chalk counts as a turn for cooldown purposes
    if (gameState.staticCooldown > 0) gameState.staticCooldown--;
    if (gameState.dynamicCooldown > 0) gameState.dynamicCooldown--;
    if (gameState.commitCooldown > 0) gameState.commitCooldown--;

    updateUI();
}

// ============ HOLD FAMILIARITY SYSTEM ============

function getHoldFamiliarityKey(locationId, routeId, holdIndex) {
    return `${locationId}-${routeId}-${holdIndex}`;
}

function getHoldFamiliarityBonus(holdIndex) {
    if (!gameState.currentLocation || !gameState.currentRoute) return 0;
    const key = getHoldFamiliarityKey(
        gameState.currentLocation.id,
        gameState.currentRoute.id,
        holdIndex
    );
    const grabs = gameState.holdFamiliarity[key] || 0;
    return Math.min(0.10, grabs * 0.02);
}

function recordSuccessfulGrab(holdIndex) {
    if (!gameState.currentLocation || !gameState.currentRoute) return;
    const key = getHoldFamiliarityKey(
        gameState.currentLocation.id,
        gameState.currentRoute.id,
        holdIndex
    );
    if (!gameState.holdFamiliarity[key]) {
        gameState.holdFamiliarity[key] = 0;
    }
    if (gameState.holdFamiliarity[key] < 5) {
        gameState.holdFamiliarity[key]++;
    }
}

// ============ COMMIT SKILL ============
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
    addFeedback('COMMIT ACTIVATED! Next move: halved pump cost OR instant fall!', 'bonus');
    updateUI();
}

// Find the hold the player is currently on
function findCurrentHold() {
    if (!gameState.routeGrid) return null;
    const row = gameState.currentRow;
    if (row >= 0 && row < gameState.routeGrid.length) {
        for (let col = 0; col < 5; col++) {
            if (gameState.routeGrid[row][col] && gameState.routeGrid[row][col].col === gameState.currentCol) {
                return gameState.routeGrid[row][col];
            }
        }
    }
    return null;
}

// ============ ROUTE COMPLETION ============
function completeRoute() {
    const location = gameState.currentLocation;
    const route = gameState.currentRoute;
    const routeKey = `${location.id}-${route.id}`;

    // Add fatigue for this attempt
    gameState.pumpFatigue += 1;
    gameState.gripFatigue += 1;

    advanceTime();

    // Update route progress
    if (!gameState.routeProgress[routeKey]) {
        gameState.routeProgress[routeKey] = {
            attempts: 0,
            highPoint: route.holdCount,
            status: 'completed'
        };
    }
    gameState.routeProgress[routeKey].attempts++;
    gameState.routeProgress[routeKey].status = 'completed';
    gameState.routeProgress[routeKey].highPoint = route.holdCount;

    // Calculate time elapsed
    const timeElapsed = (Date.now() - gameState.climbStartTime) / 1000;
    const timeLimit = route.stars?.speed?.timeLimit || (route.holdCount * 5);
    const roundedTime = Math.round(timeElapsed);

    // Check star challenges (new puzzle-based stars)
    const starResults = {
        completion: true,
        speed: roundedTime <= timeLimit,
        pumpEfficiency: route.stars?.pumpEfficiency
            ? gameState.pump <= route.stars.pumpEfficiency.maxPump
            : gameState.pump <= Math.round(gameState.maxPump * 0.3),
        noRecovery: gameState.shakesUsed === 0 && gameState.chalksUsed === 0,
        flashClimb: gameState.routeAttempts <= 1
    };

    let starsEarned = Object.values(starResults).filter(v => v).length;

    // Boss routes award minimum 2 stars
    if (route.bossRoute) {
        starsEarned = Math.max(starsEarned, 2);
    }

    // Check for victory (The Spire completion)
    if (location.id === 24 && route.name === "The Ascension") {
        showVictoryScreen();
        return;
    }

    // Save completion
    if (!gameState.completedRoutes[routeKey]) {
        gameState.completedRoutes[routeKey] = {
            stars: starsEarned,
            attempts: gameState.routeAttempts,
            starResults: starResults
        };
    } else {
        if (starsEarned > gameState.completedRoutes[routeKey].stars) {
            gameState.completedRoutes[routeKey].stars = starsEarned;
        }
        gameState.completedRoutes[routeKey].starResults = {
            completion: true,
            speed: gameState.completedRoutes[routeKey].starResults?.speed || starResults.speed,
            pumpEfficiency: gameState.completedRoutes[routeKey].starResults?.pumpEfficiency || starResults.pumpEfficiency,
            noRecovery: gameState.completedRoutes[routeKey].starResults?.noRecovery || starResults.noRecovery,
            flashClimb: gameState.completedRoutes[routeKey].starResults?.flashClimb || starResults.flashClimb
        };
        gameState.completedRoutes[routeKey].stars = Object.values(gameState.completedRoutes[routeKey].starResults).filter(v => v).length;
    }

    // Award pump/grip banking for route completion (no star requirement)
    gameState.bankedPumpIncrease += 1;
    gameState.bankedGripIncrease += 1;
    addFeedback('💪 Banked +1 max pump & +1 max grip! Rest to realize gains.', 'bonus');

    // Award loot if route has it
    const loot = awardRouteLoot(location, route);
    let lootHtml = '';
    if (loot) {
        lootHtml = `
            <div style="margin: 15px 0; padding: 15px; background: rgba(250, 216, 130, 0.2); border: 2px solid ${getRarityColor(loot.rarity)}; border-radius: 8px;">
                <div style="color: #fad882; font-weight: bold; margin-bottom: 5px;">LOOT FOUND!</div>
                <div style="color: ${getRarityColor(loot.rarity)}; font-size: 1.1em;">${loot.name}</div>
                <div style="color: #738078; font-size: 0.85em;">${loot.rarity.toUpperCase()} ${getSlotDisplayName(loot.slot)}</div>
            </div>
        `;
    }

    // Unlock adjacent locations
    unlockAdjacentLocations(location);

    // Build star display
    const pumpEffLabel = route.stars?.pumpEfficiency
        ? `Pump <= ${route.stars.pumpEfficiency.maxPump}`
        : `Pump <= ${Math.round(gameState.maxPump * 0.3)}`;

    const starDisplay = `
        <div style="font-size: 1.2em; margin-bottom: 15px;">
            ${starResults.completion ? '⭐' : '☆'} Completion
            <div style="font-size: 0.7em; color: #bdb9ae;">Route completed!</div>
        </div>
        <div style="font-size: 1.2em; margin-bottom: 15px;">
            ${starResults.speed ? '⭐' : '☆'} Speed Climber
            <div style="font-size: 0.7em; color: #bdb9ae;">${roundedTime}s / ${timeLimit}s limit</div>
        </div>
        <div style="font-size: 1.2em; margin-bottom: 15px;">
            ${starResults.pumpEfficiency ? '⭐' : '☆'} Pump Efficiency
            <div style="font-size: 0.7em; color: #bdb9ae;">${pumpEffLabel} (ended at ${gameState.pump})</div>
        </div>
        <div style="font-size: 1.2em; margin-bottom: 15px;">
            ${starResults.noRecovery ? '⭐' : '☆'} No Recovery
            <div style="font-size: 0.7em; color: #bdb9ae;">${gameState.shakesUsed + gameState.chalksUsed} recovery uses</div>
        </div>
        <div style="font-size: 1.2em; margin-bottom: 15px;">
            ${starResults.flashClimb ? '⭐' : '☆'} Flash Climb
            <div style="font-size: 0.7em; color: #bdb9ae;">${gameState.routeAttempts <= 1 ? 'First try!' : `Attempt #${gameState.routeAttempts}`}</div>
        </div>
    `;

    // Show completion message
    const gameOver = document.getElementById('game-over');
    const title = document.getElementById('game-over-title');
    const msg = document.getElementById('game-over-message');

    title.textContent = 'ROUTE COMPLETED!';
    msg.innerHTML = `
        <div style="font-size: 2em; margin-bottom: 20px;">${starsEarned}/5 ⭐</div>
        ${lootHtml}
        ${starDisplay}
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #738078;">
            <button class="back-button" onclick="retryRoute()">Retry for More Stars</button>
            <button class="back-button" onclick="returnToRouteSelection()">Routes</button>
            <button class="back-button" onclick="returnToWorldMap()">World Map</button>
        </div>
    `;
    gameOver.classList.add('show');
}

// Unlock adjacent locations (legacy — uses star system now)
function unlockAdjacentLocations(currentLocation) {
    return;
}

// End game (fall/failure)
function endGame(victory, message) {
    // Add fatigue for this attempt
    gameState.pumpFatigue += 1;
    gameState.gripFatigue += 1;

    advanceTime();

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

    if (gameState.holdsClimbed > gameState.routeProgress[routeKey].highPoint) {
        gameState.routeProgress[routeKey].highPoint = gameState.holdsClimbed;
    }

    const highPoint = gameState.routeProgress[routeKey].highPoint;
    const isNewHighPoint = gameState.holdsClimbed === highPoint && gameState.holdsClimbed > 0;

    const gameOver = document.getElementById('game-over');
    const title = document.getElementById('game-over-title');
    const msg = document.getElementById('game-over-message');

    title.textContent = 'YOU FELL!';
    const availablePump = getAvailablePump();
    const availableGrip = getAvailableGrip();
    msg.innerHTML = `
        <div style="margin-bottom: 20px;">${message}</div>
        <div>Holds Climbed: ${gameState.holdsClimbed} / ${gameState.currentRoute.holdCount}</div>
        ${isNewHighPoint ? `<div style="color: #fad882; margin: 10px 0;">NEW HIGH POINT!</div>` :
            (highPoint > 0 ? `<div style="color: #738078; margin: 10px 0;">High Point: ${highPoint}</div>` : '')}
        <div style="margin-bottom: 10px; color: #bdb9ae;">💪 Available: ${availablePump} Pump / ${availableGrip} Grip</div>
        <button class="back-button" onclick="retryRoute()">Retry</button>
        <button class="back-button" onclick="returnToRouteSelection()">Routes</button>
        <button class="back-button" onclick="returnToWorldMap()">World Map</button>
    `;
    gameOver.classList.add('show');
}

// Victory screen for completing The Spire
function showVictoryScreen() {
    const totalStars = calculateTotalStars();
    const gameOver = document.getElementById('game-over');
    const title = document.getElementById('game-over-title');
    const msg = document.getElementById('game-over-message');

    title.textContent = 'VICTORY!';
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
            <div>Total Stars: ${totalStars}</div>
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

// Return to route selection
function returnToRouteSelection() {
    document.getElementById('game-over').classList.remove('show');
    showRouteSelection(gameState.currentLocation);
}
