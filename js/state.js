const gameState = {
    gameMode: 'title', // 'title', 'worldmap', 'routeselect', 'climbing', 'camp'
    currentLocation: null,
    currentRoute: null,
    completedRoutes: {}, // "locationId-routeId": { stars: 3, attempts: 2, starResults: {} }
    
    // Route progress tracking: { "locationId-routeId": { attempts: 2, highPoint: 5, status: 'attempted' } }
    // status: 'not_tried', 'attempted', 'completed'
    routeProgress: {},
    
    // Hold familiarity tracking: { "locationId-routeId-holdIndex": grabCount }
    // Each successful grab adds +2% success bonus (capped at 10% / 5 grabs)
    holdFamiliarity: {},
    
    // Equipment system
    inventory: [], // Array of gear IDs the player owns
    equippedGear: {
        shoes: null,
        chalkBag: null,
        helmet: null,
        harness: null,
        gloves: null,
        clothing: null,
        food: null,
        brush: null,
        guidebook: null,
        watch: null
    },
    collectedLoot: {}, // Track which routes have had their loot collected: "locationId-routeId": true
    
    // Energy system
    energy: 5,
    maxEnergy: 5,
    
    // Time of day system
    timeOfDay: 'morning', // 'morning', 'noon', 'evening'
    climbsThisPeriod: 0, // Counts toward time advancement (3 max)
    day: 1, // Current day number
    
    // Conditions system (generated daily)
    currentConditions: {
        temperature: 'mild', // 'cool', 'mild', 'hot'
        humidity: 'dry', // 'dry', 'moderate', 'humid'
        wind: 'calm' // 'calm', 'moderate', 'heavy'
    },
    
    pump: 0,
    grip: 100,
    maxPump: 100,
    maxGrip: 100,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    unspentStatPoints: 0,
    unspentSkillPoints: 0,
    
    // Skills system - points invested in each skill
    skills: {
        // === ATHLETICS SKILLS ===
        dyno: 0,              // Max 15 pts (5 ranks) - renamed from dynamicMovement
        flowState: 0,         // Max 12 pts (4 ranks)
        ironGrip: 0,          // Max 9 pts (3 ranks)
        grit: 0,              // Max 9 pts (3 ranks)
        deadpoint: 0,         // Max 1 pt
        kneebar: 0,           // Max 9 pts (3 ranks)
        battleCry: 0,         // Max 6 pts (2 ranks)
        precisionFootwork: 0, // Max 12 pts (4 ranks)
        adrenalineRush: 0,    // Max 1 pt
        ambidextrous: 0,      // Max 6 pts (2 ranks)
        
        // === UTILITY SKILLS ===
        efficientRecovery: 0, // Max 15 pts (5 ranks)
        grapplingHook: 0,     // Max 9 pts (3 ranks)
        pitonPlacement: 0,    // Max 6 pts (2 ranks)
        climbingSalve: 0,     // Max 9 pts (3 ranks)
        stimulant: 0,         // Max 6 pts (2 ranks)
        headlamp: 0,          // Max 9 pts (3 ranks)
        routeJournal: 0,      // Max 12 pts (4 ranks)
        wingsuit: 0,          // Max 1 pt
        crashPad: 0,          // Max 6 pts (2 ranks)
        weatherReading: 0,    // Max 9 pts (3 ranks)
        
        // === MAGIC SKILLS ===
        transmogrify: 0,      // Max 9 pts (3 ranks)
        teleport: 0,          // Max 12 pts (4 ranks)
        seer: 0,              // Max 12 pts (4 ranks)
        timeDilation: 0,      // Max 9 pts (3 ranks)
        rockcreate: 0,        // Max 9 pts (3 ranks)
        sunmark: 0,           // Max 6 pts (2 ranks)
        whisperingVines: 0,   // Max 6 pts (2 ranks)
        transmute: 0,         // Max 1 pt
        gravityShift: 0,      // Max 6 pts (2 ranks)
        phantomGrip: 0,       // Max 9 pts (3 ranks)
        energySiphon: 0,      // Max 6 pts (2 ranks)
        
        // Legacy
        commit: false,
    },
    
    // Skill state tracking (per-climb, reset each attempt)
    skillState: {
        justChalked: false,
        justShook: false,
        gritProcBonus: 0,
        ironGripProcBonus: 0,
        adrenalineTriggered: false,
        adrenalineMovesLeft: 0,
        battleCryUsesLeft: 0,
        battleCryActive: false,
        battleCryMovesLeft: 0,
        battleCryFailImmunity: false,
        kneebar: {
            available: false,
            active: false,
            movesInKneebar: 0,
            cooldown: 0,
            postKneebarBonus: 0
        },
        flowFailureBuffer: 0,
        flowPaused: false,
        flowStackBonus: 0,
        dynamicLandingBonus: 0,
        footworkMoveCount: 0,
        
        // === UTILITY SKILL STATE ===
        grapplingHook: {
            usesLeft: 0,
            cooldown: 0
        },
        piton: {
            placementsLeft: 0,
            placed: false,  // Is there a piton on current hold?
            restMovesLeft: 0
        },
        salve: {
            usesLeft: 0,
            bonusMovesLeft: 0,
            weatherImmunityLeft: 0
        },
        stimulant: {
            usesLeft: 0,
            active: false,
            movesLeft: 0
        },
        crashPad: {
            placementsLeft: 0,
            placed: false,
            lastSafeHold: null
        },
        wingsuit: {
            available: false
        },
        recoveryBonus: 0  // +success after recovery (Efficient Recovery rank 5)
    },
    
    commitCooldown: 0,
    commitActive: false,
    // Player stats
    endurance: 0,
    power: 0,
    speed: 0,
    technique: 0,
    selectedHand: null,
    lastHandUsed: null, // Track which hand was used last
    movementStyle: 'regular', // 'static', 'regular', 'dynamic'
    consecutiveCrosses: 0, // Track consecutive cross-overs
    staticCooldown: 0, // Turns until static is available again
    dynamicCooldown: 0, // Turns until dynamic is available again
    shakeCooldown: 0, // Turns until shake is available again
    chalkCooldown: 0, // Turns until chalk is available again
    cooldownLength: 3, // Number of turns for movement cooldown
    actionCooldownLength: 5, // Number of turns for shake/chalk cooldown
    currentRow: 4, // Start at bottom
    currentCol: 2, // Start at center
    holdsClimbed: 0,
    totalGrabs: 0, // Track all grab attempts
    successfulGrabs: 0, // Track successful grabs
    comboCount: 0, // Track consecutive successful grabs
    flowStateActive: false, // Whether flow state bonus is active
    fatiguePenalty: 0, // Penalty from shaking/chalking on bad holds (-2% per action)
    // Star challenge tracking
    climbStartTime: 0, // Timestamp when climb starts
    holdsCompletedInFlowState: 0, // Count holds grabbed while in flow state
    shakesUsed: 0, // Count shake uses
    chalksUsed: 0, // Count chalk uses
    chalkRemaining: 5, // Chalk uses remaining this climb
    maxChalk: 5, // Maximum chalk uses per climb
    routeAttempts: 0, // Track attempts on current route
    totalHoldsInRoute: 0, // Total holds that should exist in this route
    holdsGenerated: 0, // How many holds have been generated so far
    restHoldIndices: [], // Which hold indices should be rest holds
    grid: [] // 5x5 grid
};

