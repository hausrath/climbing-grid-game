// ============ ROUTE EDITOR: SIMULATOR ENGINE ============

let simState = null;
let simMode = 'auto'; // 'auto' or 'manual'
let simControls = { hand: null, weight: null, useCross: false, useReach: false, useCommit: false };

// ---- State Creation ----
function createSimState() {
    const sorted = getSortedHolds();
    return {
        currentRow: 0,
        currentCol: editorState.startCol,
        pumpState: 0,
        gripState: 0,
        gripDecayCounter: 0,
        weight: 'center',
        lastHandUsed: null,
        consecutiveCrosses: 0,
        shakeCooldown: 0,
        chalkCooldown: 0,
        crossCooldown: 0,
        reachCooldown: 0,
        commitCooldown: 0,
        commitActive: false,
        chalkRemaining: 5,
        maxChalk: 5,
        holdsClimbed: 0,
        shakesUsed: 0,
        chalksUsed: 0,
        moveHistory: [],
        skillState: { justChalked: false, justShook: false },
        cooldownLength: 3,
        actionCooldownLength: 5,
        fell: false,
        completed: false,
        visitedHolds: new Array(sorted.length).fill(false)
    };
}

function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
}

function pushHistory() {
    const snapshot = cloneState(simState);
    snapshot.moveHistory = [];
    simState.moveHistory.push(snapshot);
}

