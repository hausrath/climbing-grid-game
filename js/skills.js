// Get skill rank (0 = not learned, 1+ = rank)
function getSkillRank(skillId) {
    const skill = skillDatabase[skillId];
    if (!skill) return 0;
    const points = gameState.skills[skillId] || 0;
    return Math.floor(points / skill.pointsPerRank);
}

// Check if skill can be upgraded
function canUpgradeSkill(skillId) {
    const skill = skillDatabase[skillId];
    if (!skill) return false;
    const current = gameState.skills[skillId] || 0;
    return gameState.unspentSkillPoints >= skill.pointsPerRank && current < skill.maxPoints;
}

// Upgrade a skill
function upgradeSkill(skillId) {
    if (!canUpgradeSkill(skillId)) return false;
    const skill = skillDatabase[skillId];
    gameState.skills[skillId] = (gameState.skills[skillId] || 0) + skill.pointsPerRank;
    gameState.unspentSkillPoints -= skill.pointsPerRank;
    const rank = getSkillRank(skillId);
    addFeedback(`Learned ${skill.ranks[rank - 1].name}!`, 'bonus');
    updateSidebarSkillPoints();
    return true;
}

// Reset skill state at start of each climb
function resetSkillState() {
    const rank = (id) => getSkillRank(id);
    
    gameState.skillState = {
        justChalked: false,
        justShook: false,
        ironGripProcBonus: 0,
        adrenalineTriggered: false,
        adrenalineMovesLeft: 0,
        battleCryUsesLeft: rank('battleCry') >= 2 ? 2 : (rank('battleCry') >= 1 ? 1 : 0),
        battleCryActive: false,
        battleCryMovesLeft: 0,
        battleCryFailImmunity: false,
        kneebar: {
            available: rank('kneebar') >= 1,
            active: false,
            movesInKneebar: 0,
            cooldown: 0,
            postKneebarBonus: 0
        },
        flowFailureBuffer: rank('flowState') >= 3 ? 1 : 0,
        flowPaused: false,
        flowStackBonus: 0,
        dynamicLandingBonus: 0,
        footworkMoveCount: 0,
        
        // === UTILITY SKILL STATE ===
        grapplingHook: {
            usesLeft: rank('grapplingHook') >= 3 ? 3 : rank('grapplingHook') >= 2 ? 2 : rank('grapplingHook') >= 1 ? 1 : 0,
            cooldown: 0,
            landingBonus: 0
        },
        piton: {
            placementsLeft: rank('pitonPlacement') >= 2 ? 3 : rank('pitonPlacement') >= 1 ? 2 : 0,
            placed: false,
            restMovesLeft: 0
        },
        salve: {
            usesLeft: rank('climbingSalve') >= 3 ? 3 : rank('climbingSalve') >= 2 ? 2 : rank('climbingSalve') >= 1 ? 1 : 0,
            bonusMovesLeft: 0,
            weatherImmunityLeft: 0
        },
        stimulant: {
            usesLeft: rank('stimulant') >= 2 ? 2 : rank('stimulant') >= 1 ? 1 : 0,
            active: false,
            movesLeft: 0
        },
        crashPad: {
            placementsLeft: rank('crashPad') >= 2 ? 2 : rank('crashPad') >= 1 ? 1 : 0,
            placed: false,
            lastSafeHold: null,
            confidenceBoost: 0
        },
        wingsuit: {
            available: rank('wingsuit') >= 1
        },
        recoveryBonus: 0,
        
        // === MAGIC SKILL STATE ===
        timeDilation: {
            usesLeft: rank('timeDilation') >= 3 ? 3 : rank('timeDilation') >= 2 ? 2 : rank('timeDilation') >= 1 ? 1 : 0,
            active: false,
            movesLeft: 0
        },
        transmute: {
            usesLeft: rank('transmute') >= 1 ? 2 : 0,
            bonusMovesLeft: 0
        },
        gravityShift: {
            usesLeft: rank('gravityShift') >= 2 ? 2 : rank('gravityShift') >= 1 ? 1 : 0,
            active: false,
            movesLeft: 0
        },
        phantomGrip: {
            procced: false
        },
        energySiphon: {
            grabCount: 0
        },
        seer: {
            holdsRevealed: rank('seer') >= 4 ? 999 : rank('seer') >= 3 ? 999 : rank('seer') >= 2 ? 6 : rank('seer') >= 1 ? 3 : 0
        },
        sunmark: {
            marksLeft: rank('sunmark') >= 2 ? 4 : rank('sunmark') >= 1 ? 2 : 0,
            markedHolds: []
        },
        teleport: {
            usesLeft: rank('teleport') >= 4 ? 4 : rank('teleport') >= 3 ? 3 : rank('teleport') >= 2 ? 2 : rank('teleport') >= 1 ? 1 : 0,
            postTeleportBonus: 0
        },
        hookActive: false  // For grappling hook auto-success
    };
    
    // Flow State rank 4: start in flow
    if (rank('flowState') >= 4) {
        gameState.flowStateActive = true;
        gameState.comboCount = 3;
    }
}

