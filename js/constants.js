const holdTypes = [
    { type: 'jug',       label: 'JUG',    basePumpRating: 1, baseGripDrain: 1, color: '#a8db60' },
    { type: 'crimp',     label: 'CRIMP',   basePumpRating: 4, baseGripDrain: 2, color: '#f5aaa2' },
    { type: 'sloper',    label: 'SLOPER',  basePumpRating: 3, baseGripDrain: 5, color: '#6dbce3' },
    { type: 'pinch',     label: 'PINCH',   basePumpRating: 3, baseGripDrain: 3, color: '#fad882' },
    { type: 'pocket',    label: 'POCKET',  basePumpRating: 3, baseGripDrain: 2, color: '#c178de' },
    { type: 'edge',      label: 'EDGE',    basePumpRating: 3, baseGripDrain: 2, color: '#738078' },
    { type: 'undercling', label: 'UNDER',  basePumpRating: 4, baseGripDrain: 2, color: '#b06758' }
];

// ============ PUMP/GRIP SEPARATION SYSTEM ============

// HAND-HOLD PUMP MODIFIERS
// Maps (holdType, hand, angle) → pump modifier
// Pump represents muscular cost - affected by which hand grabs which hold
const HAND_HOLD_PUMP_RAW = [
    // Jugs - minimal hand preference (easy for both hands)
    ['jug', 'L', 0, 0], ['jug', 'R', 0, 0],
    ['jug', 'L', 45, 0], ['jug', 'R', 45, 0],
    ['jug', 'L', 90, 0], ['jug', 'R', 90, 0],
    ['jug', 'L', 135, 0], ['jug', 'R', 135, 0],
    ['jug', 'L', 180, 0], ['jug', 'R', 180, 0],
    ['jug', 'L', 225, 0], ['jug', 'R', 225, 0],
    ['jug', 'L', 270, 0], ['jug', 'R', 270, 0],
    ['jug', 'L', 315, 0], ['jug', 'R', 315, 0],

    // Crimps - significant hand-angle interaction (hard when mis-matched)
    ['crimp', 'L', 0, 0], ['crimp', 'R', 0, 0],
    ['crimp', 'L', 45, 1], ['crimp', 'R', 45, 0],  // Right hand easier on left-facing
    ['crimp', 'L', 90, 1], ['crimp', 'R', 90, 0],
    ['crimp', 'L', 135, 1], ['crimp', 'R', 135, 0],
    ['crimp', 'L', 180, 0], ['crimp', 'R', 180, 0],
    ['crimp', 'L', 225, 0], ['crimp', 'R', 225, 1], // Left hand easier on right-facing
    ['crimp', 'L', 270, 0], ['crimp', 'R', 270, 1],
    ['crimp', 'L', 315, 0], ['crimp', 'R', 315, 1],

    // Slopers - moderate hand preference
    ['sloper', 'L', 0, 0], ['sloper', 'R', 0, 0],
    ['sloper', 'L', 45, 1], ['sloper', 'R', 45, 0],
    ['sloper', 'L', 90, 1], ['sloper', 'R', 90, 0],
    ['sloper', 'L', 135, 1], ['sloper', 'R', 135, 0],
    ['sloper', 'L', 180, 0], ['sloper', 'R', 180, 0],
    ['sloper', 'L', 225, 0], ['sloper', 'R', 225, 1],
    ['sloper', 'L', 270, 0], ['sloper', 'R', 270, 1],
    ['sloper', 'L', 315, 0], ['sloper', 'R', 315, 1],

    // Pinches, Pockets, Edges - moderate hand preference
    ['pinch', 'L', 0, 0], ['pinch', 'R', 0, 0],
    ['pinch', 'L', 45, 1], ['pinch', 'R', 45, 0],
    ['pinch', 'L', 90, 1], ['pinch', 'R', 90, 0],
    ['pinch', 'L', 135, 1], ['pinch', 'R', 135, 0],
    ['pinch', 'L', 180, 0], ['pinch', 'R', 180, 0],
    ['pinch', 'L', 225, 0], ['pinch', 'R', 225, 1],
    ['pinch', 'L', 270, 0], ['pinch', 'R', 270, 1],
    ['pinch', 'L', 315, 0], ['pinch', 'R', 315, 1],

    ['pocket', 'L', 0, 0], ['pocket', 'R', 0, 0],
    ['pocket', 'L', 45, 1], ['pocket', 'R', 45, 0],
    ['pocket', 'L', 90, 1], ['pocket', 'R', 90, 0],
    ['pocket', 'L', 135, 1], ['pocket', 'R', 135, 0],
    ['pocket', 'L', 180, 0], ['pocket', 'R', 180, 0],
    ['pocket', 'L', 225, 0], ['pocket', 'R', 225, 1],
    ['pocket', 'L', 270, 0], ['pocket', 'R', 270, 1],
    ['pocket', 'L', 315, 0], ['pocket', 'R', 315, 1],

    ['edge', 'L', 0, 0], ['edge', 'R', 0, 0],
    ['edge', 'L', 45, 1], ['edge', 'R', 45, 0],
    ['edge', 'L', 90, 1], ['edge', 'R', 90, 0],
    ['edge', 'L', 135, 1], ['edge', 'R', 135, 0],
    ['edge', 'L', 180, 0], ['edge', 'R', 180, 0],
    ['edge', 'L', 225, 0], ['edge', 'R', 225, 1],
    ['edge', 'L', 270, 0], ['edge', 'R', 270, 1],
    ['edge', 'L', 315, 0], ['edge', 'R', 315, 1],

    // Underclings - hand dependent
    ['undercling', 'L', 0, 0], ['undercling', 'R', 0, 0],
    ['undercling', 'L', 45, 1], ['undercling', 'R', 45, 0],
    ['undercling', 'L', 90, 1], ['undercling', 'R', 90, 0],
    ['undercling', 'L', 135, 1], ['undercling', 'R', 135, 0],
    ['undercling', 'L', 180, 0], ['undercling', 'R', 180, 0],
    ['undercling', 'L', 225, 0], ['undercling', 'R', 225, 1],
    ['undercling', 'L', 270, 0], ['undercling', 'R', 270, 1],
    ['undercling', 'L', 315, 0], ['undercling', 'R', 315, 1],
];

