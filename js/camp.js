// ============ PHASE 12: Camp System ============

// Show camp screen
function showCamp() {
    gameState.gameMode = 'camp';
    document.getElementById('camp-overlay').classList.add('show');
    updateCampUI();
}

// Update camp UI displays
function updateCampUI() {
    // Update subtitle
    const timeIcon = getTimeIcon();
    const timeName = gameState.timeOfDay.charAt(0).toUpperCase() + gameState.timeOfDay.slice(1);
    document.getElementById('camp-subtitle').textContent = `Day ${gameState.day} - ${timeIcon} ${timeName}`;
    
    // Update fatigue status in camp
    const availablePump = getAvailablePump();
    const availableGrip = getAvailableGrip();
    const campPips = document.getElementById('camp-energy-pips');
    if (campPips) {
        campPips.innerHTML = `<div style="color: #bdb9ae; font-size: 0.9em;">💪 Available: ${availablePump} Pump / ${availableGrip} Grip</div>`;
    }
    const campEnergyText = document.getElementById('camp-energy-text');
    if (campEnergyText) {
        campEnergyText.textContent = gameState.pumpFatigue > 0 || gameState.gripFatigue > 0 ?
            `Fatigue: ${gameState.pumpFatigue} Pump / ${gameState.gripFatigue} Grip` : 'Fully Rested';
    }

    // Update points notification
    const availableStars = calculateAvailableStars();
    const hasPoints = availableStars > 0;
    const notification = document.getElementById('camp-points-notification');
    if (notification) {
        notification.style.display = hasPoints ? 'block' : 'none';
    }
    const statPoints = document.getElementById('camp-stat-points');
    if (statPoints) statPoints.textContent = '0';
    const skillPoints = document.getElementById('camp-skill-points');
    if (skillPoints) skillPoints.textContent = availableStars;

    // Update rest button (disabled if no fatigue and no banked gains)
    const restBtn = document.getElementById('camp-rest');
    const hasFatigue = gameState.pumpFatigue > 0 || gameState.gripFatigue > 0;
    const hasBankedGains = gameState.bankedPumpIncrease > 0 || gameState.bankedGripIncrease > 0;
    if (!hasFatigue && !hasBankedGains) {
        restBtn.classList.add('disabled');
        restBtn.innerHTML = '<span class="icon">😴</span>Rest<br><span style="font-size: 0.7em; color: #738078;">Fully rested</span>';
    } else {
        restBtn.classList.remove('disabled');
        const bankedText = hasBankedGains ? `<br><span style="font-size: 0.7em; color: #fad882;">+${gameState.bankedPumpIncrease}/${gameState.bankedGripIncrease} to realize</span>` : '';
        restBtn.innerHTML = `<span class="icon">😴</span>Rest${bankedText}`;
    }
    
    // Update spend points overlay values (legacy code - stat system removed)
    const spendStatCount = document.getElementById('spend-stat-count');
    if (spendStatCount) spendStatCount.textContent = '0';
    const spendSkillCount = document.getElementById('spend-skill-count');
    if (spendSkillCount) spendSkillCount.textContent = availableStars;

    // Legacy stat displays (system removed)
    const campEndurance = document.getElementById('camp-endurance');
    if (campEndurance) campEndurance.textContent = '0';
    const campPower = document.getElementById('camp-power');
    if (campPower) campPower.textContent = '0';
    const campSpeed = document.getElementById('camp-speed');
    if (campSpeed) campSpeed.textContent = '0';
    const campTechnique = document.getElementById('camp-technique');
    if (campTechnique) campTechnique.textContent = '0';
    
    // Update commit skill button
    if (gameState.skills.commit) {
        document.getElementById('camp-commit-btn').textContent = 'LEARNED ✓';
        document.getElementById('camp-commit-btn').disabled = true;
        document.getElementById('camp-commit-btn').style.opacity = '0.5';
    }
}

// Show spend points overlay
function showCampSpendPoints() {
    document.getElementById('camp-spend-points-overlay').classList.add('show');
    updateCampUI();
    updateCampSkillsPreview();
}

