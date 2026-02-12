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
            { name: 'Dyno Basics', effect: 'Can skip 1 hold. -3% pump on dynamic moves.' },
            { name: 'Extended Reach', effect: 'Skip 2 holds. -6% pump on dynamic. -5% pump cost.' },
            { name: 'Explosive Power', effect: 'Skip 3 holds. -10% pump on dynamic. -8% pump cost. -1 cooldown.' },
            { name: 'Chain Dynos', effect: 'Skip 3 holds. -15% pump on dynamic. Doesn\'t break flow. -10% pump cost.' },
            { name: 'Gravity Defiance', effect: 'Skip 3 holds. -20% pump on dynamic. No cooldown. -5% pump on next hold.' }
        ]
    },
    flowState: {
        id: 'flowState',
        name: 'Flow State',
        category: 'athletics',
        maxPoints: 12,
        pointsPerRank: 3,
        description: 'Perfect positioning builds momentum, reducing costs.',
        ranks: [
            { name: 'Finding the Rhythm', effect: 'After 3 low-penalty moves: -50% pump & grip costs.' },
            { name: 'Deeper Flow', effect: 'Trigger after 2 low-penalty moves. Stacks -1%/move (max -15%).' },
            { name: 'Unbreakable Focus', effect: 'Trigger after 1 low-penalty move. Survives first bad move. -3% pump.' },
            { name: 'Transcendence', effect: 'Start in flow. -15% grip drain. Bad moves pause flow instead of breaking.' }
        ]
    },
    ironGrip: {
        id: 'ironGrip',
        name: 'Iron Grip',
        category: 'athletics',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'Vice-like fingers that reduce grip drain.',
        ranks: [
            { name: 'Strong Fingers', effect: '10% chance negate grip drain. -5% grip drain.' },
            { name: 'Steel Tendons', effect: '20% chance negate. -10% grip drain. -15% on crimps/slopers/pinches.' },
            { name: 'Unbreakable', effect: '30% chance negate. -15% grip drain. +10% max grip.' }
        ]
    },
    grit: {
        id: 'grit',
        name: 'Grit',
        category: 'athletics',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'Mental toughness that reduces pump when fatigued.',
        ranks: [
            { name: 'Determined', effect: '-10% pump cost when pump >80%.' },
            { name: 'Resilient', effect: '-15% pump cost when pump >80%.' },
            { name: 'Indomitable', effect: '-20% pump cost when pump >80%.' }
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
            { name: 'Perfect Timing', effect: 'After chalk: 0 pump cost. After shake: 0 grip drain.' }
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
            { name: 'Perfect Position', effect: 'Recover 12 pump + 10 grip/move. 1 cooldown. -10% costs for 2 moves after.' }
        ]
    },
    battleCry: {
        id: 'battleCry',
        name: 'Battle Cry',
        category: 'athletics',
        maxPoints: 6,
        pointsPerRank: 3,
        description: 'A powerful yell that reduces pump costs.',
        ranks: [
            { name: "Warrior's Shout", effect: '1x/route. 5 moves: -30% pump cost, +20% chalk effectiveness.' },
            { name: 'Primal Roar', effect: '2x/route. 7 moves: -40% pump cost, +30% chalk effectiveness.' }
        ]
    },
    precisionFootwork: {
        id: 'precisionFootwork',
        name: 'Precision Footwork',
        category: 'athletics',
        maxPoints: 12,
        pointsPerRank: 3,
        description: 'Perfect foot placement reduces pump costs.',
        ranks: [
            { name: 'Mindful Steps', effect: '-3% pump cost per move.' },
            { name: 'Balanced Movement', effect: '-5% pump cost.' },
            { name: 'Perfect Placement', effect: '-8% pump cost.' },
            { name: 'Silent Step Master', effect: '-12% pump cost. Every 3rd move costs 0 pump.' }
        ]
    },
    adrenalineRush: {
        id: 'adrenalineRush',
        name: 'Adrenaline Rush',
        category: 'athletics',
        maxPoints: 1,
        pointsPerRank: 1,
        description: 'When dire, adrenaline eliminates costs.',
        ranks: [
            { name: 'Survival Instinct', effect: 'When pump >80% AND grip <30%: 4 moves with 0 pump cost, -50% grip drain. 1x/route.' }
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
            { name: 'Dual Training', effect: '-50% cross-body pump penalty. Alternating hands: -3% pump.' },
            { name: 'Perfect Balance', effect: 'No cross-body penalty. Alternating hands: -5% pump. Match freely.' }
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
            { name: 'Practiced Technique', effect: 'Cooldowns -2. +10% chalk/shake effectiveness.' },
            { name: 'Expert Recovery', effect: 'Cooldowns -3. +20% effectiveness.' },
            { name: 'Masterful Efficiency', effect: 'Cooldowns -4. +30% effectiveness. Chalk also -5 pump. Shake also +5 grip.' },
            { name: 'Perfect Execution', effect: 'No cooldowns. +50% effectiveness. Reduced costs after recovery.' }
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
            { name: 'Basic Hook', effect: '1x/route: target hold within 3 spaces (0 cost). 5-move cooldown.' },
            { name: 'Advanced Technique', effect: '2x/route. Range 5 spaces. 3-move cooldown. 0 pump/grip cost.' },
            { name: 'Hook Master', effect: '3x/route. Range 7 spaces. 1-move cooldown. Reduced costs next move.' }
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
            { name: 'Herbal Remedy', effect: '1x/route: restore 30 pump, 30 grip. Reduced costs for 3 moves.' },
            { name: 'Potent Formula', effect: '2x/route. Restore 50/50. Reduced costs for 5 moves.' },
            { name: 'Alchemical Perfection', effect: '3x/route. Restore 75/75. Reduced costs for 8 moves. Weather immunity 10 moves.' }
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
            { name: 'Pure Focus', effect: '2x/route. 0 cooldowns for 10 moves. +15s speed time. Reduced pump on dynamic moves.' }
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
            { name: 'Searchlight', effect: 'See entire route. See exact pump/grip costs. Show optimal path.' }
        ]
    },
    routeJournal: {
        id: 'routeJournal',
        name: 'Route Journal',
        category: 'utility',
        maxPoints: 12,
        pointsPerRank: 3,
        description: 'Document routes for reduced costs on repeated attempts.',
        ranks: [
            { name: 'Taking Notes', effect: '2nd attempt: -5% pump. 3rd+: -8% pump.' },
            { name: 'Detailed Analysis', effect: '2nd: -8%. 3rd: -12%. 4th+: -15% pump. +20% XP on repeats.' },
            { name: 'Route Memorization', effect: '2nd: -12%. 3rd: -18%. 4th+: -25% pump. Start with 3 familiarity.' },
            { name: 'Encyclopedia', effect: '2nd: -15%. 3rd: -25%. 4th+: -35% pump. Familiarity applies to similar holds.' }
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
            { name: 'Controlled Glide', effect: '1x/route: glide to any hold same level within 8 spaces. 0 cost. Reset to 70% pump/grip.' }
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
            { name: 'Multiple Pads', effect: '2x/route. Return at 70% pump/grip. Reduced costs for 5 moves after save.' }
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
            { name: 'Basic Forecasting', effect: 'See weather 3 periods ahead. -20% weather pump/grip penalties.' },
            { name: 'Adaptation', effect: 'See 6 periods ahead. -40% weather penalties. Skip time without energy cost.' },
            { name: 'Master Meteorologist', effect: 'See 10 periods ahead. -60% weather penalties. Weather bonuses doubled.' }
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
            { name: 'Mass Transmutation', effect: '3x/route. Change 3 adjacent holds. Choose type. -10% pump cost.' }
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
            { name: 'Blink', effect: '1x/route: teleport to random hold within 3 spaces. 0 cost.' },
            { name: 'Directed Warp', effect: '2x/route. Choose target within 5 spaces. 0 pump/grip cost.' },
            { name: 'Phase Shift', effect: '3x/route. Range 7 spaces. Reduced costs for 2 moves after.' },
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
            { name: 'Third Eye', effect: 'See hold types for next 3 holds. See penalty preview.' },
            { name: 'Oracle Vision', effect: 'See 6 holds. See exact penalties. Highlight rest/crux holds.' },
            { name: 'Prophetic Sight', effect: 'See entire route. See pump/grip costs. -5% pump on "seen" holds.' },
            { name: 'Omniscience', effect: 'Perfect information. -10% pump on all holds. Reveal secrets.' }
        ]
    },
    timeDilation: {
        id: 'timeDilation',
        name: 'Time Dilation',
        category: 'magic',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'Slow time, reducing pump and grip costs.',
        ranks: [
            { name: 'Temporal Shift', effect: '1x/route. 5 moves: -40% pump/grip costs.' },
            { name: 'Time Crawl', effect: '2x/route. 7 moves: -60% costs. Cooldowns frozen.' },
            { name: 'Temporal Mastery', effect: '3x/route. 10 moves: -80% costs. Can skip 1 move.' }
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
            { name: 'Precision Conjuring', effect: '3x/route. Choose type. Range 2 spaces. -5% pump cost.' },
            { name: 'Master Geomancer', effect: '4x/route. Create 2 holds. Permanent. -15% pump cost.' }
        ]
    },
    sunmark: {
        id: 'sunmark',
        name: 'Sunmark',
        category: 'magic',
        maxPoints: 6,
        pointsPerRank: 3,
        description: 'Mark holds with golden light for reduced costs.',
        ranks: [
            { name: 'Blessing of Light', effect: 'Mark 2 holds: -15% pump cost, 0 grip drain.' },
            { name: 'Radiant Path', effect: 'Mark 4 holds: -25% pump cost, 0 pump/grip cost.' }
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
            { name: "Nature's Path", effect: '1x/route: vine between 2 holds. 0 pump/grip cost. Lasts 6 moves.' },
            { name: 'Living Bridge', effect: '2x/route. Connect 3 holds. Rest point in middle. -12% pump on adjacent.' }
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
            { name: 'Alchemical Exchange', effect: '2x/route: swap pump↔grip values. Reduced costs for 3 moves after.' }
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
            { name: 'Weightless', effect: '1x/route. 6 moves: remove overhang penalties. -40% pump cost.' },
            { name: 'Gravity Master', effect: '2x/route. 10 moves: overhangs become slabs. -60% pump cost.' }
        ]
    },
    phantomGrip: {
        id: 'phantomGrip',
        name: 'Phantom Grip',
        category: 'magic',
        maxPoints: 9,
        pointsPerRank: 3,
        description: 'Hands phase through reality for reduced grip drain.',
        ranks: [
            { name: 'Ghost Touch', effect: '10% chance: treat hold as jug. 0 grip drain on proc.' },
            { name: 'Ethereal Hands', effect: '25% proc chance. Additional grip reduction when grip <40%.' },
            { name: 'Reality Breach', effect: '40% proc chance. Strong grip reduction when low. Restore 5 grip on proc.' }
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
            { name: 'Life Drain', effect: 'Every 3rd move: restore 5 pump, 5 grip.' },
            { name: 'Power Theft', effect: 'Every 2nd move: restore 10/10. Crimps/slopers: 20/20.' }
        ]
    }
};