// Build O(1) lookup map for hand-hold pump
const HAND_HOLD_PUMP_MAP = new Map();
HAND_HOLD_PUMP_RAW.forEach(entry => {
    const key = `${entry[0]}-${entry[1]}-${entry[2]}`;
    HAND_HOLD_PUMP_MAP.set(key, entry[3]);
});

// WEIGHT-DIRECTION GRIP MODIFIERS
// Maps (weight, direction, angle) → grip modifier (+0 or +1)
// 0 = good/neutral weight position, 1 = bad weight position (+1 extra grip drain)
const WEIGHT_DIRECTION_GRIP_RAW = [
    // UP - straight up movement
    ['L', 'up', 0, 0], ['C', 'up', 0, 0], ['R', 'up', 0, 0],
    ['L', 'up', 45, 0], ['C', 'up', 45, 0], ['R', 'up', 45, 1],
    ['L', 'up', 90, 0], ['C', 'up', 90, 1], ['R', 'up', 90, 1],
    ['L', 'up', 135, 0], ['C', 'up', 135, 1], ['R', 'up', 135, 1],
    ['L', 'up', 180, 0], ['C', 'up', 180, 0], ['R', 'up', 180, 0],
    ['L', 'up', 225, 1], ['C', 'up', 225, 1], ['R', 'up', 225, 0],
    ['L', 'up', 270, 1], ['C', 'up', 270, 1], ['R', 'up', 270, 0],
    ['L', 'up', 315, 1], ['C', 'up', 315, 0], ['R', 'up', 315, 0],

    // UP-LEFT - diagonal left movement
    ['L', 'up-left', 0, 0], ['C', 'up-left', 0, 0], ['R', 'up-left', 0, 1],
    ['L', 'up-left', 45, 0], ['C', 'up-left', 45, 0], ['R', 'up-left', 45, 1],
    ['L', 'up-left', 90, 0], ['C', 'up-left', 90, 1], ['R', 'up-left', 90, 1],
    ['L', 'up-left', 135, 0], ['C', 'up-left', 135, 1], ['R', 'up-left', 135, 1],
    ['L', 'up-left', 180, 1], ['C', 'up-left', 180, 1], ['R', 'up-left', 180, 1],
    ['L', 'up-left', 225, 1], ['C', 'up-left', 225, 0], ['R', 'up-left', 225, 1],
    ['L', 'up-left', 270, 1], ['C', 'up-left', 270, 0], ['R', 'up-left', 270, 0],
    ['L', 'up-left', 315, 1], ['C', 'up-left', 315, 0], ['R', 'up-left', 315, 0],

    // UP-RIGHT - diagonal right movement
    ['L', 'up-right', 0, 1], ['C', 'up-right', 0, 0], ['R', 'up-right', 0, 0],
    ['L', 'up-right', 45, 0], ['C', 'up-right', 45, 0], ['R', 'up-right', 45, 0],
    ['L', 'up-right', 90, 0], ['C', 'up-right', 90, 0], ['R', 'up-right', 90, 0],
    ['L', 'up-right', 135, 1], ['C', 'up-right', 135, 0], ['R', 'up-right', 135, 0],
    ['L', 'up-right', 180, 1], ['C', 'up-right', 180, 1], ['R', 'up-right', 180, 1],
    ['L', 'up-right', 225, 1], ['C', 'up-right', 225, 1], ['R', 'up-right', 225, 1],
    ['L', 'up-right', 270, 1], ['C', 'up-right', 270, 1], ['R', 'up-right', 270, 0],
    ['L', 'up-right', 315, 1], ['C', 'up-right', 315, 0], ['R', 'up-right', 315, 0],
];

