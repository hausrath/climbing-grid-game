function showHoldTooltip(hold, row, col, event) {
    if (gameState.gameMode !== 'climbing') return;

    const tooltipBox = document.getElementById('hold-tooltip-static');

    // Convert viewport to route coords for calculation preview
    const routeRow = viewportRowToRouteRow(row);
    const dy = routeRow - gameState.currentRow;
    const dx = Math.abs(col - gameState.currentCol);
    const isExtendedMove = (dy >= 2 || dx >= 2);
    const direction = getMoveDirection(gameState.currentCol, gameState.currentRow, col, routeRow);

    const penaltyNames = ['Perfect', 'Slight', 'Moderate', 'Severe', 'FALL'];
    const penaltyColors = ['#a8db60', '#fad882', '#f5aaa2', '#f55', '#f00'];

    // Build pump breakdown for a given hand
    function buildHandBreakdown(hand) {
        const handLabel = hand === 'left' ? 'Left' : 'Right';
        const penaltyLevel = lookupPenalty(direction, hand, hold.angle, gameState.weight);

        if (penaltyLevel === 4) {
            return `<div style="color: #f00; font-weight: bold;">${handLabel}: INSTANT FALL</div>`;
        }

        const basePump = hold.pumpRating || 0;
        const handMod = getHandHoldPumpModifier(hold.type, hand, hold.angle) || 0;
        const penaltyPump = PENALTY_PUMP_MULTIPLIERS[penaltyLevel] || 0;
        let distancePump = 0;
        let staticReduction = 0;

        if (isExtendedMove) {
            distancePump = (gameState.movementStyle === 'dynamic') ? 0 : 2;
        }
        if (gameState.movementStyle === 'static' && handMod > 0) {
            staticReduction = 1;
        }

        const totalPump = Math.max(0, basePump + handMod + penaltyPump + distancePump - staticReduction);

        let details = `Base ${basePump}`;
        if (handMod > 0) details += ` <span style="color:#f5aaa2;">+${handMod} hand</span>`;
        if (penaltyPump > 0) details += ` <span style="color:${penaltyColors[penaltyLevel]};">+${penaltyPump} ${penaltyNames[penaltyLevel].toLowerCase()}</span>`;
        if (distancePump > 0) details += ` <span style="color:#f5aaa2;">+${distancePump} dist</span>`;
        if (gameState.movementStyle === 'dynamic' && isExtendedMove) details += ` <span style="color:#a8db60;">dyn</span>`;
        if (staticReduction > 0) details += ` <span style="color:#a8db60;">-${staticReduction} static</span>`;

        return `<div style="color: ${penaltyColors[penaltyLevel]};">${handLabel}: +${totalPump} pump (${details})</div>`;
    }

    // Grip breakdown
    const baseGrip = hold.gripDrain || 0;
    const weightMod = getWeightDirectionGripModifier(gameState.weight, direction, hold.angle);
    const totalGrip = baseGrip + weightMod;
    let gripDetails = `Base ${baseGrip}`;
    if (weightMod > 0) gripDetails += ` <span style="color:#f5aaa2;">+${weightMod} weight</span>`;

    const idealWeight = getIdealWeight(hold.angle);
    const restLabel = hold.isRest ? ' (REST)' : '';
    const styleLabel = gameState.movementStyle !== 'regular' ? gameState.movementStyle.toUpperCase() : '';

    // Show selected hand only, or both if none selected
    let handHtml;
    if (gameState.selectedHand) {
        handHtml = buildHandBreakdown(gameState.selectedHand);
    } else {
        handHtml = buildHandBreakdown('left') + buildHandBreakdown('right');
    }

    tooltipBox.innerHTML = `
        <div style="width: 100%; text-align: left;">
            <div style="font-size: 1em; color: ${hold.color || '#fad882'}; font-weight: bold; margin-bottom: 6px; text-align: center;">
                ${hold.label} ${hold.angle}°${restLabel}
            </div>
            <div style="padding-top: 4px; border-top: 1px solid #738078; font-size: 0.85em; line-height: 1.8;">
                <div style="color: #fad882; font-weight: bold; margin-bottom: 2px;">PUMP${styleLabel ? ' (' + styleLabel + ')' : ''}</div>
                ${handHtml}
            </div>
            <div style="padding-top: 4px; border-top: 1px solid #738078; font-size: 0.85em; line-height: 1.8; margin-top: 4px;">
                <div style="color: #6dbce3; font-weight: bold; margin-bottom: 2px;">GRIP</div>
                <div style="color: ${weightMod > 0 ? '#f5aaa2' : '#bdb9ae'};">-${totalGrip} grip (${gripDetails})</div>
            </div>
            <div style="margin-top: 4px; font-size: 0.8em; color: #bdb9ae; border-top: 1px solid #738078; padding-top: 4px;">
                Ideal Weight: ${idealWeight} | ${hold.matchable ? 'Matchable' : 'No match'}
            </div>
        </div>
    `;
}