// ---- Core Simulation ----
function simulateMove(state, hold, hand, weight, options) {
    const opts = options || {};
    const useCross = opts.useCross || false;
    const useReach = opts.useReach || false;
    const useCommit = opts.useCommit || false;
    const skills = editorState.unlockedSkills;

    const result = {
        success: true, direction: '', basePenalty: 0,
        modifiers: [], effectivePenalty: 0, pumpChange: 0,
        newPumpState: state.pumpState, newGripState: state.gripState,
        gripAdvanced: false, gripDecayBlocked: false,
        fell: false, fallReason: null, feedback: [],
        crossUsed: false, reachUsed: false, commitUsed: false
    };

    // Direction
    result.direction = getMoveDirection(state.currentCol, state.currentRow, hold.position.x, hold.position.y);
    const crossMove = isCrossMove(hand, result.direction);

    // Distance
    const dy = hold.position.y - state.currentRow;
    const dx = Math.abs(hold.position.x - state.currentCol);
    const isExtendedMove = (dy >= 2 || dx >= 2);

    // Validation
    if (dy <= 0) {
        result.success = false; result.fell = true;
        result.fallReason = 'Can only climb upward';
        return result;
    }
    if (dy > 2 || dx > 2) {
        result.success = false; result.fell = true;
        result.fallReason = 'Too far to reach';
        return result;
    }

    // Base penalty
    result.basePenalty = lookupPenalty(result.direction, hand, hold.angle, weight);

    if (result.basePenalty === 4) {
        result.success = false; result.fell = true;
        result.fallReason = 'Impossible position (base penalty 4)';
        result.effectivePenalty = 4;
        return result;
    }

    // Calculate effective penalty
    let effectiveLevel = result.basePenalty;
    let levelBumps = [];

    // Extended moves require Reach skill — no skill = instant fall
    if (isExtendedMove) {
        if (useReach && skills.includes('reach') && state.reachCooldown <= 0) {
            result.reachUsed = true;
            result.feedback.push({ text: 'Reach: distance penalty negated', type: 'bonus' });
        } else {
            result.success = false; result.fell = true;
            result.fallReason = 'Extended move without Reach skill';
            return result;
        }
    }

    // Cross-body moves require Cross skill — no skill = instant fall
    if (crossMove) {
        if (useCross && skills.includes('cross') && state.crossCooldown <= 0) {
            result.crossUsed = true;
            effectiveLevel = Math.max(0, effectiveLevel - 1);
            result.feedback.push({ text: 'Cross: cross-body penalty reduced', type: 'bonus' });
        } else {
            result.success = false; result.fell = true;
            result.fallReason = 'Cross-body move without Cross skill';
            return result;
        }
    }

    // Commit
    if (useCommit && skills.includes('commit') && state.commitCooldown <= 0 && effectiveLevel > 0) {
        effectiveLevel = Math.max(0, effectiveLevel - 1);
        result.commitUsed = true;
        result.feedback.push({ text: 'Commit: penalty reduced', type: 'bonus' });
    }

    effectiveLevel = Math.min(effectiveLevel, 4);
    result.effectivePenalty = effectiveLevel;
    result.modifiers = levelBumps;

    // Map to pump change
    if (effectiveLevel >= 3) {
        result.success = false; result.fell = true;
        result.fallReason = `Severe penalty (effective ${effectiveLevel})`;
        return result;
    } else if (effectiveLevel === 2) {
        result.pumpChange = 2;
    } else if (effectiveLevel === 1) {
        result.pumpChange = 1;
    }

    // Deadpoint after shake
    if (skills.includes('deadpoint') && state.skillState.justShook && result.pumpChange > 0) {
        result.feedback.push({ text: 'Deadpoint: pump penalty negated after shake', type: 'bonus' });
        result.pumpChange = 0;
    }

    result.newPumpState = state.pumpState + result.pumpChange;

    // Grip decay
    let gripDecayBlocked = false;
    if (skills.includes('deadpoint') && state.skillState.justChalked) {
        gripDecayBlocked = true;
        result.gripDecayBlocked = true;
        result.feedback.push({ text: 'Deadpoint: grip decay blocked after chalk', type: 'bonus' });
    }

    let newGripDecayCounter = state.gripDecayCounter;
    let newGripState = state.gripState;
    if (!gripDecayBlocked) {
        const gripCost = HOLD_GRIP_COST[hold.type] || 1;
        newGripDecayCounter += gripCost;
        while (newGripDecayCounter >= 3) {
            newGripDecayCounter -= 3;
            newGripState++;
            result.gripAdvanced = true;
        }
    }
    result.newGripState = newGripState;

    // Check post-move falls
    if (result.newPumpState >= 3) {
        result.success = false; result.fell = true;
        result.fallReason = 'Pump maxed out';
    }
    if (result.newGripState >= 3) {
        result.success = false; result.fell = true;
        result.fallReason = 'Grip depleted';
    }

    // Build summary feedback
    if (result.pumpChange > 0) {
        const bumpStr = levelBumps.length > 0 ? ` (${levelBumps.join(', ')})` : '';
        result.feedback.push({ text: `${PENALTY_LEVEL_NAMES[effectiveLevel]}${bumpStr}: pump +${result.pumpChange}`, type: result.pumpChange >= 2 ? 'penalty' : 'neutral' });
    } else if (effectiveLevel === 0) {
        result.feedback.push({ text: 'Clean move!', type: 'bonus' });
    }

    // Store computed values for state application
    result._newGripDecayCounter = newGripDecayCounter;
    result._crossMove = crossMove;

    return result;
}

