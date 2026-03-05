extends Control

# Game-over / route-complete popup. Displays stars, skill unlocks, loot.

signal retry_requested
signal map_requested

@onready var result_label: Label = $Panel/MarginContainer/VBox/ResultLabel
@onready var stars_label: Label = $Panel/MarginContainer/VBox/StarsLabel
@onready var details_label: Label = $Panel/MarginContainer/VBox/DetailsLabel
@onready var new_skills_label: Label = $Panel/MarginContainer/VBox/NewSkillsLabel
@onready var loot_label: Label = $Panel/MarginContainer/VBox/LootLabel
@onready var retry_btn: Button = $Panel/MarginContainer/VBox/ButtonRow/RetryBtn
@onready var map_btn: Button = $Panel/MarginContainer/VBox/ButtonRow/MapBtn


func _ready() -> void:
	if retry_btn:
		retry_btn.pressed.connect(func(): emit_signal("retry_requested"))
	if map_btn:
		map_btn.pressed.connect(func(): emit_signal("map_requested"))
	hide()


func show_result(success: bool, stars: int, star_results: Dictionary, new_skills: Array,
		new_actions: Array, loot: Dictionary, time_elapsed: float, time_limit: int,
		message: String) -> void:
	if result_label:
		result_label.text = "Route Complete!" if success else "You Fell!"
		result_label.modulate = Color(0.4, 1.0, 0.4) if success else Color(1.0, 0.4, 0.4)

	if stars_label:
		if success:
			stars_label.text = "★ %d / 5 stars" % stars
		else:
			stars_label.text = ""

	if details_label:
		if success:
			var parts := PackedStringArray()
			var keys := ["completion", "speed", "pumpEfficiency", "gripEfficiency", "flashClimb"]
			var labels := {"completion": "Completed", "speed": "Speed",
				"pumpEfficiency": "Pump Efficiency", "gripEfficiency": "Grip Efficiency",
				"flashClimb": "Flash Climb"}
			for k in keys:
				var got: bool = star_results.get(k, false)
				parts.append("%s: %s" % [labels.get(k, k), "✓" if got else "✗"])
			details_label.text = "\n".join(parts)
		else:
			details_label.text = message

	if new_skills_label:
		if not new_skills.is_empty():
			var names := PackedStringArray()
			for s in new_skills:
				names.append(s.get("name", ""))
			new_skills_label.text = "New skills: %s" % ", ".join(names)
		else:
			new_skills_label.text = ""

	if loot_label:
		if not loot.is_empty():
			loot_label.text = "Loot: %s" % loot.get("name", "gear")
		else:
			loot_label.text = ""

	show()


func show_victory(total_stars: int, routes_completed: int) -> void:
	if result_label:
		result_label.text = "VICTORY!"
		result_label.modulate = Color(1.0, 0.85, 0.1)
	if stars_label:
		stars_label.text = "Total Stars: %d | Routes: %d" % [total_stars, routes_completed]
	if details_label:
		details_label.text = "You've conquered The Ascension!"
	if new_skills_label:
		new_skills_label.text = ""
	if loot_label:
		loot_label.text = ""
	show()