// Hide hold information (reset to default message)
function hideHoldTooltip() {
    const tooltipBox = document.getElementById('hold-tooltip-static');
    tooltipBox.innerHTML = 'Hover over a hold to see details';
}

// Show location modifier tooltip
function showLocationTooltip(location, event) {
    if (gameState.gameMode !== 'worldmap') return;
    
    const tooltipBox = document.getElementById('hold-tooltip-static');
    const modifier = location.modifier;
    
    // Build modifier effects display
    let effectsList = '';
    if (modifier.pumpMult) {
        const change = ((modifier.pumpMult - 1) * 100).toFixed(0);
        effectsList += `<div style="margin: 4px 0;">Pump: ${change > 0 ? '+' : ''}${change}%</div>`;
    }
    if (modifier.gripMult) {
        const change = ((modifier.gripMult - 1) * 100).toFixed(0);
        effectsList += `<div style="margin: 4px 0;">Grip loss: ${change > 0 ? '+' : ''}${change}%</div>`;
    }
    if (modifier.gripCost) {
        effectsList += `<div style="margin: 4px 0;">Grip cost: +${modifier.gripCost}</div>`;
    }
    if (modifier.gripRecovery) {
        effectsList += `<div style="margin: 4px 0;">Grip recovery: +${modifier.gripRecovery}</div>`;
    }
    if (modifier.farPenalty) {
        effectsList += `<div style="margin: 4px 0;">Far moves: -${Math.round(modifier.farPenalty * 100)}% success</div>`;
    }
    if (modifier.crimpBonus) {
        effectsList += `<div style="margin: 4px 0; color: #a8db60;">Crimps: +${Math.round(modifier.crimpBonus * 100)}% success</div>`;
    }
    if (modifier.sloperBonus) {
        effectsList += `<div style="margin: 4px 0; color: #a8db60;">Slopers: +${Math.round(modifier.sloperBonus * 100)}% success</div>`;
    }
    if (modifier.pinchBonus) {
        effectsList += `<div style="margin: 4px 0; color: #a8db60;">Pinches: +${Math.round(modifier.pinchBonus * 100)}% success</div>`;
    }
    if (modifier.pocketBonus) {
        effectsList += `<div style="margin: 4px 0; color: #a8db60;">Pockets: +${Math.round(modifier.pocketBonus * 100)}% success</div>`;
    }
    if (modifier.allBonus) {
        effectsList += `<div style="margin: 4px 0; color: #a8db60;">All holds: +${Math.round(modifier.allBonus * 100)}% success</div>`;
    }
    if (modifier.allPenalty) {
        effectsList += `<div style="margin: 4px 0; color: #f5aaa2;">All holds: -${Math.round(modifier.allPenalty * 100)}% success</div>`;
    }
    
    tooltipBox.innerHTML = `
        <div style="width: 100%; text-align: left;">
            <div style="font-size: 1.1em; color: #fad882; font-weight: bold; margin-bottom: 8px; text-align: center;">
                ${location.name}
            </div>
            <div style="font-size: 0.9em; color: #bdb9ae; margin-bottom: 8px; text-align: center;">
                ${location.difficultyTier.toUpperCase()} ${location.isBoss ? '👑' : ''}
            </div>
            <div style="padding: 8px; background: rgba(115, 128, 120, 0.2); border-radius: 4px; margin-bottom: 8px;">
                <div style="font-size: 0.9em; color: #c178de; font-weight: bold; margin-bottom: 4px;">
                    ${modifier.name}
                </div>
                <div style="font-size: 0.85em; color: #bdb9ae; font-style: italic;">
                    ${modifier.effect}
                </div>
            </div>
            <div style="font-size: 0.85em; line-height: 1.4;">
                ${effectsList}
            </div>
        </div>
    `;
}

