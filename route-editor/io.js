// ============ ROUTE EDITOR: IMPORT/EXPORT ============

let currentExportFormat = 'txt';

// ---- Text Format Export ----
function exportToTxt() {
    const meta = editorState.routeMeta;
    const sorted = getSortedHolds();

    let txt = '=== ROUTE ===\n';
    txt += `id: ${meta.id}\n`;
    txt += `name: ${meta.name}\n`;
    txt += `grade: ${meta.grade}\n`;
    txt += `area: ${meta.area}\n`;
    txt += `description: ${meta.description}\n`;
    txt += `holdCount: ${sorted.length}\n`;

    txt += '\n=== HOLDS ===\n';
    txt += '# y  x  type        angle  pump  grip  match  rest\n';

    for (const hold of sorted) {
        const typeStr = hold.type.padEnd(11);
        const angleStr = String(hold.angle).padStart(3);
        const pumpStr = String(hold.pumpRating).padStart(4);
        const gripStr = String(hold.gripDrain).padStart(4);
        const matchStr = (hold.matchable ? 'yes' : 'no').padStart(5);
        const restStr = (hold.isRest ? 'yes' : 'no').padStart(4);
        txt += `  ${String(hold.position.y).padStart(1)}  ${hold.position.x}  ${typeStr} ${angleStr}  ${pumpStr}  ${gripStr}  ${matchStr}  ${restStr}\n`;
    }

    txt += '\n=== STARS ===\n';
    txt += `speed: ${editorState.stars.speed}\n`;
    txt += `pumpEfficiency: ${editorState.stars.pumpEfficiency || 0}\n`;

    return txt;
}

// ---- JS Format Export ----
function exportToJs() {
    const meta = editorState.routeMeta;
    const sorted = getSortedHolds();

    let js = '{\n';
    js += `    id: '${meta.id}',\n`;
    js += `    name: '${meta.name}',\n`;
    js += `    grade: '${meta.grade}',\n`;
    js += `    holdCount: ${sorted.length},\n`;
    js += `    // area: ${meta.area},\n`;
    js += `    description: '${meta.description.replace(/'/g, "\\'")}',\n`;
    js += '    holds: [\n';

    for (const hold of sorted) {
        const ht = holdTypes.find(h => h.type === hold.type);
        const label = ht ? ht.label : hold.type.toUpperCase();
        js += `        { type: '${hold.type}', label: '${label}', angle: ${hold.angle}, pumpRating: ${hold.pumpRating}, gripDrain: ${hold.gripDrain}, position: { x: ${hold.position.x}, y: ${hold.position.y} }, matchable: ${hold.matchable}, isRest: ${hold.isRest} },\n`;
    }

    js += '    ],\n';
    js += '    stars: {\n';
    js += '        completion: true,\n';
    js += `        speed: { timeLimit: ${editorState.stars.speed} },\n`;
    js += `        pumpEfficiency: { maxPump: ${editorState.stars.pumpEfficiency || 0} },\n`;
    js += '        noRecovery: true,\n';
    js += '        flashClimb: true,\n';
    js += '    }\n';
    js += '}';

    return js;
}

// ---- Import from Text ----
function importFromTxt(text) {
    const lines = text.split('\n');
    const newMeta = { id: '', name: '', grade: 'V0', description: '', area: 0 };
    const newHolds = [];
    const newStars = { speed: 30, pumpEfficiency: 0 };

    let section = '';

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('=== ROUTE ===')) { section = 'route'; continue; }
        if (trimmed.startsWith('=== HOLDS ===')) { section = 'holds'; continue; }
        if (trimmed.startsWith('=== STARS ===')) { section = 'stars'; continue; }
        if (trimmed.startsWith('#') || trimmed === '') continue;

        if (section === 'route') {
            const colonIdx = trimmed.indexOf(':');
            if (colonIdx === -1) continue;
            const key = trimmed.substring(0, colonIdx).trim();
            const val = trimmed.substring(colonIdx + 1).trim();
            if (key === 'id') newMeta.id = val;
            else if (key === 'name') newMeta.name = val;
            else if (key === 'grade') newMeta.grade = val;
            else if (key === 'area') newMeta.area = parseInt(val) || 0;
            else if (key === 'description') newMeta.description = val;
        }

        if (section === 'holds') {
            const parts = trimmed.split(/\s+/);
            if (parts.length >= 8) {
                const y = parseInt(parts[0]);
                const x = parseInt(parts[1]);
                const type = parts[2];
                const angle = parseInt(parts[3]);
                const pump = parseInt(parts[4]);
                const grip = parseInt(parts[5]);
                const matchable = parts[6] === 'yes';
                const isRest = parts[7] === 'yes';

                const ht = holdTypes.find(h => h.type === type);
                newHolds.push({
                    type, label: ht ? ht.label : type.toUpperCase(),
                    angle, pumpRating: pump, gripDrain: grip,
                    position: { x, y }, matchable, isRest
                });
            }
        }

        if (section === 'stars') {
            const colonIdx = trimmed.indexOf(':');
            if (colonIdx === -1) continue;
            const key = trimmed.substring(0, colonIdx).trim();
            const val = trimmed.substring(colonIdx + 1).trim();
            if (key === 'speed') newStars.speed = parseInt(val) || 30;
            else if (key === 'pumpEfficiency') newStars.pumpEfficiency = parseInt(val) || 0;
        }
    }

    // Apply
    editorState.routeMeta = newMeta;
    editorState.holds = newHolds;
    editorState.stars = newStars;

    // Adjust grid height
    const maxY = newHolds.reduce((max, h) => Math.max(max, h.position.y), 0);
    editorState.gridHeight = Math.max(10, maxY + 2);

    editorState.selectedHoldIndex = null;
    hideHoldProps();
    loadMetaToUI();
    simReset();
    renderGrid();
}

