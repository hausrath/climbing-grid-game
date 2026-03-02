// Keyboard controls
document.addEventListener('keydown', (e) => {
    // TAB key - toggle help modal (works anytime except title)
    if (e.key === 'Tab') {
        e.preventDefault(); // Prevent default tab behavior
        toggleHelpModal();
        return;
    }
    
    // If help modal is open, ESC or TAB closes it
    const helpModal = document.getElementById('help-modal');
    if (helpModal.classList.contains('show')) {
        if (e.key === 'Escape') {
            toggleHelpModal();
        }
        return; // Don't process other keys while help is open
    }
    
    // Title screen - any key starts
    if (gameState.gameMode === 'title') {
        startGame();
        return;
    }
    
    // ESC key handling
    if (e.key === 'Escape') {
        if (gameState.gameMode === 'climbing') {
            returnToWorldMap();
        } else if (gameState.gameMode === 'routeselect') {
            showWorldMap();
        }
        return;
    }
    
    // Only process game keys during climbing
    if (gameState.gameMode !== 'climbing') return;
    
    const key = e.key.toLowerCase();
    if (key === 'a') selectHand('left');
    else if (key === 'd') selectHand('right');
    else if (key === '1') selectMovementStyle('reach');
    else if (key === '2') selectMovementStyle('regular');
    else if (key === '3') selectMovementStyle('cross');
    else if (key === 'q') useShake();
    else if (key === 'e') useChalk();
    else if (key === 'r') activateCommit();
    else if (key === 't') activateDyno();
    else if (key === 'b') activateBump();
    else if (key === 'z') setWeight('left');
    else if (key === 'x') setWeight('center');
    else if (key === 'c') setWeight('right');
});

// Start game from title screen
function startGame() {
    // Generate daily conditions for Day 1
    generateDailyConditions();
    updateSidebarConditions();
    
    // Give starting gear
    giveStartingGear();
    
    const titleScreen = document.getElementById('title-screen');
    titleScreen.classList.add('hidden');
    setTimeout(() => {
        titleScreen.style.display = 'none';
        showWorldMap();
    }, 500);
}

// Show world map
function showWorldMap() {
    gameState.gameMode = 'worldmap';
    gameState.currentLocation = null; // Clear current location
    document.getElementById('route-selection-overlay').style.display = 'none';
    document.querySelector('.game-container').style.display = 'grid';
    updateSidebarLocationModifiers(); // Hide location modifiers
    updateSidebarConditions(); // Update conditions display
    renderWorldMap();
}

// Render world map (5x5 grid of locations)
function renderWorldMap() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    
    const totalStars = calculateTotalStars();
    const starsNeeded = 8;
    
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const locationIndex = row * 5 + col;
            const location = locations[locationIndex];
            
            const cell = document.createElement('div');
            cell.className = 'grid-cell location-cell';
            
            // Check if location is unlocked
            const isStartingLocation = (row === 0 && col === 0);
            const isUnlocked = isLocationUnlocked(location);
            
            if (!isUnlocked) {
                cell.classList.add('locked');
            } else if (location.isBoss) {
                cell.classList.add('boss');
            }
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'location-name';
            
            if (isUnlocked) {
                nameDiv.textContent = location.name;
                // Mark as discovered once visible
                location.discovered = true;
            } else {
                // Find the best adjacent location to complete
                let bestAdjacentStars = 0;
                const adjacentOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                
                for (const [dr, dc] of adjacentOffsets) {
                    const adjRow = row + dr;
                    const adjCol = col + dc;
                    if (adjRow >= 0 && adjRow < 5 && adjCol >= 0 && adjCol < 5) {
                        const adjLocation = locations[adjRow * 5 + adjCol];
                        if (adjLocation.discovered) {
                            const adjStars = calculateLocationStars(adjLocation.id);
                            bestAdjacentStars = Math.max(bestAdjacentStars, adjStars);
                        }
                    }
                }
                
                nameDiv.innerHTML = `<span style="font-size: 0.8em;">🔒 ${bestAdjacentStars}/${starsNeeded} ⭐</span>`;
            }
            
            const tierDiv = document.createElement('div');
            tierDiv.className = 'location-tier';
            if (isUnlocked) {
                tierDiv.textContent = location.isBoss ? '👑 THE SPIRE' : location.difficultyTier.toUpperCase();
            }
            
            cell.appendChild(nameDiv);
            cell.appendChild(tierDiv);
            
            if (isUnlocked) {
                cell.addEventListener('click', () => selectLocation(location));
                // Add hover events to show modifier tooltip
                cell.addEventListener('mouseover', (e) => showLocationTooltip(location, e));
                cell.addEventListener('mouseout', () => hideLocationTooltip());
            } else {
                cell.addEventListener('click', () => {
                    addFeedback(`⭐ Need 8 stars in an adjacent location to unlock!`, 'penalty');
                });
            }
            
            gridEl.appendChild(cell);
        }
    }
    
    // Update title to show it's world map with star count
    document.querySelector('.title').textContent = `WORLD MAP - ⭐ ${totalStars} Total Stars`;
    
    // Update tooltip hint
    const tooltipBox = document.getElementById('hold-tooltip-static');
    tooltipBox.innerHTML = 'Hover over a location to see modifiers';
}

