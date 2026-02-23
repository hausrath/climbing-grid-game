extends Node

# Handles gear equip/unequip, equipment bonus aggregation, and loot generation.
# Mirrors the equipment logic in js/equipment.js.

signal gear_equipped(gear_id: String)
signal gear_unequipped(slot: String)
signal loot_awarded(gear: Dictionary)

var _gear_db: Dictionary = {}


func _ready() -> void:
	_gear_db = GearData.get_gear_database()


func equip_gear(gear_id: String) -> void:
	if not _gear_db.has(gear_id):
		return
	var gear: Dictionary = _gear_db[gear_id]
	GameState.equipped_gear[gear["slot"]] = gear_id
	emit_signal("gear_equipped", gear_id)


func unequip_gear(slot: String) -> void:
	GameState.equipped_gear[slot] = null
	emit_signal("gear_unequipped", slot)


func get_gear(gear_id: String) -> Dictionary:
	return _gear_db.get(gear_id, {})


func get_gear_database() -> Dictionary:
	return _gear_db


func get_equipment_bonuses() -> Dictionary:
	var bonuses := {
		"holdBonus": {},
		"allHoldBonus": 0.0,
		"gripLossReduction": 0.0,
		"pumpGainReduction": 0.0,
		"fallCatchChance": 0.0,
		"maxEnergyBonus": 0,
		"maxPumpBonus": 0,
		"maxGripBonus": 0,
		"cruxBonus": 0.0,
		"dynamicBonus": 0.0,
		"staticBonus": 0.0,
	}

	for slot in GameState.equipped_gear:
		var gear_id = GameState.equipped_gear[slot]
		if not gear_id:
			continue
		var gear: Dictionary = _gear_db.get(gear_id, {})
		if gear.is_empty() or not gear.has("modifiers"):
			continue

		for key in gear["modifiers"]:
			var value = gear["modifiers"][key]
			if key == "holdBonus" and typeof(value) == TYPE_DICTIONARY:
				for hold_type in value:
					if not bonuses["holdBonus"].has(hold_type):
						bonuses["holdBonus"][hold_type] = 0.0
					bonuses["holdBonus"][hold_type] += value[hold_type]
			elif bonuses.has(key) and typeof(bonuses[key]) == TYPE_FLOAT:
				bonuses[key] += float(value)
			elif bonuses.has(key) and typeof(bonuses[key]) == TYPE_INT:
				bonuses[key] += int(value)
			elif typeof(value) == TYPE_BOOL:
				bonuses[key] = value

	return bonuses


func generate_route_loot(location: Dictionary, route: Dictionary) -> String:
	var rarity_pool: Array
	var difficulty_tier: String = location.get("difficultyTier", "easy")

	if route.get("bossRoute", false) and location.get("isBoss", false):
		rarity_pool = ["rare", "rare", "exquisite", "exquisite", "exquisite", "legendary"]
	elif route.get("bossRoute", false):
		rarity_pool = ["uncommon", "rare", "rare", "rare", "exquisite", "exquisite"]
		if randf() < 0.05:
			var legendaries := _gear_db.values().filter(func(g): return g["rarity"] == "legendary")
			if not legendaries.is_empty():
				return legendaries[randi() % legendaries.size()]["id"]
	elif difficulty_tier == "easy":
		rarity_pool = ["common", "common", "common", "uncommon"]
	elif difficulty_tier == "intermediate":
		rarity_pool = ["common", "uncommon", "uncommon", "rare"]
	else: # expert
		rarity_pool = ["uncommon", "rare", "rare", "exquisite"]
		if randf() < 0.02:
			var legendaries := _gear_db.values().filter(func(g): return g["rarity"] == "legendary")
			if not legendaries.is_empty():
				return legendaries[randi() % legendaries.size()]["id"]

	var rarity: String = rarity_pool[randi() % rarity_pool.size()]
	var gear_of_rarity := _gear_db.values().filter(func(g): return g["rarity"] == rarity)

	if gear_of_rarity.is_empty():
		return ""
	return gear_of_rarity[randi() % gear_of_rarity.size()]["id"]


func award_route_loot(location: Dictionary, route: Dictionary) -> Dictionary:
	if not route.get("hasLoot", false):
		return {}

	var loot_key := "%d-%s" % [location.get("id", -1), route.get("id", "")]
	if GameState.collected_loot.get(loot_key, false):
		return {}

	var loot_id := generate_route_loot(location, route)
	if loot_id.is_empty():
		return {}

	GameState.inventory.append(loot_id)
	GameState.collected_loot[loot_key] = true
	var gear: Dictionary = _gear_db.get(loot_id, {})
	if not gear.is_empty():
		emit_signal("loot_awarded", gear)
	return gear


func give_starting_gear() -> void:
	var starting_gear := ["common_shoes_basic", "common_chalk_standard", "common_harness_basic"]
	for gear_id in starting_gear:
		if not GameState.inventory.has(gear_id):
			GameState.inventory.append(gear_id)