// Calculate grip loss reduction
function calculateSkillGripReduction(hold) {
    let reduction = 0;
    const rank = (id) => getSkillRank(id);
    
    // Iron Grip
    const ironRank = rank('ironGrip');
    if (ironRank >= 3) reduction += 0.15;
    else if (ironRank >= 2) reduction += 0.10;
    else if (ironRank >= 1) reduction += 0.05;
    
    if (ironRank >= 2 && (hold.type === 'crimp' || hold.type === 'sloper' || hold.type === 'pinch')) reduction += 0.15;
    
    // Flow State rank 4
    if (rank('flowState') >= 4 && gameState.flowStateActive) reduction += 0.15;
    
    // Adrenaline
    if (gameState.skillState.adrenalineMovesLeft > 0) reduction += 0.50;
    
    // === MAGIC: Time Dilation ===
    if (gameState.skillState.timeDilation && gameState.skillState.timeDilation.active) {
        const tdRank = rank('timeDilation');
        reduction += tdRank >= 3 ? 0.80 : tdRank >= 2 ? 0.60 : 0.40;
    }
    
    return Math.min(reduction, 0.80);
}

// Calculate pump reduction
function calculateSkillPumpReduction() {
    let reduction = 0;
    const rank = (id) => getSkillRank(id);

    // Grit: reduce pump cost when pump is high
    const gritRank = rank('grit');
    if (gritRank >= 1 && gameState.pump > gameState.maxPump * 0.8) {
        reduction += gritRank >= 3 ? 0.20 : gritRank >= 2 ? 0.15 : 0.10;
    }

    // Ambidextrous: pump reduction when alternating hands
    const ambiRank = rank('ambidextrous');
    if (ambiRank >= 2 && gameState.lastHandUsed && gameState.selectedHand !== gameState.lastHandUsed) {
        reduction += 0.05;
    }

    // Precision Footwork
    const pfRank = rank('precisionFootwork');
    if (pfRank >= 4) reduction += 0.12;
    else if (pfRank >= 3) reduction += 0.08;
    else if (pfRank >= 2) reduction += 0.05;
    else if (pfRank >= 1) reduction += 0.03;
    
    // Flow State rank 3+
    if (rank('flowState') >= 3 && gameState.flowStateActive) reduction += 0.03;
    
    // Battle Cry
    if (gameState.skillState.battleCryActive && gameState.skillState.battleCryMovesLeft > 0) {
        reduction += rank('battleCry') >= 2 ? 0.40 : 0.30;
    }
    
    // Adrenaline
    if (gameState.skillState.adrenalineMovesLeft > 0) reduction = 1.0;
    
    // Precision Footwork rank 4: every 3rd move free
    if (pfRank >= 4 && gameState.skillState.footworkMoveCount % 3 === 2) {
        reduction = 1.0;
    }
    
    // === MAGIC: Time Dilation ===
    if (gameState.skillState.timeDilation && gameState.skillState.timeDilation.active) {
        const tdRank = rank('timeDilation');
        reduction += tdRank >= 3 ? 0.80 : tdRank >= 2 ? 0.60 : 0.40;
    }
    
    // === MAGIC: Gravity Shift ===
    if (gameState.skillState.gravityShift && gameState.skillState.gravityShift.active) {
        const gsRank = rank('gravityShift');
        reduction += gsRank >= 2 ? 0.60 : 0.40;
    }
    
    return Math.min(reduction, 1.0);
}

