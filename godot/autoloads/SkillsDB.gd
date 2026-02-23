extends Node

const SKILL_STAR_THRESHOLD: int = 8

const SKILL_DATABASE: Dictionary = {
	"cross": {
		"id": "cross", "name": "Cross",
		"unlock_location": 0, "unlock_trigger": "completion",
		"key": "3",
		"description": "Activate before a cross-body move to reduce effective penalty by 1.",
		"effect": "Reduces cross-body or gaston penalty by 1 level. 3-move cooldown.",
		"cooldown": 3,
	},
	"reach": {
		"id": "reach", "name": "Reach",
		"unlock_location": 0, "unlock_trigger": "areaUnlock",
		"key": "1",
		"description": "Activate before a 2+ space move to negate the distance penalty.",
		"effect": "Negates the +1 penalty for extended (2+ space) moves. 3-move cooldown.",
		"cooldown": 3,
	},
	"weightShift": {
		"id": "weightShift", "name": "Weight Shift",
		"unlock_location": 1, "unlock_trigger": "areaUnlock",
		"description": "Manually set your body weight before a move.",
		"effect": "Shift weight one step (left/center/right). Allows pre-positioning for optimal angles.",
		"passive": true,
	},
	"match": {
		"id": "match", "name": "Match",
		"unlock_location": 2, "unlock_trigger": "areaUnlock",
		"description": "On matchable holds, place both hands to reset hand alternation.",
		"effect": "Resets hand choice and consecutive crosses. Costs 1 move.",
		"passive": true,
	},
	"deadpoint": {
		"id": "deadpoint", "name": "Deadpoint",
		"unlock_location": 3, "unlock_trigger": "areaUnlock",
		"description": "Recovery actions empower your next move.",
		"effect": "After Shake: no pump change. After Chalk: no grip decay.",
		"passive": true,
	},
	"commit": {
		"id": "commit", "name": "Commit",
		"unlock_location": 4, "unlock_trigger": "areaUnlock",
		"key": "r",
		"description": "Activate before a move to reduce effective penalty by 1.",
		"effect": "One-shot penalty reduction for a single crux move. 10-move cooldown.",
		"cooldown": 10,
	},
	"bump": {
		"id": "bump", "name": "Bump",
		"unlock_location": 5, "unlock_trigger": "areaUnlock",
		"key": "b",
		"description": "Move to an adjacent hold without changing hands.",
		"effect": "Reposition without hand alternation. Costs 1 move.",
		"cooldown": 0,
	},
	"dyno": {
		"id": "dyno", "name": "Dyno",
		"unlock_location": 7, "unlock_trigger": "areaUnlock",
		"key": "t",
		"description": "Activate before a move to jump to holds beyond normal reach.",
		"effect": "Extends max reach to 3 spaces. One-shot. 5-move cooldown.",
		"cooldown": 5,
	},
}

const SKILL_UNLOCK_ORDER: Array = [
	"cross", "reach", "weightShift", "match", "deadpoint", "commit", "bump", "dyno"
]

func is_skill_unlocked(skill_id: String) -> bool:
	return GameState.unlocked_skills.has(skill_id)

func try_unlock_skill_at_location(location_id: int) -> Array:
	var new_skills: Array = []
	for skill_id in SKILL_DATABASE:
		var skill: Dictionary = SKILL_DATABASE[skill_id]
		if skill["unlock_location"] == location_id \
				and not skill.has("unlock_trigger") \
				and not GameState.unlocked_skills.has(skill_id):
			GameState.unlocked_skills.append(skill_id)
			new_skills.append(skill)
	return new_skills

func try_unlock_skill_on_completion(location_id: int) -> Array:
	var new_skills: Array = []
	var location_stars := GameState.calculate_location_stars(location_id)
	var has_enough_stars := location_stars >= SKILL_STAR_THRESHOLD
	for skill_id in SKILL_DATABASE:
		var skill: Dictionary = SKILL_DATABASE[skill_id]
		if skill["unlock_location"] == location_id \
				and not GameState.unlocked_skills.has(skill_id):
			var trigger: String = skill.get("unlock_trigger", "")
			if trigger == "completion" or (trigger == "areaUnlock" and has_enough_stars):
				GameState.unlocked_skills.append(skill_id)
				new_skills.append(skill)
	return new_skills