// Hide location tooltip
function hideLocationTooltip() {
    const tooltipBox = document.getElementById('hold-tooltip-static');
    tooltipBox.innerHTML = 'Hover over a location to see modifiers';
}

// Render the grid
function renderGrid() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';

    // Determine which holds are reachable from current position
    const playerVRow = routeRowToViewportRow(gameState.currentRow);

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Check if this cell's hold is reachable
            const routeRow = viewportRowToRouteRow(row);
            const dy = routeRow - gameState.currentRow;
            const dx = Math.abs(col - gameState.currentCol);
            const isReachable = dy > 0 && dy <= 2 && dx <= 2;

            if (isReachable && gameState.grid[row][col]) {
                cell.classList.add('next-row');
            }

            if (gameState.grid[row][col]) {
                const hold = gameState.grid[row][col];
                const holdEl = document.createElement('div');
                holdEl.className = 'hold semicircle';
                holdEl.style.setProperty('--hold-angle', `${hold.angle}deg`);
                holdEl.style.backgroundColor = hold.color || '#738078';

                if (hold.matchable) holdEl.classList.add('matchable');
                if (hold.isRest) holdEl.classList.add('rest-hold');

                // Hold label
                const restIcon = hold.isRest ? ' R' : '';
                holdEl.innerHTML = `
                    <span class="hold-label">${hold.label}${restIcon}</span>
                    <div class="hold-angle-indicator">${hold.angle}°</div>
                `;

                // Show hand indicator on player's current hold
                const isPlayerHold = (routeRow === gameState.currentRow && col === gameState.currentCol);
                if (isPlayerHold && gameState.lastHandUsed) {
                    const handInd = document.createElement('div');
                    handInd.className = `hand-indicator ${gameState.lastHandUsed}`;
                    handInd.textContent = gameState.lastHandUsed === 'left' ? 'L' : 'R';
                    holdEl.appendChild(handInd);
                }

                cell.appendChild(holdEl);

                // Reachable holds are clickable and show tooltips
                if (isReachable) {
                    cell.classList.add('has-hold');
                    cell.addEventListener('click', () => moveToHold(row, col));
                    cell.addEventListener('mouseover', (e) => showHoldTooltip(hold, row, col, e));
                    cell.addEventListener('mouseout', () => hideHoldTooltip());
                } else if (isPlayerHold) {
                    cell.addEventListener('mouseover', (e) => showHoldTooltip(hold, row, col, e));
                    cell.addEventListener('mouseout', () => hideHoldTooltip());
                    holdEl.style.cursor = 'help';
                } else if (routeRow < gameState.currentRow) {
                    // Below player — dim
                    holdEl.style.opacity = '0.35';
                    holdEl.style.cursor = 'default';
                } else {
                    // Above but out of reach — slightly dimmed
                    holdEl.style.opacity = '0.6';
                    holdEl.style.cursor = 'default';
                }
            }

            // Player position
            const isPlayerCell = (routeRow === gameState.currentRow && col === gameState.currentCol);
            if (isPlayerCell) {
                const player = document.createElement('div');
                player.className = 'player';
                player.textContent = '🧗';
                player.style.position = 'absolute';
                player.style.top = '0';
                player.style.left = '0';
                player.style.width = '100%';
                player.style.height = '100%';
                player.style.display = 'flex';
                player.style.alignItems = 'center';
                player.style.justifyContent = 'center';
                player.style.fontSize = '2em';
                player.style.zIndex = '10';
                player.style.pointerEvents = 'none';
                cell.appendChild(player);
            }

            gridEl.appendChild(cell);
        }
    }
}

// Select hand
function selectHand(hand) {
    // Can't select the hand that was just used (must alternate)
    if (hand === gameState.lastHandUsed) {
        addFeedback(`Can't use ${hand} hand again! Must alternate or match.`, 'penalty');
        return;
    }

    gameState.selectedHand = hand;
    addFeedback(`${hand.charAt(0).toUpperCase() + hand.slice(1)} hand selected`, 'neutral');
    updateUI();
}

