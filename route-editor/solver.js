// ============ ROUTE EDITOR: AUTO-SOLVER (Graph-Based Path Enumeration) ============
// Supports branching routes — the solver explores all reachable holds from each
// position rather than forcing sequential traversal. Completion = reaching the top.

let solverResults = null;
let solverBestPath = null;

function hashSolverState(visitedMask, state) {
    return `${visitedMask}-${state.currentRow}-${state.currentCol}-${state.pumpState}-${state.gripState}-${state.gripDecayCounter}-${state.lastHandUsed}-${state.weight}-${state.crossCooldown}-${state.reachCooldown}-${state.commitCooldown}-${state.shakeCooldown}-${state.chalkCooldown}-${state.chalkRemaining}-${state.skillState.justChalked}-${state.skillState.justShook}-${state.consecutiveCrosses}`;
}

function runSolver() {
    const sorted = getSortedHolds();
    if (sorted.length === 0) {
        document.getElementById('solver-results').innerHTML = '<span class="fail">No holds placed</span>';
        return;
    }

    const skills = editorState.unlockedSkills;
    const startTime = performance.now();
    const maxY = Math.max(...sorted.map(h => h.position.y));
    // Pre-check: verify every hold is reachable from at least one lower hold or the start
    // Uses base reach of 2 — dyno is an active skill (per-move activation) so it doesn't
    // change structural reachability. The solver doesn't model dyno activation.
    const unreachableHolds = [];
    for (let i = 0; i < sorted.length; i++) {
        const hold = sorted[i];
        const hy = hold.position.y;
        const hx = hold.position.x;

        // Check if reachable from start position
        let canReach = false;
        const dyFromStart = hy;
        const dxFromStart = Math.abs(hx - editorState.startCol);
        if (dyFromStart > 0 && dyFromStart <= 2 && dxFromStart <= 2) {
            canReach = true;
        }

        // Check if reachable from any lower hold
        if (!canReach) {
            for (let j = 0; j < sorted.length; j++) {
                if (i === j) continue;
                const other = sorted[j];
                const dy = hy - other.position.y;
                const dx = Math.abs(hx - other.position.x);
                if (dy > 0 && dy <= 2 && dx <= 2) {
                    canReach = true;
                    break;
                }
            }
        }

        if (!canReach) {
            unreachableHolds.push(i);
        }
    }

    if (unreachableHolds.length > 0) {
        const elapsed = (performance.now() - startTime).toFixed(0);
        const holdStats = sorted.map(() => ({
            successCombos: new Set(), totalAttempts: 0, failures: 0,
            failReasons: { pump: 0, grip: 0, penalty: 0 }, bestPumpArriving: 999, inBestPath: false
        }));
        solverResults = {
            totalPaths: 0, successPaths: 0, bestFinalPump: 999, holdStats, elapsed,
            highestRowReached: 0, maxY, shortestPathLength: 999,
            unreachableHolds: unreachableHolds.map(i => ({
                index: i,
                hold: sorted[i],
                label: (holdTypes.find(h => h.type === sorted[i].type)?.label || sorted[i].type)
            }))
        };
        solverBestPath = null;
        displaySolverResults();
        return;
    }

    let totalPaths = 0;
    let successPaths = 0;
    let bestPath = null;
    let bestFinalPump = 999;
    let shortestPathLength = 999;
    let highestRowReached = 0;
    let bestAttemptPath = null;
    let bestAttemptRow = -1;
    let bestAttemptPump = 999;

    // Per-hold stats (indexed by position in sorted array)
    const holdStats = sorted.map(() => ({
        successCombos: new Set(),
        totalAttempts: 0,
        failures: 0,
        failReasons: { pump: 0, grip: 0, penalty: 0 },
        bestPumpArriving: 999,
        inBestPath: false
    }));

    const memo = new Map();

    function solve(visitedMask, state, path) {
        // Completion: reached a hold at the maximum y-position
        if (state.currentRow >= maxY) {
            totalPaths++;
            successPaths++;
            // Prefer lower pump, then shorter path
            if (state.pumpState < bestFinalPump ||
                (state.pumpState === bestFinalPump && path.length < shortestPathLength)) {
                bestFinalPump = state.pumpState;
                bestPath = [...path];
                shortestPathLength = path.length;
            }
            return true;
        }

        // Track highest row reached for failure reporting
        if (state.currentRow > highestRowReached) {
            highestRowReached = state.currentRow;
        }

        const stateHash = hashSolverState(visitedMask, state);
        if (memo.has(stateHash)) {
            const cached = memo.get(stateHash);
            if (cached === 'fail') return false;
            if (cached === 'success') {
                successPaths++;
                totalPaths++;
                return true;
            }
        }

        if (state.pumpState >= 3 || state.gripState >= 3) {
            memo.set(stateHash, 'fail');
            return false;
        }

        // Find all reachable unvisited holds from current position
        const reachable = [];
        for (let i = 0; i < sorted.length; i++) {
            if (visitedMask & (1 << i)) continue; // already visited
            const hold = sorted[i];
            const dy = hold.position.y - state.currentRow;
            const dx = Math.abs(hold.position.x - state.currentCol);
            if (dy > 0 && dy <= 2 && dx <= 2) {
                reachable.push(i);
            }
        }

        if (reachable.length === 0) {
            // Dead end — no reachable holds and not at top
            totalPaths++;
            trackBestAttempt(state.currentRow, path, state.pumpState);
            memo.set(stateHash, 'fail');
            return false;
        }

        let anySuccess = false;

        for (const holdIdx of reachable) {
            const hold = sorted[holdIdx];

            // Track best arriving pump for this hold
            if (state.pumpState < holdStats[holdIdx].bestPumpArriving) {
                holdStats[holdIdx].bestPumpArriving = state.pumpState;
            }

            const hands = ['left', 'right'];
            const weights = skills.includes('weightshift')
                ? ['left', 'center', 'right']
                : [getIdealWeight(hold.angle)];

            const recoveryOptions = [null];
            if (state.shakeCooldown <= 0 && state.pumpState > 0) recoveryOptions.push('shake');
            if (state.chalkCooldown <= 0 && state.chalkRemaining > 0 && state.gripState > 0) recoveryOptions.push('chalk');

            for (const recovery of recoveryOptions) {
                let recState = cloneState(state);
                recState.moveHistory = [];

                if (recovery === 'shake') {
                    simulateShakeAction(recState);
                } else if (recovery === 'chalk') {
                    simulateChalkAction(recState);
                }

                if (recState.pumpState >= 3 || recState.gripState >= 3) continue;

                for (const hand of hands) {
                    if (recState.lastHandUsed !== null && hand === recState.lastHandUsed) continue;

                    for (const wt of weights) {
                        const dir = getMoveDirection(recState.currentCol, recState.currentRow, hold.position.x, hold.position.y);
                        const crossMove = isCrossMove(hand, dir);
                        const dy = hold.position.y - recState.currentRow;
                        const dx = Math.abs(hold.position.x - recState.currentCol);
                        const extended = (dy >= 2 || dx >= 2);
                        const gaston = getHandHoldPumpModifier(hold.type, hand, hold.angle) > 0;

                        const crossOpts = (skills.includes('cross') && recState.crossCooldown <= 0 && (crossMove || gaston)) ? [false, true] : [false];
                        const reachOpts = (skills.includes('reach') && recState.reachCooldown <= 0 && extended) ? [false, true] : [false];
                        const commitOpts = (skills.includes('commit') && recState.commitCooldown <= 0) ? [false, true] : [false];

                        for (const uc of crossOpts) {
                            for (const ur of reachOpts) {
                                for (const ucm of commitOpts) {
                                    holdStats[holdIdx].totalAttempts++;

                                    const moveState = cloneState(recState);
                                    moveState.moveHistory = [];
                                    moveState.weight = wt;

                                    const result = simulateMove(moveState, hold, hand, wt, { useCross: uc, useReach: ur, useCommit: ucm });

                                    if (!result.success || result.fell) {
                                        holdStats[holdIdx].failures++;
                                        holdStats[holdIdx].failReasons.penalty++;
                                        totalPaths++;
                                        trackBestAttempt(state.currentRow, path, state.pumpState);
                                        continue;
                                    }

                                    applyMoveResult(moveState, hold, hand, result, wt);

                                    if (moveState.pumpState >= 3) {
                                        holdStats[holdIdx].failures++;
                                        holdStats[holdIdx].failReasons.pump++;
                                        totalPaths++;
                                        trackBestAttempt(state.currentRow, path, state.pumpState);
                                        continue;
                                    }
                                    if (moveState.gripState >= 3) {
                                        holdStats[holdIdx].failures++;
                                        holdStats[holdIdx].failReasons.grip++;
                                        totalPaths++;
                                        trackBestAttempt(state.currentRow, path, state.pumpState);
                                        continue;
                                    }

                                    const step = {
                                        holdIndex: holdIdx, hand, weight: wt, recovery,
                                        useCross: uc, useReach: ur, useCommit: ucm,
                                        effectivePenalty: result.effectivePenalty,
                                        pumpAfter: moveState.pumpState, gripAfter: moveState.gripState
                                    };

                                    const newMask = visitedMask | (1 << holdIdx);
                                    if (solve(newMask, moveState, [...path, step])) {
                                        holdStats[holdIdx].successCombos.add(`${hand[0].toUpperCase()}@${wt[0].toUpperCase()}${recovery ? '+' + recovery[0].toUpperCase() : ''}`);
                                        anySuccess = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        memo.set(stateHash, anySuccess ? 'success' : 'fail');
        return anySuccess;
    }

    function trackBestAttempt(row, path, pumpArriving) {
        if (row > bestAttemptRow ||
            (row === bestAttemptRow && pumpArriving < bestAttemptPump)) {
            bestAttemptPath = [...path];
            bestAttemptRow = row;
            bestAttemptPump = pumpArriving;
        }
    }

    const initState = createSimState();
    solve(0, initState, []);

    const elapsed = (performance.now() - startTime).toFixed(0);

    // Mark holds in best path
    if (bestPath) {
        for (const step of bestPath) {
            holdStats[step.holdIndex].inBestPath = true;
        }
    }

    solverResults = {
        totalPaths, successPaths, bestFinalPump, holdStats, elapsed,
        highestRowReached, maxY, shortestPathLength
    };
    solverBestPath = successPaths > 0 ? bestPath : bestAttemptPath;

    displaySolverResults();
}

function displaySolverResults() {
    const r = solverResults;
    if (!r) return;

    const sorted = getSortedHolds();
    const resultsDiv = document.getElementById('solver-results');

    let html = '';
    if (r.unreachableHolds && r.unreachableHolds.length > 0) {
        html += `<div class="result-row"><span class="fail" style="font-size:1.1em;">ROUTE IMPOSSIBLE</span></div>`;
        html += `<div class="result-row" style="color:#bdb9ae;">Unreachable holds detected — no hold or start position is close enough</div>`;
        for (const uh of r.unreachableHolds) {
            html += `<div class="result-row" style="margin-top:4px;"><span style="color:#f5aaa2;">Hold #${uh.index + 1} (${uh.label} at ${uh.hold.position.x},${uh.hold.position.y})</span><span style="color:#738078;">no hold within reach below</span></div>`;
        }
        html += `<div class="result-row"><span>Time:</span><span>${r.elapsed}ms</span></div>`;
        html += `<div class="result-row"><span>Skills:</span><span>${editorState.unlockedSkills.length > 0 ? editorState.unlockedSkills.join(', ') : 'none'}</span></div>`;
        resultsDiv.innerHTML = html;
        document.getElementById('solver-hold-summary').innerHTML = '';
        return;
    }
    if (r.successPaths > 0) {
        html += `<div class="result-row"><span>Successful paths:</span><span class="success">${r.successPaths}</span></div>`;
        html += `<div class="result-row"><span>Best final pump:</span><span class="success">${PUMP_STATE_LABELS[r.bestFinalPump] || r.bestFinalPump} (${r.bestFinalPump})</span></div>`;
        html += `<div class="result-row"><span>Shortest path:</span><span>${r.shortestPathLength} holds</span></div>`;
    } else {
        // Find holds that block progress (attempted but never succeeded)
        const blockers = [];
        for (let i = 0; i < sorted.length; i++) {
            if (r.holdStats[i].successCombos.size === 0 && r.holdStats[i].totalAttempts > 0) {
                blockers.push(i);
            }
        }
        // Pick the lowest-y blocker as "the wall"
        let wallIndex = -1;
        if (blockers.length > 0) {
            wallIndex = blockers.reduce((best, idx) =>
                sorted[idx].position.y < sorted[best].position.y ? idx : best, blockers[0]);
        }

        const wallHold = wallIndex >= 0 ? sorted[wallIndex] : null;
        const wallHt = wallHold ? (holdTypes.find(h => h.type === wallHold.type)?.label || wallHold.type) : '';
        const wallReasons = wallIndex >= 0 ? r.holdStats[wallIndex].failReasons : null;

        html += `<div class="result-row"><span class="fail" style="font-size:1.1em;">ROUTE IMPOSSIBLE</span></div>`;
        html += `<div class="result-row" style="color:#bdb9ae;">No path reaches the top with current skills</div>`;
        html += `<div class="result-row"><span>Highest row reached:</span><span>${r.highestRowReached} of ${r.maxY}</span></div>`;

        if (wallIndex >= 0 && wallReasons) {
            const totalFails = wallReasons.pump + wallReasons.grip + wallReasons.penalty;
            const reasons = [];
            if (wallReasons.pump > 0) reasons.push(`${Math.round(wallReasons.pump / totalFails * 100)}% pump`);
            if (wallReasons.grip > 0) reasons.push(`${Math.round(wallReasons.grip / totalFails * 100)}% grip`);
            if (wallReasons.penalty > 0) reasons.push(`${Math.round(wallReasons.penalty / totalFails * 100)}% penalty`);

            html += `<div class="result-row" style="margin-top:8px;"><span style="color:#f5aaa2;">The Wall:</span><span style="color:#f5aaa2;">Hold #${wallIndex + 1} (${wallHt} ${wallHold.angle}°)</span></div>`;
            html += `<div class="result-row" style="padding-left:12px;"><span style="color:#738078;">${reasons.join(', ')}</span></div>`;

            if (r.holdStats[wallIndex].bestPumpArriving < 999) {
                html += `<div class="result-row" style="padding-left:12px;"><span style="color:#738078;">Best pump arriving: ${PUMP_STATE_LABELS[r.holdStats[wallIndex].bestPumpArriving] || r.holdStats[wallIndex].bestPumpArriving}</span></div>`;
            }
        }
    }

    html += `<div class="result-row"><span>Total paths explored:</span><span>${r.totalPaths}</span></div>`;
    html += `<div class="result-row"><span>Time:</span><span>${r.elapsed}ms</span></div>`;
    html += `<div class="result-row"><span>Skills:</span><span>${editorState.unlockedSkills.length > 0 ? editorState.unlockedSkills.join(', ') : 'none'}</span></div>`;

    resultsDiv.innerHTML = html;

    // Update Load Best Path button label
    const loadBtn = document.getElementById('load-best-btn');
    if (loadBtn) {
        loadBtn.textContent = r.successPaths > 0 ? 'Load Best Path' : 'Load Best Attempt';
    }

    // Hold summary table
    const summaryDiv = document.getElementById('solver-hold-summary');

    if (r.successPaths > 0) {
        let tableHtml = '<table><tr><th>#</th><th>Hold</th><th>Combos</th><th>Fail%</th></tr>';
        for (let i = 0; i < sorted.length; i++) {
            const hold = sorted[i];
            const stats = r.holdStats[i];
            const ht = holdTypes.find(h => h.type === hold.type);
            const failPct = stats.totalAttempts > 0 ? Math.round((stats.failures / stats.totalAttempts) * 100) : 0;
            const combos = [...stats.successCombos].join(', ') || '<span style="color:#738078;">alt branch</span>';
            const isCrux = stats.successCombos.size <= 2 && stats.successCombos.size > 0;
            const isOnBestPath = stats.inBestPath;
            const isAltBranch = stats.totalAttempts === 0 && !isOnBestPath;

            let rowStyle = '';
            if (isCrux) rowStyle = ' class="crux"';
            if (isAltBranch) rowStyle = ' style="opacity:0.5"';

            tableHtml += `<tr${rowStyle}>`;
            tableHtml += `<td>${i + 1}${isOnBestPath ? ' *' : ''}</td>`;
            tableHtml += `<td>${ht?.label || hold.type} ${hold.angle}°</td>`;
            tableHtml += `<td>${combos}</td>`;
            tableHtml += `<td${failPct > 70 ? ' style="color:#f5aaa2"' : ''}>${stats.totalAttempts > 0 ? failPct + '%' : ''}</td>`;
            tableHtml += `</tr>`;
        }
        tableHtml += '</table>';
        summaryDiv.innerHTML = tableHtml;
    } else {
        // Impossible case: failure breakdown
        let wallIndex = -1;
        const blockers = [];
        for (let i = 0; i < sorted.length; i++) {
            if (r.holdStats[i].successCombos.size === 0 && r.holdStats[i].totalAttempts > 0) {
                blockers.push(i);
            }
        }
        if (blockers.length > 0) {
            wallIndex = blockers.reduce((best, idx) =>
                sorted[idx].position.y < sorted[best].position.y ? idx : best, blockers[0]);
        }

        let tableHtml = '<table><tr><th>#</th><th>Hold</th><th>Status</th><th>Why</th></tr>';
        for (let i = 0; i < sorted.length; i++) {
            const hold = sorted[i];
            const stats = r.holdStats[i];
            const ht = holdTypes.find(h => h.type === hold.type);

            if (stats.totalAttempts === 0) {
                tableHtml += `<tr style="opacity:0.4;"><td>${i + 1}</td><td>${ht?.label || hold.type} ${hold.angle}°</td>`;
                tableHtml += `<td colspan="2" style="color:#738078;">never reached</td></tr>`;
                continue;
            }

            const isWall = (i === wallIndex);
            const allPass = stats.successCombos.size > 0;
            const fr = stats.failReasons;

            let statusText, statusClass, whyText;
            if (allPass) {
                const combos = [...stats.successCombos].join(', ');
                statusText = combos;
                statusClass = 'success';
                whyText = '';
            } else {
                statusText = isWall ? 'THE WALL' : '100% fail';
                statusClass = 'fail';
                const reasons = [];
                if (fr.pump > 0) reasons.push(`pump:${fr.pump}`);
                if (fr.grip > 0) reasons.push(`grip:${fr.grip}`);
                if (fr.penalty > 0) reasons.push(`pen:${fr.penalty}`);
                whyText = reasons.join(', ');
            }

            tableHtml += `<tr${isWall ? ' style="background:rgba(245,170,162,0.15);"' : ''}>`;
            tableHtml += `<td>${i + 1}</td>`;
            tableHtml += `<td>${ht?.label || hold.type} ${hold.angle}°</td>`;
            tableHtml += `<td class="${statusClass}">${statusText}</td>`;
            tableHtml += `<td style="color:#738078;font-size:0.85em;">${whyText}</td>`;
            tableHtml += `</tr>`;
        }
        tableHtml += '</table>';
        summaryDiv.innerHTML = tableHtml;
    }
}

function loadBestPath() {
    if (!solverBestPath || solverBestPath.length === 0) return;

    simReset();
    const sorted = getSortedHolds();
    const isImpossible = solverResults && solverResults.successPaths === 0;

    let moveNum = 0;
    for (const step of solverBestPath) {
        if (simState.fell || simState.completed) break;

        // Apply recovery first
        if (step.recovery === 'shake') {
            pushHistory();
            const res = simulateShakeAction(simState);
            if (res.success) addMoveLog(res.text, 'bonus');
        } else if (step.recovery === 'chalk') {
            pushHistory();
            const res = simulateChalkAction(simState);
            if (res.success) addMoveLog(res.text, 'bonus');
        }

        // Execute move
        moveNum++;
        const hold = sorted[step.holdIndex];
        pushHistory();
        simState.weight = step.weight;

        const result = simulateMove(simState, hold, step.hand, step.weight, {
            useCross: step.useCross, useReach: step.useReach, useCommit: step.useCommit
        });
        applyMoveResult(simState, hold, step.hand, result, step.weight);

        const handLabel = step.hand === 'left' ? 'L' : 'R';
        const ht = holdTypes.find(h => h.type === hold.type);
        let logText = `#${moveNum} ${ht?.label} ${hold.angle}° | ${handLabel} | eff:${result.effectivePenalty}`;
        const logType = result.fell ? 'fell' : result.effectivePenalty === 0 ? 'bonus' : result.effectivePenalty >= 2 ? 'penalty' : 'neutral';
        addMoveLog(logText, logType);
        result.feedback.forEach(f => addMoveLog('  ' + f.text, f.type));
    }

    if (simState.completed) {
        addMoveLog(`COMPLETED! Final pump: ${PUMP_STATE_LABELS[simState.pumpState] || 'Critical'}`, 'bonus');
    } else if (isImpossible) {
        addMoveLog(`Best attempt reached row ${solverResults.highestRowReached} of ${solverResults.maxY} before all paths fail`, 'penalty');
    }

    updateSimUI();
    renderGrid();
}
