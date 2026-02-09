function showHoldTooltip(hold, row, col, event) {
    if (gameState.gameMode !== 'climbing') return;
    if (row !== 3 && row !== 4) return; // Only for climbable holds and current position
    
    const tooltipBox = document.getElementById('hold-tooltip-static');
    
    // Calculate move difficulty and costs
    let currentHold = null;
    for (let c = 0; c < 5; c++) {
        const checkHold = gameState.grid[gameState.currentRow][c];
        if (checkHold && checkHold.col === gameState.currentCol) {
            currentHold = checkHold;
            break;
        }
    }
    
    const moveDifficulty = calculateMoveDifficulty(
        gameState.currentRow, 
        gameState.currentCol, 
        row, 
        col, 
        currentHold
    );
    
    // Calculate base costs (with Regular movement style)
    let gripCost = hold.gripCost;
    gripCost *= (1 - gameState.power * 0.02);
    
    let basePumpCost = hold.pumpBase;
    basePumpCost *= (1 + moveDifficulty * 2);
    basePumpCost *= (1 - gameState.endurance * 0.02);
    
    // Calculate total distance for movement style modifiers
    const totalDistance = Math.sqrt(
        Math.pow(col - gameState.currentCol, 2) + 
        Math.pow(row - gameState.currentRow, 2)
    );
    
    // Calculate pump costs - same for all movement styles now
    // Movement styles only affect success chance, not pump cost
    const staticPump = Math.round(basePumpCost);
    const regularPump = Math.round(basePumpCost);
    const dynamicPump = Math.round(basePumpCost);
    
    gripCost = Math.round(gripCost);
    
    // Find best movement style based on success bonus (not pump)
    const horizontalDist = Math.abs(col - gameState.currentCol);
    let best = { style: 'Regular', cost: regularPump };
    if (horizontalDist <= 1) {
        best = { style: 'Static', cost: staticPump }; // +10% success on close
    } else if (horizontalDist >= 2) {
        best = { style: 'Dynamic', cost: dynamicPump }; // +10% success on far
    }
    
    // Determine move description
    let moveDesc = 'Easy';
    if (moveDifficulty > 0.2) moveDesc = 'Hard';
    else if (moveDifficulty > 0.1) moveDesc = 'Moderate';
    
    // Calculate actual success chance with fatigue AND movement style
    let displaySuccessChance = hold.difficulty;
    
    // Apply fatigue penalty
    if (gameState.fatiguePenalty > 0) {
        displaySuccessChance -= gameState.fatiguePenalty;
        displaySuccessChance = Math.max(0.05, displaySuccessChance);
    }
    
    // Apply movement style modifiers (same as moveToHold)
    let movementBonus = 0;
    const techniqueMultiplier = 1 + (gameState.technique * 0.1);
    const horizontalDistance = Math.abs(col - gameState.currentCol);
    
    if (gameState.movementStyle === 'static') {
        if (horizontalDistance <= 1) {
            movementBonus = 0.10 * techniqueMultiplier; // +10% on close/medium
        } else {
            movementBonus = 0; // No benefit on far
        }
    } else if (gameState.movementStyle === 'regular') {
        movementBonus = 0; // No bonus
    } else if (gameState.movementStyle === 'dynamic') {
        if (horizontalDistance >= 2) {
            movementBonus = 0.10 * techniqueMultiplier; // +10% on far
        } else {
            movementBonus = 0; // No benefit on close/medium
        }
    }
    
    displaySuccessChance += movementBonus;
    displaySuccessChance = Math.max(0.05, Math.min(0.99, displaySuccessChance));
    
    // Build fatigue warning
    let fatigueText = '';
    if (gameState.fatiguePenalty > 0) {
        const penaltyPercent = Math.round(gameState.fatiguePenalty * 100);
        fatigueText = `<div style="color: #f5aaa2; font-size: 0.75em; margin-top: 4px; padding: 4px; background: rgba(245, 170, 162, 0.1); border-radius: 4px;">
            ⚠️ Fatigued: -${penaltyPercent}% success from resting on bad holds
        </div>`;
    }
    
    // Determine success bonuses for each style
    const staticBonusPercent = Math.round((horizontalDist <= 1 ? 0.10 * techniqueMultiplier : 0) * 100);
    const dynamicBonusPercent = Math.round((horizontalDist >= 2 ? 0.10 * techniqueMultiplier : 0) * 100);
    const staticBonus = staticBonusPercent > 0 ? `+${staticBonusPercent}%` : '';
    const dynamicBonus = dynamicBonusPercent > 0 ? `+${dynamicBonusPercent}%` : '';
    
    // Build tooltip content with movement style comparison
    tooltipBox.innerHTML = `
        <div style="width: 100%; text-align: left;">
            <div style="font-size: 1em; color: #fad882; font-weight: bold; margin-bottom: 6px; text-align: center;">
                ${hold.label} (${Math.round(displaySuccessChance * 100)}% grab)
            </div>
            ${fatigueText}
            <div style="font-size: 0.85em; line-height: 1.4; margin-bottom: 6px;">
                <div style="color: #f5aaa2;">${moveDesc} move • Grip: -${gripCost} • Pump: +${regularPump}</div>
            </div>
            <div style="padding-top: 4px; border-top: 1px solid #738078; font-size: 0.8em; line-height: 1.5;">
                <div style="color: ${best.style === 'Static' ? '#a8db60' : '#bdb9ae'};">Static: ${staticBonus ? staticBonus + ' success' : 'no bonus'}</div>
                <div style="color: ${best.style === 'Regular' ? '#a8db60' : '#bdb9ae'};">Regular: no cooldown</div>
                <div style="color: ${best.style === 'Dynamic' ? '#a8db60' : '#bdb9ae'};">Dynamic: ${dynamicBonus ? dynamicBonus + ' success' : 'no bonus'}</div>
            </div>
            <div style="margin-top: 4px; font-size: 0.8em; color: #6dbce3; font-style: italic;">
                Best: ${best.style}
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
    
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Highlight row 3 (next climbable row)
            if (row === 3 && gameState.grid[row][col]) {
                cell.classList.add('next-row');
            }
            
            // Hold exists - render it first
            if (gameState.grid[row][col]) {
                const hold = gameState.grid[row][col];
                const holdEl = document.createElement('div');
                holdEl.className = `hold ${hold.type}`;
                if (hold.matchable) holdEl.classList.add('matchable');
                if (hold.isRestHold) holdEl.classList.add('rest-hold');
                
                // Check if this is the high point hold
                const routeKey = `${gameState.currentLocation.id}-${gameState.currentRoute.id}`;
                const progress = gameState.routeProgress[routeKey];
                const highPoint = progress ? progress.highPoint : 0;
                const isHighPoint = (gameState.holdsClimbed + (4 - row)) === highPoint && highPoint > 0;
                
                // Display hold label and difficulty
                const difficultyPercent = Math.round(hold.difficulty * 100);
                const restIcon = hold.isRestHold ? ' ⚓' : '';
                const highPointIcon = isHighPoint ? ' 🏔️' : '';
                holdEl.innerHTML = `
                    <span>${hold.label}${restIcon}${highPointIcon}</span>
                    <div style="font-size: 0.7em; color: #bdb9ae; margin-top: 2px;">${difficultyPercent}%</div>
                `;
                
                // Add fatigue visual indicator for row 3 (next climbable holds) if fatigued
                if (row === 3 && gameState.fatiguePenalty > 0) {
                    const fatigueOverlay = document.createElement('div');
                    fatigueOverlay.style.position = 'absolute';
                    fatigueOverlay.style.top = '0';
                    fatigueOverlay.style.left = '0';
                    fatigueOverlay.style.width = '100%';
                    fatigueOverlay.style.height = '100%';
                    fatigueOverlay.style.border = '2px solid rgba(245, 170, 162, 0.8)';
                    fatigueOverlay.style.boxShadow = '0 0 10px rgba(245, 170, 162, 0.5)';
                    fatigueOverlay.style.pointerEvents = 'none';
                    fatigueOverlay.style.borderRadius = '4px';
                    fatigueOverlay.style.zIndex = '1';
                    holdEl.appendChild(fatigueOverlay);
                }
                
                // Show hand indicator for the last hand used
                if (gameState.lastHandUsed === 'left') {
                    const leftInd = document.createElement('div');
                    leftInd.className = 'hand-indicator left';
                    leftInd.textContent = 'L';
                    holdEl.appendChild(leftInd);
                } else if (gameState.lastHandUsed === 'right') {
                    const rightInd = document.createElement('div');
                    rightInd.className = 'hand-indicator right';
                    rightInd.textContent = 'R';
                    holdEl.appendChild(rightInd);
                }
                
                cell.appendChild(holdEl);
                
                // Only make row 3 holds clickable
                if (row === 3) {
                    cell.classList.add('has-hold');
                    cell.addEventListener('click', () => moveToHold(row, col));
                    // Add hover events for static tooltip box
                    cell.addEventListener('mouseover', (e) => showHoldTooltip(hold, row, col, e));
                    cell.addEventListener('mouseout', () => hideHoldTooltip());
                } else if (row === 4) {
                    // Row 4 (current position) - not clickable but show tooltip
                    cell.addEventListener('mouseover', (e) => showHoldTooltip(hold, row, col, e));
                    cell.addEventListener('mouseout', () => hideHoldTooltip());
                    holdEl.style.opacity = '1.0'; // Full opacity for current hold
                    holdEl.style.cursor = 'help'; // Help cursor for info
                } else {
                    // Make non-clickable holds visually distinct
                    holdEl.style.opacity = '0.6';
                    holdEl.style.cursor = 'default';
                }
            }
            
            // Player position - add player emoji ON TOP of hold
            if (row === gameState.currentRow && col === gameState.currentCol) {
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
                player.style.pointerEvents = 'none'; // Allow hover through to hold
                cell.appendChild(player);
            }
            
            gridEl.appendChild(cell);
        }
    }
    
    // Add NO FALL ZONE red line visual if in no-fall zone
    if (gameState.currentRoute && gameState.currentRoute.noFallZone && 
        gameState.holdsClimbed >= gameState.currentRoute.noFallZone) {
        
        // Add red line below the grid
        const redLine = document.createElement('div');
        redLine.className = 'no-fall-zone-line';
        redLine.style.position = 'absolute';
        redLine.style.width = '100%';
        redLine.style.height = '4px';
        redLine.style.backgroundColor = '#f5aaa2';
        redLine.style.bottom = '-8px';
        redLine.style.left = '0';
        redLine.style.boxShadow = '0 0 15px rgba(245, 170, 162, 0.8)';
        redLine.style.animation = 'danger-pulse 1s infinite';
        
        gridEl.style.position = 'relative';
        gridEl.appendChild(redLine);
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

// Trigger bump animation when grab fails
function triggerBumpAnimation(targetRow, targetCol) {
    console.log('triggerBumpAnimation called', { targetRow, targetCol });
    
    // Find the player element (🧗 emoji)
    const playerElement = document.querySelector('.player');
    console.log('playerElement found:', playerElement);
    
    if (!playerElement) {
        console.error('No player element found!');
        return;
    }
    
    // Calculate direction to target
    const currentColPos = gameState.currentCol;
    const deltaCol = targetCol - currentColPos;
    
    console.log('Animation details:', { 
        currentColPos, 
        targetCol, 
        deltaCol 
    });
    
    // Convert grid position delta to pixels
    // Each cell is 80px + 8px gap = 88px
    const bumpX = deltaCol * 44; // Half the distance to make it subtle
    const bumpY = -30; // Move up slightly toward next row
    
    console.log('Bump pixels:', { bumpX, bumpY });
    
    // Set CSS variables for the animation
    playerElement.style.setProperty('--bump-x', `${bumpX}px`);
    playerElement.style.setProperty('--bump-y', `${bumpY}px`);
    
    // Add the bumping class
    playerElement.classList.add('bumping');
    console.log('Added bumping class, classList:', playerElement.classList);
    
    // Remove the class after animation completes
    setTimeout(() => {
        playerElement.classList.remove('bumping');
        console.log('Removed bumping class');
    }, 350);
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


function gainXP(amount, reason) {
    gameState.xp += amount;
    addFeedback(`+${amount} XP: ${reason}`, 'bonus');
    
    // Check for level up
    while (gameState.xp >= gameState.xpToNextLevel) {
        levelUp();
    }
    
    updateUI();
}

// Level up
function levelUp() {
    gameState.level++;
    gameState.xp -= gameState.xpToNextLevel;
    gameState.xpToNextLevel = Math.floor(gameState.xpToNextLevel * 1.5); // 1.5x scaling
    
    // Grant 3 stat points and 1 skill point per level
    gameState.unspentStatPoints += 3;
    gameState.unspentSkillPoints += 1;
    
    addFeedback(`🎉 LEVEL UP! You are now level ${gameState.level}!`, 'bonus');
    addFeedback(`+3 stat points! Total unspent: ${gameState.unspentStatPoints}`, 'bonus');
    addFeedback(`+1 skill point! Total unspent: ${gameState.unspentSkillPoints}`, 'bonus');
    addFeedback(`Next level requires ${gameState.xpToNextLevel} XP`, 'neutral');
}

// Allocate stat point
function allocateStatPoint(stat) {
    // Can only spend points at camp
    if (gameState.gameMode !== 'camp') {
        addFeedback('⛺ Return to camp to spend stat points!', 'penalty');
        return;
    }
    
    if (gameState.unspentStatPoints <= 0) {
        addFeedback('No stat points available!', 'penalty');
        return;
    }
    
    gameState[stat]++;
    gameState.unspentStatPoints--;
    
    // Update max resources based on stats
    gameState.maxPump = 100 + (gameState.endurance * 5);
    gameState.maxGrip = 100 + (gameState.power * 5);
    
    // Update cooldowns based on speed
    gameState.cooldownLength = Math.max(1, 3 - Math.floor(gameState.speed * 0.2));
    gameState.actionCooldownLength = Math.max(1, 5 - Math.floor(gameState.speed * 0.2));
    
    const statNames = {
        endurance: 'Endurance',
        power: 'Power',
        speed: 'Speed',
        technique: 'Technique'
    };
    
    addFeedback(`+1 ${statNames[stat]} (now ${gameState[stat]})`, 'bonus');
    updateUI();
    updateCampUI();
}

// Learn a skill
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
    
    // Update resources with max values
    const pumpPercent = Math.min(100, Math.max(0, (gameState.pump / gameState.maxPump) * 100));
    const gripPercent = Math.min(100, Math.max(0, (gameState.grip / gameState.maxGrip) * 100));
    
    document.getElementById('pump-value').textContent = `${Math.round(gameState.pump)}/${gameState.maxPump}`;
    document.getElementById('pump-bar').style.width = `${pumpPercent}%`;
    document.getElementById('pump-bar').textContent = `${Math.round(pumpPercent)}%`;
    
    document.getElementById('grip-value').textContent = `${Math.round(gameState.grip)}/${gameState.maxGrip}`;
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
