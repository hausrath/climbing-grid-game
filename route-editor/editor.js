// ============ ROUTE EDITOR: GRID & HOLD EDITING ============

const editorState = {
    routeMeta: { id: '', name: '', grade: 'V0', description: '', area: 0 },
    holds: [],
    gridHeight: 10,
    selectedHoldIndex: null,
    startCol: 3,
    stars: { speed: 30, pumpEfficiency: 0 },
    unlockedSkills: []
};

// ---- Initialization ----
function initEditor() {
    renderGrid();
    updateHoldCount();
    updateSkills();
}

// ---- Route Metadata ----
function updateMeta() {
    editorState.routeMeta.id = document.getElementById('meta-id').value;
    editorState.routeMeta.name = document.getElementById('meta-name').value;
    editorState.routeMeta.grade = document.getElementById('meta-grade').value;
    editorState.routeMeta.area = parseInt(document.getElementById('meta-area').value) || 0;
    editorState.routeMeta.description = document.getElementById('meta-desc').value;
    editorState.stars.speed = parseInt(document.getElementById('star-speed').value) || 30;
}

function loadMetaToUI() {
    document.getElementById('meta-id').value = editorState.routeMeta.id;
    document.getElementById('meta-name').value = editorState.routeMeta.name;
    document.getElementById('meta-grade').value = editorState.routeMeta.grade;
    document.getElementById('meta-area').value = editorState.routeMeta.area;
    document.getElementById('meta-desc').value = editorState.routeMeta.description;
    document.getElementById('star-speed').value = editorState.stars.speed;
    updateHoldCount();
}

function updateHoldCount() {
    document.getElementById('meta-holdcount').value = editorState.holds.length;
}

// ---- Skills ----
function updateSkills() {
    const skills = [];
    if (document.getElementById('skill-cross').checked) skills.push('cross');
    if (document.getElementById('skill-reach').checked) skills.push('reach');
    if (document.getElementById('skill-weightshift').checked) skills.push('weightshift');
    if (document.getElementById('skill-match').checked) skills.push('match');
    if (document.getElementById('skill-deadpoint').checked) skills.push('deadpoint');
    if (document.getElementById('skill-commit').checked) skills.push('commit');
    if (document.getElementById('skill-bump').checked) skills.push('bump');
    editorState.unlockedSkills = skills;
}

// ---- Grid Rendering ----
function renderGrid() {
    const wrapper = document.getElementById('grid-wrapper');
    wrapper.innerHTML = '';

    const sortedHolds = getSortedHolds();
    const holdMap = buildHoldPositionMap();

    for (let y = 0; y <= editorState.gridHeight; y++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'grid-row';

        const label = document.createElement('div');
        label.className = 'row-label';
        label.textContent = y;
        rowDiv.appendChild(label);

        for (let x = 0; x < 7; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            if (y === 0) {
                if (x === editorState.startCol) {
                    cell.classList.add('start-marker');
                    const lbl = document.createElement('div');
                    lbl.className = 'hold-label';
                    lbl.textContent = 'START';
                    cell.appendChild(lbl);
                }
                cell.addEventListener('click', () => {
                    editorState.startCol = x;
                    simReset();
                    renderGrid();
                });
            } else {
                const holdIdx = holdMap[`${x},${y}`];
                if (holdIdx !== undefined) {
                    const hold = editorState.holds[holdIdx];
                    const ht = holdTypes.find(h => h.type === hold.type) || holdTypes[0];
                    cell.classList.add('has-hold');
                    cell.style.borderColor = ht.color;
                    cell.style.background = hexToRgba(ht.color, 0.15);

                    const numSpan = document.createElement('div');
                    numSpan.className = 'hold-number';
                    numSpan.textContent = getHoldSequenceNumber(holdIdx);
                    cell.appendChild(numSpan);

                    const lblSpan = document.createElement('div');
                    lblSpan.className = 'hold-label';
                    lblSpan.textContent = ht.label;
                    lblSpan.style.color = ht.color;
                    cell.appendChild(lblSpan);

                    const angSpan = document.createElement('div');
                    angSpan.className = 'hold-angle';
                    angSpan.textContent = hold.angle + '°';
                    cell.appendChild(angSpan);

                    // Flags
                    const flags = [];
                    if (hold.matchable) flags.push('M');
                    if (hold.isRest) flags.push('R');
                    if (flags.length > 0) {
                        const flagSpan = document.createElement('div');
                        flagSpan.className = 'hold-flags';
                        flagSpan.textContent = flags.join('');
                        cell.appendChild(flagSpan);
                    }

                    if (holdIdx === editorState.selectedHoldIndex) {
                        cell.classList.add('selected');
                    }

                    // Penalty tooltip
                    if (y > 0) {
                        const tooltip = buildPenaltyTooltip(hold);
                        if (tooltip) cell.appendChild(tooltip);
                    }

                    cell.addEventListener('click', (e) => {
                        if (e.shiftKey) {
                            deleteHold(holdIdx);
                        } else {
                            selectHold(holdIdx);
                        }
                    });
                } else {
                    cell.addEventListener('click', (e) => {
                        if (!e.shiftKey && y > 0) placeHold(x, y);
                    });
                }
            }

            // Simulator highlighting
            if (typeof simState !== 'undefined' && simState) {
                if (simState.currentRow === y && simState.currentCol === x) {
                    cell.classList.add('sim-current');
                }
            }

            rowDiv.appendChild(cell);
        }

        wrapper.appendChild(rowDiv);
    }
}