// Location names
const locationNames = [
    "Boulder Garden", "Crimp Canyon", "Overhang Alley", "Slab Valley", "Jug Junction",
    "Pinch Peak", "Pocket Paradise", "Steep Street", "Face City", "Crack Corner",
    "Arete Avenue", "Traverse Town", "Dyno District", "Rest Ridge", "Pump Plaza",
    "Grip Gorge", "Chalk Cliff", "Shake Summit", "Power Point", "Tech Tower",
    "Endurance End", "Speed Sector", "Flow Falls", "Crispy Crag", "The Sanctuary"
];

// Define location modifiers (environmental effects)
const locationModifiers = [
    { name: "Polished Holds", effect: "Heavy use: +15% grip loss", gripMult: 1.15 },
    { name: "Overhang Wall", effect: "Steep: +15% pump on moves", pumpMult: 1.15 },
    { name: "Slab Climbing", effect: "Low angle: -10% pump on moves", pumpMult: 0.9 },
    { name: "Humid Climate", effect: "Sweaty: +5 grip cost per move", gripCost: 5 },
    { name: "Desert Heat", effect: "Hot & dry: +15% pump gain", pumpMult: 1.15 },
    { name: "Windy Exposure", effect: "Gusts: -5% success on far moves", farPenalty: 0.05 },
    { name: "Sharp Limestone", effect: "Crimps: +5% success", crimpBonus: 0.05 },
    { name: "Smooth Granite", effect: "Slopers: +5% success", sloperBonus: 0.05 },
    { name: "Textured Sandstone", effect: "Pinches: +5% success", pinchBonus: 0.05 },
    { name: "Pocketed Rock", effect: "Pockets: +5% success", pocketBonus: 0.05 },
    { name: "Cold Weather", effect: "Crisp air: Better grip recovery", gripRecovery: 5 },
    { name: "Cool & Dry", effect: "Comfortable: -10% grip loss", gripMult: 0.9 },
    { name: "Morning Dew", effect: "Slippery: +10% grip loss", gripMult: 1.1 },
    { name: "Perfect Conditions", effect: "Ideal: +3% success all holds", allBonus: 0.03 }
];