function applyMoveResult(state, hold, hand, result, weight) {
    // Apply pump/grip
    state.pumpState = result.newPumpState;
    state.gripState = result.newGripState;
    state.gripDecayCounter = result._newGripDecayCounter;
    if (weight) state.weight = weight;

    // Decrement cooldowns
    if (state.crossCooldown > 0) state.crossCooldown--;
    if (state.reachCooldown > 0) state.reachCooldown--;
    if (state.shakeCooldown > 0) state.shakeCooldown--;
    if (state.chalkCooldown > 0) state.chalkCooldown--;
    if (state.commitCooldown > 0) state.commitCooldown--;

    // Set new cooldowns
    if (result.commitUsed) {
        state.commitCooldown = 10;
    }
    if (result.crossUsed) {
        state.crossCooldown = state.cooldownLength;
    }
    if (result.reachUsed) {
        state.reachCooldown = state.cooldownLength;
    }

    // Update tracking
    if (result._crossMove) {
        state.consecutiveCrosses++;
    } else {
        state.consecutiveCrosses = 0;
    }

    state.currentHand = hand;
    state.lastHandUsed = hand;
    state.currentRow = hold.position.y;
    state.currentCol = hold.position.x;
    state.holdsClimbed++;

    // Match check (requires different hand than last used)
    const skills = editorState.unlockedSkills;
    if (hold.matchable && skills.includes('match') && state.lastHandUsed !== null && state.lastHandUsed !== hand) {
        state.lastHandUsed = null;
        state.consecutiveCrosses = 0;
    }

    // Clear deadpoint flags
    state.skillState.justChalked = false;
    state.skillState.justShook = false;

    if (result.fell) state.fell = true;

    // Check completion: reached the highest hold position
    const sorted = getSortedHolds();
    const maxY = sorted.length > 0 ? Math.max(...sorted.map(h => h.position.y)) : 0;
    if (state.currentRow >= maxY) {
        state.completed = true;
    }
}

// ---- Recovery Actions ----
function simulateShakeAction(state) {
    if (state.shakeCooldown > 0) return { success: false, reason: `Shake on cooldown (${state.shakeCooldown})` };
    if (state.pumpState <= 0) return { success: false, reason: 'Already fresh' };

    const oldPump = state.pumpState;
    state.pumpState = Math.max(0, state.pumpState - 1);
    state.shakesUsed++;
    state.shakeCooldown = state.actionCooldownLength;

    if (editorState.unlockedSkills.includes('deadpoint')) {
        state.skillState.justShook = true;
    }

    // Recovery counts as a turn for skill cooldowns
    if (state.crossCooldown > 0) state.crossCooldown--;
    if (state.reachCooldown > 0) state.reachCooldown--;
    if (state.commitCooldown > 0) state.commitCooldown--;

    return { success: true, text: `Shake: ${PUMP_STATE_LABELS[oldPump]} -> ${PUMP_STATE_LABELS[state.pumpState]}` };
}

function simulateChalkAction(state) {
    if (state.chalkRemaining <= 0) return { success: false, reason: 'Out of chalk' };
    if (state.chalkCooldown > 0) return { success: false, reason: `Chalk on cooldown (${state.chalkCooldown})` };

    const oldGrip = GRIP_STATE_LABELS[state.gripState] || 'Critical';
    state.gripState = 0;
    state.gripDecayCounter = 0;
    state.chalkRemaining--;
    state.chalksUsed++;
    state.chalkCooldown = 1;

    if (editorState.unlockedSkills.includes('deadpoint')) {
        state.skillState.justChalked = true;
    }

    if (state.crossCooldown > 0) state.crossCooldown--;
    if (state.reachCooldown > 0) state.reachCooldown--;
    if (state.commitCooldown > 0) state.commitCooldown--;

    return { success: true, text: `Chalk: ${oldGrip} -> Chalked (${state.chalkRemaining}/${state.maxChalk} left)` };
}

// ---- Auto Mode: Find Optimal Move ----
function findOptimalChoice(state, hold) {
    const skills = editorState.unlockedSkills;
    let bestHand = 'left', bestWeight = getIdealWeight(hold.angle);
    let bestPenalty = 999;
    let bestOpts = {};

    const weights = skills.includes('weightshift') ? ['left', 'center', 'right'] : [getIdealWeight(hold.angle)];

    for (const hand of ['left', 'right']) {
        // Enforce hand alternation
        if (state.lastHandUsed !== null && hand === state.lastHandUsed) continue;

        for (const wt of weights) {
            // Try combinations of skill activations
            const crossOptions = (skills.includes('cross') && state.crossCooldown <= 0) ? [false, true] : [false];
            const reachOptions = (skills.includes('reach') && state.reachCooldown <= 0) ? [false, true] : [false];
            const commitOptions = (skills.includes('commit') && state.commitCooldown <= 0) ? [false, true] : [false];

            for (const uc of crossOptions) {
                for (const ur of reachOptions) {
                    for (const ucm of commitOptions) {
                        const res = simulateMove(state, hold, hand, wt, { useCross: uc, useReach: ur, useCommit: ucm });
                        const penalty = res.fell ? 100 : res.effectivePenalty;
                        if (penalty < bestPenalty) {
                            bestPenalty = penalty;
                            bestHand = hand;
                            bestWeight = wt;
                            bestOpts = { useCross: uc, useReach: ur, useCommit: ucm };
                        }
                    }
                }
            }
        }
    }

    return { hand: bestHand, weight: bestWeight, options: bestOpts, penalty: bestPenalty };
}