// Check Iron Grip proc
function checkIronGripProc() {
    const ironRank = getSkillRank('ironGrip');
    if (ironRank < 1) return false;
    
    const procChance = ironRank >= 3 ? 0.30 : ironRank >= 2 ? 0.20 : 0.10;
    if (Math.random() < procChance) {
        addFeedback('🤜 Iron Grip! Grip cost negated!', 'bonus');
        if (ironRank >= 3) gameState.skillState.ironGripProcBonus = 1;
        return true;
    }
    return false;
}

// Check Adrenaline Rush trigger
function checkAdrenalineRush() {
    if (getSkillRank('adrenalineRush') < 1) return false;
    if (gameState.skillState.adrenalineTriggered) return false;
    
    if (gameState.pump > gameState.maxPump * 0.8 && gameState.grip < gameState.maxGrip * 0.3) {
        gameState.skillState.adrenalineTriggered = true;
        gameState.skillState.adrenalineMovesLeft = 4;
        addFeedback('⚡ ADRENALINE RUSH! 4 moves of power!', 'bonus');
        return true;
    }
    return false;
}

// Get cross-body penalty modifier
function getSkillCrossBodyModifier() {
    const ambiRank = getSkillRank('ambidextrous');
    if (ambiRank >= 2) return 0;
    if (ambiRank >= 1) return 0.5;
    return 1.0;
}

