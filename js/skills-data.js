// ============ SKILLS DATABASE ============
const skillDatabase = {
    // === ATHLETICS SKILLS ===
    dyno: {
        id: 'dyno',
        name: 'Dyno',
        category: 'athletics',
        maxPoints: 15,
        pointsPerRank: 3,
        description: 'Master explosive moves that skip holds and cover distance.',
        ranks: [
            { name: 'Dyno Basics', effect: 'Can skip 1 hold. +3% dynamic bonus.' },
            { name: 'Extended Reach', effect: 'Skip 2 holds. +6% dynamic bonus. -5% pump cost.' },
            { name: 'Explosive Power', effect: 'Skip 3 holds. +10% dynamic bonus. -8% pump cost. -1 cooldown.' },
            { name: 'Chain Dynos', effect: 'Skip 3 holds. +15% dynamic bonus. Doesn\'t break combo. -10% pump cost.' },
            { name: 'Gravity Defiance', effect: 'Skip 3 holds. +20% dynamic bonus. No cooldown. +5% on next hold.' }
        ]
    },
    flowState: {
        id: 'flowState',
        name: 'Flow State',
        category: 'athletics',
        maxPoints: 12,
        pointsPerRank: 3,
        description: 'Perfect concentration where success builds momentum.',
        ranks: [
            { name: 'Finding the Rhythm', effect: 'After 3 successes: +5% additional bonus (10% total).' },
            { name: 'Deeper Flow', effect: 'Trigger after 2 successes. +8% additional. Stacks +1%/grab (max +15%).' },
            { name: 'Unbreakable Focus', effect: 'Trigger after 1 success. +10% additional. Survives first fail. -3% pump.' },
            { name: 'Transcendence', effect: 'Start in flow. +20% max. -15% grip loss. Fails pause flow.' }
        ]
    },
    ironGrip: {
        id: 'ironGrip',
        name: 'Iron Grip',
        category: 'athletics',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'Vice-like fingers that reduce grip loss.',
        ranks: [
            { name: 'Strong Fingers', effect: '10% chance negate grip cost. -5% grip loss.' },
            { name: 'Steel Tendons', effect: '20% chance negate. -10% grip loss. -15% on crimps.' },
            { name: 'Unbreakable', effect: '30% chance negate. +8% success on proc. -15% grip loss. +10% max grip.' }
        ]
    },
    grit: {
        id: 'grit',
        name: 'Grit',
        category: 'athletics',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'Mental toughness to power through failures.',
        ranks: [
            { name: 'Determined', effect: '25% chance ignore failed grab.' },
            { name: 'Resilient', effect: '40% chance ignore. +8% when pump >70%.' },
            { name: 'Indomitable', effect: '50% chance. +12% pump >70%. +10% grip <40%. +5% for 2 moves on proc.' }
        ]
    },
    deadpoint: {
        id: 'deadpoint',
        name: 'Deadpoint',
        category: 'athletics',
        maxPoints: 1,
        pointsPerRank: 1,
        description: 'Perfect timing at the moment of weightlessness.',
        ranks: [
            { name: 'Perfect Timing', effect: 'After chalk: 0 pump +10% success. After shake: 0 grip +8% success.' }
        ]
    },
    kneebar: {
        id: 'kneebar',
        name: 'Kneebar Mastery',
        category: 'athletics',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'Create improvised rests using leg positions.',
        ranks: [
            { name: 'Basic Kneebar', effect: '1x/route rest. Recover 5 pump/move. 3-move cooldown.' },
            { name: 'Comfortable Rest', effect: 'Recover 8 pump + 5 grip/move. 2-move cooldown. Max 4 moves.' },
            { name: 'Perfect Position', effect: 'Recover 12 pump + 10 grip/move. 1 cooldown. +10% for 2 moves after.' }
        ]
    },
    battleCry: {
        id: 'battleCry',
        name: 'Battle Cry',
        category: 'athletics',
        maxPoints: 6,
        pointsPerRank: 3,
        description: 'A powerful yell that boosts capabilities.',
        ranks: [
            { name: "Warrior's Shout", effect: '1x/route. 5 moves: +15% success, -30% pump, +20% chalk.' },
            { name: 'Primal Roar', effect: '2x/route. 7 moves: +20% success, -40% pump, +30% chalk. Immune 1 fail.' }
        ]
    },
    precisionFootwork: {
        id: 'precisionFootwork',
        name: 'Precision Footwork',
        category: 'athletics',
        maxPoints: 12,
        pointsPerRank: 3,
        description: 'Perfect foot placement for efficiency.',
        ranks: [
            { name: 'Mindful Steps', effect: '-3% pump/move. +5% on slab routes.' },
            { name: 'Balanced Movement', effect: '-5% pump. +8% slabs. -5% cross-body pump.' },
            { name: 'Perfect Placement', effect: '-8% pump. +12% slabs. No cross penalty alternating. +5% high steps.' },
            { name: 'Silent Step Master', effect: '-12% pump. +15% slabs. Every 3rd move costs 0 pump.' }
        ]
    },
    adrenalineRush: {
        id: 'adrenalineRush',
        name: 'Adrenaline Rush',
        category: 'athletics',
        maxPoints: 1,
        pointsPerRank: 1,
        description: 'When dire, adrenaline grants supernatural ability.',
        ranks: [
            { name: 'Survival Instinct', effect: 'When pump >80% AND grip <30%: 4 moves +25%, -50% grip loss, no pump. 1x/route.' }
        ]
    },
    ambidextrous: {
        id: 'ambidextrous',
        name: 'Ambidextrous',
        category: 'athletics',
        maxPoints: 6,
        pointsPerRank: 3,
        description: 'Train both hands equally for flexibility.',
        ranks: [
            { name: 'Dual Training', effect: '-50% cross-body penalty. +3% alternating hands.' },
            { name: 'Perfect Balance', effect: 'No cross penalty. +6% alternating, -3% pump. Match freely.' }
        ]
    },
    
    // === UTILITY SKILLS ===
    efficientRecovery: {
        id: 'efficientRecovery',
        name: 'Efficient Recovery',
        category: 'utility',
        maxPoints: 15,
        pointsPerRank: 3,
        description: 'Master recovery, making chalk and shake more effective.',
        ranks: [
            { name: 'Quick Hands', effect: 'Shake/chalk cooldown -1.' },
            { name: 'Practiced Technique', effect: 'Cooldowns -2. +10% chalk grip, +10% shake pump recovery.' },
            { name: 'Expert Recovery', effect: 'Cooldowns -3. +20% effectiveness. -1 fatigue penalty.' },
            { name: 'Masterful Efficiency', effect: 'Cooldowns -4. +30% effectiveness. No fatigue. Chalk also -5 pump. Shake also +5 grip.' },
            { name: 'Perfect Execution', effect: 'No cooldowns. +50% effectiveness. +10% success after recovery.' }
        ]
    },
    grapplingHook: {
        id: 'grapplingHook',
        name: 'Grappling Hook',
        category: 'utility',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'Deploy a hook to access distant holds.',
        ranks: [
            { name: 'Basic Hook', effect: '1x/route: target hold within 3 spaces (auto-success). 5-move cooldown.' },
            { name: 'Advanced Technique', effect: '2x/route. Range 5 spaces. 3-move cooldown. 0 pump/grip cost.' },
            { name: 'Hook Master', effect: '3x/route. Range 7 spaces. 1-move cooldown. +15% success next move.' }
        ]
    },
    pitonPlacement: {
        id: 'pitonPlacement',
        name: 'Piton Placement',
        category: 'utility',
        maxPoints: 6,
        pointsPerRank: 3,
        description: 'Drive pitons for safety and rest opportunities.',
        ranks: [
            { name: 'Safety First', effect: '2x/route: place piton. 25% catch on fall. Rest 3 moves (8 pump, 5 grip/move).' },
            { name: 'Strategic Protection', effect: '3x/route. 40% catch. Rest recovers 12 pump, 8 grip/move.' }
        ]
    },
    climbingSalve: {
        id: 'climbingSalve',
        name: 'Climbing Salve',
        category: 'utility',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'Apply salve that restores pump and grip.',
        ranks: [
            { name: 'Herbal Remedy', effect: '1x/route: restore 30 pump, 30 grip. +5% for 3 moves.' },
            { name: 'Potent Formula', effect: '2x/route. Restore 50/50. +8% for 5 moves. Removes fatigue.' },
            { name: 'Alchemical Perfection', effect: '3x/route. Restore 75/75. +12% for 8 moves. Weather immunity 10 moves.' }
        ]
    },
    stimulant: {
        id: 'stimulant',
        name: 'Stimulant',
        category: 'utility',
        maxPoints: 6,
        pointsPerRank: 3,
        description: 'Consume stimulant for speed and reduced cooldowns.',
        ranks: [
            { name: 'Energy Rush', effect: '1x/route. All cooldowns -2 for 8 moves. +10s speed star time.' },
            { name: 'Pure Focus', effect: '2x/route. 0 cooldowns for 10 moves. +15s speed time. +8% dynamic moves.' }
        ]
    },
    headlamp: {
        id: 'headlamp',
        name: 'Headlamp',
        category: 'utility',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'See more holds and route information ahead.',
        ranks: [
            { name: 'Basic Illumination', effect: 'See 2 additional holds ahead. No night penalty.' },
            { name: 'Bright Beam', effect: 'See 4 holds ahead. See hold types for visible holds. Highlight rest holds.' },
            { name: 'Searchlight', effect: 'See entire route. See exact success %. Show optimal path.' }
        ]
    },
    routeJournal: {
        id: 'routeJournal',
        name: 'Route Journal',
        category: 'utility',
        maxPoints: 12,
        pointsPerRank: 3,
        description: 'Document routes for bonuses on repeated attempts.',
        ranks: [
            { name: 'Taking Notes', effect: '2nd attempt: +5%. 3rd+: +8%.' },
            { name: 'Detailed Analysis', effect: '2nd: +8%. 3rd: +12%. 4th+: +15%. +20% XP on repeats.' },
            { name: 'Route Memorization', effect: '2nd: +12%. 3rd: +18%. 4th+: +25%. Start with 3 familiarity.' },
            { name: 'Encyclopedia', effect: '2nd: +15%. 3rd: +25%. 4th+: +35%. Familiarity applies to similar holds.' }
        ]
    },
    wingsuit: {
        id: 'wingsuit',
        name: 'Wingsuit',
        category: 'utility',
        maxPoints: 1,
        pointsPerRank: 1,
        description: 'Deploy wingsuit to glide laterally.',
        ranks: [
            { name: 'Controlled Glide', effect: '1x/route: glide to any hold same level within 8 spaces. Auto-success. Reset to 70% pump/grip.' }
        ]
    },
    crashPad: {
        id: 'crashPad',
        name: 'Crash Pad',
        category: 'utility',
        maxPoints: 6,
        pointsPerRank: 3,
        description: 'Place pads that save you from fall consequences.',
        ranks: [
            { name: 'Safety Net', effect: '1x/route: place pad. On fall: return to last hold at 50% pump/grip.' },
            { name: 'Multiple Pads', effect: '2x/route. Return at 70% pump/grip. +10% for 5 moves after save.' }
        ]
    },
    weatherReading: {
        id: 'weatherReading',
        name: 'Weather Reading',
        category: 'utility',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'Predict and adapt to weather conditions.',
        ranks: [
            { name: 'Basic Forecasting', effect: 'See weather 3 periods ahead. -20% weather penalties.' },
            { name: 'Adaptation', effect: 'See 6 periods ahead. -40% penalties. Skip time without energy cost.' },
            { name: 'Master Meteorologist', effect: 'See 10 periods ahead. -60% penalties. +5% bonus from each weather type.' }
        ]
    },
    
    // === MAGIC SKILLS ===
    transmogrify: {
        id: 'transmogrify',
        name: 'Transmogrify',
        category: 'magic',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'Change hold types to adapt routes to your strengths.',
        ranks: [
            { name: 'Basic Alteration', effect: '1x/route: change hold to random type. 5-move cooldown.' },
            { name: 'Controlled Change', effect: '2x/route. Choose hold type. 3-move cooldown. Range 2 spaces.' },
            { name: 'Mass Transmutation', effect: '3x/route. Change 3 adjacent holds. Choose type. -10% difficulty.' }
        ]
    },
    teleport: {
        id: 'teleport',
        name: 'Teleport',
        category: 'magic',
        maxPoints: 12,
        pointsPerRank: 3,
        description: 'Instantly relocate to different holds.',
        ranks: [
            { name: 'Blink', effect: '1x/route: teleport to random hold within 3 spaces. Auto-success.' },
            { name: 'Directed Warp', effect: '2x/route. Choose target within 5 spaces. 0 pump/grip cost.' },
            { name: 'Phase Shift', effect: '3x/route. Range 7 spaces. +15% success for 2 moves after.' },
            { name: 'Quantum Leap', effect: '4x/route. Teleport anywhere visible. Reset to 60% resources.' }
        ]
    },
    seer: {
        id: 'seer',
        name: 'Seer',
        category: 'magic',
        maxPoints: 12,
        pointsPerRank: 3,
        description: 'Divine knowledge about routes through mystical vision.',
        ranks: [
            { name: 'Third Eye', effect: 'See hold types for next 3 holds. See difficulty rating.' },
            { name: 'Oracle Vision', effect: 'See 6 holds. See exact difficulties. Highlight rest/crux holds.' },
            { name: 'Prophetic Sight', effect: 'See entire route. See success %. +5% on "seen" holds.' },
            { name: 'Omniscience', effect: 'Perfect information. +10% on all holds. Reveal secrets.' }
        ]
    },
    timeDilation: {
        id: 'timeDilation',
        name: 'Time Dilation',
        category: 'magic',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'Slow time, reducing pump and grip deterioration.',
        ranks: [
            { name: 'Temporal Shift', effect: '1x/route. 5 moves: -40% pump/grip rates.' },
            { name: 'Time Crawl', effect: '2x/route. 7 moves: -60% rates. Cooldowns frozen. +8% success.' },
            { name: 'Temporal Mastery', effect: '3x/route. 10 moves: -80% rates. +15% success. Can skip 1 move.' }
        ]
    },
    rockcreate: {
        id: 'rockcreate',
        name: 'Rockcreate',
        category: 'magic',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'Conjure new holds from thin air.',
        ranks: [
            { name: 'Stone Shaping', effect: '2x/route: create random hold on adjacent tile. Lasts 8 moves.' },
            { name: 'Precision Conjuring', effect: '3x/route. Choose type. Range 2 spaces. -5% difficulty.' },
            { name: 'Master Geomancer', effect: '4x/route. Create 2 holds. Permanent. -15% difficulty.' }
        ]
    },
    sunmark: {
        id: 'sunmark',
        name: 'Sunmark',
        category: 'magic',
        maxPoints: 6,
        pointsPerRank: 3,
        description: 'Mark holds with golden light for bonuses.',
        ranks: [
            { name: 'Blessing of Light', effect: 'Mark 2 holds: -15% difficulty, +10% success, 0 grip loss.' },
            { name: 'Radiant Path', effect: 'Mark 4 holds: -25% difficulty, +15% success, 0 pump/grip cost.' }
        ]
    },
    whisperingVines: {
        id: 'whisperingVines',
        name: 'Whispering Vines',
        category: 'magic',
        maxPoints: 6,
        pointsPerRank: 3,
        description: 'Grow magical vines between holds.',
        ranks: [
            { name: "Nature's Path", effect: '1x/route: vine between 2 holds. Auto-success, 0 cost. Lasts 6 moves.' },
            { name: 'Living Bridge', effect: '2x/route. Connect 3 holds. Rest point in middle. +12% to adjacent.' }
        ]
    },
    transmute: {
        id: 'transmute',
        name: 'Transmute',
        category: 'magic',
        maxPoints: 1,
        pointsPerRank: 1,
        description: 'Swap pump and grip values.',
        ranks: [
            { name: 'Alchemical Exchange', effect: '2x/route: swap pump↔grip values. +10% for 3 moves after.' }
        ]
    },
    gravityShift: {
        id: 'gravityShift',
        name: 'Gravity Shift',
        category: 'magic',
        maxPoints: 6,
        pointsPerRank: 3,
        description: 'Alter gravity, making overhangs feel like slabs.',
        ranks: [
            { name: 'Weightless', effect: '1x/route. 6 moves: remove overhang penalties. -40% pump.' },
            { name: 'Gravity Master', effect: '2x/route. 10 moves: overhangs become slabs. -60% pump. +15% success.' }
        ]
    },
    phantomGrip: {
        id: 'phantomGrip',
        name: 'Phantom Grip',
        category: 'magic',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'Hands phase through reality for impossible grabs.',
        ranks: [
            { name: 'Ghost Touch', effect: '10% chance: ignore hold type (treat as jug). 0 grip loss on proc.' },
            { name: 'Ethereal Hands', effect: '25% proc chance. +8% when grip <40%.' },
            { name: 'Reality Breach', effect: '40% proc chance. +15% when grip low. Restore 5 grip on proc.' }
        ]
    },
    energySiphon: {
        id: 'energySiphon',
        name: 'Energy Siphon',
        category: 'magic',
        maxPoints: 6,
        pointsPerRank: 3,
        description: 'Drain energy from rock to restore reserves.',
        ranks: [
            { name: 'Life Drain', effect: 'Every 3rd success: restore 5 pump, 5 grip instead of costing.' },
            { name: 'Power Theft', effect: 'Every 2nd success: restore 10/10. Crimps/slopers: 20/20.' }
        ]
    }
};