// ---- Import from JS object literal ----
function importFromJs(text) {
    try {
        // Extract fields with regex (no eval for safety)
        const getString = (key) => {
            const m = text.match(new RegExp(`${key}:\\s*'([^']*)'`));
            return m ? m[1] : '';
        };
        const getNum = (key) => {
            const m = text.match(new RegExp(`${key}:\\s*(\\d+)`));
            return m ? parseInt(m[1]) : 0;
        };

        const newMeta = {
            id: getString('id'),
            name: getString('name'),
            grade: getString('grade'),
            description: getString('description'),
            area: getNum('area')
        };

        const newStars = { speed: 30, pumpEfficiency: 0 };
        const timeLimitMatch = text.match(/timeLimit:\s*(\d+)/);
        if (timeLimitMatch) newStars.speed = parseInt(timeLimitMatch[1]);
        const maxPumpMatch = text.match(/maxPump:\s*(\d+)/);
        if (maxPumpMatch) newStars.pumpEfficiency = parseInt(maxPumpMatch[1]);

        // Parse holds array
        const holdsMatch = text.match(/holds:\s*\[([\s\S]*?)\]/);
        const newHolds = [];

        if (holdsMatch) {
            const holdEntries = holdsMatch[1].match(/\{[^}]+\}/g) || [];
            for (const entry of holdEntries) {
                const type = (entry.match(/type:\s*'([^']+)'/) || [])[1] || 'jug';
                const angle = parseInt((entry.match(/angle:\s*(\d+)/) || [])[1]) || 0;
                const pumpRating = parseInt((entry.match(/pumpRating:\s*(\d+)/) || [])[1]) || 1;
                const gripDrain = parseInt((entry.match(/gripDrain:\s*(\d+)/) || [])[1]) || 1;
                const x = parseInt((entry.match(/x:\s*(\d+)/) || [])[1]) || 0;
                const y = parseInt((entry.match(/y:\s*(\d+)/) || [])[1]) || 0;
                const matchable = /matchable:\s*true/.test(entry);
                const isRest = /isRest:\s*true/.test(entry);

                const ht = holdTypes.find(h => h.type === type);
                newHolds.push({
                    type, label: ht ? ht.label : type.toUpperCase(),
                    angle, pumpRating, gripDrain,
                    position: { x, y }, matchable, isRest
                });
            }
        }

        editorState.routeMeta = newMeta;
        editorState.holds = newHolds;
        editorState.stars = newStars;

        const maxY = newHolds.reduce((max, h) => Math.max(max, h.position.y), 0);
        editorState.gridHeight = Math.max(10, maxY + 2);

        editorState.selectedHoldIndex = null;
        hideHoldProps();
        loadMetaToUI();
        simReset();
        renderGrid();
    } catch (e) {
        alert('Failed to parse JS format: ' + e.message);
    }
}

// ---- File Import ----
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        if (text.trim().startsWith('{') || text.includes('holds:')) {
            importFromJs(text);
        } else {
            importFromTxt(text);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // reset for re-import
}

// ---- Export Modal ----
function showExportTxt() {
    currentExportFormat = 'txt';
    document.getElementById('export-title').textContent = 'Export — Text Format';
    document.getElementById('export-content').value = exportToTxt();
    document.getElementById('export-modal').classList.add('show');
}

function showExportJs() {
    currentExportFormat = 'js';
    document.getElementById('export-title').textContent = 'Export — JavaScript Format';
    document.getElementById('export-content').value = exportToJs();
    document.getElementById('export-modal').classList.add('show');
}

function closeExportModal() {
    document.getElementById('export-modal').classList.remove('show');
}

function copyExport() {
    const textarea = document.getElementById('export-content');
    textarea.select();
    navigator.clipboard.writeText(textarea.value).then(() => {
        // Brief visual feedback
        const btn = event.target;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1000);
    });
}

function downloadExport() {
    const content = document.getElementById('export-content').value;
    const ext = currentExportFormat === 'js' ? 'js' : 'txt';
    const name = editorState.routeMeta.id || 'route';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
}
