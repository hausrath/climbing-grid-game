# Godot Port — Editor Setup Guide

This document covers everything you need to do inside the Godot 4 editor to get the port running. The code scaffold is complete (48 files), so most wiring is already done; what remains is import, verification, and a few things that genuinely require the editor UI.

---

## 1. Open the Project

1. Launch **Godot 4.3** (must be 4.x — the project uses GDScript 2.0 syntax).
2. In the Project Manager, click **Import**.
3. Navigate to `Climbing Grid Prototype/godot/` and select `project.godot`.
4. Click **Import & Edit**.

Godot will scan all files and regenerate `.import` metadata and UIDs. This takes a few seconds. You will likely see a handful of warnings in the **Output** panel — these are expected and are addressed below.

---

## 2. Verify Autoloads

Go to **Project → Project Settings → Autoload** and confirm these four entries exist in this order:

| Name | Path |
|---|---|
| `Constants` | `res://autoloads/Constants.gd` |
| `RouteDB` | `res://autoloads/RouteDB.gd` |
| `SkillsDB` | `res://autoloads/SkillsDB.gd` |
| `GameState` | `res://autoloads/GameState.gd` |

They should already be there from `project.godot`. The order matters: `Constants` must load before `RouteDB`, and `GameState` must load last.

---

## 3. Verify the Main Scene

Go to **Project → Project Settings → Application → Run** and confirm:

- **Main Scene:** `res://scenes/Main.tscn`

This is already set in `project.godot`, but worth confirming.

---

## 4. First Test Run — What to Expect

Press **F5** (or the Play button). You should see:

- A dark screen with **"Climb Shake Chalk"** title and blinking prompt.
- Pressing any key transitions to the **World Map** with one location visible (Area 0, top-left).
- Clicking the location opens the **Route Select** overlay with three routes.
- Clicking CLIMB loads the **Climbing Screen** with a 7×7 grid of semicircle holds.

If you get a crash or black screen instead, check the **Output / Debugger** tab. Common first-run issues are listed in Section 7.

---

## 5. Things That Are Already Wired in Code (No Editor Action Needed)

The following are handled entirely in GDScript — you do **not** need to set them in the Inspector or the Signal graph:

- **All signal connections** — `Main._wire_overlay_signals()` connects every overlay's signals at startup.
- **Logic node references** (`route_loader`, `familiarity_system`, `equipment_logic`, `conditions_system`) — `Main._wire_logic_refs()` injects these via `set()` at startup.
- **ClimbingScreen ↔ logic signals** — `ClimbingScreen.assign_logic_nodes()` wires `ClimbingLogic`, `ClimbingActions`, and `ClimbingCompletion` signals on first climb.
- **HoldCell grid construction** — `ClimbingGrid._build_cells()` creates all 49 cells procedurally; no manual scene instancing needed.
- **Starting gear** — `EquipmentLogic.give_starting_gear()` runs on `Main._ready()`.
- **Daily conditions** — `ConditionsSystem.generate_daily_conditions()` runs on `Main._ready()`.

---

## 6. Things That Need Your Attention in the Editor

### 6a. GameOverPopup Button Signals

The **Retry** and **World Map** buttons in the `GameOverPopup` (inside `ClimbingScreen.tscn`) need their `pressed` signals connected. The `GameOverPopup.gd` script emits `retry_requested` and `map_requested`, but nothing yet listens to them.

**Option A — Wire in ClimbingScreen.gd (recommended):**
Open `godot/scripts/ClimbingScreen.gd` and add to `_connect_signals()`:
```gdscript
if game_over_popup:
    game_over_popup.retry_requested.connect(_on_retry)
    game_over_popup.map_requested.connect(_on_map_from_popup)
```
Then add the two handlers:
```gdscript
func _on_retry() -> void:
    if GameState.current_route.is_empty(): return
    var main := get_tree().root.get_node_or_null("Main")
    if main and main.has_method("_start_climb"):
        main._start_climb(GameState.current_route)

func _on_map_from_popup() -> void:
    var main := get_tree().root.get_node_or_null("Main")
    if main and main.has_method("show_world_map"):
        main.show_world_map()
```

**Option B — Wire in the editor:**
In the `ClimbingScreen.tscn` scene, select the `RetryBtn` node, go to the **Node → Signals** panel, and connect `pressed` to `GameOverPopup.gd`. Repeat for `MapBtn`. (This is more fragile if you edit the scene later.)

### 6b. Camp "Go to Camp" Button on the Climbing Screen

The right panel has a "GO TO CAMP" button defined in the scene but no script connection. Add to `ClimbingUI.gd _ready()` or wire in the editor:
```gdscript
# Find the camp button and connect it
var camp_btn := $RightPanel/CampBtn  # adjust path if needed
if camp_btn:
    camp_btn.pressed.connect(func():
        var main := get_tree().root.get_node_or_null("Main")
        if main: main.open_camp())
```

Alternatively, add a `CampBtn` node to `RightPanel` in `ClimbingScreen.tscn` and wire its signal there.

> **Note:** The current `ClimbingScreen.tscn` does not include CampBtn, GuidebookBtn, or SkillsBtn in the right panel — only the feedback list and resource bars. You'll want to add these three buttons to `RightPanel` in the scene editor, then connect their signals to `Main.open_camp()`, `Main._show_guidebook()`, and `Main._show_skills()`.

### 6c. Right-Panel Button Layout (RightPanel in ClimbingScreen.tscn)