// ---- UI Integration ----
function simReset() {
    simState = createSimState();
    simControls = { hand: null, weight: null, useCross: false, useReach: false, useCommit: false };
    document.getElementById('move-log').innerHTML = '';
    updateSimUI();
    renderGrid();
}

function setSimMode(mode) {
    simMode = mode;
    document.getElementById('mode-auto').classList.toggle('active', mode === 'auto');
    document.getElementById('mode-manual').classList.toggle('active', mode === 'manual');
    updateSimUI();
}

function setSimControl(group, value) {
    if (group === 'hand') simControls.hand = value;
    if (group === 'weight') simControls.weight = value;

    document.querySelectorAll(`.radio-btn[data-group="${group}"]`).forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === value);
    });
}

// Find all reachable unvisited holds from current sim state
function getReachableHolds(state) {
    const sorted = getSortedHolds();
    const reachable = [];
    for (let i = 0; i < sorted.length; i++) {
        if (state.visitedHolds && state.visitedHolds[i]) continue;
        const hold = sorted[i];
        const dy = hold.position.y - state.currentRow;
        const dx = Math.abs(hold.position.x - state.currentCol);
        if (dy > 0 && dy <= 2 && dx <= 2) {
            reachable.push({ index: i, hold });
        }
    }
    return reachable;
}

function simExecuteMove() {
    if (!simState || simState.fell || simState.completed) return;

    // Find reachable unvisited holds
    const reachable = getReachableHolds(simState);
    if (reachable.length === 0) {
        addMoveLog('No reachable holds!', 'penalty');
        return;
    }

    let hold, holdIdx, hand, weight, options;

    if (simMode === 'auto') {
        // Evaluate all reachable holds and pick the best one
        let bestPenalty = 999;
        let bestChoice = null;
        for (const r of reachable) {
            const opt = findOptimalChoice(simState, r.hold);
            if (opt.penalty < bestPenalty) {
                bestPenalty = opt.penalty;
                bestChoice = { holdIdx: r.index, hold: r.hold, ...opt };
            }
        }
        hold = bestChoice.hold;
        holdIdx = bestChoice.holdIdx;
        hand = bestChoice.hand;
        weight = bestChoice.weight;
        options = bestChoice.options;
    } else {
        // Manual mode: pick the lowest-y reachable hold (closest above)
        hold = reachable[0].hold;
        holdIdx = reachable[0].index;
        hand = simControls.hand;
        weight = simControls.weight || getIdealWeight(hold.angle);
        options = {
            useCross: simControls.useCross,
            useReach: simControls.useReach,
            useCommit: simControls.useCommit
        };
    }

    if (!hand) {
        addMoveLog('Select a hand first!', 'penalty');
        return;
    }

    pushHistory();

    // Set weight before move
    simState.weight = weight;

    const result = simulateMove(simState, hold, hand, weight, options);
    applyMoveResult(simState, hold, hand, result, weight);

    // Mark hold as visited
    if (simState.visitedHolds) {
        simState.visitedHolds[holdIdx] = true;
    }

    // Log the move
    const holdNum = simState.holdsClimbed;
    const dirLabel = result.direction.replace('up-', 'U').replace('up', 'U');
    const handLabel = hand === 'left' ? 'L' : 'R';
    const htInfo = holdTypes.find(h => h.type === hold.type);

    let logText = `#${holdNum} ${htInfo?.label || hold.type} ${hold.angle}° | ${handLabel} ${dirLabel} | base:${result.basePenalty} eff:${result.effectivePenalty}`;
    if (result.modifiers.length > 0) logText += ` [${result.modifiers.join(',')}]`;

    let logType = 'neutral';
    if (result.fell) logType = 'fell';
    else if (result.effectivePenalty === 0) logType = 'bonus';
    else if (result.effectivePenalty >= 2) logType = 'penalty';

    addMoveLog(logText, logType);
    result.feedback.forEach(f => addMoveLog('  ' + f.text, f.type));

    if (result.fell) {
        addMoveLog(`FELL: ${result.fallReason}`, 'fell');
    } else if (simState.completed) {
        const pumpLabel = PUMP_STATE_LABELS[simState.pumpState] || 'Critical';
        addMoveLog(`COMPLETED! Final pump: ${pumpLabel}`, 'bonus');
    }

    updateSimUI();
    renderGrid();
}