// Generate 25 locations (5x5 grid)
const locations = [];
for (let i = 0; i < 25; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    
    // Determine difficulty tier based on position
    let difficultyTier;
    if (row === 0 || col === 0) difficultyTier = 'easy';
    else if (row <= 2 && col <= 2) difficultyTier = 'intermediate';
    else difficultyTier = 'expert';
    
    // Boss location (hidden) - place in bottom right area
    const isBoss = (row === 4 && col === 4);
    
    // Assign random modifier to each location
    const modifier = locationModifiers[Math.floor(Math.random() * locationModifiers.length)];
    
    locations.push({
        id: i,
        name: locationNames[i],
        row: row,
        col: col,
        difficultyTier: difficultyTier,
        isBoss: isBoss,
        discovered: (row === 0 && col === 0), // Start with top-left visible
        modifier: modifier,
        routes: generateRoutesForLocation(i, difficultyTier, isBoss)
    });
}

// Generate routes for a location
function generateRoutesForLocation(locationId, difficultyTier, isBoss) {
    // The Spire - special final boss location
    if (isBoss) {
        return [{
            id: 0,
            name: "The Ascension",
            difficulty: "spire",
            holdCount: 30,
            noFallZone: 15, // Death after this hold
            bossRoute: true,
            hasLoot: true, // Boss routes always have loot
            difficultyMultiplier: 1.5 // Harder holds
        }];
    }
    
    const routeCount = 3; // Fixed at 3 regular routes
    const routes = [];
    
    // Pick one random route to have loot (not the boss route)
    const lootRouteIndex = Math.floor(Math.random() * routeCount);
    
    const routePrefixes = ["Warm-up", "Classic", "Tricky", "Technical", "Power", "Endurance", "Overhung", "Delicate"];
    const routeSuffixes = ["Wall", "Route", "Problem", "Line", "Crack", "Face", "Corner", "Traverse"];
    
    for (let i = 0; i < routeCount; i++) {
        let difficulty, holdCount, difficultyMultiplier;
        
        if (difficultyTier === 'easy') {
            difficulty = i < 2 ? 'easy' : 'intermediate';
            holdCount = 6 + Math.floor(Math.random() * 4); // 6-9
            difficultyMultiplier = difficulty === 'easy' ? 0.8 : 1.0;
        } else if (difficultyTier === 'intermediate') {
            difficulty = i === 0 ? 'easy' : (i < 3 ? 'intermediate' : 'expert');
            holdCount = 8 + Math.floor(Math.random() * 5); // 8-12
            difficultyMultiplier = difficulty === 'easy' ? 0.8 : (difficulty === 'intermediate' ? 1.0 : 1.2);
        } else {
            difficulty = i === 0 ? 'intermediate' : 'expert';
            holdCount = 10 + Math.floor(Math.random() * 6); // 10-15
            difficultyMultiplier = difficulty === 'intermediate' ? 1.0 : 1.3;
        }
        
        const prefix = routePrefixes[Math.floor(Math.random() * routePrefixes.length)];
        const suffix = routeSuffixes[Math.floor(Math.random() * routeSuffixes.length)];
        
        // Determine terrain type (slab, vertical, overhang)
        const terrainRoll = Math.random();
        let terrain = 'vertical';
        if (terrainRoll < 0.25) terrain = 'slab';
        else if (terrainRoll > 0.75) terrain = 'overhang';
        
        routes.push({
            id: i,
            name: `${prefix} ${suffix}`,
            difficulty: difficulty,
            holdCount: holdCount,
            difficultyMultiplier: difficultyMultiplier,
            terrain: terrain, // 'slab', 'vertical', 'overhang'
            hasLoot: (i === lootRouteIndex) // One route has loot
        });
    }
    
    // Add boss route (Project) as 4th route for non-Spire locations
    const projectNames = ["The Project", "King Line", "Test Piece", "Crown Jewel", "The Crux"];
    const projectName = projectNames[Math.floor(Math.random() * projectNames.length)];
    
    routes.push({
        id: 3,
        name: projectName,
        difficulty: "project",
        holdCount: 20,
        noFallZone: 12, // Death after hold 12
        bossRoute: true,
        hasLoot: true, // Boss routes always have loot
        difficultyMultiplier: 1.4,
        terrain: 'overhang' // Boss routes are always overhangs
    });
    
    return routes;
}

