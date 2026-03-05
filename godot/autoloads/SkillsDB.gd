extends Node

const SKILL_STAR_THRESHOLD: int = 8

const SKILL_DATABASE: Dictionary = {
	"cross": {
		"id": "cross", "name": "Cross",
		"unlock_location": 1, "unlock_trigger": "routeCount", "unlock_threshold": 1,
		"key": "3",
		"description": "Required for cross-body moves (no skill = fall). Activating reduces effective penalty by 1.",
		"effect": "Reduces cross-body or gaston penalty by 1 level. 3-move cooldown.",
		"cooldown": 3,
	},
	"reach": {
		"id": "reach", "name": "Reach",
		"unlock_location": 1, "unlock_trigger": "routeCount", "unlock_threshold": 2,
		"key": "1",
		"description": "Required for extended (2+ space) moves (no skill = fall). Activating negates distance penalty.",
		"effect": "Negates the +1 penalty for extended (2+ space) moves. 3-move cooldown.",
		"cooldown": 3,
	},
	"weightShift": {
		"id": "weightShift", "name": "Weight Shift",
		"unlock_location": 1, "unlock_trigger": "arrival",
		"description": "Manually set your body weight before a move.",
		"effect": "Shift weight (left/center/right) with Z/X/C. Allows pre-positioning for optimal angles.",
		"passive": true,
	},
	"match": {
		"id": "match", "name": "Match",
		"unlock_location": 1, "unlock_trigger": "routeCount", "unlock_threshold": 3,
		"description": "On matchable holds, place both hands to reset hand alternation.",
		"effect": "Resets hand choice and consecutive crosses. 3-move cooldown.",
		"passive": true,
		"cooldown": 3,
	},
	"deadpoint": {
		"id": "deadpoint", "name": "Deadpoint",
		"unlock_location": 3, "unlock_trigger": "areaUnlock",
		"description": "Recovery actions empower your next move.",
		"effect": "After Shake: next pump tick accumulation blocked. After Chalk: next grip state change blocked.",
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
		"description": "Activate to move laterally to an adjacent hold without changing hands.",
		"effect": "Lateral reposition without hand alternation. 3-move cooldown.",
		"cooldown": 3,
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

# Actions are tutorial unlocks (not skills), shown as intro popups on first unlock.
const ACTION_DATABASE: Dictionary = {
	"shake": {
		"id": "shake", "name": "Shake",
		"unlock_location": 0, "unlock_route": "bg2",
		"description": "Rest on a jug and shake your arms to reset pump.",
		"effect": "Fully resets pump to 0. Requires a shakable hold. 1-move cooldown.",
		"key": "Q",
	},
	"chalk": {
		"id": "chalk", "name": "Chalk",
		"unlock_location": 0, "unlock_route": "bg3",
		"description": "Apply chalk to restore grip when on a chalkable hold.",
		"effect": "Resets grip to 0. Requires a chalkable hold. 3 uses per climb. 1-move cooldown.",
		"key": "E",
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
				and skill.get("unlock_trigger", "") == "arrival" \
				and not GameState.unlocked_skills.has(skill_id):
			GameState.unlocked_skills.append(skill_id)
			new_skills.append(skill)
	return new_skills


func try_unlock_skill_on_completion(location_id: int) -> Array:
	var new_skills: Array = []
	var location_stars := GameState.calculate_location_stars(location_id)
	var has_enough_stars := location_stars >= SKILL_STAR_THRESHOLD

	# Count completed routes for this location
	var completed_route_count := 0
	for key in GameState.completed_routes:
		var parts: PackedStringArray = key.split("-")
		if parts.size() >= 1 and int(parts[0]) == location_id:
			completed_route_count += 1

	for skill_id in SKILL_DATABASE:
		var skill: Dictionary = SKILL_DATABASE[skill_id]
		if skill["unlock_location"] != location_id:
			continue
		if GameState.unlocked_skills.has(skill_id):
			continue
		var trigger: String = skill.get("unlock_trigger", "")
		var unlocked := false
		if trigger == "areaUnlock" and has_enough_stars:
			unlocked = true
		elif trigger == "routeCount":
			var threshold: int = skill.get("unlock_threshold", 1)
			if completed_route_count >= threshold:
				unlocked = true
		if unlocked:
			GameState.unlocked_skills.append(skill_id)
			new_skills.append(skill)
	return new_skills


func try_unlock_action_on_completion(location_id: int, route_id: String) -> Array:
	var new_actions: Array = []
	for action_id in ACTION_DATABASE:
		var action: Dictionary = ACTION_DATABASE[action_id]
		if action["unlock_location"] == location_id \
				and action["unlock_route"] == route_id \
				and not GameState.unlocked_actions.has(action_id):
			GameState.unlocked_actions.append(action_id)
			new_actions.append(action)
	return new_actions
