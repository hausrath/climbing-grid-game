// ============ PHASE 14: Equipment System ============

let selectedEquipmentSlot = null;

// Show equipment screen
// ============ SKILLS UI FUNCTIONS ============

function showSkills() {
    renderSkillsScreen();
    document.getElementById('skills-overlay').classList.add('show');
}

function closeSkills() {
    document.getElementById('skills-overlay').classList.remove('show');
    closeSkillDetail();
}

function renderSkillsScreen() {
    document.getElementById('skill-points-count').textContent = gameState.unspentSkillPoints;
    
    const container = document.getElementById('skills-categories');
    const categories = { 
        athletics: { name: 'Athletics', icon: '🔴', skills: [] },
        utility: { name: 'Utility', icon: '🟡', skills: [] },
        magic: { name: 'Magic', icon: '🟢', skills: [] }
    };
    
    for (const [id, skill] of Object.entries(skillDatabase)) {
        if (categories[skill.category]) {
            categories[skill.category].skills.push(skill);
        }
    }
    
    let html = '';
    for (const [catId, category] of Object.entries(categories)) {
        if (category.skills.length === 0) continue;
        
        html += `
            <div class="skills-category">
                <div class="skills-category-header">
                    <span>${category.icon}</span>
                    <span class="skills-category-title">${category.name}</span>
                </div>
                <div class="skills-grid">
        `;
        
        for (const skill of category.skills) {
            const current = gameState.skills[skill.id] || 0;
            const rank = getSkillRank(skill.id);
            const maxed = current >= skill.maxPoints;
            const hasPoints = current > 0;
            const progress = (current / skill.maxPoints) * 100;
            const rankName = rank > 0 ? skill.ranks[rank - 1].name : 'Not Learned';
            
            html += `
                <div class="skill-card ${hasPoints ? 'has-points' : ''} ${maxed ? 'maxed' : ''}" 
                     onclick="showSkillDetail('${skill.id}')">
                    <div class="skill-card-header">
                        <div class="skill-card-name">${skill.name}</div>
                        <div class="skill-card-points">${current}/${skill.maxPoints}</div>
                    </div>
                    <div class="skill-card-desc">${skill.description}</div>
                    <div class="skill-card-rank ${!hasPoints ? 'inactive' : ''}">
                        ${hasPoints ? `Rank ${rank}: ${rankName}` : 'Click to learn'}
                    </div>
                    <div class="skill-progress-bar">
                        <div class="skill-progress-fill" style="width: ${progress}%;"></div>
                    </div>
                </div>
            `;
        }
        
        html += `</div></div>`;
    }
    
    container.innerHTML = html;
}

