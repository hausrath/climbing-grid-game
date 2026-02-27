// Render the grid
function renderGrid() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';

    // Determine which holds are reachable from current position
    const playerVRow = routeRowToViewportRow(gameState.currentRow);

    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Check if this cell's hold is reachable
            const routeRow = viewportRowToRouteRow(row);
            const dy = routeRow - gameState.currentRow;
            const dx = Math.abs(col - gameState.currentCol);
            const maxReach = gameState.dynoActive ? 3 : 2;
            const isReachable = dy > 0 && dy <= maxReach && dx <= maxReach;

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

                if (hold.shakable) {
                    const icon = document.createElement('span');
                    icon.className = 'hold-icon-shakable';
                    icon.textContent = '👋';
                    holdEl.appendChild(icon);
                }
                if (hold.chalkable) {
                    const icon = document.createElement('span');
                    icon.className = 'hold-icon-chalkable';
                    icon.textContent = '💨';
                    holdEl.appendChild(icon);
                }

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
    refreshTooltip();
    updateUI();
}

// Set body weight (only one adjacent shift per move: left↔center↔right)
function setWeight(weight) {
    if (gameState.weight === weight) return;

    // Check adjacency against starting weight for this move (can only shift one step)
    const startWeight = gameState.weightAtMoveStart;
    const reachable = { left: ['left', 'center'], center: ['left', 'center', 'right'], right: ['center', 'right'] };
    if (!reachable[startWeight].includes(weight)) {
        addFeedback(`Can't reach ${weight} from ${startWeight}! Only one step per move.`, 'penalty');
        return;
    }

    gameState.weight = weight;

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
    refreshTooltip();
}

// Toggle a movement skill on/off (skills can stack)
function selectMovementStyle(style) {
    if (style === 'cross') {
        if (gameState.crossCooldown > 0) {
            addFeedback(`Cross on cooldown! ${gameState.crossCooldown} moves remaining.`, 'penalty');
            return;
        }
        gameState.crossActive = !gameState.crossActive;
        addFeedback(gameState.crossActive ? 'Cross activated (negates cross-body penalty)' : 'Cross deactivated', 'neutral');
    } else if (style === 'reach') {
        if (gameState.reachCooldown > 0) {
            addFeedback(`Reach on cooldown! ${gameState.reachCooldown} moves remaining.`, 'penalty');
            return;
        }
        gameState.reachActive = !gameState.reachActive;
        addFeedback(gameState.reachActive ? 'Reach activated (negates distance penalty)' : 'Reach deactivated', 'neutral');
    } else if (style === 'regular') {
        gameState.crossActive = false;
        gameState.reachActive = false;
        addFeedback('Skills deactivated', 'neutral');
    }
    refreshTooltip();
    updateUI();
}

