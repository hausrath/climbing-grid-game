// ============ SKILLS DATABASE (Location-Gated Puzzle Skills) ============
// Skills unlock automatically when the player first visits a specific location.
// Each skill is a single-rank deterministic tool — no star purchasing, no RNG.

const skillDatabase = {
    cross: {
        id: 'cross',
        name: 'Cross',
        unlockLocation: 0, // Boulder Garden (unlocks after completing first route)
        unlockTrigger: 'completion', // Unlocks on route completion, not on visit
        key: '3',
        description: 'Activate before a cross-body move to reduce effective penalty by 1.',
        effect: 'Reduces cross-body or gaston penalty by 1 level. 3-move cooldown.',
        cooldown: 3
    },
    reach: {
        id: 'reach',
        name: 'Reach',
        unlockLocation: 1, // Crimp Canyon
        key: '1',
        description: 'Activate before a 2+ space move to negate the distance penalty.',
        effect: 'Negates the +1 penalty for extended (2+ space) moves. 3-move cooldown.',
        cooldown: 3
    },
    weightShift: {
        id: 'weightShift',
        name: 'Weight Shift',
        unlockLocation: 2, // Overhang Alley
        description: 'Manually set your body weight before a move, overriding auto-shift.',
        effect: 'Shift weight one step (left/center/right) per action. Allows pre-positioning for upcoming sequences.',
        passive: true // No cooldown — always available once unlocked
    },
    match: {
        id: 'match',
        name: 'Match',
        unlockLocation: 3, // Slab Valley
        description: 'On matchable holds, place both hands to reset hand alternation.',
        effect: 'Resets hand choice and consecutive crosses. Costs 1 move (grip decays, cooldowns tick).',
        passive: true // Available on matchable holds
    },
    deadpoint: {
        id: 'deadpoint',
        name: 'Deadpoint',
        unlockLocation: 4, // Jug Junction
        description: 'Recovery actions empower your next move.',
        effect: 'After Shake: next move has no pump state change. After Chalk: next move skips grip decay.',
        passive: true // Triggers automatically after shake/chalk
    },
    commit: {
        id: 'commit',
        name: 'Commit',
        unlockLocation: 5, // Pinch Peak
        key: 'r',
        description: 'Activate before a move to reduce effective penalty by 1.',
        effect: 'One-shot penalty reduction for a single crux move. 10-move cooldown.',
        cooldown: 10
    },
    bump: {
        id: 'bump',
        name: 'Bump',
        unlockLocation: 6, // Pocket Paradise
        key: 'b',
        description: 'Move to an adjacent hold without changing hands.',
        effect: 'Reposition (same row or 1 lateral space) without hand alternation. Costs 1 move (grip decays, cooldowns tick).',
        cooldown: 0 // No cooldown but counts as a move
    }
};

// Ordered list of skill unlock progression
const SKILL_UNLOCK_ORDER = ['cross', 'reach', 'weightShift', 'match', 'deadpoint', 'commit', 'bump'];

// Check if a skill is unlocked based on visited locations
function isSkillUnlocked(skillId) {
    const skill = skillDatabase[skillId];
    if (!skill) return false;
    return gameState.unlockedSkills.includes(skillId);
}

// Unlock a skill (called when entering a new location — skips completion-triggered skills)
function tryUnlockSkillAtLocation(locationId) {
    const newSkills = [];
    for (const [skillId, skill] of Object.entries(skillDatabase)) {
        if (skill.unlockLocation === locationId && skill.unlockTrigger !== 'completion' && !gameState.unlockedSkills.includes(skillId)) {
            gameState.unlockedSkills.push(skillId);
            newSkills.push(skill);
        }
    }
    return newSkills; // Returns array of newly unlocked skills (for notification)
}

// Unlock skills triggered by completing a route at a location
function tryUnlockSkillOnCompletion(locationId) {
    const newSkills = [];
    for (const [skillId, skill] of Object.entries(skillDatabase)) {
        if (skill.unlockLocation === locationId && skill.unlockTrigger === 'completion' && !gameState.unlockedSkills.includes(skillId)) {
            gameState.unlockedSkills.push(skillId);
            newSkills.push(skill);
        }
    }
    return newSkills;
}