// Update skill state after move
// penalty: 0-3 penalty level from the move (0 = perfect position)
function updateSkillStateAfterMove(success, penalty) {
    const state = gameState.skillState;

    state.justChalked = false;
    state.justShook = false;

    if (state.ironGripProcBonus > 0) state.ironGripProcBonus--;
    if (state.adrenalineMovesLeft > 0) state.adrenalineMovesLeft--;
    if (state.kneebar.postKneebarBonus > 0) state.kneebar.postKneebarBonus--;
    if (state.kneebar.cooldown > 0) state.kneebar.cooldown--;
    if (state.dynamicLandingBonus > 0) state.dynamicLandingBonus--;
    
    // Battle Cry duration
    if (state.battleCryActive && state.battleCryMovesLeft > 0) {
        state.battleCryMovesLeft--;
        if (state.battleCryMovesLeft <= 0) {
            state.battleCryActive = false;
            addFeedback('Battle Cry faded', 'neutral');
        }
    }
    
    // Flow State: builds on low-penalty moves, breaks on high penalty
    const flowRank = getSkillRank('flowState');
    if (flowRank >= 1) {
        if (penalty !== undefined && penalty <= 1) {
            // Low/no penalty move builds flow
            if (!gameState.flowStateActive) {
                const threshold = flowRank >= 3 ? 1 : flowRank >= 2 ? 2 : 3;
                gameState.comboCount++;
                if (gameState.comboCount >= threshold) {
                    gameState.flowStateActive = true;
                    addFeedback('Flow State activated!', 'bonus');
                }
            } else if (flowRank >= 2) {
                state.flowStackBonus = Math.min(state.flowStackBonus + 0.01, 0.15);
            }
        } else if (penalty !== undefined && penalty >= 3) {
            // High penalty breaks flow (unless rank 3+ has buffer)
            if (gameState.flowStateActive) {
                if (state.flowFailureBuffer > 0) {
                    state.flowFailureBuffer--;
                    if (flowRank >= 4) {
                        // Rank 4: pause flow instead of breaking
                    } else {
                        addFeedback('Flow State buffer used!', 'neutral');
                    }
                } else {
                    gameState.flowStateActive = false;
                    gameState.comboCount = 0;
                    state.flowStackBonus = 0;
                    addFeedback('Flow State broken!', 'penalty');
                }
            }
        }
    }
    
    // Footwork move counter
    state.footworkMoveCount++;
    
    // === UTILITY SKILL DURATIONS ===
    
    // Grappling Hook cooldown
    if (state.grapplingHook && state.grapplingHook.cooldown > 0) {
        state.grapplingHook.cooldown--;
    }
    if (state.grapplingHook && state.grapplingHook.landingBonus > 0) {
        state.grapplingHook.landingBonus--;
    }
    
    // Climbing Salve bonus
    if (state.salve && state.salve.bonusMovesLeft > 0) {
        state.salve.bonusMovesLeft--;
    }
    if (state.salve && state.salve.weatherImmunityLeft > 0) {
        state.salve.weatherImmunityLeft--;
    }
    
    // Stimulant effect
    if (state.stimulant && state.stimulant.active && state.stimulant.movesLeft > 0) {
        state.stimulant.movesLeft--;
        if (state.stimulant.movesLeft <= 0) {
            state.stimulant.active = false;
            addFeedback('Stimulant effect faded', 'neutral');
        }
    }
    
    // Crash Pad confidence boost
    if (state.crashPad && state.crashPad.confidenceBoost > 0) {
        state.crashPad.confidenceBoost--;
    }
    
    // Recovery bonus (Efficient Recovery rank 5)
    if (state.recoveryBonus > 0) {
        state.recoveryBonus--;
    }
    
    // === MAGIC SKILL DURATIONS ===
    
    // Time Dilation
    if (state.timeDilation && state.timeDilation.active && state.timeDilation.movesLeft > 0) {
        state.timeDilation.movesLeft--;
        if (state.timeDilation.movesLeft <= 0) {
            state.timeDilation.active = false;
            addFeedback('⏰ Time Dilation ended', 'neutral');
        }
    }
    
    // Transmute bonus
    if (state.transmute && state.transmute.bonusMovesLeft > 0) {
        state.transmute.bonusMovesLeft--;
    }
    
    // Gravity Shift
    if (state.gravityShift && state.gravityShift.active && state.gravityShift.movesLeft > 0) {
        state.gravityShift.movesLeft--;
        if (state.gravityShift.movesLeft <= 0) {
            state.gravityShift.active = false;
            addFeedback('🌀 Gravity Shift ended', 'neutral');
        }
    }
    
    // Teleport bonus
    if (state.teleport && state.teleport.postTeleportBonus > 0) {
        state.teleport.postTeleportBonus--;
    }
    
    // Energy Siphon
    if (getSkillRank('energySiphon') >= 1 && success) {
        state.energySiphon.grabCount++;
        const siphonRank = getSkillRank('energySiphon');
        const triggerEvery = siphonRank >= 2 ? 2 : 3;
        
        if (state.energySiphon.grabCount >= triggerEvery) {
            state.energySiphon.grabCount = 0;
            const restore = siphonRank >= 2 ? 10 : 5;
            gameState.pump = Math.max(0, gameState.pump - restore);
            gameState.grip = Math.min(gameState.maxGrip, gameState.grip + restore);
            addFeedback(`⚡ Energy Siphon! +${restore} grip, -${restore} pump`, 'bonus');
        }
    }
    
    checkAdrenalineRush();
}

// Update sidebar skill points indicator
function updateSidebarSkillPoints() {
    const el = document.getElementById('sidebar-skill-points');
    if (el) {
        el.textContent = gameState.unspentSkillPoints > 0 ? `(${gameState.unspentSkillPoints})` : '';
    }
}

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

// Hold difficulty characteristics (from GDD table)

// Generate a hold with calculated difficulty using GDD system

// ============ UTILITY SKILL ACTIONS ============