// Update skill action buttons (placeholder — will be reworked in UI step)
function updateSkillActionButtons() {
    // Legacy skill buttons removed — new skill UI handled in Step 6
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

    // Update skill action buttons (Cross, Reach, Commit — shown when unlocked)
    const crossBtn = document.getElementById('cross-btn');
    const regularBtn = document.getElementById('regular-btn');
    const reachBtn = document.getElementById('reach-btn');

    const crossUnlocked = isSkillUnlocked('cross');
    const reachUnlocked = isSkillUnlocked('reach');

    // Show/hide based on unlock
    if (crossBtn) crossBtn.style.display = crossUnlocked ? 'inline-block' : 'none';
    if (reachBtn) reachBtn.style.display = reachUnlocked ? 'inline-block' : 'none';
    // Regular button shows when either Cross or Reach is unlocked (to toggle back)
    if (regularBtn) regularBtn.style.display = (crossUnlocked || reachUnlocked) ? 'inline-block' : 'none';

    // Disable on cooldown
    if (crossBtn) {
        crossBtn.disabled = gameState.crossCooldown > 0;
        crossBtn.textContent = gameState.crossCooldown > 0 ? `CROSS CD:${gameState.crossCooldown}` : 'CROSS (3)';
    }
    if (reachBtn) {
        reachBtn.disabled = gameState.reachCooldown > 0;
        reachBtn.textContent = gameState.reachCooldown > 0 ? `REACH CD:${gameState.reachCooldown}` : 'REACH (1)';
    }

    if (crossBtn) crossBtn.classList.toggle('selected', gameState.crossActive);
    if (reachBtn) reachBtn.classList.toggle('selected', gameState.reachActive);
    if (regularBtn) regularBtn.classList.toggle('selected', !gameState.crossActive && !gameState.reachActive);

    // Gate weight section behind Weight Shift skill
    const weightSection = document.getElementById('weight-section');
    if (weightSection) {
        weightSection.style.display = isSkillUnlocked('weightShift') ? 'block' : 'none';
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

    const curHold = gameState.routeGrid?.[gameState.currentRow]?.[gameState.currentCol];
    shakeBtn.disabled = gameState.shakeCooldown > 0 || !curHold?.shakable;
    chalkBtn.disabled = gameState.chalkCooldown > 0 || !curHold?.chalkable;

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

    // Update pump/grip state indicators
    const pumpLabel = PUMP_STATE_LABELS[gameState.pumpState] || 'Critical';
    const gripLabel = GRIP_STATE_LABELS[gameState.gripState] || 'Critical';
    const pumpColors = ['#a8db60', '#fad882', '#f5aaa2']; // green, yellow, red
    const gripColors = ['#a8db60', '#fad882', '#f5aaa2'];

    document.getElementById('pump-value').textContent = pumpLabel;
    document.getElementById('pump-value').style.color = pumpColors[gameState.pumpState] || '#f5aaa2';

    document.getElementById('grip-value').textContent = gripLabel;
    document.getElementById('grip-value').style.color = gripColors[gameState.gripState] || '#f5aaa2';

    // Update pump bar: starts empty, fills as pump accumulates (fall at state 3 = 100%)
    const pumpPercent = Math.min(100, (gameState.pumpState / 3) * 100);
    document.getElementById('pump-bar').style.width = `${pumpPercent}%`;
    document.getElementById('pump-bar').style.background = pumpColors[gameState.pumpState] || '#f5aaa2';
    document.getElementById('pump-bar-text').textContent = pumpLabel;

    // Update grip bar: starts full, depletes as grip is lost (3 states × 3 ticks = 9 total)
    const usedGripTicks = (gameState.gripState * 3) + gameState.gripDecayCounter;
    const gripPercent = Math.max(0, ((9 - usedGripTicks) / 9) * 100);
    document.getElementById('grip-bar').style.width = `${gripPercent}%`;
    document.getElementById('grip-bar').style.background = gripColors[gameState.gripState] || '#f5aaa2';
    document.getElementById('grip-bar-text').textContent = `${gripLabel} (${gameState.gripDecayCounter}/3)`;

    // Update Commit button (only visible if skill unlocked)
    const commitBtn = document.getElementById('commit-btn');
    if (commitBtn) {
        if (isSkillUnlocked('commit')) {
            commitBtn.style.display = 'inline-block';
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
        }
    }

    // Update Dyno button (only visible if skill unlocked)
    const dynoBtn = document.getElementById('dyno-btn');
    if (dynoBtn) {
        if (isSkillUnlocked('dyno')) {
            dynoBtn.style.display = 'inline-block';
            dynoBtn.disabled = gameState.dynoCooldown > 0 || gameState.dynoActive;

            if (gameState.dynoActive) {
                dynoBtn.textContent = 'ACTIVE!';
                dynoBtn.style.borderColor = '#a8db60';
            } else if (gameState.dynoCooldown > 0) {
                dynoBtn.textContent = `CD: ${gameState.dynoCooldown}`;
                dynoBtn.style.borderColor = '#738078';
            } else {
                dynoBtn.textContent = 'DYNO (T)';
                dynoBtn.style.borderColor = '#c178de';
            }
        } else {
            dynoBtn.style.display = 'none';
        }
    }
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
