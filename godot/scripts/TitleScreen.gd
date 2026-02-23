extends Control

# Title screen — shown at game start. Any key/click → Main.start_game().
# Mirrors the title screen block in js/main.js.

@onready var title_label: Label = $TitleLabel
@onready var subtitle_label: Label = $SubtitleLabel
@onready var press_label: Label = $PressLabel

var _blink_timer: float = 0.0
var _blink_visible: bool = true


func _ready() -> void:
	if title_label:
		title_label.text = "Climb Shake Chalk"
	if subtitle_label:
		subtitle_label.text = "A deterministic puzzle-climbing game"
	if press_label:
		press_label.text = "Press any key or click to start"


func _process(delta: float) -> void:
	if not visible:
		return
	_blink_timer += delta
	if _blink_timer >= 0.6:
		_blink_timer = 0.0
		_blink_visible = not _blink_visible
		if press_label:
			press_label.visible = _blink_visible


func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		_trigger_start()


func _trigger_start() -> void:
	var main := get_tree().root.get_node_or_null("Main")
	if main and main.has_method("start_game"):
		main.start_game()