function simShake() {
    if (!simState || simState.fell || simState.completed) return;
    pushHistory();
    const result = simulateShakeAction(simState);
    if (result.success) {
        addMoveLog(result.text, 'bonus');
        if (simState.skillState.justShook) {
            addMoveLog('  Deadpoint ready: next move no pump change', 'bonus');
        }
    } else {
        addMoveLog(result.reason, 'penalty');
        simState.moveHistory.pop(); // undo the push since nothing happened
    }
    updateSimUI();
}

function simChalk() {
    if (!simState || simState.fell || simState.completed) return;
    pushHistory();
    const result = simulateChalkAction(simState);
    if (result.success) {
        addMoveLog(result.text, 'bonus');
        if (simState.skillState.justChalked) {
            addMoveLog('  Deadpoint ready: next move grip decay skipped', 'bonus');
        }
    } else {
        addMoveLog(result.reason, 'penalty');
        simState.moveHistory.pop();
    }
    updateSimUI();
}

function simUndo() {
    if (!simState || simState.moveHistory.length === 0) return;
    const prev = simState.moveHistory.pop();
    prev.moveHistory = simState.moveHistory;
    simState = prev;

    // Remove last log entries (rough heuristic: remove until we find a move entry)
    const log = document.getElementById('move-log');
    if (log.lastChild) log.removeChild(log.lastChild);
    // Remove feedback lines too
    while (log.lastChild && log.lastChild.textContent.startsWith('  ')) {
        log.removeChild(log.lastChild);
    }

    updateSimUI();
    renderGrid();
}

