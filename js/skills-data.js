// ============ SKILLS DATABASE (Location-Gated Puzzle Skills) ============
// Skills unlock on the victory screen when the player earns enough stars.
// 'areaUnlock' = when 8+ stars earned at this location (same threshold that unlocks adjacent areas).
// 'routeCount' = when N routes at this location are completed (uses unlockRouteCount; 'all' = every route).

const SKILL_STAR_THRESHOLD = 8; // Stars needed at a location to trigger 'areaUnlock' skills

const skillDatabase = {
    cross: {
        id: 'cross',
        name: 'Cross',
        unlockLocation: 0, // Boulder Garden (unlocks after completing all routes)
        unlockTrigger: 'routeCount',
        unlockRouteCount: 'all',
        key: '3',
        description: 'Activate before a cross-body move to reduce effective penalty by 1.',
        effect: 'Reduces cross-body or gaston penalty by 1 level. 3-move cooldown.',
        cooldown: 3
    },
    reach: {
        id: 'reach',
        name: 'Reach',
        unlockLocation: 1, // Crimp Canyon (unlocks after completing first 2 routes)
        unlockTrigger: 'routeCount',
        unlockRouteCount: 2,
        key: '1',
        description: 'Activate before a 2+ space move to negate the distance penalty.',
        effect: 'Negates the +1 penalty for extended (2+ space) moves. 3-move cooldown.',
        cooldown: 3
    },
    weightShift: {
        id: 'weightShift',
        name: 'Weight Shift',
        unlockLocation: 1, // Crimp Canyon
        unlockTrigger: 'areaUnlock',
        description: 'Manually set your body weight before a move.',
        effect: 'Shift weight one step (left/center/right) per action. Allows pre-positioning for optimal penalty angles.',
        passive: true
    },
    match: {
        id: 'match',
        name: 'Match',
        unlockLocation: 2, // Overhang Alley
        unlockTrigger: 'areaUnlock',
        description: 'On matchable holds, place both hands to reset hand alternation.',
        effect: 'Resets hand choice and consecutive crosses. Costs 1 move (pump ticks, cooldowns tick).',
        passive: true
    },
    deadpoint: {
        id: 'deadpoint',
        name: 'Deadpoint',
        unlockLocation: 3, // Slab Valley
        unlockTrigger: 'areaUnlock',
        description: 'Recovery actions empower your next move.',
        effect: 'After Shake: next move skips pump decay. After Chalk: next move has no grip state change.',
        passive: true
    },
    commit: {
        id: 'commit',
        name: 'Commit',
        unlockLocation: 4, // Jug Junction
        unlockTrigger: 'areaUnlock',
        key: 'r',
        description: 'Activate before a move to reduce effective penalty by 1.',
        effect: 'One-shot penalty reduction for a single crux move. 10-move cooldown.',
        cooldown: 10
    },
    bump: {
        id: 'bump',
        name: 'Bump',
        unlockLocation: 5, // Pinch Peak
        unlockTrigger: 'areaUnlock',
        key: 'b',
        description: 'Move to an adjacent hold without changing hands.',
        effect: 'Reposition (same row or 1 lateral space) without hand alternation. Costs 1 move (pump ticks, cooldowns tick).',
        cooldown: 0
    },
    dyno: {
        id: 'dyno',
        name: 'Dyno',
        unlockLocation: 7, // Steep Street
        unlockTrigger: 'areaUnlock',
        key: 't',
        description: 'Activate before a move to jump to holds beyond normal reach.',
        effect: 'Extends max reach to 3 spaces (dy or dx). One-shot activation. 5-move cooldown.',
        cooldown: 5
    }
};

// Ordered list of skill unlock progression
const SKILL_UNLOCK_ORDER = ['cross', 'reach', 'weightShift', 'match', 'deadpoint', 'commit', 'bump', 'dyno'];

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
        if (skill.unlockLocation === locationId && !skill.unlockTrigger && !gameState.unlockedSkills.includes(skillId)) {
            gameState.unlockedSkills.push(skillId);
            newSkills.push(skill);
        }
    }
    return newSkills; // Returns array of newly unlocked skills (for notification)
}

// Unlock skills triggered by completing a route at a location
// 'areaUnlock' fires when 8+ stars earned; 'routeCount' fires when N routes completed
function tryUnlockSkillOnCompletion(locationId) {
    const newSkills = [];
    const locationStars = calculateLocationStars(locationId);
    const hasEnoughStars = locationStars >= SKILL_STAR_THRESHOLD;

    const locationRoutes = getRoutesForLocation(locationId);
    const completedCount = locationRoutes.filter(r => gameState.completedRoutes[`${locationId}-${r.id}`]).length;

    for (const [skillId, skill] of Object.entries(skillDatabase)) {
        if (skill.unlockLocation === locationId && !gameState.unlockedSkills.includes(skillId)) {
            let shouldUnlock = false;
            if (skill.unlockTrigger === 'areaUnlock' && hasEnoughStars) {
                shouldUnlock = true;
            } else if (skill.unlockTrigger === 'routeCount') {
                const threshold = skill.unlockRouteCount === 'all' ? locationRoutes.length : skill.unlockRouteCount;
                if (completedCount >= threshold) shouldUnlock = true;
            }
            if (shouldUnlock) {
                gameState.unlockedSkills.push(skillId);
                newSkills.push(skill);
            }
        }
    }
    return newSkills;
}
