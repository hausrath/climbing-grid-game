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

    const penaltyNames = ['Perfect', 'Slight', 'Moderate', 'Severe', 'FALL'];
    const penaltyColors = ['#a8db60', '#fad882', '#f5aaa2', '#f55', '#f00'];

    const fatigueMultiplier = 1 + (gameState.holdsClimbed * 0.05);
    const fatiguePercent = Math.round((fatigueMultiplier - 1) * 100);

    // Build pump breakdown for a given hand (base hold cost disabled)
    function buildHandBreakdown(hand) {
        const handLabel = hand === 'left' ? 'Left' : 'Right';
        const penaltyLevel = lookupPenalty(direction, hand, hold.angle, gameState.weight);

        if (penaltyLevel === 4) {
            return { pumpHtml: `<div style="color: #f00; font-weight: bold;">${handLabel}: INSTANT FALL</div>`, penaltyGrip: 0, penaltyLevel };
        }

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

        const rawPump = Math.max(0, handMod + penaltyPump + distancePump - staticReduction);
        const totalPump = gameState.holdsClimbed > 0 ? Math.round(rawPump * fatigueMultiplier) : rawPump;

        // Build details showing only active modifiers
        let parts = [];
        if (handMod > 0) parts.push(`<span style="color:#f5aaa2;">+${handMod} hand</span>`);
        if (penaltyPump > 0) parts.push(`<span style="color:${penaltyColors[penaltyLevel]};">+${penaltyPump} ${penaltyNames[penaltyLevel].toLowerCase()}</span>`);
        if (distancePump > 0) parts.push(`<span style="color:#f5aaa2;">+${distancePump} dist</span>`);
        if (gameState.movementStyle === 'dynamic' && isExtendedMove) parts.push(`<span style="color:#a8db60;">dyn</span>`);
        if (staticReduction > 0) parts.push(`<span style="color:#a8db60;">-${staticReduction} static</span>`);
        const details = parts.length > 0 ? ` (${parts.join(' ')})` : '';

        const pumpHtml = `<div style="color: ${penaltyColors[penaltyLevel]};">${handLabel}: +${totalPump} pump${details}</div>`;
        const penaltyGrip = PENALTY_GRIP_MULTIPLIERS[penaltyLevel] || 0;
        return { pumpHtml, penaltyGrip, penaltyLevel };
    }

    // Grip breakdown (base hold cost disabled)
    const weightMod = getWeightDirectionGripModifier(gameState.weight, direction, hold.angle);
    const idealWeight = getIdealWeight(hold.angle);
    const restLabel = hold.isRest ? ' (REST)' : '';
    const styleLabel = gameState.movementStyle !== 'regular' ? gameState.movementStyle.toUpperCase() : '';

    let pumpHtml = '';
    let gripPenaltyGrip = 0;
    let gripPenaltyLabel = '';

    if (gameState.selectedHand) {
        const result = buildHandBreakdown(gameState.selectedHand);
        pumpHtml = result.pumpHtml;
        gripPenaltyGrip = result.penaltyGrip || 0;
        if (gripPenaltyGrip > 0) gripPenaltyLabel = penaltyNames[result.penaltyLevel].toLowerCase();
    } else {
        const resultL = buildHandBreakdown('left');
        const resultR = buildHandBreakdown('right');
        pumpHtml = resultL.pumpHtml + resultR.pumpHtml;
        gripPenaltyGrip = Math.max(resultL.penaltyGrip || 0, resultR.penaltyGrip || 0);
        if (gripPenaltyGrip > 0) gripPenaltyLabel = 'penalty';
    }

    const rawGrip = weightMod + gripPenaltyGrip;
    const totalGrip = gameState.holdsClimbed > 0 ? Math.round(rawGrip * fatigueMultiplier) : rawGrip;

    let gripParts = [];
    if (weightMod > 0) gripParts.push(`<span style="color:#f5aaa2;">+${weightMod} weight</span>`);
    if (gripPenaltyGrip > 0) gripParts.push(`<span style="color:#f5aaa2;">+${gripPenaltyGrip} ${gripPenaltyLabel}</span>`);
    const gripDetails = gripParts.length > 0 ? ` (${gripParts.join(' ')})` : '';
    const hasGripPenalty = weightMod > 0 || gripPenaltyGrip > 0;

    const fatigueHtml = fatiguePercent > 0 ? `<div style="font-size: 0.8em; color: #f5aaa2; margin-top: 2px;">Fatigue: +${fatiguePercent}% all costs</div>` : '';

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
                <div style="color: ${hasGripPenalty ? '#f5aaa2' : '#bdb9ae'};">-${totalGrip} grip${gripDetails}</div>
            </div>
            ${fatigueHtml}
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
