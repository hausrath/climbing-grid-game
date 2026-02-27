// ============ SHAKE (reduces pump state by 1) ============
function useShake() {
    const currentHold = gameState.routeGrid?.[gameState.currentRow]?.[gameState.currentCol];
    if (!currentHold?.shakable) {
        addFeedback(`Can't shake here — find a rest position!`, 'penalty');
        return;
    }
    if (gameState.shakeCooldown > 0) {
        addFeedback(`Shake on cooldown! ${gameState.shakeCooldown} moves remaining.`, 'penalty');
        return;
    }

    if (gameState.pumpState <= 0) {
        addFeedback(`Already fresh — no pump to shake off!`, 'neutral');
        return;
    }

    // Reduce pump state by 1
    const oldState = gameState.pumpState;
    gameState.pumpState = Math.max(0, gameState.pumpState - 1);
    const newLabel = PUMP_STATE_LABELS[gameState.pumpState] || 'Fresh';

    gameState.shakesUsed++;
    gameState.shakeCooldown = gameState.actionCooldownLength;

    addFeedback(`Shook out! Pump: ${PUMP_STATE_LABELS[oldState]} -> ${newLabel}`, 'bonus');
    addFeedback(`Cooldown: ${gameState.shakeCooldown} moves`, 'neutral');

    // Deadpoint tracking
    if (isSkillUnlocked('deadpoint')) {
        gameState.skillState.justShook = true;
        addFeedback(`Deadpoint ready! Next move: no pump state change`, 'bonus');
    }

    // Shake counts as a turn for cooldown purposes
    if (gameState.crossCooldown > 0) gameState.crossCooldown--;
    if (gameState.reachCooldown > 0) gameState.reachCooldown--;
    if (gameState.commitCooldown > 0) gameState.commitCooldown--;
    if (gameState.dynoCooldown > 0) gameState.dynoCooldown--;

    updateUI();
}