// Select a location
function selectLocation(location) {
    gameState.currentLocation = location;

    // Check for skill unlocks at this location
    const newSkills = tryUnlockSkillAtLocation(location.id);
    for (const skill of newSkills) {
        addFeedback(`NEW SKILL UNLOCKED: ${skill.name}!`, 'bonus');
        addFeedback(`${skill.description}`, 'neutral');
    }

    showRouteSelection(location);
}

// Show route selection screen
function showRouteSelection(location) {
    gameState.gameMode = 'routeselect';
    gameState.currentLocation = location; // Set current location for sidebar
    updateSidebarLocationModifiers(); // Show location modifiers
    
    const overlay = document.getElementById('route-selection-overlay');
    const content = document.getElementById('route-selection-content');
    
    // Get conditions modifiers for display
    const conditionsMods = getConditionsModifiers();
    const gripEffect = Math.round((conditionsMods.gripMult - 1) * 100);
    const pumpEffect = Math.round((conditionsMods.pumpMult - 1) * 100);
    
    // Build conditions summary with individual indicators
    const { temperature, humidity, wind } = gameState.currentConditions;
    
    // Temperature indicator
    let tempColor = '#bdb9ae';
    let tempEffect = '';
    if (temperature === 'cool') {
        tempColor = '#a8db60';
        tempEffect = ' ↓Pump';
    } else if (temperature === 'hot') {
        tempColor = '#f5aaa2';
        tempEffect = ' ↑Pump';
    }
    
    // Humidity indicator  
    let humidColor = '#bdb9ae';
    let humidEffect = '';
    if (humidity === 'dry') {
        humidColor = '#a8db60';
        humidEffect = ' ↓Grip';
    } else if (humidity === 'humid') {
        humidColor = '#f5aaa2';
        humidEffect = ' ↑Grip';
    }
    
    // Wind indicator
    let windColor = '#bdb9ae';
    let windEffect = '';
    if (wind === 'moderate') {
        windColor = '#fad882';
        windEffect = ' ↑Pump';
    } else if (wind === 'heavy') {
        windColor = '#f5aaa2';
        windEffect = ' ↑↑Pump';
    }
    
    let conditionsHtml = `
        <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
            <span style="color: ${tempColor};">🌡️ ${temperature.charAt(0).toUpperCase() + temperature.slice(1)}${tempEffect}</span>
            <span style="color: ${humidColor};">💧 ${humidity.charAt(0).toUpperCase() + humidity.slice(1)}${humidEffect}</span>
            <span style="color: ${windColor};">💨 ${wind === 'calm' ? 'Calm' : wind.charAt(0).toUpperCase() + wind.slice(1)}${windEffect}</span>
        </div>
    `;
    
    let effectsText = '';
    if (gripEffect !== 0 || pumpEffect !== 0) {
        const effects = [];
        if (gripEffect !== 0) effects.push(`<span style="color: ${gripEffect > 0 ? '#f5aaa2' : '#a8db60'}">Grip ${gripEffect > 0 ? '+' : ''}${gripEffect}%</span>`);
        if (pumpEffect !== 0) effects.push(`<span style="color: ${pumpEffect > 0 ? '#f5aaa2' : '#a8db60'}">Pump ${pumpEffect > 0 ? '+' : ''}${pumpEffect}%</span>`);
        effectsText = `<div style="font-size: 0.9em; margin-top: 8px;">${effects.join(' | ')}</div>`;
    }
    
    const fatigueWarning = '';
    
    content.innerHTML = `
        <h2 style="font-family: 'Righteous', cursive; font-size: 2em; color: #fad882; text-align: center; margin-bottom: 10px;">
            ${location.name}
        </h2>
        <p style="text-align: center; color: #bdb9ae; margin-bottom: 10px;">
            ${location.isBoss ? '👑 BOSS LOCATION' : location.difficultyTier.toUpperCase() + ' TIER'}
        </p>
        ${fatigueWarning}
        <div style="text-align: center; margin-bottom: 20px; padding: 10px; background: rgba(15, 19, 26, 0.4); border-radius: 8px;">
            <div style="color: #738078; font-size: 0.85em; margin-bottom: 5px;">${getTimeIcon()} ${gameState.timeOfDay.charAt(0).toUpperCase() + gameState.timeOfDay.slice(1)} - Day ${gameState.day}</div>
            ${conditionsHtml}
            ${effectsText}
            <div style="margin-top: 8px; color: #a8db60;">Ready to climb!</div>
        </div>
        <div id="routes-list"></div>
        <div style="text-align: center;">
            <button class="back-button" onclick="showWorldMap()">◄ Back to World Map</button>
        </div>
    `;
    
    const routesList = content.querySelector('#routes-list');
    
    location.routes.forEach(route => {
        // Skip placeholder routes
        if (route.placeholder) {
            const placeholderDiv = document.createElement('div');
            placeholderDiv.className = 'route-item';
            placeholderDiv.style.opacity = '0.5';
            placeholderDiv.style.cursor = 'default';
            placeholderDiv.innerHTML = `
                <div class="route-name">${route.name}</div>
                <div class="route-details" style="color: #738078;">${route.description || 'Coming soon...'}</div>
            `;
            routesList.appendChild(placeholderDiv);
            return;
        }

        const completion = gameState.completedRoutes[`${location.id}-${route.id}`];
        const stars = completion ? completion.stars : 0;

        const routeDiv = document.createElement('div');
        routeDiv.className = 'route-item';
        if (route.bossRoute) {
            routeDiv.classList.add('boss-route');
        }
        routeDiv.onclick = () => startClimb(location, route);

        // Color by grade
        let gradeColor = '#a8db60';
        if (route.grade) {
            const gradeNum = parseInt(route.grade.replace(/\D/g, ''));
            if (gradeNum >= 4) gradeColor = '#f5aaa2';
            else if (gradeNum >= 2) gradeColor = '#fad882';
        }

        // Loot indicator
        const lootKey = `${location.id}-${route.id}`;
        const hasLoot = route.hasLoot && !gameState.collectedLoot[lootKey];
        const lootCollected = route.hasLoot && gameState.collectedLoot[lootKey];
        const lootIndicator = hasLoot ? '<span class="loot-indicator">🎁</span>' : (lootCollected ? '<span style="color: #738078;">📦</span>' : '');

        routeDiv.innerHTML = `
            <div class="route-name">${route.name} ${route.bossRoute ? '👑' : ''} ${lootIndicator}</div>
            <div class="route-details">
                <span style="color: ${gradeColor};">${route.grade || 'V?'}</span>
                | ${route.holds.length} holds
                ${completion ? `| <span class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(6-stars)}</span> ${stars}/6` : ''}
                ${hasLoot ? ' | <span style="color: #fad882;">Has Loot!</span>' : ''}
            </div>
            ${route.description ? `<div style="color: #bdb9ae; font-size: 0.85em; margin-top: 4px;">${route.description}</div>` : ''}
        `;

        routesList.appendChild(routeDiv);
    });
    
    overlay.style.display = 'block';
}

