// Track hovered hold for live tooltip refresh
let hoveredHold = null;
let hoveredRow = null;
let hoveredCol = null;

function showHoldTooltip(hold, row, col, event) {
    if (gameState.gameMode !== 'climbing') return;

    // Store for live refresh
    hoveredHold = hold;
    hoveredRow = row;
    hoveredCol = col;

    refreshTooltip();
}

// Refresh tooltip with current game state (called on hover and on hand/weight/style change)
function refreshTooltip() {
    if (!hoveredHold) return;
    const hold = hoveredHold;
    const row = hoveredRow;
    const col = hoveredCol;

    const tooltipBox = document.getElementById('hold-tooltip-static');

    const routeRow = viewportRowToRouteRow(row);
    const dy = routeRow - gameState.currentRow;
    const dx = Math.abs(col - gameState.currentCol);
    const isExtendedMove = (dy >= 2 || dx >= 2);
    const direction = getMoveDirection(gameState.currentCol, gameState.currentRow, col, routeRow);

    const penaltyColors = ['#a8db60', '#fad882', '#f5aaa2', '#f55', '#f00'];
    const idealWeight = getIdealWeight(hold.angle);
    const restLabel = hold.isRest ? ' (REST)' : '';
    const styleLabel = gameState.movementStyle !== 'regular' ? gameState.movementStyle.toUpperCase() : '';

    // Build effective penalty breakdown for a given hand
    function buildHandBreakdown(hand) {
        const handLabel = hand === 'left' ? 'Left' : 'Right';
        const basePenalty = lookupPenalty(direction, hand, hold.angle, gameState.weight);

        if (basePenalty === 4) {
            return `<div style="color: #f00; font-weight: bold;">${handLabel}: INSTANT FALL</div>`;
        }

        let effective = basePenalty;
        let bumps = [];

        const handMod = getHandHoldPumpModifier(hold.type, hand, hold.angle) || 0;
        if (handMod > 0) { effective += 1; bumps.push('gaston'); }

        const isCross = isCrossMove(hand, direction);
        if (isCross) {
            if (gameState.movementStyle === 'cross') {
                effective = Math.max(0, effective - 1);
                bumps.push('<span style="color:#a8db60">cross</span>');
            } else {
                bumps.push('cross-body');
            }
        }

        if (isExtendedMove) {
            if (gameState.movementStyle === 'reach') {
                bumps.push('<span style="color:#a8db60">reach</span>');
            } else {
                effective += 1; bumps.push('distance');
            }
        }

        // Cross skill can also reduce gaston if not used for cross-body
        if (!isCross && gameState.movementStyle === 'cross' && handMod > 0) {
            effective = Math.max(0, effective - 1);
            bumps.push('<span style="color:#a8db60">cross</span>');
        }

        if (gameState.commitActive && effective > 0) {
            effective = Math.max(0, effective - 1);
            bumps.push('<span style="color:#a8db60">commit</span>');
        }

        effective = Math.min(effective, 4);

        // Map to state change
        let stateChange;
        let resultColor;
        if (effective >= 3) {
            stateChange = 'FALL';
            resultColor = '#f00';
        } else if (effective === 2) {
            stateChange = '+2 states';
            resultColor = '#f5aaa2';
        } else if (effective === 1) {
            stateChange = '+1 state';
            resultColor = '#fad882';
        } else {
            stateChange = 'clean';
            resultColor = '#a8db60';
        }

        const levelName = PENALTY_LEVEL_NAMES[effective] || 'None';
        const bumpStr = bumps.length > 0 ? ` (${bumps.join(' ')})` : '';
        return `<div style="color: ${resultColor};">${handLabel}: ${levelName} → ${stateChange}${bumpStr}</div>`;
    }

    // Build pump section
    let pumpHtml = '';
    if (gameState.selectedHand) {
        pumpHtml = buildHandBreakdown(gameState.selectedHand);
    } else {
        pumpHtml = buildHandBreakdown('left') + buildHandBreakdown('right');
    }

    // Grip section (time-based decay)
    const movesUntilDecay = 3 - gameState.gripDecayCounter;
    const gripLabel = GRIP_STATE_LABELS[gameState.gripState] || 'Critical';
    const gripColor = ['#a8db60', '#fad882', '#f5aaa2'][gameState.gripState] || '#f5aaa2';

    tooltipBox.innerHTML = `
        <div style="width: 100%; text-align: left;">
            <div style="font-size: 1em; color: ${hold.color || '#fad882'}; font-weight: bold; margin-bottom: 6px; text-align: center;">
                ${hold.label} ${hold.angle}°${restLabel}
            </div>
            <div style="padding-top: 4px; border-top: 1px solid #738078; font-size: 0.85em; line-height: 1.8;">
                <div style="color: #fad882; font-weight: bold; margin-bottom: 2px;">PUMP${styleLabel ? ' (' + styleLabel + ')' : ''}</div>
                ${pumpHtml}
            </div>
            <div style="padding-top: 4px; border-top: 1px solid #738078; font-size: 0.85em; line-height: 1.8; margin-top: 4px;">
                <div style="color: #6dbce3; font-weight: bold; margin-bottom: 2px;">GRIP</div>
                <div style="color: ${gripColor};">State: ${gripLabel} | Decay in ${movesUntilDecay} move${movesUntilDecay !== 1 ? 's' : ''}</div>
                <div style="color: #bdb9ae; font-size: 0.9em;">Chalk: ${gameState.chalkRemaining}/${gameState.maxChalk} uses</div>
            </div>
            <div style="margin-top: 4px; font-size: 0.8em; color: #bdb9ae; border-top: 1px solid #738078; padding-top: 4px;">
                Ideal Weight: ${idealWeight} | ${hold.matchable ? 'Matchable' : 'No match'}
            </div>
        </div>
    `;
}

// Hide hold information (reset to default message)
function hideHoldTooltip() {
    hoveredHold = null;
    hoveredRow = null;
    hoveredCol = null;
    const tooltipBox = document.getElementById('hold-tooltip-static');
    tooltipBox.innerHTML = 'Hover over hold<br>to see details';
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
    tooltipBox.innerHTML = 'Hover over location<br>to see modifiers';
}