// Set body weight (only one adjacent shift per move: left↔center↔right)
function setWeight(weight) {
    const current = gameState.weight;
    if (current === weight) return;

    if (gameState.weightShiftedThisMove) {
        addFeedback(`Already shifted weight this move!`, 'penalty');
        return;
    }

    const adjacent = { left: ['center'], center: ['left', 'right'], right: ['center'] };
    if (!adjacent[current].includes(weight)) {
        addFeedback(`Can't shift from ${current} to ${weight}! Move one step at a time.`, 'penalty');
        return;
    }

    gameState.weight = weight;
    gameState.weightShiftedThisMove = true;

    // Update button states
    const leftBtn = document.getElementById('weight-left-btn');
    const centerBtn = document.getElementById('weight-center-btn');
    const rightBtn = document.getElementById('weight-right-btn');

    if (leftBtn) leftBtn.classList.toggle('selected', weight === 'left');
    if (centerBtn) centerBtn.classList.toggle('selected', weight === 'center');
    if (rightBtn) rightBtn.classList.toggle('selected', weight === 'right');

    // Update indicator text
    const indicator = document.getElementById('weight-indicator');
    if (indicator) {
        indicator.textContent = `Current: ${weight.toUpperCase()}`;
    }

    addFeedback(`Weight shifted to ${weight}`, 'neutral');
}

// Select movement style
function selectMovementStyle(style) {
    // Check if style is on cooldown
    if (style === 'static' && gameState.staticCooldown > 0) {
        addFeedback(`Static on cooldown! ${gameState.staticCooldown} moves remaining.`, 'penalty');
        return;
    }
    if (style === 'dynamic' && gameState.dynamicCooldown > 0) {
        addFeedback(`Dynamic on cooldown! ${gameState.dynamicCooldown} moves remaining.`, 'penalty');
        return;
    }
    
    gameState.movementStyle = style;
    const styleNames = {
        'static': 'Static (precise, short range)',
        'regular': 'Regular (balanced)',
        'dynamic': 'Dynamic (powerful, long range)'
    };
    addFeedback(`${styleNames[style]} selected`, 'neutral');
    updateUI();
}