// Build O(1) lookup map for weight-direction grip
const WEIGHT_DIRECTION_GRIP_MAP = new Map();
WEIGHT_DIRECTION_GRIP_RAW.forEach(entry => {
    const key = `${entry[0]}-${entry[1]}-${entry[2]}`;
    WEIGHT_DIRECTION_GRIP_MAP.set(key, entry[3]);
});

// Helper function to get hand-hold pump modifier
function getHandHoldPumpModifier(holdType, hand, angle) {
    const normalized = normalizeAngle(angle);
    const handCode = hand === 'left' ? 'L' : 'R';
    const key = `${holdType}-${handCode}-${normalized}`;
    return HAND_HOLD_PUMP_MAP.get(key) || 0;
}

// Helper function to get weight-direction grip modifier (+0 or +1)
function getWeightDirectionGripModifier(weight, direction, angle) {
    const normalized = normalizeAngle(angle);
    const weightCode = weight === 'left' ? 'L' : weight === 'right' ? 'R' : 'C';
    const key = `${weightCode}-${direction}-${normalized}`;
    return WEIGHT_DIRECTION_GRIP_MAP.get(key) || 0;
}

// Normalize any angle to nearest 45-degree increment (0, 45, 90, ..., 315)
function normalizeAngle(angle) {
    // Handle negative angles
    let a = ((angle % 360) + 360) % 360;
    // Round to nearest 45
    return Math.round(a / 45) * 45 % 360;
}