function buildHoldPositionMap() {
    const map = {};
    editorState.holds.forEach((h, i) => {
        map[`${h.position.x},${h.position.y}`] = i;
    });
    return map;
}

function getSortedHolds() {
    return [...editorState.holds].sort((a, b) => {
        if (a.position.y !== b.position.y) return a.position.y - b.position.y;
        return a.position.x - b.position.x;
    });
}

function getHoldSequenceNumber(holdIdx) {
    const sorted = getSortedHolds();
    const hold = editorState.holds[holdIdx];
    for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].position.x === hold.position.x && sorted[i].position.y === hold.position.y) {
            return i + 1;
        }
    }
    return '?';
}

// ---- Hold Placement ----
function placeHold(x, y) {
    const existing = editorState.holds.findIndex(h =>
        h.position.x === x && h.position.y === y
    );
    if (existing !== -1) return;

    const newHold = {
        type: 'jug', label: 'JUG', angle: 0,
        pumpRating: 1, gripDrain: 1,
        position: { x, y },
        matchable: false, isRest: false
    };
    editorState.holds.push(newHold);
    const idx = editorState.holds.length - 1;
    selectHold(idx);
    updateHoldCount();
    renderGrid();
}

function deleteHold(holdIdx) {
    if (holdIdx < 0 || holdIdx >= editorState.holds.length) return;
    editorState.holds.splice(holdIdx, 1);
    if (editorState.selectedHoldIndex === holdIdx) {
        editorState.selectedHoldIndex = null;
        hideHoldProps();
    } else if (editorState.selectedHoldIndex > holdIdx) {
        editorState.selectedHoldIndex--;
    }
    updateHoldCount();
    renderGrid();
}

function deleteSelectedHold() {
    if (editorState.selectedHoldIndex !== null) {
        deleteHold(editorState.selectedHoldIndex);
    }
}

// ---- Hold Selection & Properties ----
function selectHold(holdIdx) {
    editorState.selectedHoldIndex = holdIdx;
    const hold = editorState.holds[holdIdx];
    if (!hold) return;

    document.getElementById('hold-type').value = hold.type;
    document.getElementById('hold-pump').value = hold.pumpRating;
    document.getElementById('hold-grip').value = hold.gripDrain;
    document.getElementById('hold-matchable').checked = hold.matchable;
    document.getElementById('hold-rest').checked = hold.isRest;

    // Update compass
    document.querySelectorAll('.compass-segment').forEach(seg => {
        seg.classList.toggle('active', parseInt(seg.dataset.angle) === hold.angle);
    });

    document.getElementById('hold-props').classList.add('active');
    renderGrid();
}

function hideHoldProps() {
    document.getElementById('hold-props').classList.remove('active');
}

function updateHoldProp() {
    if (editorState.selectedHoldIndex === null) return;
    const hold = editorState.holds[editorState.selectedHoldIndex];
    if (!hold) return;

    hold.type = document.getElementById('hold-type').value;
    hold.label = holdTypes.find(h => h.type === hold.type)?.label || hold.type.toUpperCase();
    hold.pumpRating = parseInt(document.getElementById('hold-pump').value);
    hold.gripDrain = parseInt(document.getElementById('hold-grip').value);
    hold.matchable = document.getElementById('hold-matchable').checked;
    hold.isRest = document.getElementById('hold-rest').checked;
    renderGrid();
}

function setAngle(angle) {
    if (editorState.selectedHoldIndex === null) return;
    editorState.holds[editorState.selectedHoldIndex].angle = angle;
    document.querySelectorAll('.compass-segment').forEach(seg => {
        seg.classList.toggle('active', parseInt(seg.dataset.angle) === angle);
    });
    renderGrid();
}

// ---- Grid Row Management ----
function addRow() {
    editorState.gridHeight++;
    renderGrid();
}

function removeTopRow() {
    const topRowHasHold = editorState.holds.some(h => h.position.y === editorState.gridHeight);
    if (topRowHasHold) return; // don't remove row with holds
    if (editorState.gridHeight <= 1) return;
    editorState.gridHeight--;
    renderGrid();
}

// ---- Penalty Tooltip ----
function buildPenaltyTooltip(hold) {
    const tooltip = document.createElement('div');
    tooltip.className = 'penalty-tooltip';

    const idealWt = getIdealWeight(hold.angle);
    const directions = ['up', 'up-left', 'up-right'];
    const dirLabels = { 'up': 'U', 'up-left': 'UL', 'up-right': 'UR' };
    const hands = ['left', 'right'];
    const handLabels = { left: 'L', right: 'R' };

    let html = '';
    for (const dir of directions) {
        for (const hand of hands) {
            const eff = Math.min(lookupPenalty(dir, hand, hold.angle, idealWt), 4);
            html += `<span class="p${eff}">${dirLabels[dir]}+${handLabels[hand]}=${eff}</span> `;
        }
        html += '<br>';
    }
    html += `<span style="color:#738078">@${idealWt} weight</span>`;
    tooltip.innerHTML = html;
    return tooltip;
}

// ---- New Route ----
function newRoute() {
    editorState.routeMeta = { id: '', name: '', grade: 'V0', description: '', area: 0 };
    editorState.holds = [];
    editorState.gridHeight = 10;
    editorState.selectedHoldIndex = null;
    editorState.startCol = 2;
    editorState.stars = { speed: 30, pumpEfficiency: 0 };
    hideHoldProps();
    loadMetaToUI();
    simReset();
    renderGrid();
}

// ---- Utility ----
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

// ---- Init on load ----
document.addEventListener('DOMContentLoaded', initEditor);