// ============ CHALK (resets grip state to 0) ============
function useChalk() {
    const currentHold = gameState.routeGrid?.[gameState.currentRow]?.[gameState.currentCol];
    if (!currentHold?.chalkable) {
        addFeedback(`Can't chalk here — no chalk bucket!`, 'penalty');
        return;
    }
    if (gameState.chalkRemaining <= 0) {
        addFeedback(`Out of chalk! No uses remaining this climb.`, 'penalty');
        return;
    }

    if (gameState.chalkCooldown > 0) {
        addFeedback(`Chalk on cooldown! ${gameState.chalkCooldown} moves remaining.`, 'penalty');
        return;
    }

    gameState.chalkRemaining--;

    // Reset grip state and decay counter
    const oldGripLabel = GRIP_STATE_LABELS[gameState.gripState] || 'Critical';
    gameState.gripState = 0;
    gameState.gripDecayCounter = 0;

    gameState.chalksUsed++;
    gameState.chalkCooldown = 1; // 1-turn cooldown

    addFeedback(`Chalked up! Grip: ${oldGripLabel} -> Chalked (${gameState.chalkRemaining}/${gameState.maxChalk} uses left)`, 'bonus');

    // Deadpoint tracking
    if (isSkillUnlocked('deadpoint')) {
        gameState.skillState.justChalked = true;
        addFeedback(`Deadpoint ready! Next move: grip decay skipped`, 'bonus');
    }

    // Chalk counts as a turn for cooldown purposes
    if (gameState.crossCooldown > 0) gameState.crossCooldown--;
    if (gameState.reachCooldown > 0) gameState.reachCooldown--;
    if (gameState.commitCooldown > 0) gameState.commitCooldown--;
    if (gameState.dynoCooldown > 0) gameState.dynoCooldown--;

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
    if (!isSkillUnlocked('commit')) {
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
    addFeedback('COMMIT ACTIVATED! Next move: penalty reduced by 1 level!', 'bonus');
    updateUI();
}

// ============ DYNO SKILL ============
function activateDyno() {
    if (!isSkillUnlocked('dyno')) {
        addFeedback('Dyno skill not learned!', 'penalty');
        return;
    }
    if (gameState.dynoCooldown > 0) {
        addFeedback(`Dyno on cooldown! ${gameState.dynoCooldown} moves remaining`, 'penalty');
        return;
    }
    if (gameState.dynoActive) {
        addFeedback('Dyno already active!', 'penalty');
        return;
    }
    gameState.dynoActive = true;
    addFeedback('DYNO ACTIVATED! Next move: reach extended to 3 spaces!', 'bonus');
    renderGrid();
    updateUI();
}

// Find the hold the player is currently on
function findCurrentHold() {
    if (!gameState.routeGrid) return null;
    const row = gameState.currentRow;
    if (row >= 0 && row < gameState.routeGrid.length) {
        for (let col = 0; col < 7; col++) {
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

    advanceTime();

    // Update route progress
    if (!gameState.routeProgress[routeKey]) {
        gameState.routeProgress[routeKey] = {
            attempts: 0,
            highPoint: gameState.currentRow,
            status: 'completed'
        };
    }
    gameState.routeProgress[routeKey].attempts++;
    gameState.routeProgress[routeKey].status = 'completed';
    gameState.routeProgress[routeKey].highPoint = gameState.currentRow;

    // Calculate time elapsed
    const timeElapsed = (Date.now() - gameState.climbStartTime) / 1000;
    const timeLimit = route.stars?.speed?.timeLimit || (route.holds.length * 5);
    const roundedTime = Math.round(timeElapsed);

    // Check star challenges (new puzzle-based stars)
    const starResults = {
        completion: true,
        speed: roundedTime <= timeLimit,
        pumpEfficiency: gameState.pumpState === 0,
        gripEfficiency: gameState.gripState === 0,
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
            gripEfficiency: gameState.completedRoutes[routeKey].starResults?.gripEfficiency || starResults.gripEfficiency,
            flashClimb: gameState.completedRoutes[routeKey].starResults?.flashClimb || starResults.flashClimb
        };
        gameState.completedRoutes[routeKey].stars = Object.values(gameState.completedRoutes[routeKey].starResults).filter(v => v).length;
    }


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

    // Check for skill unlocks triggered by route completion
    const newSkills = tryUnlockSkillOnCompletion(location.id);
    let skillUnlockHtml = '';
    if (newSkills.length > 0) {
        skillUnlockHtml = newSkills.map(skill => `
            <div style="margin: 20px 0; padding: 20px; background: linear-gradient(135deg, rgba(250, 216, 130, 0.15), rgba(168, 219, 96, 0.15)); border: 2px solid #fad882; border-radius: 12px; position: relative; overflow: hidden;">
                <style>
                    @keyframes skillShimmer {
                        0% { background-position: -200% center; }
                        100% { background-position: 200% center; }
                    }
                </style>
                <div style="font-size: 1.4em; font-weight: bold; font-family: 'Righteous', cursive;
                    background: linear-gradient(90deg, #fad882, #ffffff, #a8db60, #ffffff, #fad882);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: skillShimmer 2s linear infinite;">
                    NEW SKILL UNLOCKED!
                </div>
                <div style="font-size: 1.6em; color: #fad882; margin: 10px 0; font-family: 'Righteous', cursive;">
                    ${skill.name}
                </div>
                <div style="color: #bdb9ae; font-size: 0.95em;">${skill.description}</div>
                <div style="color: #738078; font-size: 0.85em; margin-top: 8px;">${skill.effect}</div>
            </div>
        `).join('');
    }

    // Build star display
    const pumpEffLabel = 'Finish with Fresh pump';

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
            <div style="font-size: 0.7em; color: #bdb9ae;">${pumpEffLabel} (ended: ${PUMP_STATE_LABELS[gameState.pumpState] || 'Critical'})</div>
        </div>
        <div style="font-size: 1.2em; margin-bottom: 15px;">
            ${starResults.gripEfficiency ? '⭐' : '☆'} Grip Efficiency
            <div style="font-size: 0.7em; color: #bdb9ae;">Finish with Chalked grip (ended: ${GRIP_STATE_LABELS[gameState.gripState] || 'Critical'})</div>
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
        ${skillUnlockHtml}
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

    if (gameState.currentRow > gameState.routeProgress[routeKey].highPoint) {
        gameState.routeProgress[routeKey].highPoint = gameState.currentRow;
    }

    const highPoint = gameState.routeProgress[routeKey].highPoint;
    const topRow = gameState.currentRoute.topRow || 1;
    const isNewHighPoint = gameState.currentRow === highPoint && gameState.currentRow > 0;

    const gameOver = document.getElementById('game-over');
    const title = document.getElementById('game-over-title');
    const msg = document.getElementById('game-over-message');

    title.textContent = 'YOU FELL!';
    const pumpLabel = PUMP_STATE_LABELS[gameState.pumpState] || 'Critical';
    const gripLabel = GRIP_STATE_LABELS[gameState.gripState] || 'Critical';
    msg.innerHTML = `
        <div style="margin-bottom: 20px;">${message}</div>
        <div>Reached row ${gameState.currentRow} / ${topRow}</div>
        ${isNewHighPoint ? `<div style="color: #fad882; margin: 10px 0;">NEW HIGH POINT!</div>` :
            (highPoint > 0 ? `<div style="color: #738078; margin: 10px 0;">High Point: row ${highPoint}</div>` : '')}
        <div style="margin-bottom: 10px; color: #bdb9ae;">Pump: ${pumpLabel} | Grip: ${gripLabel}</div>
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