function showSkillDetail(skillId) {
    const skill = skillDatabase[skillId];
    if (!skill) return;
    
    const current = gameState.skills[skillId] || 0;
    const currentRank = getSkillRank(skillId);
    const canUp = canUpgradeSkill(skillId);
    const maxed = current >= skill.maxPoints;
    
    let ranksHtml = '';
    for (let i = 0; i < skill.ranks.length; i++) {
        const rankData = skill.ranks[i];
        const rankNum = i + 1;
        const isUnlocked = currentRank >= rankNum;
        const isCurrent = currentRank === rankNum;
        const isNext = currentRank === rankNum - 1;
        
        let tierClass = isCurrent ? 'current' : isUnlocked ? 'unlocked' : isNext ? 'next' : '';
        const icon = isUnlocked ? '✓' : isNext ? '→' : '○';
        
        ranksHtml += `
            <div class="skill-rank-tier ${tierClass}">
                <div class="skill-rank-label">${icon} Rank ${rankNum} (${rankNum * skill.pointsPerRank} pts): ${rankData.name}</div>
                <div class="skill-rank-effect">${rankData.effect}</div>
            </div>
        `;
    }
    
    const upgradeButton = maxed 
        ? `<div style="color: #fad882; text-align: center; padding: 10px;">⭐ MAXED OUT</div>`
        : canUp 
            ? `<button class="camp-button primary" onclick="learnSkill('${skillId}')" style="width: 100%; margin-top: 15px;">
                Learn Rank ${currentRank + 1} (${skill.pointsPerRank} points)
               </button>`
            : `<div style="color: #738078; text-align: center; padding: 10px; margin-top: 15px;">
                Need ${skill.pointsPerRank} skill points to upgrade
               </div>`;
    
    closeSkillDetail();
    
    const modal = document.createElement('div');
    modal.className = 'skill-detail-modal';
    modal.id = 'skill-detail-modal';
    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
            <div>
                <div style="font-size: 1.3em; font-weight: bold; color: #6dbce3;">${skill.name}</div>
                <div style="color: #738078; font-size: 0.9em;">${skill.category.toUpperCase()}</div>
            </div>
            <div style="color: #c178de; background: rgba(193, 120, 222, 0.2); padding: 4px 12px; border-radius: 10px;">
                ${current}/${skill.maxPoints}
            </div>
        </div>
        <div style="color: #bdb9ae; font-style: italic; margin-bottom: 15px;">${skill.description}</div>
        ${ranksHtml}
        ${upgradeButton}
        <button class="camp-button" onclick="closeSkillDetail()" style="width: 100%; margin-top: 10px;">Close</button>
    `;
    
    document.body.appendChild(modal);
}

function closeSkillDetail() {
    const modal = document.getElementById('skill-detail-modal');
    if (modal) modal.remove();
}

function learnSkill(skillId) {
    // Handle legacy commit skill (boolean)
    if (skillId === 'commit') {
        // Can only spend points at camp
        if (gameState.gameMode !== 'camp') {
            addFeedback('⛺ Return to camp to spend skill points!', 'penalty');
            return;
        }
        
        if (gameState.unspentSkillPoints <= 0) {
            addFeedback('No skill points available!', 'penalty');
            return;
        }
        
        if (gameState.skills.commit) {
            addFeedback('Skill already learned!', 'penalty');
            return;
        }
        
        gameState.skills.commit = true;
        gameState.unspentSkillPoints--;
        
        addFeedback(`🎓 Learned skill: Commit!`, 'bonus');
        
        // Show the skill button in actions
        document.getElementById('commit-btn').style.display = 'inline-block';
        document.getElementById('commit-learn-btn').style.display = 'none';
        
        updateUI();
        updateCampUI();
        updateSidebarSkillPoints();
        updateCampSkillsPreview();
        return;
    }
    
    // Handle new skills system
    if (upgradeSkill(skillId)) {
        // Update camp preview if we're in the spend points overlay
        updateCampSkillsPreview();
        updateCampUI();
        
        // Only show skills screen detail if we're in the skills overlay
        const skillsOverlay = document.getElementById('skills-overlay');
        if (skillsOverlay && skillsOverlay.classList.contains('show')) {
            renderSkillsScreen();
            showSkillDetail(skillId);
        }
    }
}

function showEquipment() {
    renderEquipmentSlots();
    renderInventory();
    document.getElementById('equipment-overlay').classList.add('show');
}

// Close equipment screen
function closeEquipment() {
    document.getElementById('equipment-overlay').classList.remove('show');
    selectedEquipmentSlot = null;
}

// Render equipment slots
function renderEquipmentSlots() {
    const container = document.getElementById('equipment-slots');
    const slots = ['shoes', 'chalkBag', 'helmet', 'harness', 'gloves', 'clothing', 'food', 'brush', 'guidebook', 'watch'];
    
    container.innerHTML = slots.map(slot => {
        const equippedId = gameState.equippedGear[slot];
        const gear = equippedId ? gearDatabase[equippedId] : null;
        const isSelected = selectedEquipmentSlot === slot;
        
        return `
            <div class="equipment-slot ${isSelected ? 'selected' : ''}" onclick="selectEquipmentSlot('${slot}')">
                <div class="equipment-slot-name">${getSlotDisplayName(slot)}</div>
                ${gear ? `
                    <div class="equipment-slot-item" style="color: ${getRarityColor(gear.rarity)};">
                        ${gear.name}
                    </div>
                ` : `
                    <div class="equipment-slot-item equipment-slot-empty">Empty</div>
                `}
            </div>
        `;
    }).join('');
}

// Select equipment slot to filter inventory
function selectEquipmentSlot(slot) {
    selectedEquipmentSlot = selectedEquipmentSlot === slot ? null : slot;
    renderEquipmentSlots();
    renderInventory();
    
    const label = document.getElementById('inventory-filter-label');
    if (selectedEquipmentSlot) {
        label.textContent = `- Showing ${getSlotDisplayName(selectedEquipmentSlot)}`;
        label.style.color = '#6dbce3';
    } else {
        label.textContent = '';
    }
}

// Render inventory
function renderInventory() {
    const container = document.getElementById('inventory-grid');
    
    // Filter inventory by selected slot if any
    let items = gameState.inventory.map(id => gearDatabase[id]).filter(Boolean);
    if (selectedEquipmentSlot) {
        items = items.filter(item => item.slot === selectedEquipmentSlot);
    }
    
    if (items.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #738078; padding: 30px;">
                ${selectedEquipmentSlot ? `No ${getSlotDisplayName(selectedEquipmentSlot)} in inventory` : 'No gear in inventory. Complete routes to find loot!'}
            </div>
        `;
        return;
    }
    
    container.innerHTML = items.map(gear => {
        const isEquipped = Object.values(gameState.equippedGear).includes(gear.id);
        
        return `
            <div class="inventory-item rarity-${gear.rarity} ${isEquipped ? 'equipped' : ''}" 
                 onclick="showGearDetails('${gear.id}')">
                <div class="inventory-item-name" style="color: ${getRarityColor(gear.rarity)};">
                    ${gear.name} ${isEquipped ? '✓' : ''}
                </div>
                <div class="inventory-item-slot">${getSlotDisplayName(gear.slot)}</div>
            </div>
        `;
    }).join('');
}

