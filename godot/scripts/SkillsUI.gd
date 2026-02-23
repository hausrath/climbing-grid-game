extends Control

# Skills overlay. Shows all 8 skills with unlock status and description.
# Mirrors renderSkillsUI() in js/skills.js and the skills panel in js/camp.js.

signal closed

@onready var skills_container: VBoxContainer = $Panel/MarginContainer/VBox/ScrollContainer/SkillsContainer
@onready var close_btn: Button = $Panel/MarginContainer/VBox/CloseButton
@onready var title_label: Label = $Panel/MarginContainer/VBox/TitleLabel


func _ready() -> void:
	if close_btn:
		close_btn.pressed.connect(_on_close)
	if title_label:
		title_label.text = "Skills"
	hide()


func show_skills() -> void:
	_render_skills()
	show()


func _render_skills() -> void:
	if not skills_container:
		return
	for child in skills_container.get_children():
		child.queue_free()

	for skill_id in SkillsDB.SKILL_UNLOCK_ORDER:
		var skill: Dictionary = SkillsDB.SKILL_DATABASE.get(skill_id, {})
		if skill.is_empty():
			continue

		var unlocked: bool = SkillsDB.is_skill_unlocked(skill_id)

		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 8)

		# Status indicator
		var status := Label.new()
		status.text = "[✓]" if unlocked else "[ ]"
		status.modulate = Color(0.4, 1.0, 0.4) if unlocked else Color(0.5, 0.5, 0.5)
		status.custom_minimum_size = Vector2(30, 0)
		row.add_child(status)

		# Skill info
		var info_col := VBoxContainer.new()
		info_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL

		var name_line := Label.new()
		var key_hint := (" [%s]" % skill.get("key", "")) if skill.has("key") else ""
		name_line.text = "%s%s" % [skill.get("name", skill_id), key_hint]
		name_line.modulate = Color.WHITE if unlocked else Color(0.5, 0.5, 0.5)
		info_col.add_child(name_line)

		var desc_line := Label.new()
		desc_line.text = skill.get("description", "")
		desc_line.modulate = Color(0.8, 0.8, 0.8) if unlocked else Color(0.4, 0.4, 0.4)
		desc_line.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		info_col.add_child(desc_line)

		var effect_line := Label.new()
		effect_line.text = skill.get("effect", "")
		effect_line.modulate = Color(0.6, 0.9, 0.6) if unlocked else Color(0.3, 0.3, 0.3)
		effect_line.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		info_col.add_child(effect_line)

		if not unlocked:
			var unlock_line := Label.new()
			var loc_id: int = skill.get("unlock_location", -1)
			unlock_line.text = "Unlock: Area %d" % loc_id
			unlock_line.modulate = Color(0.5, 0.5, 0.5)
			info_col.add_child(unlock_line)

		row.add_child(info_col)
		skills_container.add_child(row)

		# Separator
		var sep := HSeparator.new()
		skills_container.add_child(sep)


func _on_close() -> void:
	hide()
	emit_signal("closed")