function addMoveLog(text, type) {
    const log = document.getElementById('move-log');
    const entry = document.createElement('div');
    entry.className = 'move-log-entry';
    entry.innerHTML = `<span class="${type}">${text}</span>`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function updateSimUI() {
    if (!simState) { simState = createSimState(); }

    const pumpLabel = simState.pumpState < 3 ? PUMP_STATE_LABELS[simState.pumpState] : 'FELL';
    const gripLabel = simState.gripState < 3 ? GRIP_STATE_LABELS[simState.gripState] : 'FELL';

    const pumpEl = document.getElementById('sim-pump');
    pumpEl.textContent = `${pumpLabel} (${simState.pumpState})`;
    pumpEl.className = 'value ' + (simState.pumpState === 0 ? 'fresh' : simState.pumpState === 1 ? 'moderate' : 'critical');

    const gripEl = document.getElementById('sim-grip');
    gripEl.textContent = `${gripLabel} (${simState.gripState})`;
    gripEl.className = 'value ' + (simState.gripState === 0 ? 'fresh' : simState.gripState === 1 ? 'moderate' : 'critical');

    document.getElementById('sim-weight').textContent = simState.weight.charAt(0).toUpperCase() + simState.weight.slice(1);
    document.getElementById('sim-hand').textContent = simState.lastHandUsed ? (simState.lastHandUsed === 'left' ? 'Left' : 'Right') : '—';
    document.getElementById('sim-decay').textContent = `${simState.gripDecayCounter}/3`;
    document.getElementById('sim-chalk').textContent = `${simState.chalkRemaining}/${simState.maxChalk}`;
    document.getElementById('sim-move').textContent = simState.holdsClimbed;

    // Next hold info — show best reachable hold
    const reachable = getReachableHolds(simState);
    if (reachable.length > 0 && !simState.fell && !simState.completed) {
        const next = reachable[0].hold;
        const ht = holdTypes.find(h => h.type === next.type);
        document.getElementById('sim-next').textContent = `${ht?.label || next.type} ${next.angle}° (${next.position.x},${next.position.y})`;
    } else if (simState.completed) {
        document.getElementById('sim-next').textContent = 'DONE';
    } else {
        document.getElementById('sim-next').textContent = simState.fell ? 'FELL' : '—';
    }

    // Cooldowns
    const cds = [];
    if (simState.shakeCooldown > 0) cds.push(`Shake:${simState.shakeCooldown}`);
    if (simState.chalkCooldown > 0) cds.push(`Chalk:${simState.chalkCooldown}`);
    if (simState.crossCooldown > 0) cds.push(`Cross:${simState.crossCooldown}`);
    if (simState.reachCooldown > 0) cds.push(`Reach:${simState.reachCooldown}`);
    if (simState.commitCooldown > 0) cds.push(`Commit:${simState.commitCooldown}`);
    document.getElementById('sim-cooldowns').textContent = cds.length > 0 ? cds.join(' | ') : 'All ready';

    // Auto-suggest for next move
    if (simMode === 'auto' && reachable.length > 0 && !simState.fell && !simState.completed) {
        // Find best reachable hold for suggestion
        let bestPenalty = 999;
        let bestOpt = null;
        for (const r of reachable) {
            const opt = findOptimalChoice(simState, r.hold);
            if (opt.penalty < bestPenalty) {
                bestPenalty = opt.penalty;
                bestOpt = opt;
            }
        }
        if (bestOpt) {
            setSimControl('hand', bestOpt.hand);
            setSimControl('weight', bestOpt.weight);
        }
    }

    // Build skill activation toggles for manual mode
    const skillActDiv = document.getElementById('skill-activations');
    skillActDiv.innerHTML = '<span class="control-label">Skills</span>';
    if (simMode === 'manual') {
        const activeSkillDefs = [
            { id: 'cross', label: 'Cross', cd: simState.crossCooldown },
            { id: 'reach', label: 'Reach', cd: simState.reachCooldown },
            { id: 'commit', label: 'Commit', cd: simState.commitCooldown }
        ];
        for (const sk of activeSkillDefs) {
            if (!editorState.unlockedSkills.includes(sk.id)) continue;
            const btn = document.createElement('button');
            btn.className = 'radio-btn' + (simControls['use' + sk.label] ? ' active' : '');
            btn.textContent = sk.cd > 0 ? `${sk.label}(${sk.cd})` : sk.label;
            btn.disabled = sk.cd > 0;
            btn.onclick = () => {
                const key = 'use' + sk.label;
                simControls[key] = !simControls[key];
                btn.classList.toggle('active', simControls[key]);
            };
            skillActDiv.appendChild(btn);
        }
    } else {
        skillActDiv.innerHTML += ' <span style="font-size:0.6em;color:#738078">auto</span>';
    }

    // Update button states
    document.getElementById('btn-move').disabled = simState.fell || simState.completed || reachable.length === 0;
    document.getElementById('btn-shake').disabled = simState.fell || simState.completed || simState.shakeCooldown > 0 || simState.pumpState <= 0;
    document.getElementById('btn-chalk').disabled = simState.fell || simState.completed || simState.chalkCooldown > 0 || simState.chalkRemaining <= 0;
    document.getElementById('btn-undo').disabled = simState.moveHistory.length === 0;
}
