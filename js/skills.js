// ============ SKILL FUNCTIONS (Deterministic Puzzle System) ============

// Compatibility: returns 1 if skill is unlocked, 0 if not.
// Legacy callers use getSkillRank(id) >= 1 checks — this satisfies them.
function getSkillRank(skillId) {
    return isSkillUnlocked(skillId) ? 1 : 0;
}

// Reset skill state at start of each climb
function resetSkillState() {
    gameState.skillState = {
        justChalked: false, // Deadpoint: after chalk, next move skips grip decay
        justShook: false    // Deadpoint: after shake, next move has no pump change
    };
}

// Update skill state after a move
// effectiveLevel: 0-4 penalty level from the move
function updateSkillStateAfterMove(success, effectiveLevel) {
    const state = gameState.skillState;

    // Clear deadpoint flags (they only last one move)
    state.justChalked = false;
    state.justShook = false;
}

// ============ EQUIPMENT HELPERS ============

// Get slot display name
function getSlotDisplayName(slot) {
    const names = {
        shoes: 'Shoes',
        chalkBag: 'Chalk Bag',
        helmet: 'Helmet',
        harness: 'Harness',
        gloves: 'Tape/Gloves',
        clothing: 'Clothing',
        food: 'Food',
        brush: 'Brush',
        guidebook: 'Guidebook',
        watch: 'Watch'
    };
    return names[slot] || slot;
}

// Get rarity color
function getRarityColor(rarity) {
    const colors = {
        common: '#738078',
        uncommon: '#428764',
        rare: '#6dbce3',
        exquisite: '#c178de',
        legendary: '#fad882'
    };
    return colors[rarity] || '#bdb9ae';
}