// ============ PHASE 14: Equipment Database ============
// Complete gear table with all rarities
const gearDatabase = {
    // === COMMON GEAR (15 items) ===
    'common_shoes_basic': {
        id: 'common_shoes_basic',
        name: 'Basic Climbing Shoes',
        slot: 'shoes',
        rarity: 'common',
        modifiers: {
            holdBonus: { jug: 0.02, edge: 0.02 },
            gripLossReduction: 0.03
        }
    },
    'common_chalk_standard': {
        id: 'common_chalk_standard',
        name: 'Standard Chalk Bag',
        slot: 'chalkBag',
        rarity: 'common',
        modifiers: {
            chalkGripBonus: 0.05,
            chalkCooldownReduction: 1
        }
    },
    'common_helmet_light': {
        id: 'common_helmet_light',
        name: 'Lightweight Helmet',
        slot: 'helmet',
        rarity: 'common',
        modifiers: {
            fallCatchChance: 0.05,
            maxEnergyBonus: 1
        }
    },
    'common_harness_basic': {
        id: 'common_harness_basic',
        name: 'Basic Harness',
        slot: 'harness',
        rarity: 'common',
        modifiers: {
            pumpGainReduction: 0.02,
            shakeEffectiveness: 0.05,
            maxEnergyBonus: 1
        }
    },
    'common_tape_finger': {
        id: 'common_tape_finger',
        name: 'Finger Tape',
        slot: 'gloves',
        rarity: 'common',
        modifiers: {
            holdBonus: { crimp: 0.03 },
            gripDegradationReduction: { crimp: 0.05 }
        }
    },
    'common_clothing_breathable': {
        id: 'common_clothing_breathable',
        name: 'Breathable Shirt',
        slot: 'clothing',
        rarity: 'common',
        modifiers: {
            hotWeatherPumpReduction: 0.15,
            humidWeatherGripReduction: 0.10
        }
    },
    'common_food_bar': {
        id: 'common_food_bar',
        name: 'Energy Bar',
        slot: 'food',
        rarity: 'common',
        modifiers: {
            maxPumpBonus: 10,
            maxGripBonus: 5,
            climbsBeforeTimeBonus: 1
        }
    },
    'common_brush_boar': {
        id: 'common_brush_boar',
        name: "Boar's Hair Brush",
        slot: 'brush',
        rarity: 'common',
        modifiers: {
            familiarHoldBonus: 0.02,
            holdDegradationReduction: 0.10
        }
    },
    'common_guidebook_pocket': {
        id: 'common_guidebook_pocket',
        name: 'Pocket Guidebook',
        slot: 'guidebook',
        rarity: 'common',
        modifiers: {
            familiarityBonusPerGrab: 0.01,
            xpBonus: 0.05
        }
    },
    'common_watch_digital': {
        id: 'common_watch_digital',
        name: 'Digital Watch',
        slot: 'watch',
        rarity: 'common',
        modifiers: {
            shakeCooldownReduction: 1,
            speedStarBonus: 3
        }
    },
    'common_shoes_approach': {
        id: 'common_shoes_approach',
        name: 'Approach Shoes',
        slot: 'shoes',
        rarity: 'common',
        modifiers: {
            holdBonus: { sloper: 0.03, edge: 0.02 }
        }
    },
    'common_gloves_cotton': {
        id: 'common_gloves_cotton',
        name: 'Cotton Gloves',
        slot: 'gloves',
        rarity: 'common',
        modifiers: {
            coldWeatherReduction: 0.15,
            holdBonus: { jug: 0.05, crimp: -0.02 },
            gripLossReduction: 0.05
        }
    },
    'common_clothing_windbreaker': {
        id: 'common_clothing_windbreaker',
        name: 'Windbreaker Jacket',
        slot: 'clothing',
        rarity: 'common',
        modifiers: {
            windPumpReduction: 0.20,
            dynamicPumpReduction: 0.03
        }
    },
    'common_harness_clip': {
        id: 'common_harness_clip',
        name: 'Carabiner Clip',
        slot: 'harness',
        rarity: 'common',
        modifiers: {
            energyCostReduction: 0.1,
            fallXpBonus: 0.10
        }
    },
    'common_clothing_pants': {
        id: 'common_clothing_pants',
        name: 'Climbing Pants',
        slot: 'clothing',
        rarity: 'common',
        modifiers: {
            pumpGainReduction: 0.02,
            highStepBonus: 0.03
        }
    },
    
    // === UNCOMMON GEAR (12 items) ===
    'uncommon_shoes_aggressive': {
        id: 'uncommon_shoes_aggressive',
        name: 'Aggressive Climbing Shoes',
        slot: 'shoes',
        rarity: 'uncommon',
        modifiers: {
            holdBonus: { crimp: 0.05, edge: 0.04, pocket: 0.03 },
            gripLossReduction: 0.05
        }
    },
    'uncommon_chalk_premium': {
        id: 'uncommon_chalk_premium',
        name: 'Premium Chalk Bag',
        slot: 'chalkBag',
        rarity: 'uncommon',
        modifiers: {
            chalkGripBonus: 0.10,
            chalkCooldownReduction: 2,
            fatiguePenaltyReduction: 1,
            lowGripBonus: 0.03
        }
    },
    'uncommon_helmet_reinforced': {
        id: 'uncommon_helmet_reinforced',
        name: 'Reinforced Helmet',
        slot: 'helmet',
        rarity: 'uncommon',
        modifiers: {
            fallCatchChance: 0.10,
            maxEnergyBonus: 2,
            cruxBonus: 0.05
        }
    },
    'uncommon_harness_padded': {
        id: 'uncommon_harness_padded',
        name: 'Padded Harness',
        slot: 'harness',
        rarity: 'uncommon',
        modifiers: {
            pumpGainReduction: 0.04,
            shakeEffectiveness: 0.10,
            maxEnergyBonus: 2,
            retryPumpGripKeep: 0.20
        }
    },
    'uncommon_gloves_full': {
        id: 'uncommon_gloves_full',
        name: 'Full-Finger Gloves',
        slot: 'gloves',
        rarity: 'uncommon',
        modifiers: {
            holdBonus: { crimp: 0.05, edge: 0.04 },
            gripDegradationReduction: { crimp: 0.10 },
            coldWeatherReduction: 0.20
        }
    },
    'uncommon_clothing_moisture': {
        id: 'uncommon_clothing_moisture',
        name: 'Moisture-Wicking Top',
        slot: 'clothing',
        rarity: 'uncommon',
        modifiers: {
            hotWeatherPumpReduction: 0.25,
            humidWeatherGripReduction: 0.20,
            pumpGainReduction: 0.03
        }
    },
    'uncommon_food_gel': {
        id: 'uncommon_food_gel',
        name: 'Energy Gel Pack',
        slot: 'food',
        rarity: 'uncommon',
        modifiers: {
            maxPumpBonus: 15,
            maxGripBonus: 10,
            climbsBeforeTimeBonus: 2,
            routeCompletionEnergyBonus: 1
        }
    },
    'uncommon_brush_wire': {
        id: 'uncommon_brush_wire',
        name: 'Wire Brush',
        slot: 'brush',
        rarity: 'uncommon',
        modifiers: {
            familiarHoldBonus: 0.04,
            holdDegradationReduction: 0.20,
            chalkCleanBonus: 0.02
        }
    },
    'uncommon_guidebook_annotated': {
        id: 'uncommon_guidebook_annotated',
        name: 'Annotated Guidebook',
        slot: 'guidebook',
        rarity: 'uncommon',
        modifiers: {
            familiarityBonusPerGrab: 0.02,
            xpBonus: 0.10,
            firstGrabXpBonus: 0.15,
            familiarityCapBonus: 0.05
        }
    },
    'uncommon_watch_chrono': {
        id: 'uncommon_watch_chrono',
        name: 'Chronograph Watch',
        slot: 'watch',
        rarity: 'uncommon',
        modifiers: {
            shakeCooldownReduction: 2,
            chalkCooldownReduction: 1,
            speedStarBonus: 5
        }
    },
    'uncommon_shoes_smearing': {
        id: 'uncommon_shoes_smearing',
        name: 'Smearing Shoes',
        slot: 'shoes',
        rarity: 'uncommon',
        modifiers: {
            holdBonus: { sloper: 0.06, edge: 0.05 },
            staticBonus: 0.05
        }
    },
    'uncommon_gloves_belay': {
        id: 'uncommon_gloves_belay',
        name: 'Belay Gloves',
        slot: 'gloves',
        rarity: 'uncommon',
        modifiers: {
            fallCatchChance: 0.15,
            gripLossReduction: 0.08,
            holdBonus: { jug: 0.04 }
        }
    },
    
    // === RARE GEAR (10 items) ===
    'rare_shoes_competition': {
        id: 'rare_shoes_competition',
        name: 'Competition Climbing Shoes',
        slot: 'shoes',
        rarity: 'rare',
        modifiers: {
            holdBonus: { crimp: 0.08, edge: 0.06, pocket: 0.06 },
            dynamicBonus: 0.08,
            gripLossReduction: 0.10
        }
    },
    'rare_chalk_magnesium': {
        id: 'rare_chalk_magnesium',
        name: 'Magnesium Chalk Bag',
        slot: 'chalkBag',
        rarity: 'rare',
        modifiers: {
            chalkGripBonus: 0.15,
            chalkCooldownReduction: 3,
            fatiguePenaltyReduction: 2,
            lowGripBonus: 0.05,
            chalkPumpReduction: 5,
            humidWeatherGripReduction: 0.30
        }
    },
    'rare_helmet_carbon': {
        id: 'rare_helmet_carbon',
        name: 'Carbon Fiber Helmet',
        slot: 'helmet',
        rarity: 'rare',
        modifiers: {
            fallCatchChance: 0.20,
            maxEnergyBonus: 3,
            cruxBonus: 0.08,
            upperRouteBonus: 0.05,
            highPumpBonus: 0.10
        }
    },
    'rare_harness_technical': {
        id: 'rare_harness_technical',
        name: 'Technical Harness',
        slot: 'harness',
        rarity: 'rare',
        modifiers: {
            pumpGainReduction: 0.06,
            shakeEffectiveness: 0.15,
            maxEnergyBonus: 3,
            retryPumpGripKeep: 0.40,
            energyCostReduction: 0.2,
            crossBodyPumpReduction: 0.05
        }
    },
    'rare_gloves_crack': {
        id: 'rare_gloves_crack',
        name: 'Crack Gloves',
        slot: 'gloves',
        rarity: 'rare',
        modifiers: {
            holdBonus: { crimp: 0.08, edge: 0.07, pocket: 0.06 },
            gripDegradationReduction: { all: 0.15 },
            coldWeatherReduction: 0.30
        }
    },
    'rare_clothing_allseason': {
        id: 'rare_clothing_allseason',
        name: 'All-Season Climbing Jacket',
        slot: 'clothing',
        rarity: 'rare',
        modifiers: {
            hotWeatherPumpReduction: 0.35,
            humidWeatherGripReduction: 0.30,
            windPumpReduction: 0.30,
            pumpGainReduction: 0.05,
            coldWeatherReduction: 0.25
        }
    },
    'rare_food_performance': {
        id: 'rare_food_performance',
        name: 'Performance Nutrition Pack',
        slot: 'food',
        rarity: 'rare',
        modifiers: {
            maxPumpBonus: 25,
            maxGripBonus: 15,
            climbsBeforeTimeBonus: 3,
            routeCompletionEnergyBonus: 2,
            xpBonus: 0.15,
            startingGripBonus: 10
        }
    },
    'rare_brush_diamond': {
        id: 'rare_brush_diamond',
        name: 'Diamond Brush',
        slot: 'brush',
        rarity: 'rare',
        modifiers: {
            familiarHoldBonus: 0.06,
            holdDegradationReduction: 0.30,
            chalkCleanBonus: 0.04,
            familiarityKickInFaster: 1,
            matchableBonus: 0.03
        }
    },
    'rare_guidebook_master': {
        id: 'rare_guidebook_master',
        name: "Master's Guidebook",
        slot: 'guidebook',
        rarity: 'rare',
        modifiers: {
            familiarityBonusPerGrab: 0.03,
            xpBonus: 0.20,
            firstGrabXpBonus: 0.25,
            familiarityCapBonus: 0.10,
            flashXpBonus: 0.15,
            comboThresholdReduction: 1
        }
    },
    'rare_watch_precision': {
        id: 'rare_watch_precision',
        name: 'Precision Timer',
        slot: 'watch',
        rarity: 'rare',
        modifiers: {
            shakeCooldownReduction: 3,
            chalkCooldownReduction: 2,
            speedStarBonus: 8,
            staticCooldownReduction: 1,
            dynamicCooldownReduction: 1
        }
    },
    
    // === EXQUISITE GEAR (8 items) ===
    'exquisite_shoes_spider': {
        id: 'exquisite_shoes_spider',
        name: 'Ethereal Spider Silk Shoes',
        slot: 'shoes',
        rarity: 'exquisite',
        modifiers: {
            holdBonus: { crimp: 0.12, edge: 0.10, sloper: 0.10 },
            dynamicBonus: 0.12,
            staticBonus: 0.08,
            gripLossReduction: 0.15,
            dynamicDistanceReduction: 1 // Works on distance ≥1
        },
        corePerk: {
            name: "Gecko Grip",
            description: "15% chance per move: automatic success regardless of roll"
        }
    },
    'exquisite_chalk_alchemist': {
        id: 'exquisite_chalk_alchemist',
        name: "Alchemist's Chalk Pouch",
        slot: 'chalkBag',
        rarity: 'exquisite',
        modifiers: {
            chalkGripBonus: 0.25,
            chalkCooldownReduction: 4,
            noFatiguePenalty: true,
            lowGripBonus: 0.08,
            chalkPumpReduction: 15,
            humidWeatherGripReduction: 0.50,
            postChalkBonus: 0.05
        },
        corePerk: {
            name: "Chalk Cloud",
            description: "First hold after chalking is automatic success, next 2 holds get +15% bonus"
        }
    },
    'exquisite_helmet_guardian': {
        id: 'exquisite_helmet_guardian',
        name: "Guardian's Crown",
        slot: 'helmet',
        rarity: 'exquisite',
        modifiers: {
            fallCatchChance: 0.35,
            maxEnergyBonus: 5,
            cruxBonus: 0.12,
            upperRouteBonus: 0.10,
            highPumpBonus: 0.15,
            lowGripBonus: 0.10,
            seeCruxBeforeClimbing: true
        },
        corePerk: {
            name: "Last Stand",
            description: "Once per route when you would fall: restore 30 pump and 30 grip, +20% success for next 3 holds"
        }
    },
    'exquisite_harness_ascendant': {
        id: 'exquisite_harness_ascendant',
        name: "Ascendant's Harness",
        slot: 'harness',
        rarity: 'exquisite',
        modifiers: {
            pumpGainReduction: 0.10,
            shakeEffectiveness: 0.25,
            maxEnergyBonus: 5,
            retryPumpGripKeep: 0.60,
            energyCostReduction: 0.3,
            crossBodyPumpReduction: 0.08,
            noCrossBodyPenalty: true
        },
        corePerk: {
            name: "Endless Endurance",
            description: "When pump maxes: gain 4 moves of pump invulnerability, then pump resets to 50"
        }
    },
    'exquisite_gloves_dragon': {
        id: 'exquisite_gloves_dragon',
        name: 'Dragonscale Gloves',
        slot: 'gloves',
        rarity: 'exquisite',
        modifiers: {
            holdBonus: { crimp: 0.12, edge: 0.10, pinch: 0.08 },
            gripDegradationReduction: { all: 0.20 },
            coldWeatherReduction: 0.40,
            crimpSloperGripReduction: 0.50
        },
        corePerk: {
            name: "Iron Grip",
            description: "25% chance per move to negate ALL grip loss, on proc next move gets +10% success"
        }
    },
    'exquisite_clothing_chameleon': {
        id: 'exquisite_clothing_chameleon',
        name: 'Chameleon Cloak',
        slot: 'clothing',
        rarity: 'exquisite',
        modifiers: {
            hotWeatherPumpReduction: 0.50,
            humidWeatherGripReduction: 0.50,
            windPumpReduction: 0.50,
            pumpGainReduction: 0.08,
            coldWeatherReduction: 0.40,
            favorableWeatherBonus: 0.05
        },
        corePerk: {
            name: "Weatherproof",
            description: "All weather penalties become bonuses instead"
        }
    },
    'exquisite_food_elixir': {
        id: 'exquisite_food_elixir',
        name: 'Elixir of Eternal Stamina',
        slot: 'food',
        rarity: 'exquisite',
        modifiers: {
            maxPumpBonus: 40,
            maxGripBonus: 25,
            climbsBeforeTimeBonus: 5,
            routeCompletionEnergyBonus: 3,
            xpBonus: 0.25,
            startingGripBonus: 20,
            pumpGainReduction: 0.05
        },
        corePerk: {
            name: "Second Wind",
            description: "Complete route with pump >80%: permanently gain +5 max pump"
        }
    },
    'exquisite_guidebook_sage': {
        id: 'exquisite_guidebook_sage',
        name: "Sage's Tome of Routes",
        slot: 'guidebook',
        rarity: 'exquisite',
        modifiers: {
            familiarityBonusPerGrab: 0.05,
            xpBonus: 0.30,
            firstGrabXpBonus: 0.40,
            familiarityCapBonus: 0.15,
            flashXpBonus: 0.30,
            comboThresholdReduction: 2,
            holdTypeFamiliarity: true,
            seeExactSuccess: true
        },
        corePerk: {
            name: "Route Memory",
            description: "On previously attempted routes: start with 15% bonus (increases 5% per attempt, max 30%)"
        }
    },
    
    // === LEGENDARY GEAR (5 items) ===
    'legendary_shoes_skywalker': {
        id: 'legendary_shoes_skywalker',
        name: "Skywalker's Mythical Slippers",
        slot: 'shoes',
        rarity: 'legendary',
        modifiers: {
            allHoldBonus: 0.18,
            dynamicBonus: 0.15,
            staticBonus: 0.12,
            gripLossReduction: 0.25,
            noCooldowns: true,
            staticDistanceIncrease: 2, // Works on distance ≤3
            dynamicDistanceReduction: 1, // Works on distance ≥1
            firstHoldsBonus: 0.15,
            noSidepullPenalty: true
        },
        corePerks: [
            {
                name: "Gravity Defiance",
                description: "Once per route: teleport to any visible hold within 5 spaces (auto success)"
            },
            {
                name: "Flow State Mastery",
                description: "After 3 successes: permanent +15% bonus for rest of route"
            }
        ]
    },
    'legendary_chalk_phoenix': {
        id: 'legendary_chalk_phoenix',
        name: 'Phoenix Chalk of Resurrection',
        slot: 'chalkBag',
        rarity: 'legendary',
        modifiers: {
            chalkGripBonus: 0.40,
            chalkCooldownReduction: 5,
            noFatiguePenalty: true,
            lowGripBonus: 0.15,
            chalkPumpReduction: 30,
            humidWeatherGripReduction: 0.75,
            postChalkBonus: 0.10,
            chalkGripInvulnerability: 3
        },
        corePerks: [
            {
                name: "Perfect Send",
                description: "First hold auto-succeeds and grants +25% for next 5 holds"
            },
            {
                name: "Eternal Chalk",
                description: "Chalk effects stack and persist until route end (+10% grip, +3% success per stack)"
            }
        ]
    },
    'legendary_helmet_crown': {
        id: 'legendary_helmet_crown',
        name: 'Crown of the Mountain King',
        slot: 'helmet',
        rarity: 'legendary',
        modifiers: {
            fallCatchChance: 0.50,
            maxEnergyBonus: 8,
            cruxBonus: 0.20,
            upperRouteBonus: 0.18,
            highPumpBonus: 0.25,
            lowGripBonus: 0.20,
            seeAllRouteInfo: true,
            nightBonus: 0.15,
            noFallZoneImmunity: true
        },
        corePerks: [
            {
                name: "Indomitable Will",
                description: "Twice per route when falling: restore to 80% pump/grip. After second, +30% for rest"
            },
            {
                name: "Summit Vision",
                description: "See entire route with perfect info and optimal path highlighted"
            }
        ]
    },
    'legendary_harness_atlas': {
        id: 'legendary_harness_atlas',
        name: 'Atlas Harness of Infinite Endurance',
        slot: 'harness',
        rarity: 'legendary',
        modifiers: {
            pumpGainReduction: 0.15,
            shakeEffectiveness: 0.40,
            maxEnergyBonus: 8,
            retryPumpGripKeep: 1.0,
            energyCostReduction: 0.5,
            crossBodyPumpReduction: 0.12,
            noCrossBodyPenalty: true,
            shakeCooldownReduction: 4,
            pumpThresholdBonus: 0.20
        },
        corePerks: [
            {
                name: "Boundless Energy",
                description: "Pump never exceeds 85%. Excess converts to +5% success bonus (stacks)"
            },
            {
                name: "Titan's Strength",
                description: "Every 5 successful grabs: permanently gain +2 max pump and +2 max grip"
            }
        ]
    },
    'legendary_watch_chronos': {
        id: 'legendary_watch_chronos',
        name: 'Chronos Watch of Infinite Time',
        slot: 'watch',
        rarity: 'legendary',
        modifiers: {
            allCooldownsZero: true,
            speedStarBonus: 15,
            simultaneousActions: true,
            shakeChalkEffectiveness: 0.50,
            allTimeOfDayBonuses: true,
            climbsBeforeTimeBonus: 10,
            speedRouteBonus: 0.25
        },
        corePerks: [
            {
                name: "Time Dilation",
                description: "Once per route: freeze pump/grip for 8 moves with +20% success"
            },
            {
                name: "Temporal Echo",
                description: "On failed grab: rewind and try different hold (3 uses per route)"
            }
        ]
    }
};