// Start climbing a route
function startClimb(location, route) {
    // Don't allow starting placeholder routes
    if (route.placeholder) {
        addFeedback('This route is not yet available.', 'penalty');
        return;
    }

    gameState.gameMode = 'climbing';

    // Track attempts
    const routeKey = `${location.id}-${route.id}`;
    const isSameRoute = gameState.currentLocation?.id === location.id &&
                        gameState.currentRoute?.id === route.id;

    if (isSameRoute && gameState.routeAttempts > 0) {
        gameState.routeAttempts++;
    } else {
        gameState.routeAttempts = 1;
    }

    gameState.currentLocation = location;
    gameState.currentRoute = route;

    // Hide route selection
    document.getElementById('route-selection-overlay').style.display = 'none';
    updateSidebarLocationModifiers();

    // Reset climbing state
    gameState.pumpState = 0;
    gameState.pumpDecayCounter = 0;
    gameState.gripState = 0;
    gameState.selectedHand = null;
    gameState.lastHandUsed = null;
    gameState.currentHand = null;
    gameState.weight = 'center';
    gameState.weightAtMoveStart = 'center';
    gameState.consecutiveCrosses = 0;
    gameState.movementStyle = 'regular';
    gameState.crossActive = false;
    gameState.reachActive = false;
    gameState.crossCooldown = 0;
    gameState.reachCooldown = 0;
    gameState.shakeCooldown = 0;
    gameState.chalkCooldown = 0;
    gameState.commitCooldown = 0;
    gameState.commitActive = false;
    gameState.dynoCooldown = 0;
    gameState.dynoActive = false;
    gameState.bumpActive = false;
    gameState.bumpCooldown = 0;
    gameState.matchCooldown = 0;
    gameState.climbStartTime = Date.now();
    gameState.shakesUsed = 0;
    gameState.chalksUsed = 0;
    gameState.chalkRemaining = gameState.maxChalk;
    gameState.holdsClimbed = 0;

    // Reset skill state
    resetSkillState();

    document.getElementById('feedback').innerHTML = '';

    // Update title
    document.querySelector('.title').textContent = `${location.name} - ${route.name}`;

    // Load route into grid using new system
    loadRoute(route);

    renderGrid();
    updateUI();

    const attemptInfo = gameState.routeAttempts > 1 ? ` (Attempt #${gameState.routeAttempts})` : '';
    addFeedback(`Climbing ${route.name} (${route.grade})! ${route.holds.length} holds to top${attemptInfo}.`, 'neutral');
    if (route.description) {
        addFeedback(route.description, 'neutral');
    }
}

// Return to world map from climb
function returnToWorldMap() {
    document.getElementById('game-over').classList.remove('show');
    gameState.gameMode = 'worldmap';
    showWorldMap();
}



// Initialize game - start at title screen
// Title screen is shown by default, game starts when user presses any key
updateUI();