// Calculate total stars earned across all completed routes
function calculateTotalStars() {
    let total = 0;
    Object.values(gameState.completedRoutes).forEach(route => {
        total += route.stars || 0;
    });
    return total;
}

// Calculate stars earned at a specific location
function calculateLocationStars(locationId) {
    let total = 0;
    Object.keys(gameState.completedRoutes).forEach(routeKey => {
        // routeKey format: "locationId-routeId"
        const [locId, routeId] = routeKey.split('-').map(Number);
        if (locId === locationId) {
            total += gameState.completedRoutes[routeKey].stars || 0;
        }
    });
    return total;
}

// Check if location should be unlocked based on adjacent location stars
function isLocationUnlocked(location) {
    // Starting location always unlocked
    if (location.row === 0 && location.col === 0) return true;
    
    // If already discovered, keep it
    if (location.discovered) return true;
    
    // Check if any orthogonally adjacent location has 8+ stars
    const adjacentOffsets = [
        [-1, 0], [1, 0], [0, -1], [0, 1] // only orthogonal (no diagonals)
    ];
    
    for (const [dr, dc] of adjacentOffsets) {
        const adjRow = location.row + dr;
        const adjCol = location.col + dc;
        
        if (adjRow >= 0 && adjRow < 5 && adjCol >= 0 && adjCol < 5) {
            const adjLocation = locations[adjRow * 5 + adjCol];
            const adjStars = calculateLocationStars(adjLocation.id);
            
            if (adjStars >= 8) {
                return true; // Adjacent location has 8+ stars
            }
        }
    }
    
    return false;
}

// Calculate hold difficulty using GDD formula
// Generate hold difficulty using GDD formula
// easinessBias: 0 = random across full range, 1 = heavily biased toward easy end
function generateHoldDifficulty(holdType, routeDifficultyMultiplier = 1.0, easinessBias = 0) {
    // Generate random values within the hold type's ranges
    // With easiness bias, we skew the random toward the MAX values (which = easier holds)
    
    // Helper function to generate biased random
    // bias of 0 = uniform random, bias of 1 = heavily weighted toward max
    function biasedRandom(min, max, bias) {
        if (bias <= 0) {
            return min + Math.random() * (max - min);
        }
        // Use power function to bias toward max
        // With bias = 0.9, power ≈ 0.26, so random 0.5 → 0.84
        // This means most values will be in top 30% of range
        const power = 1 / (1 + bias * 3); // More aggressive: *3 instead of *2
        const rand = Math.pow(Math.random(), power);
        return min + rand * (max - min);
    }
    
    const depth = biasedRandom(holdType.depthMin, holdType.depthMax, easinessBias);
    const angle = biasedRandom(holdType.angleMin, holdType.angleMax, easinessBias);
    const texture = biasedRandom(holdType.textureMin, holdType.textureMax, easinessBias);
    const width = biasedRandom(holdType.widthMin, holdType.widthMax, easinessBias);
    const matchDiff = biasedRandom(holdType.matchDiffMin, holdType.matchDiffMax, easinessBias);
    
    // GDD formula: angle × depth × texture × width × matchDifficulty
    let rawDifficulty = angle * depth * texture * width * matchDiff;
    
    // Apply route difficulty multiplier (makes harder routes have worse holds)
    // Lower multiplier = easier holds, higher = harder holds
    if (routeDifficultyMultiplier > 1.0) {
        // Harder route: reduce success chance
        rawDifficulty *= (2.0 - routeDifficultyMultiplier);
    } else if (routeDifficultyMultiplier < 1.0) {
        // Easier route: boost success chance toward max
        rawDifficulty = rawDifficulty + (1.0 - rawDifficulty) * (1.0 - routeDifficultyMultiplier) * 0.5;
    }
    
    // For easy locations (high easinessBias), enforce minimum success rates
    // This ensures holds in easy areas aren't frustratingly hard
    if (easinessBias >= 0.8) {
        // Easy location minimum: at least 45% success for all holds
        rawDifficulty = Math.max(0.45, rawDifficulty);
    } else if (easinessBias >= 0.5) {
        // Intermediate location minimum: at least 30% success
        rawDifficulty = Math.max(0.30, rawDifficulty);
    }
    
    return Math.max(0.05, Math.min(0.99, rawDifficulty)); // Clamp between 5% and 99%
}