// Use Climbing Salve
function useSalve() {
    const state = gameState.skillState.salve;
    if (!state || state.usesLeft <= 0) {
        addFeedback('No salve uses remaining!', 'penalty');
        return;
    }
    
    const rank = getSkillRank('climbingSalve');
    state.usesLeft--;
    
    // Restore pump and grip
    const restore = rank >= 3 ? 75 : rank >= 2 ? 50 : 30;
    gameState.pump = Math.max(0, gameState.pump - restore);
    gameState.grip = Math.min(gameState.maxGrip, gameState.grip + restore);
    
    // Bonus success moves
    const bonusMoves = rank >= 3 ? 8 : rank >= 2 ? 5 : 3;
    state.bonusMovesLeft = bonusMoves;
    
    // Rank 2+: additional pump reduction
    if (rank >= 2) {
        gameState.pump = Math.max(0, gameState.pump - 3);
    }
    
    // Weather immunity at rank 3
    if (rank >= 3) {
        state.weatherImmunityLeft = 10;
        addFeedback(`🧴 Salve applied! -${restore} pump, +${restore} grip, reduced costs for ${bonusMoves} moves, weather immunity!`, 'bonus');
    } else {
        addFeedback(`🧴 Salve applied! -${restore} pump, +${restore} grip, reduced costs for ${bonusMoves} moves`, 'bonus');
    }
    
    updateSkillActionButtons();
    updateUI();
}

// Use Stimulant
function useStimulant() {
    const state = gameState.skillState.stimulant;
    if (!state || state.usesLeft <= 0) {
        addFeedback('No stimulant uses remaining!', 'penalty');
        return;
    }
    
    const rank = getSkillRank('stimulant');
    state.usesLeft--;
    state.active = true;
    state.movesLeft = rank >= 2 ? 10 : 8;
    
    addFeedback(`💊 Stimulant consumed! ${rank >= 2 ? 'Zero cooldowns' : 'Cooldowns -2'} for ${state.movesLeft} moves!`, 'bonus');
    if (rank >= 2) {
        addFeedback(`Reduced pump on dynamic moves during effect!`, 'bonus');
    }
    
    updateSkillActionButtons();
    updateUI();
}

// Use Grappling Hook (simplified - auto-success to any visible hold)
function useGrapplingHook() {
    const state = gameState.skillState.grapplingHook;
    if (!state || state.usesLeft <= 0) {
        addFeedback('No hook uses remaining!', 'penalty');
        return;
    }
    if (state.cooldown > 0) {
        addFeedback(`Hook on cooldown! ${state.cooldown} moves remaining.`, 'penalty');
        return;
    }
    
    const rank = getSkillRank('grapplingHook');
    state.usesLeft--;
    
    // Set cooldown
    state.cooldown = rank >= 3 ? 1 : rank >= 2 ? 3 : 5;
    
    // Auto-grab the next hold with no cost
    addFeedback(`🪝 Grappling hook deployed! Next move has 0 pump/grip cost!`, 'bonus');

    // Grant landing bonus at rank 3
    if (rank >= 3) {
        state.landingBonus = 1;
        addFeedback(`Hook Master: reduced costs on next move after landing!`, 'bonus');
    }
    
    // Set a flag to make next grab auto-success
    gameState.skillState.hookActive = true;
    
    updateSkillActionButtons();
    updateUI();
}

// Use Piton
function usePiton() {
    const state = gameState.skillState.piton;
    if (!state || state.placementsLeft <= 0) {
        addFeedback('No pitons remaining!', 'penalty');
        return;
    }
    
    const rank = getSkillRank('pitonPlacement');
    state.placementsLeft--;
    state.placed = true;
    
    const catchChance = rank >= 2 ? 40 : 25;
    const pumpRecovery = rank >= 2 ? 12 : 8;
    const gripRecovery = rank >= 2 ? 8 : 5;
    
    addFeedback(`🔩 Piton placed! ${catchChance}% catch on fall. Can rest for 3 moves (${pumpRecovery} pump, ${gripRecovery} grip/move).`, 'bonus');
    
    updateSkillActionButtons();
    updateUI();
}