function updateSkillActionButtons() {
    const skillRow = document.getElementById('skill-actions-row');
    if (!skillRow) return;
    
    let anyVisible = false;
    
    // Salve button
    const salveBtn = document.getElementById('salve-btn');
    if (salveBtn) {
        const hasSkill = getSkillRank('climbingSalve') >= 1;
        const usesLeft = gameState.skillState.salve?.usesLeft || 0;
        salveBtn.style.display = hasSkill ? 'inline-block' : 'none';
        salveBtn.textContent = `🧴 SALVE (${usesLeft})`;
        salveBtn.disabled = usesLeft <= 0;
        if (hasSkill) anyVisible = true;
    }
    
    // Stimulant button
    const stimBtn = document.getElementById('stimulant-btn');
    if (stimBtn) {
        const hasSkill = getSkillRank('stimulant') >= 1;
        const usesLeft = gameState.skillState.stimulant?.usesLeft || 0;
        const active = gameState.skillState.stimulant?.active;
        stimBtn.style.display = hasSkill ? 'inline-block' : 'none';
        stimBtn.textContent = active ? `💊 ACTIVE` : `💊 STIM (${usesLeft})`;
        stimBtn.disabled = usesLeft <= 0 || active;
        if (hasSkill) anyVisible = true;
    }
    
    // Hook button
    const hookBtn = document.getElementById('hook-btn');
    if (hookBtn) {
        const hasSkill = getSkillRank('grapplingHook') >= 1;
        const usesLeft = gameState.skillState.grapplingHook?.usesLeft || 0;
        const cooldown = gameState.skillState.grapplingHook?.cooldown || 0;
        hookBtn.style.display = hasSkill ? 'inline-block' : 'none';
        hookBtn.textContent = cooldown > 0 ? `🪝 CD:${cooldown}` : `🪝 HOOK (${usesLeft})`;
        hookBtn.disabled = usesLeft <= 0 || cooldown > 0;
        if (hasSkill) anyVisible = true;
    }
    
    // Piton button
    const pitonBtn = document.getElementById('piton-btn');
    if (pitonBtn) {
        const hasSkill = getSkillRank('pitonPlacement') >= 1;
        const placementsLeft = gameState.skillState.piton?.placementsLeft || 0;
        pitonBtn.style.display = hasSkill ? 'inline-block' : 'none';
        pitonBtn.textContent = `🔩 PITON (${placementsLeft})`;
        pitonBtn.disabled = placementsLeft <= 0;
        if (hasSkill) anyVisible = true;
    }
    
    // Crash Pad button
    const padBtn = document.getElementById('crashpad-btn');
    if (padBtn) {
        const hasSkill = getSkillRank('crashPad') >= 1;
        const placementsLeft = gameState.skillState.crashPad?.placementsLeft || 0;
        padBtn.style.display = hasSkill ? 'inline-block' : 'none';
        padBtn.textContent = `🛡️ PAD (${placementsLeft})`;
        padBtn.disabled = placementsLeft <= 0;
        if (hasSkill) anyVisible = true;
    }
    
    // Wingsuit button
    const wingsuitBtn = document.getElementById('wingsuit-btn');
    if (wingsuitBtn) {
        const hasSkill = getSkillRank('wingsuit') >= 1;
        const available = gameState.skillState.wingsuit?.available;
        wingsuitBtn.style.display = hasSkill ? 'inline-block' : 'none';
        wingsuitBtn.textContent = available ? `🦅 GLIDE` : `🦅 USED`;
        wingsuitBtn.disabled = !available;
        if (hasSkill) anyVisible = true;
    }
    
    // === MAGIC SKILL BUTTONS ===
    
    // Time Dilation button
    const timeBtn = document.getElementById('timedilation-btn');
    if (timeBtn) {
        const hasSkill = getSkillRank('timeDilation') >= 1;
        const usesLeft = gameState.skillState.timeDilation?.usesLeft || 0;
        const active = gameState.skillState.timeDilation?.active;
        timeBtn.style.display = hasSkill ? 'inline-block' : 'none';
        timeBtn.textContent = active ? `⏰ ACTIVE` : `⏰ TIME (${usesLeft})`;
        timeBtn.disabled = usesLeft <= 0 || active;
        if (hasSkill) anyVisible = true;
    }
    
    // Transmute button
    const transmuteBtn = document.getElementById('transmute-btn');
    if (transmuteBtn) {
        const hasSkill = getSkillRank('transmute') >= 1;
        const usesLeft = gameState.skillState.transmute?.usesLeft || 0;
        transmuteBtn.style.display = hasSkill ? 'inline-block' : 'none';
        transmuteBtn.textContent = `🔄 SWAP (${usesLeft})`;
        transmuteBtn.disabled = usesLeft <= 0;
        if (hasSkill) anyVisible = true;
    }
    
    // Gravity Shift button
    const gravityBtn = document.getElementById('gravity-btn');
    if (gravityBtn) {
        const hasSkill = getSkillRank('gravityShift') >= 1;
        const usesLeft = gameState.skillState.gravityShift?.usesLeft || 0;
        const active = gameState.skillState.gravityShift?.active;
        gravityBtn.style.display = hasSkill ? 'inline-block' : 'none';
        gravityBtn.textContent = active ? `🌀 ACTIVE` : `🌀 GRAV (${usesLeft})`;
        gravityBtn.disabled = usesLeft <= 0 || active;
        if (hasSkill) anyVisible = true;
    }
    
    // Show/hide the skill actions row
    skillRow.style.display = anyVisible ? 'flex' : 'none';
}


// XP and leveling system removed - progression now through route completion

// Toggle help modal
function toggleHelpModal() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal.classList.contains('show')) {
        helpModal.classList.remove('show');
    } else {
        helpModal.classList.add('show');
    }
}