// Show gear details and equip option
function showGearDetails(gearId) {
    const gear = gearDatabase[gearId];
    if (!gear) return;
    
    const isEquipped = gameState.equippedGear[gear.slot] === gearId;
    
    // Build modifiers list
    let modifiersHtml = '<div style="margin: 10px 0;">';
    if (gear.modifiers) {
        for (const [key, value] of Object.entries(gear.modifiers)) {
            modifiersHtml += `<div style="color: #a8db60; font-size: 0.9em;">▸ ${formatModifier(key, value)}</div>`;
        }
    }
    modifiersHtml += '</div>';
    
    // Core perks for exquisite/legendary
    let perksHtml = '';
    if (gear.corePerk) {
        perksHtml = `
            <div style="background: rgba(193, 120, 222, 0.2); border-left: 3px solid #c178de; padding: 10px; margin: 10px 0; border-radius: 4px;">
                <div style="color: #c178de; font-weight: bold; font-size: 0.9em;">⚡ ${gear.corePerk.name}</div>
                <div style="color: #f5aaa2; font-size: 0.85em; font-style: italic;">${gear.corePerk.description}</div>
            </div>
        `;
    }
    if (gear.corePerks) {
        perksHtml = gear.corePerks.map(perk => `
            <div style="background: rgba(250, 216, 130, 0.2); border-left: 3px solid #fad882; padding: 10px; margin: 10px 0; border-radius: 4px;">
                <div style="color: #fad882; font-weight: bold; font-size: 0.9em;">⚡ ${perk.name}</div>
                <div style="color: #f5aaa2; font-size: 0.85em; font-style: italic;">${perk.description}</div>
            </div>
        `).join('');
    }
    
    const content = `
        <div style="text-align: center; margin-bottom: 15px;">
            <div style="font-size: 1.3em; font-weight: bold; color: ${getRarityColor(gear.rarity)};">${gear.name}</div>
            <div style="color: #738078; font-size: 0.9em;">${gear.rarity.toUpperCase()} ${getSlotDisplayName(gear.slot)}</div>
        </div>
        ${modifiersHtml}
        ${perksHtml}
        <div style="text-align: center; margin-top: 20px;">
            ${isEquipped ? `
                <button class="camp-button" onclick="unequipGear('${gear.slot}')" style="display: inline-block; padding: 10px 20px;">
                    Unequip
                </button>
            ` : `
                <button class="camp-button primary" onclick="equipGear('${gearId}')" style="display: inline-block; padding: 10px 20px;">
                    Equip
                </button>
            `}
            <button class="camp-button" onclick="closeGearDetails()" style="display: inline-block; padding: 10px 20px; margin-left: 10px;">
                Close
            </button>
        </div>
    `;
    
    // Show in a simple modal
    const modal = document.createElement('div');
    modal.id = 'gear-detail-modal';
    modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #37333b, #243447);
        border: 3px solid ${getRarityColor(gear.rarity)};
        border-radius: 12px; padding: 25px; max-width: 400px; width: 90%;
        z-index: 1700; box-shadow: 0 10px 40px rgba(0,0,0,0.8);
    `;
    modal.innerHTML = content;
    document.body.appendChild(modal);
}

// Format modifier for display
function formatModifier(key, value) {
    const formatters = {
        holdBonus: (v) => {
            if (typeof v === 'object') {
                return Object.entries(v).map(([hold, bonus]) => 
                    `${bonus > 0 ? '+' : ''}${Math.round(bonus * 100)}% success on ${hold}s`
                ).join(', ');
            }
            return `+${Math.round(v * 100)}% success on all holds`;
        },
        allHoldBonus: (v) => `+${Math.round(v * 100)}% success on all holds`,
        gripLossReduction: (v) => `-${Math.round(v * 100)}% grip loss`,
        pumpGainReduction: (v) => `-${Math.round(v * 100)}% pump gain`,
        chalkGripBonus: (v) => `+${Math.round(v * 100)}% grip from chalk`,
        chalkCooldownReduction: (v) => `Chalk cooldown -${v}`,
        shakeCooldownReduction: (v) => `Shake cooldown -${v}`,
        fallCatchChance: (v) => `${Math.round(v * 100)}% chance to catch yourself`,
        maxEnergyBonus: (v) => `+${v} max energy`,
        maxPumpBonus: (v) => `+${v} max pump`,
        maxGripBonus: (v) => `+${v} max grip`,
        cruxBonus: (v) => `+${Math.round(v * 100)}% on crux holds`,
        dynamicBonus: (v) => `+${Math.round(v * 100)}% dynamic bonus`,
        staticBonus: (v) => `+${Math.round(v * 100)}% static bonus`,
        xpBonus: (v) => `+${Math.round(v * 100)}% XP`,
        speedStarBonus: (v) => `+${v}s for speed star`,
        hotWeatherPumpReduction: (v) => `-${Math.round(v * 100)}% hot weather pump penalty`,
        humidWeatherGripReduction: (v) => `-${Math.round(v * 100)}% humid weather grip penalty`,
        windPumpReduction: (v) => `-${Math.round(v * 100)}% wind pump penalty`,
        coldWeatherReduction: (v) => `-${Math.round(v * 100)}% cold weather penalty`,
        shakeEffectiveness: (v) => `+${Math.round(v * 100)}% shake effectiveness`,
        retryPumpGripKeep: (v) => `Keep ${Math.round(v * 100)}% pump/grip on retry`,
        energyCostReduction: (v) => `-${v} energy cost per climb`,
        climbsBeforeTimeBonus: (v) => `+${v} climbs before time advances`,
    };
    
    const formatter = formatters[key];
    if (formatter) return formatter(value);
    
    // Default formatting
    if (typeof value === 'boolean') return value ? key.replace(/([A-Z])/g, ' $1').trim() : '';
    if (typeof value === 'number') return `${key}: ${value > 0 ? '+' : ''}${value}`;
    return `${key}: ${JSON.stringify(value)}`;
}

// Close gear details modal
function closeGearDetails() {
    const modal = document.getElementById('gear-detail-modal');
    if (modal) modal.remove();
}

// Equip gear
function equipGear(gearId) {
    const gear = gearDatabase[gearId];
    if (!gear) return;
    
    gameState.equippedGear[gear.slot] = gearId;
    closeGearDetails();
    renderEquipmentSlots();
    renderInventory();
    addFeedback(`Equipped ${gear.name}!`, 'bonus');
}

// Unequip gear
function unequipGear(slot) {
    const gear = gearDatabase[gameState.equippedGear[slot]];
    gameState.equippedGear[slot] = null;
    closeGearDetails();
    renderEquipmentSlots();
    renderInventory();
    if (gear) addFeedback(`Unequipped ${gear.name}`, 'neutral');
}

// Get total equipment bonuses (calculated when climbing)
function getEquipmentBonuses() {
    const bonuses = {
        holdBonus: {},
        allHoldBonus: 0,
        gripLossReduction: 0,
        pumpGainReduction: 0,
        fallCatchChance: 0,
        maxEnergyBonus: 0,
        maxPumpBonus: 0,
        maxGripBonus: 0,
        cruxBonus: 0,
        dynamicBonus: 0,
        staticBonus: 0,
        // Add more as needed
    };
    
    for (const [slot, gearId] of Object.entries(gameState.equippedGear)) {
        if (!gearId) continue;
        const gear = gearDatabase[gearId];
        if (!gear || !gear.modifiers) continue;
        
        for (const [key, value] of Object.entries(gear.modifiers)) {
            if (key === 'holdBonus' && typeof value === 'object') {
                for (const [hold, bonus] of Object.entries(value)) {
                    bonuses.holdBonus[hold] = (bonuses.holdBonus[hold] || 0) + bonus;
                }
            } else if (typeof bonuses[key] === 'number' && typeof value === 'number') {
                bonuses[key] += value;
            } else if (typeof value === 'boolean') {
                bonuses[key] = value;
            }
        }
    }
    
    return bonuses;
}

// Add loot to a route
function generateRouteLoot(location, route) {
    // Determine rarity based on location tier and route difficulty
    // Legendary is extremely rare - only from boss routes with low chance
    let rarityPool;
    
    if (route.bossRoute && location.isBoss) {
        // The Spire (final boss) - best loot, chance at legendary
        rarityPool = ['rare', 'rare', 'exquisite', 'exquisite', 'exquisite', 'legendary'];
    } else if (route.bossRoute) {
        // Regular boss/project routes - good loot, small legendary chance
        rarityPool = ['uncommon', 'rare', 'rare', 'rare', 'exquisite', 'exquisite'];
        // 5% chance to upgrade to legendary on project routes
        if (Math.random() < 0.05) {
            return Object.values(gearDatabase).filter(g => g.rarity === 'legendary')[Math.floor(Math.random() * 5)].id;
        }
    } else if (location.difficultyTier === 'easy') {
        rarityPool = ['common', 'common', 'common', 'uncommon'];
    } else if (location.difficultyTier === 'intermediate') {
        rarityPool = ['common', 'uncommon', 'uncommon', 'rare'];
    } else { // expert
        rarityPool = ['uncommon', 'rare', 'rare', 'exquisite'];
        // 2% chance for legendary on expert non-boss routes
        if (Math.random() < 0.02) {
            return Object.values(gearDatabase).filter(g => g.rarity === 'legendary')[Math.floor(Math.random() * 5)].id;
        }
    }
    
    const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
    
    // Get all gear of this rarity
    const gearOfRarity = Object.values(gearDatabase).filter(g => g.rarity === rarity);
    
    if (gearOfRarity.length === 0) return null;
    
    return gearOfRarity[Math.floor(Math.random() * gearOfRarity.length)].id;
}

// Award loot after completing a route
function awardRouteLoot(location, route) {
    if (!route.hasLoot) return null;
    
    const lootKey = `${location.id}-${route.id}`;
    if (gameState.collectedLoot[lootKey]) return null; // Already collected
    
    const lootId = generateRouteLoot(location, route);
    if (!lootId) return null;
    
    // Add to inventory
    gameState.inventory.push(lootId);
    gameState.collectedLoot[lootKey] = true;
    
    return gearDatabase[lootId];
}

// Give player starting gear
function giveStartingGear() {
    // Give one common item for each slot
    const startingGear = [
        'common_shoes_basic',
        'common_chalk_standard',
        'common_harness_basic'
    ];
    
    startingGear.forEach(id => {
        if (!gameState.inventory.includes(id)) {
            gameState.inventory.push(id);
        }
    });
}