// Update camp skills preview with learnable skills
function updateCampSkillsPreview() {
    const container = document.getElementById('camp-skills-preview');
    if (!container) return;
    
    const categoryColors = {
        athletics: '#a64e68',
        utility: '#fad882',
        magic: '#a8db60'
    };
    
    let html = '';
    
    // Show up to 6 skills that can be upgraded
    let skillsShown = 0;
    for (const [skillId, skill] of Object.entries(skillDatabase)) {
        if (skillsShown >= 6) break;

        const currentRank = getSkillRank(skillId);
        const maxRank = skill.ranks.length;

        if (currentRank < maxRank) {
            const canUpgrade = canUpgradeSkill(skillId);
            const nextRankCost = skill.starCosts[currentRank];
            const color = categoryColors[skill.category] || '#bdb9ae';

            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin-bottom: 6px; background: rgba(0,0,0,0.2); border-radius: 4px; border-left: 3px solid ${color};">
                    <div>
                        <div style="color: ${color}; font-size: 0.9em;">${skill.name}</div>
                        <div style="font-size: 0.7em; color: #738078;">Rank ${currentRank}/${maxRank}</div>
                    </div>
                    <button class="hand-button" onclick="learnSkill('${skillId}')" style="border-color: ${color}; padding: 4px 10px; font-size: 0.8em;" ${canUpgrade ? '' : 'disabled'}>
                        ${nextRankCost} ⭐
                    </button>
                </div>
            `;
            skillsShown++;
        }
    }

    if (skillsShown === 0) {
        html = '<div style="color: #738078; font-size: 0.85em; text-align: center;">All skills maxed or no stars available</div>';
    }
    
    container.innerHTML = html;
}

// Close spend points overlay
function closeCampSpendPoints() {
    document.getElementById('camp-spend-points-overlay').classList.remove('show');
    updateCampUI();
}

// Rest at camp - reset fatigue, realize banked gains, and advance to next day
function campRest() {
    if (gameState.pumpFatigue === 0 && gameState.gripFatigue === 0 &&
        gameState.bankedPumpIncrease === 0 && gameState.bankedGripIncrease === 0) {
        addFeedback('You\'re already fully rested with no training to realize!', 'neutral');
        return;
    }

    // Realize banked pump/grip increases
    if (gameState.bankedPumpIncrease > 0 || gameState.bankedGripIncrease > 0) {
        gameState.maxPump += gameState.bankedPumpIncrease;
        gameState.maxGrip += gameState.bankedGripIncrease;
        addFeedback(`💪 Training realized! +${gameState.bankedPumpIncrease} max pump, +${gameState.bankedGripIncrease} max grip`, 'bonus');
        gameState.bankedPumpIncrease = 0;
        gameState.bankedGripIncrease = 0;
    }

    // Reset fatigue
    gameState.pumpFatigue = 0;
    gameState.gripFatigue = 0;

    // Advance to next day
    gameState.day++;
    gameState.timeOfDay = 'morning';
    gameState.climbsThisPeriod = 0;

    // Generate new conditions for the new day
    generateDailyConditions();

    addFeedback(`😴 You rest through the night...`, 'neutral');
    addFeedback(`☀️ Day ${gameState.day} begins! Fatigue cleared.`, 'bonus');
    addFeedback(`Today's conditions: ${getConditionsDescription()}`, 'neutral');

    updateCampUI();
    updateSidebarConditions();
}

// Leave camp and return to world map
function leaveCamp() {
    gameState.gameMode = 'worldmap';
    document.getElementById('camp-overlay').classList.remove('show');
    showWorldMap();
}

// Placeholder function for unimplemented features
function showPlaceholder(featureName) {
    addFeedback(`📋 ${featureName} - Coming soon!`, 'neutral');
}

// ============ PHASE 13: Guidebook System ============

// Store current beta viewing context
let currentBetaLocation = null;
let currentBetaRoute = null;

// Show the guidebook
function showGuidebook() {
    const container = document.getElementById('guidebook-locations');
    container.innerHTML = '';
    
    // Group routes by location, only show discovered locations
    locations.forEach((location, index) => {
        // Check if location is discovered
        const isStartingLocation = (index === 0);
        const totalStars = calculateTotalStars();
        const hasEnoughStars = totalStars >= 8;
        const isDiscovered = isStartingLocation || location.discovered || hasEnoughStars;
        
        if (!isDiscovered) return;
        
        // Calculate location stats
        let completedCount = 0;
        let totalStarsHere = 0;
        let totalAttempts = 0;
        
        location.routes.forEach(route => {
            const completion = gameState.completedRoutes[`${location.id}-${route.id}`];
            if (completion) {
                completedCount++;
                totalStarsHere += completion.stars;
                totalAttempts += completion.attempts;
            }
        });
        
        const locationDiv = document.createElement('div');
        locationDiv.className = 'guidebook-location';
        locationDiv.innerHTML = `
            <div class="guidebook-location-header" onclick="toggleGuidebookLocation(${index})">
                <div class="guidebook-location-name">
                    ${location.isBoss ? '👑 ' : ''}${location.name}
                    <span style="color: #738078; font-size: 0.8em; margin-left: 10px;">${location.difficultyTier}</span>
                </div>
                <div class="guidebook-location-stats">
                    ${completedCount}/${location.routes.length} routes | ${totalStarsHere} ⭐
                </div>
            </div>
            <div class="guidebook-routes" id="guidebook-routes-${index}">
                ${renderGuidebookRoutes(location)}
            </div>
        `;
        
        container.appendChild(locationDiv);
    });
    
    document.getElementById('guidebook-overlay').classList.add('show');
}

// Render routes for a location in the guidebook
function renderGuidebookRoutes(location) {
    let html = '';
    
    location.routes.forEach(route => {
        const completion = gameState.completedRoutes[`${location.id}-${route.id}`];
        const stars = completion ? completion.stars : 0;
        const attempts = completion ? completion.attempts : 0;
        const lootKey = `${location.id}-${route.id}`;
        const hasLoot = route.hasLoot && !gameState.collectedLoot[lootKey];
        const lootCollected = route.hasLoot && gameState.collectedLoot[lootKey];
        
        let difficultyColor = '#a8db60';
        if (route.difficulty === 'intermediate') difficultyColor = '#fad882';
        else if (route.difficulty === 'expert') difficultyColor = '#f5aaa2';
        else if (route.difficulty === 'project') difficultyColor = '#c178de';
        else if (route.difficulty === 'boss') difficultyColor = '#c178de';
        
        html += `
            <div class="guidebook-route">
                <div class="guidebook-route-info">
                    <div class="guidebook-route-name">
                        ${route.name} ${route.bossRoute ? '👑' : ''} ${hasLoot ? '<span class="loot-indicator">🎁</span>' : ''} ${lootCollected ? '<span style="color: #738078;">📦</span>' : ''}
                    </div>
                    <div class="guidebook-route-details">
                        <span style="color: ${difficultyColor};">● ${route.difficulty.toUpperCase()}</span>
                        | ${route.holdCount} holds
                        | <span style="color: #6dbce3;">${route.terrain || 'vertical'}</span>
                        ${completion ? `| ${attempts} attempt${attempts !== 1 ? 's' : ''}` : '| Not attempted'}
                        ${hasLoot ? ' | <span style="color: #fad882;">Has Loot!</span>' : ''}
                    </div>
                </div>
                <div style="margin-right: 15px;">
                    ${completion ? `<span style="color: #fad882;">${'⭐'.repeat(stars)}${'☆'.repeat(6-stars)}</span>` : '<span style="color: #738078;">------</span>'}
                </div>
                <div class="guidebook-route-actions">
                    <button class="beta-button" onclick="showBeta(${location.id}, '${route.id}')">
                        📋 View Beta
                    </button>
                </div>
            </div>
        `;
    });
    
    return html;
}

// Toggle location expansion in guidebook
function toggleGuidebookLocation(index) {
    const routes = document.getElementById(`guidebook-routes-${index}`);
    routes.classList.toggle('expanded');
}

// Close guidebook
function closeGuidebook() {
    document.getElementById('guidebook-overlay').classList.remove('show');
}

// ============ PHASE 13: Beta/Route Preview System ============

// Show beta (route preview) for a specific route
function showBeta(locationId, routeId) {
    console.log('showBeta called with:', locationId, routeId);
    
    const location = locations.find(l => l.id === locationId);
    if (!location) {
        console.error('Location not found:', locationId);
        return;
    }
    
    // Convert routeId to number for comparison (it may come as string from onclick)
    const routeIdNum = parseInt(routeId);
    const route = location.routes.find(r => r.id === routeIdNum);
    
    if (!route) {
        console.error('Route not found:', routeId, 'in location', locationId);
        return;
    }
    
    currentBetaLocation = location;
    currentBetaRoute = route;
    
    // Set title and subtitle
    document.getElementById('beta-route-name').textContent = `${route.name} ${route.bossRoute ? '👑' : ''}`;
    
    let gradeColor = '#a8db60';
    if (route.grade) {
        const gradeNum = parseInt(route.grade.replace(/\D/g, ''));
        if (gradeNum >= 4) gradeColor = '#f5aaa2';
        else if (gradeNum >= 2) gradeColor = '#fad882';
    }

    document.getElementById('beta-route-subtitle').innerHTML = `
        ${location.name} | <span style="color: ${gradeColor};">${route.grade || 'V?'}</span> | ${route.holdCount} holds
    `;
    
    // Get route progress for status and high point
    const progress = gameState.routeProgress[`${location.id}-${route.id}`];
    const attempts = progress ? progress.attempts : 0;
    const highPoint = progress ? progress.highPoint : 0;
    const status = progress ? progress.status : 'not_tried';
    
    let statusText, statusColor;
    if (status === 'completed') {
        statusText = 'Completed ✓';
        statusColor = '#a8db60';
    } else if (status === 'attempted') {
        statusText = `Attempted (HP: ${highPoint})`;
        statusColor = '#fad882';
    } else {
        statusText = 'Not tried';
        statusColor = '#738078';
    }
    
    let overviewHtml = `
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center;">
            <div>
                <div style="color: #738078; font-size: 0.85em;">Status</div>
                <div style="color: ${statusColor}; font-size: 1em;">${statusText}</div>
            </div>
            <div>
                <div style="color: #738078; font-size: 0.85em;">Stars</div>
                <div style="color: #fad882; font-size: 1.2em;">${completion ? `${completion.stars}/6 ⭐` : '---'}</div>
            </div>
            <div>
                <div style="color: #738078; font-size: 0.85em;">Attempts</div>
                <div style="color: #bdb9ae; font-size: 1.2em;">${attempts}</div>
            </div>
            <div>
                <div style="color: #738078; font-size: 0.85em;">High Point</div>
                <div style="color: ${highPoint > 0 ? '#fad882' : '#738078'}; font-size: 1.2em;">${highPoint > 0 ? `${highPoint}/${route.holdCount}` : '---'}</div>
            </div>
        </div>
    `;
    
    if (route.noFallZone) {
        overviewHtml += `
            <div style="margin-top: 15px; padding: 10px; background: rgba(245, 170, 162, 0.2); border-radius: 6px; text-align: center;">
                <span style="color: #f5aaa2;">⚠️ NO FALL ZONE after hold ${route.noFallZone}</span>
            </div>
        `;
    }
    
    // Show route description if available
    if (route.description) {
        overviewHtml += `
            <div style="margin-top: 15px; padding: 10px; background: rgba(193, 120, 222, 0.15); border-radius: 6px; text-align: center;">
                <span style="color: #bdb9ae; font-style: italic;">${route.description}</span>
            </div>
        `;
    }
    
    document.getElementById('beta-overview').innerHTML = overviewHtml;
    
    // Render ideal conditions
    const idealConditions = analyzeIdealConditions(route);
    document.getElementById('beta-conditions').innerHTML = `
        <div class="beta-condition-box">
            <div class="beta-condition-label">Best Temperature</div>
            <div class="beta-condition-value">🌡️ ${idealConditions.temperature}</div>
        </div>
        <div class="beta-condition-box">
            <div class="beta-condition-label">Best Humidity</div>
            <div class="beta-condition-value">💧 ${idealConditions.humidity}</div>
        </div>
    `;
    
    // Generate and render hold sequence
    const holdSequence = generateBetaHoldSequence(location, route);
    document.getElementById('beta-holds').innerHTML = holdSequence;
    
    // Update climb button state based on fatigue
    const climbBtn = document.getElementById('beta-climb-btn');
    const availablePumpCheck = getAvailablePump();
    const availableGripCheck = getAvailableGrip();
    if (availablePumpCheck <= 0 || availableGripCheck <= 0) {
        climbBtn.style.opacity = '0.5';
        climbBtn.style.cursor = 'not-allowed';
        climbBtn.textContent = '💤 Too Fatigued';
    } else {
        climbBtn.style.opacity = '1';
        climbBtn.style.cursor = 'pointer';
        climbBtn.textContent = '🧗 Climb This Route';
    }
    
    document.getElementById('beta-overlay').classList.add('show');
    console.log('Beta overlay should now be visible');
}

// Analyze route to determine ideal conditions
function analyzeIdealConditions(route) {
    // Routes with more crimps/technical holds benefit from dry conditions (grip)
    // Routes with longer sustained climbing benefit from cool temps (pump)
    
    // For now, simple logic:
    // Longer routes = need cool temps (less pump)
    // All routes benefit from dry (better grip)
    
    let temperature = 'Cool';
    if (route.holdCount <= 8) {
        temperature = 'Any (short route)';
    } else if (route.holdCount >= 15) {
        temperature = 'Cool (sustained)';
    }
    
    return {
        temperature: temperature,
        humidity: 'Dry (better grip)'
    };
}

// Generate the beta hold sequence display
function generateBetaHoldSequence(location, route) {
    if (!route.holds || route.holds.length === 0) {
        return '<div style="color: #738078;">Route data not available</div>';
    }

    // Get high point for this route
    const progress = gameState.routeProgress[`${location.id}-${route.id}`];
    const highPoint = (progress && progress.status !== 'completed') ? progress.highPoint : 0;

    let html = '<div style="max-height: 300px; overflow-y: auto;">';

    let currentCol = 2; // Start center

    route.holds.forEach((hold, index) => {
        const holdNum = index + 1;
        const isHighPoint = holdNum === highPoint && highPoint > 0;

        // Calculate direction from previous position
        const direction = hold.position.x - currentCol;
        let directionText = 'Center';
        let directionColor = '#bdb9ae';
        if (direction < 0) {
            directionText = `Left ${Math.abs(direction)}`;
            directionColor = '#6dbce3';
        } else if (direction > 0) {
            directionText = `Right ${direction}`;
            directionColor = '#c178de';
        }

        // Get hold type color from constants
        const holdTypeInfo = holdTypes.find(h => h.type === hold.type);
        const holdColor = holdTypeInfo ? holdTypeInfo.color : '#738078';

        // Notes
        let notes = '';
        if (isHighPoint) notes = 'HIGH POINT';
        else if (hold.isRest) notes = 'Rest';
        if (hold.matchable) notes += notes ? ', Match' : 'Match';

        html += `
            <div class="beta-hold ${hold.isRest ? 'rest-hold' : ''}"
                 style="${isHighPoint ? 'background: rgba(250, 216, 130, 0.2); border-left: 3px solid #fad882;' : ''}">
                <div class="beta-hold-num">#${holdNum}</div>
                <div class="beta-hold-direction" style="color: ${directionColor};">${directionText}</div>
                <div class="beta-hold-type" style="color: ${holdColor};">${hold.label} ${hold.angle}°</div>
                <div class="beta-hold-success" style="color: #bdb9ae;">P:${hold.pumpRating} G:${hold.gripDrain}</div>
                <div class="beta-hold-notes" style="${isHighPoint ? 'color: #fad882; font-weight: bold;' : ''}">${notes}</div>
            </div>
        `;

        currentCol = hold.position.x;
    });

    html += '</div>';
    return html;
}

// Close beta overlay
function closeBeta() {
    document.getElementById('beta-overlay').classList.remove('show');
    currentBetaLocation = null;
    currentBetaRoute = null;
}

// Start climbing from beta view
function climbFromBeta() {
    if (!currentBetaLocation || !currentBetaRoute) return;
    const availablePumpCheck = getAvailablePump();
    const availableGripCheck = getAvailableGrip();
    if (availablePumpCheck <= 0 || availableGripCheck <= 0) {
        addFeedback(`💤 You're too fatigued to climb! Return to camp to rest!`, 'penalty');
        return;
    }
    
    // Close overlays
    document.getElementById('beta-overlay').classList.remove('show');
    document.getElementById('guidebook-overlay').classList.remove('show');
    document.getElementById('camp-overlay').classList.remove('show');
    
    // Start the climb
    startClimb(currentBetaLocation, currentBetaRoute);
}


// ============ PHASE 12: Conditions System ============

// Generate conditions based on current time of day
// Called when time advances or when a new day starts
function generateConditionsForTime() {
    const timeOfDay = gameState.timeOfDay;
    
    // Temperature probabilities based on time of day
    // Morning: 70% cool, 20% mild, 10% hot
    // Noon: 10% cool, 30% mild, 60% hot
    // Evening: 50% cool, 35% mild, 15% hot
    let tempRoll = Math.random();
    let temperature;
    if (timeOfDay === 'morning') {
        if (tempRoll < 0.70) temperature = 'cool';
        else if (tempRoll < 0.90) temperature = 'mild';
        else temperature = 'hot';
    } else if (timeOfDay === 'noon') {
        if (tempRoll < 0.10) temperature = 'cool';
        else if (tempRoll < 0.40) temperature = 'mild';
        else temperature = 'hot';
    } else { // evening
        if (tempRoll < 0.50) temperature = 'cool';
        else if (tempRoll < 0.85) temperature = 'mild';
        else temperature = 'hot';
    }
    
    // Humidity probabilities based on time of day
    // Morning: 60% humid, 25% moderate, 15% dry (dew/mist)
    // Noon: 15% humid, 25% moderate, 60% dry (sun dries things out)
    // Evening: 33% humid, 34% moderate, 33% dry (even split)
    let humidRoll = Math.random();
    let humidity;
    if (timeOfDay === 'morning') {
        if (humidRoll < 0.60) humidity = 'humid';
        else if (humidRoll < 0.85) humidity = 'moderate';
        else humidity = 'dry';
    } else if (timeOfDay === 'noon') {
        if (humidRoll < 0.15) humidity = 'humid';
        else if (humidRoll < 0.40) humidity = 'moderate';
        else humidity = 'dry';
    } else { // evening
        if (humidRoll < 0.33) humidity = 'humid';
        else if (humidRoll < 0.67) humidity = 'moderate';
        else humidity = 'dry';
    }
    
    // Wind is independent of time
    const winds = ['calm', 'moderate', 'heavy'];
    const windWeights = [0.5, 0.35, 0.15]; // 50% calm, 35% moderate, 15% heavy
    let windRoll = Math.random();
    let wind;
    if (windRoll < 0.50) wind = 'calm';
    else if (windRoll < 0.85) wind = 'moderate';
    else wind = 'heavy';
    
    gameState.currentConditions = { temperature, humidity, wind };
}

// Generate conditions for morning of a new day
function generateDailyConditions() {
    generateConditionsForTime();
}

// Get conditions modifiers for climbing (weather only, time of day is just a clock)
// Temperature affects PUMP: Cool = less pump, Hot = more pump
// Humidity affects GRIP: Dry = less grip loss, Humid = more grip loss
function getConditionsModifiers() {
    const mods = {
        gripMult: 1.0,
        pumpMult: 1.0
    };
    
    const { temperature, humidity, wind } = gameState.currentConditions;
    
    // === WEATHER READING SKILL: Reduce penalties ===
    const weatherRank = getSkillRank('weatherReading');
    let penaltyReduction = weatherRank >= 3 ? 0.60 : weatherRank >= 2 ? 0.40 : weatherRank >= 1 ? 0.20 : 0;
    let weatherBonus = weatherRank >= 3 ? 0.05 : 0; // +5% bonus from each weather type at rank 3
    
    // Climbing Salve weather immunity
    if (gameState.skillState.salve && gameState.skillState.salve.weatherImmunityLeft > 0) {
        penaltyReduction = 1.0; // Full immunity
    }
    
    // Temperature affects PUMP
    if (temperature === 'cool') {
        mods.pumpMult *= 0.85; // -15% pump gain (better)
        if (weatherBonus > 0) mods.pumpMult *= (1 - weatherBonus); // Even better with Weather Reading
    } else if (temperature === 'hot') {
        let hotPenalty = 0.15;
        hotPenalty *= (1 - penaltyReduction); // Reduce penalty
        mods.pumpMult *= (1 + hotPenalty); // Apply reduced penalty
    }
    
    // Humidity affects GRIP
    if (humidity === 'dry') {
        mods.gripMult *= 0.85; // -15% grip loss (better)
        if (weatherBonus > 0) mods.gripMult *= (1 - weatherBonus);
    } else if (humidity === 'humid') {
        let humidPenalty = 0.15;
        humidPenalty *= (1 - penaltyReduction);
        mods.gripMult *= (1 + humidPenalty);
    }
    
    // Wind affects PUMP (stacks with temperature)
    if (wind === 'moderate') {
        let windPenalty = 0.05;
        windPenalty *= (1 - penaltyReduction);
        mods.pumpMult *= (1 + windPenalty);
    } else if (wind === 'heavy') {
        let windPenalty = 0.15;
        windPenalty *= (1 - penaltyReduction);
        mods.pumpMult *= (1 + windPenalty);
    } else if (wind === 'calm' && weatherBonus > 0) {
        mods.pumpMult *= (1 - weatherBonus); // Bonus from calm winds
    }
    
    return mods;
}

// Get text description of current conditions
function getConditionsDescription() {
    const { temperature, humidity, wind } = gameState.currentConditions;
    const tempText = temperature.charAt(0).toUpperCase() + temperature.slice(1);
    const humidText = humidity.charAt(0).toUpperCase() + humidity.slice(1);
    const windText = wind === 'calm' ? 'Calm' : wind === 'moderate' ? 'Moderate Wind' : 'Heavy Wind';
    
    return `${tempText}, ${humidText}, ${windText}`;
}

// Get time of day icon
function getTimeIcon() {
    switch(gameState.timeOfDay) {
        case 'morning': return '🌅';
        case 'noon': return '☀️';
        case 'evening': return '🌙';
        default: return '☀️';
    }
}

// Update sidebar conditions display
function updateSidebarConditions() {
    const timeIcon = getTimeIcon();
    const timeName = gameState.timeOfDay.charAt(0).toUpperCase() + gameState.timeOfDay.slice(1);
    
    document.getElementById('time-display').innerHTML = `
        <span class="time-icon">${timeIcon}</span>
        <span>${timeName} - Day ${gameState.day}</span>
        <span style="color: #738078; font-size: 0.85em; margin-left: 8px;">(${gameState.climbsThisPeriod}/3 climbs)</span>
    `;
    
    const { temperature, humidity, wind } = gameState.currentConditions;
    const mods = getConditionsModifiers();
    
    // Build conditions text with individual indicators
    let conditionsHtml = '';
    
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
    conditionsHtml += `<div style="color: ${tempColor};">🌡️ ${temperature.charAt(0).toUpperCase() + temperature.slice(1)}${tempEffect}</div>`;
    
    // Humidity indicator
    let humidColor = '#bdb9ae';
    let humidEffect = '';
    if (humidity === 'dry') {
        humidColor = '#a8db60';
        humidEffect = ' ↓Grip loss';
    } else if (humidity === 'humid') {
        humidColor = '#f5aaa2';
        humidEffect = ' ↑Grip loss';
    }
    conditionsHtml += `<div style="color: ${humidColor};">💧 ${humidity.charAt(0).toUpperCase() + humidity.slice(1)}${humidEffect}</div>`;
    
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
    const windText = wind === 'calm' ? 'Calm' : (wind.charAt(0).toUpperCase() + wind.slice(1) + ' Wind');
    conditionsHtml += `<div style="color: ${windColor};">💨 ${windText}${windEffect}</div>`;
    
    // Net effects
    const gripEffect = Math.round((mods.gripMult - 1) * 100);
    const pumpEffect = Math.round((mods.pumpMult - 1) * 100);
    conditionsHtml += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #738078; font-size: 0.85em;">`;
    if (gripEffect !== 0) {
        const gripColor = gripEffect > 0 ? '#f5aaa2' : '#a8db60';
        conditionsHtml += `<div style="color: ${gripColor};">Grip: ${gripEffect > 0 ? '+' : ''}${gripEffect}%</div>`;
    }
    if (pumpEffect !== 0) {
        const pumpColor = pumpEffect > 0 ? '#f5aaa2' : '#a8db60';
        conditionsHtml += `<div style="color: ${pumpColor};">Pump: ${pumpEffect > 0 ? '+' : ''}${pumpEffect}%</div>`;
    }
    if (gripEffect === 0 && pumpEffect === 0) {
        conditionsHtml += `<div style="color: #a8db60;">Perfect conditions!</div>`;
    }
    conditionsHtml += `</div>`;
    
    document.getElementById('conditions-display').innerHTML = conditionsHtml;
    
    // Update fatigue display in sidebar (energy system removed)
    const sidebarPips = document.getElementById('energy-pips');
    if (sidebarPips) {
        sidebarPips.innerHTML = ''; // Energy pips removed
    }
    const energyText = document.getElementById('energy-text');
    if (energyText) {
        energyText.textContent = ''; // Energy text removed
    }
}

// Update sidebar location modifiers display
function updateSidebarLocationModifiers() {
    const modBox = document.getElementById('sidebar-location-modifiers');
    const content = document.getElementById('sidebar-modifier-content');
    
    if (!gameState.currentLocation) {
        modBox.style.display = 'none';
        return;
    }
    
    modBox.style.display = 'block';
    const modifier = gameState.currentLocation.modifier;
    
    let html = `<div style="color: #c178de; font-weight: bold; margin-bottom: 5px;">${modifier.name}</div>`;
    html += `<div style="font-size: 0.85em; font-style: italic; color: #738078; margin-bottom: 8px;">${modifier.effect}</div>`;
    
    // Build modifier effects list
    if (modifier.pumpMult) {
        const change = ((modifier.pumpMult - 1) * 100).toFixed(0);
        const color = change > 0 ? '#f5aaa2' : '#a8db60';
        html += `<div style="color: ${color};">Pump: ${change > 0 ? '+' : ''}${change}%</div>`;
    }
    if (modifier.gripMult) {
        const change = ((modifier.gripMult - 1) * 100).toFixed(0);
        const color = change > 0 ? '#f5aaa2' : '#a8db60';
        html += `<div style="color: ${color};">Grip loss: ${change > 0 ? '+' : ''}${change}%</div>`;
    }
    if (modifier.crimpBonus) {
        html += `<div style="color: #a8db60;">Crimps: +${Math.round(modifier.crimpBonus * 100)}% success</div>`;
    }
    if (modifier.sloperBonus) {
        html += `<div style="color: #a8db60;">Slopers: +${Math.round(modifier.sloperBonus * 100)}% success</div>`;
    }
    if (modifier.allBonus) {
        html += `<div style="color: #a8db60;">All holds: +${Math.round(modifier.allBonus * 100)}% success</div>`;
    }
    if (modifier.allPenalty) {
        html += `<div style="color: #f5aaa2;">All holds: -${Math.round(modifier.allPenalty * 100)}% success</div>`;
    }
    
    content.innerHTML = html;
}

// ============ PHASE 12: Time of Day System ============

// Advance time after a climb
function advanceTime() {
    gameState.climbsThisPeriod++;
    
    if (gameState.climbsThisPeriod >= 3) {
        gameState.climbsThisPeriod = 0;
        
        if (gameState.timeOfDay === 'morning') {
            gameState.timeOfDay = 'noon';
            generateConditionsForTime(); // New conditions for noon
            addFeedback(`☀️ The sun climbs high - it's now Noon`, 'neutral');
            addFeedback(`Conditions: ${getConditionsDescription()}`, 'neutral');
        } else if (gameState.timeOfDay === 'noon') {
            gameState.timeOfDay = 'evening';
            generateConditionsForTime(); // New conditions for evening
            addFeedback(`🌙 The sun sets - it's now Evening`, 'neutral');
            addFeedback(`Conditions: ${getConditionsDescription()}`, 'neutral');
        } else if (gameState.timeOfDay === 'evening') {
            // Evening to next morning requires rest at camp
            addFeedback(`🌙 Night falls. Return to camp to rest and start a new day.`, 'neutral');
        }
        
        updateSidebarConditions();
    }
}

// ============ PHASE 12: Energy System REMOVED ============
// Energy system replaced with fatigue system
// Fatigue is added on each climb attempt and removed when resting at camp