// Use Crash Pad
function useCrashPad() {
    const state = gameState.skillState.crashPad;
    if (!state || state.placementsLeft <= 0) {
        addFeedback('No crash pads remaining!', 'penalty');
        return;
    }
    
    const rank = getSkillRank('crashPad');
    state.placementsLeft--;
    state.placed = true;
    state.lastSafeHold = gameState.holdsClimbed;
    
    const returnPercent = rank >= 2 ? 70 : 50;
    addFeedback(`🛡️ Crash pad placed at hold ${gameState.holdsClimbed}! On fall: return at ${returnPercent}% resources.`, 'bonus');
    
    updateSkillActionButtons();
    updateUI();
}

// Use Wingsuit
function useWingsuit() {
    const state = gameState.skillState.wingsuit;
    if (!state || !state.available) {
        addFeedback('Wingsuit not available!', 'penalty');
        return;
    }
    
    state.available = false;
    
    // Reset to 70% resources
    gameState.pump = Math.round(gameState.maxPump * 0.3);
    gameState.grip = Math.round(gameState.maxGrip * 0.7);
    
    addFeedback(`🦅 Wingsuit deployed! Glided to safety. Resources reset to 70%.`, 'bonus');
    
    updateSkillActionButtons();
    updateUI();
}

// Update skill action buttons visibility

// ============ MAGIC SKILL ACTIONS ============

// Use Time Dilation
function useTimeDilation() {
    const state = gameState.skillState.timeDilation;
    if (!state || state.usesLeft <= 0) {
        addFeedback('No time dilation uses remaining!', 'penalty');
        return;
    }
    if (state.active) {
        addFeedback('Time Dilation already active!', 'penalty');
        return;
    }
    
    const rank = getSkillRank('timeDilation');
    state.usesLeft--;
    state.active = true;
    state.movesLeft = rank >= 3 ? 10 : rank >= 2 ? 7 : 5;
    
    const reduction = rank >= 3 ? 80 : rank >= 2 ? 60 : 40;
    addFeedback(`⏰ Time Dilation activated! -${reduction}% pump/grip rates for ${state.movesLeft} moves!`, 'bonus');
    
    if (rank >= 2) {
        addFeedback(`Cooldowns frozen! -${rank >= 3 ? 80 : 60}% pump/grip rates!`, 'bonus');
    }
    
    updateSkillActionButtons();
    updateUI();
}

// Use Transmute (swap pump and grip)
function useTransmute() {
    const state = gameState.skillState.transmute;
    if (!state || state.usesLeft <= 0) {
        addFeedback('No transmute uses remaining!', 'penalty');
        return;
    }
    
    state.usesLeft--;
    
    // Swap pump and grip
    const oldPump = gameState.pump;
    const oldGrip = gameState.grip;
    gameState.pump = Math.min(gameState.maxPump, oldGrip);
    gameState.grip = Math.min(gameState.maxGrip, oldPump);
    
    state.bonusMovesLeft = 3;
    
    addFeedback(`🔄 Transmute! Pump ${oldPump}→${gameState.pump}, Grip ${oldGrip}→${gameState.grip}`, 'bonus');
    addFeedback(`Reduced costs for 3 moves!`, 'bonus');
    
    updateSkillActionButtons();
    updateUI();
}

// Use Gravity Shift
function useGravityShift() {
    const state = gameState.skillState.gravityShift;
    if (!state || state.usesLeft <= 0) {
        addFeedback('No gravity shift uses remaining!', 'penalty');
        return;
    }
    if (state.active) {
        addFeedback('Gravity Shift already active!', 'penalty');
        return;
    }
    
    const rank = getSkillRank('gravityShift');
    state.usesLeft--;
    state.active = true;
    state.movesLeft = rank >= 2 ? 10 : 6;
    
    const pumpReduction = rank >= 2 ? 60 : 40;
    addFeedback(`🌀 Gravity Shift activated! -${pumpReduction}% pump for ${state.movesLeft} moves!`, 'bonus');
    
    if (rank >= 2) {
        addFeedback(`Overhangs become slabs! Greatly reduced pump!`, 'bonus');
    }
    
    updateSkillActionButtons();
    updateUI();
}