function updateUI() {
    // Update hand buttons
    const leftBtn = document.getElementById('left-hand-btn');
    const rightBtn = document.getElementById('right-hand-btn');
    const leftStatus = document.getElementById('left-hand-status');
    const rightStatus = document.getElementById('right-hand-status');
    
    // Disable the hand that was just used
    leftBtn.disabled = (gameState.lastHandUsed === 'left');
    rightBtn.disabled = (gameState.lastHandUsed === 'right');
    
    // Show which hand is selected
    if (gameState.selectedHand === 'left') {
        leftBtn.classList.add('selected');
        rightBtn.classList.remove('selected');
    } else if (gameState.selectedHand === 'right') {
        rightBtn.classList.add('selected');
        leftBtn.classList.remove('selected');
    } else {
        leftBtn.classList.remove('selected');
        rightBtn.classList.remove('selected');
    }
    
    // Update status indicators
    leftStatus.className = (gameState.lastHandUsed === 'left') ? 'hand-status-item in-use' : 'hand-status-item available';
    rightStatus.className = (gameState.lastHandUsed === 'right') ? 'hand-status-item in-use' : 'hand-status-item available';
    
    // Update movement style buttons
    const staticBtn = document.getElementById('static-btn');
    const regularBtn = document.getElementById('regular-btn');
    const dynamicBtn = document.getElementById('dynamic-btn');
    
    // Disable buttons on cooldown and show cooldown counter
    staticBtn.disabled = gameState.staticCooldown > 0;
    dynamicBtn.disabled = gameState.dynamicCooldown > 0;
    
    if (gameState.staticCooldown > 0) {
        staticBtn.textContent = `CD: ${gameState.staticCooldown}`;
    } else {
        staticBtn.textContent = 'SELECT (3)';
    }
    
    if (gameState.dynamicCooldown > 0) {
        dynamicBtn.textContent = `CD: ${gameState.dynamicCooldown}`;
    } else {
        dynamicBtn.textContent = 'SELECT (1)';
    }
    
    staticBtn.classList.remove('selected');
    regularBtn.classList.remove('selected');
    dynamicBtn.classList.remove('selected');
    
    if (gameState.movementStyle === 'static') {
        staticBtn.classList.add('selected');
    } else if (gameState.movementStyle === 'regular') {
        regularBtn.classList.add('selected');
    } else if (gameState.movementStyle === 'dynamic') {
        dynamicBtn.classList.add('selected');
    }
    
    // Update weight indicator
    const weightIndicator = document.getElementById('weight-indicator');
    if (weightIndicator) {
        const weightLabels = { left: '← LEFT', center: 'CENTER', right: 'RIGHT →' };
        weightIndicator.textContent = weightLabels[gameState.weight] || 'CENTER';
        weightIndicator.className = `weight-indicator weight-${gameState.weight}`;
    }

    // Update action buttons (shake and chalk)
    const shakeBtn = document.getElementById('shake-btn');
    const chalkBtn = document.getElementById('chalk-btn');
    
    shakeBtn.disabled = gameState.shakeCooldown > 0;
    chalkBtn.disabled = gameState.chalkCooldown > 0;
    
    if (gameState.shakeCooldown > 0) {
        shakeBtn.textContent = `CD: ${gameState.shakeCooldown}`;
    } else {
        shakeBtn.textContent = 'SHAKE (Q)';
    }
    
    if (gameState.chalkCooldown > 0) {
        chalkBtn.textContent = `CD: ${gameState.chalkCooldown}`;
    } else if (gameState.chalkRemaining <= 0) {
        chalkBtn.textContent = 'CHALK (0)';
        chalkBtn.style.opacity = '0.5';
    } else {
        chalkBtn.textContent = `CHALK (E) ${gameState.chalkRemaining}/${gameState.maxChalk}`;
        chalkBtn.style.opacity = '1';
    }
    
    // Update move counter with no-fall zone indicator
    const moveCountEl = document.getElementById('move-count');
    if (moveCountEl) {
        moveCountEl.textContent = gameState.holdsClimbed;
    }
    
    // Show no-fall zone warning in move counter area
    const moveCounter = document.querySelector('.move-counter');
    if (moveCounter) {
        if (gameState.currentRoute && gameState.currentRoute.noFallZone) {
            if (gameState.holdsClimbed >= gameState.currentRoute.noFallZone) {
                moveCounter.style.borderColor = '#f5aaa2';
                moveCounter.style.boxShadow = '0 0 15px rgba(245, 170, 162, 0.5)';
            } else {
                // Show countdown to no-fall zone
                const holdsUntilDanger = gameState.currentRoute.noFallZone - gameState.holdsClimbed;
                if (holdsUntilDanger <= 3) {
                    moveCounter.style.borderColor = '#fad882';
                } else {
                    moveCounter.style.borderColor = '#738078';
                    moveCounter.style.boxShadow = 'none';
                }
            }
        } else {
            moveCounter.style.borderColor = '#738078';
            moveCounter.style.boxShadow = 'none';
        }
    }
    
    // Update level and XP display
    document.getElementById('level-display').textContent = gameState.level;
    document.getElementById('xp-display').textContent = gameState.xp;
    document.getElementById('xp-needed-display').textContent = gameState.xpToNextLevel;
    const xpPercent = (gameState.xp / gameState.xpToNextLevel) * 100;
    document.getElementById('xp-bar').style.width = `${xpPercent}%`;
    
    // Update stat display
    document.getElementById('unspent-points-display').textContent = `(${gameState.unspentStatPoints} pts)`;
    document.getElementById('endurance-display').textContent = gameState.endurance;
    document.getElementById('power-display').textContent = gameState.power;
    document.getElementById('speed-display').textContent = gameState.speed;
    document.getElementById('technique-display').textContent = gameState.technique;
    
    // Update resources with fatigue system
    const availablePump = getAvailablePump();
    const availableGrip = getAvailableGrip();

    const pumpPercent = availablePump > 0 ? Math.min(100, Math.max(0, (gameState.pump / availablePump) * 100)) : 0;
    const gripPercent = availableGrip > 0 ? Math.min(100, Math.max(0, (gameState.grip / availableGrip) * 100)) : 100;

    // Show available vs max (including fatigue)
    const pumpText = gameState.pumpFatigue > 0
        ? `${Math.round(gameState.pump)}/${availablePump} (${gameState.maxPump} max)`
        : `${Math.round(gameState.pump)}/${gameState.maxPump}`;
    const gripText = gameState.gripFatigue > 0
        ? `${Math.round(gameState.grip)}/${availableGrip} (${gameState.maxGrip} max)`
        : `${Math.round(gameState.grip)}/${gameState.maxGrip}`;

    document.getElementById('pump-value').textContent = pumpText;
    document.getElementById('pump-bar').style.width = `${pumpPercent}%`;
    document.getElementById('pump-bar').textContent = `${Math.round(pumpPercent)}%`;

    document.getElementById('grip-value').textContent = gripText;
    document.getElementById('grip-bar').style.width = `${gripPercent}%`;
    document.getElementById('grip-bar').textContent = `${Math.round(gripPercent)}%`;
    
    // Update combo indicator
    const comboIndicator = document.getElementById('combo-indicator');
    const comboText = document.getElementById('combo-text');
    
    if (gameState.flowStateActive) {
        comboIndicator.style.display = 'block';
        comboIndicator.style.borderColor = '#a8db60';
        comboIndicator.style.background = 'rgba(168, 219, 96, 0.2)';
        comboText.style.color = '#a8db60';
        comboText.textContent = '🌊 FLOW STATE ACTIVE!';
    } else if (gameState.comboCount > 0) {
        comboIndicator.style.display = 'block';
        comboIndicator.style.borderColor = '#6dbce3';
        comboIndicator.style.background = 'rgba(109, 188, 227, 0.1)';
        comboText.style.color = '#6dbce3';
        comboText.textContent = `COMBO: ${gameState.comboCount}/3`;
    } else {
        comboIndicator.style.display = 'none';
    }
    
    // Update skill points display
    document.getElementById('unspent-skill-points-display').textContent = `(${gameState.unspentSkillPoints} pts)`;
    
    // Update Commit button
    const commitBtn = document.getElementById('commit-btn');
    const commitLearnBtn = document.getElementById('commit-learn-btn');
    
    // Show/hide learn button based on whether skill is learned
    if (gameState.skills.commit) {
        commitBtn.style.display = 'inline-block';
        commitLearnBtn.style.display = 'none';
        
        // Update Commit button state
        commitBtn.disabled = gameState.commitCooldown > 0 || gameState.commitActive;
        
        if (gameState.commitActive) {
            commitBtn.textContent = 'ACTIVE!';
            commitBtn.style.borderColor = '#a8db60';
        } else if (gameState.commitCooldown > 0) {
            commitBtn.textContent = `CD: ${gameState.commitCooldown}`;
            commitBtn.style.borderColor = '#738078';
        } else {
            commitBtn.textContent = 'COMMIT (R)';
            commitBtn.style.borderColor = '#f5aaa2';
        }
    } else {
        commitBtn.style.display = 'none';
        commitLearnBtn.style.display = 'inline-block';
        commitLearnBtn.disabled = gameState.unspentSkillPoints <= 0;
    }
    
    // Update utility skill action buttons
    updateSkillActionButtons();
}

// Add feedback
function addFeedback(text, type) {
    const feedback = document.getElementById('feedback');
    const message = document.createElement('div');
    message.className = `feedback-message ${type}`;
    message.textContent = text;
    feedback.appendChild(message);
    feedback.scrollTop = feedback.scrollHeight;
    
    while (feedback.children.length > 15) {
        feedback.removeChild(feedback.firstChild);
    }
}
