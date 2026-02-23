extends Control

# Equipment overlay: slot display, inventory list, gear detail, equip/unequip.
# Mirrors showEquipment() in js/equipment.js.

signal closed

@onready var close_btn: Button = $Panel/MarginContainer/VBox/CloseButton
@onready var title_label: Label = $Panel/MarginContainer/VBox/TitleLabel
@onready var slots_container: GridContainer = $Panel/MarginContainer/VBox/SlotsGrid
@onready var inventory_container: VBoxContainer = $Panel/MarginContainer/VBox/InvScroll/InventoryContainer
@onready var detail_panel: PanelContainer = $Panel/MarginContainer/VBox/DetailPanel
@onready var detail_label: RichTextLabel = $Panel/MarginContainer/VBox/DetailPanel/MarginContainer/DetailLabel
@onready var equip_btn: Button = $Panel/MarginContainer/VBox/DetailPanel/MarginContainer/EquipBtn
@onready var unequip_btn: Button = $Panel/MarginContainer/VBox/DetailPanel/MarginContainer/UnequipBtn

var _selected_gear_id: String = ""
var _equipment_logic: Node = null

const SLOTS := ["shoes", "harness", "chalk_bag", "belay_device", "helmet"]
const RARITY_COLORS := {
	"common": Color(0.7, 0.7, 0.7),
	"uncommon": Color(0.3, 1.0, 0.3),
	"rare": Color(0.3, 0.5, 1.0),
	"exquisite": Color(0.8, 0.2, 0.9),
	"legendary": Color(1.0, 0.6, 0.1),
}


func _ready() -> void:
	if title_label:
		title_label.text = "Equipment"
	if close_btn:
		close_btn.pressed.connect(_on_close)
	if equip_btn:
		equip_btn.pressed.connect(_on_equip)
	if unequip_btn:
		unequip_btn.pressed.connect(_on_unequip)
	if detail_panel:
		detail_panel.hide()
	hide()


func show_equipment(equipment_logic: Node) -> void:
	_equipment_logic = equipment_logic
	_render()
	show()


func _render() -> void:
	_render_slots()
	_render_inventory()
	if detail_panel:
		detail_panel.hide()


func _render_slots() -> void:
	if not slots_container:
		return
	for child in slots_container.get_children():
		child.queue_free()
	slots_container.columns = SLOTS.size()

	for slot_id in SLOTS:
		var col := VBoxContainer.new()
		var slot_lbl := Label.new()
		slot_lbl.text = slot_id.replace("_", " ").capitalize()
		slot_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		col.add_child(slot_lbl)

		var equipped_id: String = GameState.equipped_gear.get(slot_id, "")
		var item_lbl := Label.new()
		if equipped_id.is_empty():
			item_lbl.text = "(empty)"
			item_lbl.modulate = Color(0.5, 0.5, 0.5)
		else:
			var gear: Dictionary = {}
			if _equipment_logic and _equipment_logic.has_method("get_gear"):
				gear = _equipment_logic.get_gear(equipped_id)
			item_lbl.text = gear.get("name", equipped_id)
			var rarity: String = gear.get("rarity", "common")
			item_lbl.modulate = RARITY_COLORS.get(rarity, Color.WHITE)

		item_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		item_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		col.add_child(item_lbl)

		var unequip_slot_btn := Button.new()
		unequip_slot_btn.text = "Remove"
		unequip_slot_btn.disabled = equipped_id.is_empty()
		unequip_slot_btn.pressed.connect(_on_unequip_slot.bind(slot_id))
		col.add_child(unequip_slot_btn)

		slots_container.add_child(col)


func _render_inventory() -> void:
	if not inventory_container:
		return
	for child in inventory_container.get_children():
		child.queue_free()

	for gear_id in GameState.inventory:
		var gear: Dictionary = {}
		if _equipment_logic and _equipment_logic.has_method("get_gear"):
			gear = _equipment_logic.get_gear(gear_id)
		if gear.is_empty():
			continue

		var row := HBoxContainer.new()
		var name_btn := Button.new()
		var rarity: String = gear.get("rarity", "common")
		name_btn.text = gear.get("name", gear_id)
		name_btn.modulate = RARITY_COLORS.get(rarity, Color.WHITE)
		name_btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		name_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		name_btn.pressed.connect(_on_select_gear.bind(gear_id))

		var slot_lbl := Label.new()
		slot_lbl.text = gear.get("slot", "")
		slot_lbl.modulate = Color(0.7, 0.7, 0.7)
		slot_lbl.custom_minimum_size = Vector2(80, 0)

		row.add_child(name_btn)
		row.add_child(slot_lbl)
		inventory_container.add_child(row)


func _on_select_gear(gear_id: String) -> void:
	_selected_gear_id = gear_id
	var gear: Dictionary = {}
	if _equipment_logic and _equipment_logic.has_method("get_gear"):
		gear = _equipment_logic.get_gear(gear_id)
	if gear.is_empty() or not detail_panel:
		return

	detail_panel.show()
	if detail_label:
		detail_label.bbcode_enabled = true
		var lines := PackedStringArray()
		lines.append("[b]%s[/b]" % gear.get("name", ""))
		lines.append("Slot: %s | Rarity: %s" % [gear.get("slot", ""), gear.get("rarity", "")])
		var mods: Dictionary = gear.get("modifiers", {})
		for mod_key in mods:
			lines.append("%s: %s" % [mod_key, str(mods[mod_key])])
		detail_label.text = "\n".join(lines)

	var slot: String = gear.get("slot", "")
	var already_equipped: bool = GameState.equipped_gear.get(slot, "") == gear_id
	if equip_btn:
		equip_btn.disabled = already_equipped
	if unequip_btn:
		unequip_btn.disabled = not already_equipped


func _on_equip() -> void:
	if _selected_gear_id.is_empty() or not _equipment_logic:
		return
	if _equipment_logic.has_method("equip_gear"):
		_equipment_logic.equip_gear(_selected_gear_id)
	_render()


func _on_unequip() -> void:
	if _selected_gear_id.is_empty() or not _equipment_logic:
		return
	var gear: Dictionary = {}
	if _equipment_logic.has_method("get_gear"):
		gear = _equipment_logic.get_gear(_selected_gear_id)
	var slot: String = gear.get("slot", "")
	if slot and _equipment_logic.has_method("unequip_gear"):
		_equipment_logic.unequip_gear(slot)
	_render()


func _on_unequip_slot(slot_id: String) -> void:
	if _equipment_logic and _equipment_logic.has_method("unequip_gear"):
		_equipment_logic.unequip_gear(slot_id)
	_render()


func _on_close() -> void:
	hide()
	emit_signal("closed")