The `RightPanel` as written has: PumpLabel, PumpBar, GripLabel, GripBar, FeedbackScroll, SidebarConditions. You should add three navigation buttons at the bottom in the editor:

1. Open `ClimbingScreen.tscn` in the **Scene** panel.
2. Select the `RightPanel` (VBoxContainer under ClimbingUI).
3. Add three `Button` nodes at the bottom:
   - Name: `CampBtn`, Text: `CAMP (F1)`
   - Name: `GuidebookBtn`, Text: `GUIDEBOOK`
   - Name: `SkillsBtn`, Text: `SKILLS`
4. In the **Node → Signals** panel for each, connect `pressed` to the appropriate method in `Main.gd` (or to a passthrough in `ClimbingUI.gd`).

### 6d. Visual Theme (Optional but Recommended)

All nodes use Godot's default theme. To match the dark HTML prototype look, create a shared theme:

1. In the **FileSystem** panel, right-click `res://theme/` (create the folder first) → **New Resource** → `Theme` → save as `ClimbTheme.tres`.
2. Select it and use the **Theme Editor** to set:
   - Panel background: dark (`Color(0.08, 0.08, 0.1)`)
   - Button normal/hover/pressed colors
   - Font sizes (14px body, 18px headings)
   - `ProgressBar` fill colors (green for pump, blue for grip)
3. Apply it to `Main.tscn`'s root node via the **Inspector → Theme** property — all child Controls inherit it automatically.

---

## 7. Common First-Run Errors and Fixes

### "Node not found: 'ClimbingLogicNodes/RouteLoader'"
The `ClimbingLogicNodes` Node in `Main.tscn` must exist and have all 7 logic script nodes as children. Open `Main.tscn` in the editor and verify the hierarchy:
```
Main
└── ClimbingLogicNodes (Node)
    ├── RouteLoader      (script: RouteLoader.gd)
    ├── ClimbingLogic    (script: ClimbingLogic.gd)
    ├── ClimbingActions  (script: ClimbingActions.gd)
    ├── ClimbingCompletion (script: ClimbingCompletion.gd)
    ├── EquipmentLogic   (script: EquipmentLogic.gd)
    ├── ConditionsSystem (script: ConditionsSystem.gd)
    └── FamiliaritySystem (script: FamiliaritySystem.gd)
```
If any are missing, add a `Node` child and assign the script via the **Inspector → Script** field.

### "@onready: Node not found" warnings in Debugger
These mean an `@onready` path doesn't match the scene tree. The approach:
1. Click the error in the **Debugger** to see which script and variable.
2. Open the relevant scene in the editor.
3. Use the **Scene** panel to find the actual node path (hover a node to see its full path in the status bar).
4. Update the `@onready` line in the script to match.

### "Invalid call. Nonexistent function 'assign_logic_nodes'"
`ClimbingScreen.gd` must be attached to the `ClimbingScreen` node (not `GameContainer` or any other). In `Main.tscn`, click the `ClimbingScreen` node and verify the **Inspector → Script** field shows `ClimbingScreen.gd`.

### RouteDB errors on startup ("Invalid get index 'RoutesArea0'")
The `data/routes_area*.gd` files use `class_name` declarations (`class_name RoutesArea0` etc.). These are referenced by name in `RouteDB.gd`. Godot registers class names at import time — if they aren't recognised, re-save the data files by opening each one in the script editor and pressing **Ctrl+S**.

### Black grid / no holds rendering
`ClimbingGrid._build_cells()` tries to load `res://scenes/HoldCell.tscn` first. If that fails (e.g. wrong path), it falls back to attaching `HoldCell.gd` directly. Either way cells are created, but custom `_draw()` requires `queue_redraw()` to fire. If you see empty squares, try calling `render_grid()` manually from the debugger: select the `ClimbingGrid` node → **Remote** tab → call `render_grid()`.

---

## 8. Keyboard Controls Reference (for testing)

| Key | Action |
|---|---|
| Any key | Start game (title screen) |
| A / D | Select left / right hand |
| Q | Shake (pump −1) |
| E | Chalk (grip reset) |
| 1 / 2 / 3 | Reach / Regular / Cross style |
| Z / X / C | Weight left / center / right |
| R | Commit (skill) |
| T | Dyno (skill) |
| F1 | Open Camp |
| Escape | Return to world map |
| Tab | Toggle help modal |

---

## 9. What the Editor Cannot Help With

These things require script edits, not editor clicks:

- **Penalty math** — all in `autoloads/RouteDB.gd` and `autoloads/Constants.gd`.
- **Route data** — all in `data/routes_area*.gd`. Add holds by editing the `holds: []` arrays.
- **Skill unlock logic** — in `autoloads/SkillsDB.gd`.
- **Hold rendering appearance** — the semicircle `_draw()` code is in `scripts/HoldCell.gd`.
- **Feedback messages** — emitted by `ClimbingLogic.gd`, `ClimbingActions.gd`.

---

## 10. Recommended First Steps Summary

1. Open project in Godot 4.3
2. Confirm autoloads (Section 2)
3. Press F5 — fix any `@onready` path errors from the Debugger (Section 7)
4. Wire the GameOverPopup buttons (Section 6a)
5. Add Camp/Guidebook/Skills buttons to RightPanel (Section 6c)
6. Play through a full climb to validate: hold rendering, penalty feedback, star award, and return to map
7. Apply a theme for readability (Section 6d)
