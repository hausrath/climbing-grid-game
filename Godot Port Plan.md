# Godot 4 Port Plan — Climb Shake Chalk

## Context

The HTML5 prototype runs on global-scope JS with a single `gameState` object, DOM manipulation for UI, and CSS for styling. This document is the implementation plan for a faithful Godot 4 (GDScript) port with all gameplay mechanics and UI intact.

**Excluded from port:** `route-editor/` — stays as a standalone HTML5 tool.

**Key architectural translation:**
- Global JS scope → Godot Autoload singletons
- DOM elements → Godot Control nodes
- CSS styling → StyleBoxes + custom `_draw()`
- `document.addEventListener('keydown')` → `_input()` in `Main.gd`
- `display: none/block` → `node.visible = true/false`

---

## Repository Layout

All Godot files live under a `godot/` subfolder alongside the existing HTML5 project:

```
Climbing Grid Prototype/
├── js/                        ← HTML5 game (unchanged)
├── css/
├── index.html
├── route-editor/              ← Route editor (stays HTML5)
├── Handcrafted Routes/
├── godot/                     ← Godot project root (res:// maps here)
│   ├── project.godot
│   ├── autoloads/
│   ├── data/
│   ├── scenes/
│   ├── scripts/
│   └── theme/
└── CLAUDE.md
```

---

## Godot Project Structure (`res://` = `godot/`)

```
res://
├── project.godot
├── autoloads/
│   ├── GameState.gd          # All runtime state + location definitions
│   ├── Constants.gd          # Hold types, grip costs, penalty table, normalizeAngle
│   ├── RouteDB.gd            # Penalty lookup, move helpers, route DB assembly
│   └── SkillsDB.gd           # Skill definitions, isSkillUnlocked, tryUnlock
├── data/
│   ├── routes_area0.gd       # class_name RoutesArea0, static func get_routes() -> Array
│   ├── routes_area1.gd
│   ├── routes_area2.gd
│   ├── routes_area3.gd
│   ├── routes_area4.gd
│   ├── routes_area5.gd
│   ├── routes_area6.gd
│   ├── routes_area7.gd
│   └── gear_data.gd          # class_name GearData, static func get_gear_database() -> Dictionary
├── scenes/
│   ├── Main.tscn             # Root scene; all modes as persistent child nodes
│   ├── TitleScreen.tscn
│   ├── WorldMap.tscn
│   ├── ClimbingScreen.tscn   # 3-panel layout
│   ├── HoldCell.tscn         # Reusable hold cell component (instantiated 49x)
│   └── overlays/
│       ├── RouteSelectOverlay.tscn
│       ├── CampOverlay.tscn
│       ├── GuidebookOverlay.tscn
│       ├── BetaOverlay.tscn
│       ├── EquipmentOverlay.tscn
│       ├── SkillsOverlay.tscn
│       ├── GameOverPopup.tscn
│       └── HelpModal.tscn
├── scripts/
│   └── (see Script Inventory)
└── theme/
    └── ClimbTheme.tres       # Shared StyleBoxes, fonts, colors
```

---

## Autoload Registrations

Register in **Project Settings → Autoload** in this order (mirrors JS load order):

| Autoload Name | Script | JS Equivalent |
|---|---|---|
| `Constants` | `autoloads/Constants.gd` | `js/constants.js` |
| `RouteDB` | `autoloads/RouteDB.gd` | `js/routes-data.js` |
| `SkillsDB` | `autoloads/SkillsDB.gd` | `js/skills-data.js` |
| `GameState` | `autoloads/GameState.gd` | `js/state.js` |

All scene scripts reference these four by their global autoload names.

---

## Scene Hierarchy

### Main.tscn (root, always resident)
```
Control (Main.gd)
├── TitleScreen (CanvasLayer z=0)        — TitleScreen.tscn instanced
├── GameContainer (Control, full-size)
│   ├── WorldMap (Control)               — WorldMap.tscn; visible in 'worldmap' mode
│   └── ClimbingScreen (Control)         — ClimbingScreen.tscn; visible in 'climbing' mode
├── RouteSelectOverlay (CanvasLayer z=10)
├── CampOverlay        (CanvasLayer z=20)
├── GuidebookOverlay   (CanvasLayer z=30)
├── BetaOverlay        (CanvasLayer z=31)
├── EquipmentOverlay   (CanvasLayer z=30)
├── SkillsOverlay      (CanvasLayer z=30)
├── GameOverPopup      (CanvasLayer z=50)
└── HelpModal          (CanvasLayer z=60)
```

### ClimbingScreen.tscn (the 3-panel layout)
```
HBoxContainer (ClimbingScreen.gd)
├── LeftPanel (VBoxContainer, min_width=180)
│   ├── Label "Hand Selection"
│   ├── HandButtons (HBoxContainer)
│   │   ├── Button [left_hand_btn]    "SELECT (A)"
│   │   └── Button [right_hand_btn]   "SELECT (D)"
│   └── WeightSection (VBoxContainer) [hidden until weightShift skill]
│       ├── Label "Body Weight"
│       ├── HBoxContainer
│       │   ├── Button [weight_left_btn]
│       │   ├── Button [weight_center_btn]
│       │   └── Button [weight_right_btn]
│       └── Label [weight_indicator]
├── CenterPanel (VBoxContainer, EXPAND+FILL)
│   ├── GridContainer [grid] columns=7   — 49 HoldCell children
│   ├── PanelContainer (Actions)
│   │   ├── Label "ACTIONS"
│   │   ├── HBoxContainer: Button[shake_btn], Button[chalk_btn]
│   │   └── HBoxContainer [skill_actions_row]:
│   │       Button[cross_btn], Button[regular_btn], Button[reach_btn],
│   │       Button[commit_btn], Button[dyno_btn]
│   ├── PanelContainer (Info)
│   │   └── RichTextLabel [hold_tooltip_static]
│   └── PanelContainer (Counter)
│       └── Label [move_count]
└── RightPanel (VBoxContainer, min_width=200)
    ├── Label "Resources"
    ├── PumpBar (ResourceBar.tscn instanced)
    ├── GripBar (ResourceBar.tscn instanced)
    ├── Label "Feedback"
    ├── ScrollContainer > VBoxContainer [feedback]
    ├── PanelContainer [sidebar_location_modifiers] (hidden until in-location)
    ├── PanelContainer [sidebar_conditions]
    ├── Button "GO TO CAMP"
    ├── Button "GUIDEBOOK"
    └── Button "SKILLS"
```

### HoldCell.tscn (instantiated 49 times in the grid)
```
Control (HoldCell.gd, fixed 80×80px)
├── SemicircleHold (Control — custom _draw) [hold_shape]
│   ├── Label [hold_label]      "JUG", "EDGE", etc.
│   └── Label [angle_indicator] "45°"
├── Label [hand_indicator]      "L" or "R"
└── Label [player_marker]       "🧗"
```

---

## Script Inventory

All scripts must stay under 500 lines. Estimated counts are based on the source JS file sizes.

### Autoloads

| Script | Est. Lines | Contents | JS Source |
|---|---|---|---|
| `autoloads/Constants.gd` | ~150 | `HOLD_TYPES`, `HOLD_GRIP_COST`, `PENALTY_TABLE_RAW` (144 entries), `PUMP_STATE_LABELS`, `GRIP_STATE_LABELS`, `func normalize_angle()` | `js/constants.js` |
| `autoloads/RouteDB.gd` | ~100 | Builds `_penalty_map` dict in `_ready()` from PENALTY_TABLE_RAW. `lookup_penalty()`, `get_move_direction()`, `is_cross_move()`, `get_ideal_weight()`, `route_database` dict, `get_routes_for_location()` | `js/routes-data.js` |
| `autoloads/SkillsDB.gd` | ~130 | `SKILL_DATABASE` (8 entries), `SKILL_STAR_THRESHOLD = 8`, `is_skill_unlocked()`, `try_unlock_skill_on_completion()`, `try_unlock_skill_at_location()` | `js/skills-data.js` |
| `autoloads/GameState.gd` | ~200 | All ~96 state fields (snake_case), `locations: Array` (25 dicts), `location_names`, `calculate_total_stars()`, `calculate_location_stars()`, `is_location_unlocked()`, `signal game_mode_changed(mode: String)` | `js/state.js` |

### Data Files (not autoloads — called by RouteDB in `_ready()`)

| Script | Est. Lines | Contents |
|---|---|---|
| `data/routes_area0.gd` | ~100 | `class_name RoutesArea0` + `static func get_routes() -> Array` returning 4 route Dicts |
| `data/routes_area1.gd` | ~85 | Same pattern, 3 routes |
| `data/routes_area2.gd` | ~115 | Same, 3 routes |
| `data/routes_area3.gd` | ~95 | Same |
| `data/routes_area4.gd` | ~105 | Same |
| `data/routes_area5.gd` | ~115 | Same |
| `data/routes_area6.gd` | ~115 | Same |
| `data/routes_area7.gd` | ~130 | Same |
| `data/gear_data.gd` | ~215 | `class_name GearData` + `static func get_gear_database() -> Dictionary` — 50 items across 5 rarities |

### Scene Scripts

| Script | Est. Lines | Contents | JS Source |
|---|---|---|---|
| `scripts/Main.gd` | ~120 | `_input()` for all keyboard shortcuts; `set_game_mode()` visibility switching; `start_game()`, `show_world_map()`, `start_climb()`, `return_to_world_map()` | `js/main.js` (flow) |
| `scripts/TitleScreen.gd` | ~30 | Any-key → `Main.start_game()` | `js/main.js` |
| `scripts/WorldMap.gd` | ~150 | `render_world_map()` — 25 location Buttons in GridContainer; `select_location()`; hover → `TooltipController.show_location_tooltip()` | `js/main.js` (map) |
| `scripts/RouteSelectOverlay.gd` | ~160 | `show_route_selection(location)`; route list; conditions display; climb button → `Main.start_climb()` | `js/main.js` |
| `scripts/ClimbingScreen.gd` | ~80 | Wires HoldCell click signals → `ClimbingLogic.move_to_hold()`; calls `RouteLoader.load_route()` on climb start | `js/main.js` |
| `scripts/ClimbingGrid.gd` | ~210 | Holds 49 HoldCell instances; `render_grid()` — updates each cell's hold data, reachability highlight, player marker; emits `hold_clicked(row, col)` and `hold_hovered(hold, row, col)` | `js/ui.js` (renderGrid) |
| `scripts/HoldCell.gd` | ~80 | `set_hold(data)`, `set_reachable(bool)`, `clear()`, `set_player_here(hand)`; emits `pressed(row, col)` and `hovered(row, col)` | `js/ui.js` |
| `scripts/ClimbingUI.gd` | ~220 | `update_ui()` — hand button disabled/selected state, weight section visibility, action/skill button text+cooldowns, pump/grip bar widths+colors, move counter; `add_feedback(text, type)`; `update_sidebar_conditions()` | `js/ui.js` (updateUI) |
| `scripts/TooltipController.gd` | ~200 | `show_hold_tooltip()`, `refresh_tooltip()` (full penalty breakdown per hand, grip cost, ideal weight), `hide_hold_tooltip()`, `show_location_tooltip()`, `show_skill_tooltip()` | `js/ui-tooltip.js` |
| `scripts/RouteLoader.gd` | ~120 | `load_route(route)`, `update_viewport()`, `route_row_to_viewport_row()`, `viewport_row_to_route_row()` | `js/route.js` |
| `scripts/ClimbingLogic.gd` | ~230 | `move_to_hold(row, col)` — full penalty resolution pipeline: lookup → +1 gaston → +1 distance (negated by Reach) → Cross modifier → Commit modifier → pump/grip accumulation → cooldown decrement → position update → viewport update → render | `js/climbing.js` (moveToHold) |
| `scripts/ClimbingActions.gd` | ~170 | `use_shake()`, `use_chalk()`, `activate_commit()`, `activate_dyno()`, `find_current_hold()` | `js/climbing-actions.js` |
| `scripts/FamiliaritySystem.gd` | ~65 | `get_hold_familiarity_key()`, `get_hold_familiarity_bonus()`, `record_successful_grab()` | `js/climbing-actions.js` |
| `scripts/ClimbingCompletion.gd` | ~190 | `complete_route()` (star calc + save + loot + skill unlock), `end_game(victory, msg)`, `show_victory_screen()`, `retry_route()`, `return_to_route_selection()` | `js/climbing.js` (completeRoute, endGame) |
| `scripts/EquipmentLogic.gd` | ~190 | `equip_gear()`, `get_equipment_bonuses()`, `generate_route_loot()`, `award_route_loot()`, `give_starting_gear()` | `js/equipment.js` |
| `scripts/ConditionsSystem.gd` | ~140 | `generate_daily_conditions()`, `get_conditions_modifiers()`, `advance_time()`, `update_sidebar_conditions()` | `js/camp.js` |
| `scripts/CampUI.gd` | ~190 | `show_camp()`, `update_camp_ui()`, `camp_rest()`, `leave_camp()`, `show_camp_spend_points()` | `js/camp.js` |
| `scripts/GuidebookUI.gd` | ~160 | `show_guidebook()`, location accordion list with toggle, route entries with beta button, close | `js/camp.js` |
| `scripts/BetaUI.gd` | ~170 | `show_beta(location_id, route_id)`, hold sequence list, ideal conditions, route overview, `climb_from_beta()` | `js/camp.js` |
| `scripts/EquipmentUI.gd` | ~210 | Equipment slot display (10 slots), inventory grid, gear detail panel, equip/unequip buttons | `js/equipment.js` |
| `scripts/SkillsUI.gd` | ~125 | `show_skills()`, skill list with lock/unlock status, skill detail modal | `js/skills.js` |

**Total: 25 scripts.** All under 500 lines. `js/camp.js` (776 lines) is split across 4 scripts; `js/equipment.js` (442 lines) across 2.

---

## Hold Semicircle Appearance

The HTML CSS semicircle (`border-radius: 50% / 100% 100% 0 0` + CSS `transform: rotate`) is reproduced via **custom `_draw()`** in `HoldCell.gd`. No external assets required.

```gdscript
# In HoldCell.gd (the SemicircleHold child Control node)
var hold_color: Color = Color.GRAY
var hold_angle_deg: float = 0.0
var has_hold: bool = false

func _draw() -> void:
    if not has_hold:
        return
    var center := size / 2.0
    var radius := min(size.x, size.y) / 2.0 - 2.0
    var start_rad := deg_to_rad(hold_angle_deg - 90.0)
    # Dim background circle
    draw_arc(center, radius, 0.0, TAU, 32, hold_color.darkened(0.5), 2.0)
    # Filled semicircle polygon
    var pts := PackedVector2Array([center])
    for i in range(33):
        var a := start_rad + (PI / 32.0) * i
        pts.append(center + Vector2(cos(a), sin(a)) * radius)
    draw_colored_polygon(pts, hold_color)
```

Call `queue_redraw()` whenever `hold_color` or `hold_angle_deg` change.

---

## Game Mode Switching

Visibility-toggle approach — mirrors the HTML `display: none/block` pattern. All nodes stay in memory; no scene loads after startup.

```gdscript
# Main.gd
func set_game_mode(mode: String) -> void:
    GameState.game_mode = mode
    $TitleScreen.visible                    = (mode == "title")
    $GameContainer/WorldMap.visible         = (mode == "worldmap")
    $GameContainer/ClimbingScreen.visible   = (mode == "climbing")
    $RouteSelectOverlay.visible             = (mode == "routeselect")
    # Camp/guidebook/beta/skills/equipment overlays toggled by their own show/close functions
```

---

## Keyboard Input

Handled centrally in `Main.gd._input()`, mirroring the single `keydown` listener in `js/main.js`:

```gdscript
func _input(event: InputEvent) -> void:
    if not (event is InputEventKey and event.pressed): return
    if event.keycode == KEY_TAB:
        toggle_help_modal(); return
    match GameState.game_mode:
        "title":
            start_game()
        "worldmap", "routeselect":
            if event.keycode == KEY_ESCAPE: show_world_map()
        "climbing":
            _handle_climbing_input(event)

func _handle_climbing_input(event: InputEvent) -> void:
    match event.keycode:
        KEY_A:      select_hand("left")
        KEY_D:      select_hand("right")
        KEY_Q:      ClimbingActions.use_shake()
        KEY_E:      ClimbingActions.use_chalk()
        KEY_R:      ClimbingActions.activate_commit()
        KEY_T:      ClimbingActions.activate_dyno()
        KEY_1:      select_movement_style("reach")
        KEY_2:      select_movement_style("regular")
        KEY_3:      select_movement_style("cross")
        KEY_Z:      set_weight("left")
        KEY_X:      set_weight("center")
        KEY_C:      set_weight("right")
        KEY_ESCAPE: return_to_world_map()
```

---

## Verification Checklist

1. **Data layer:** `RouteDB.lookup_penalty("up","right",0,"center")` → 0; `RouteDB.get_routes_for_location(0)` → 4 routes; 25 locations generate with correct row/col/tier.
2. **Grid render:** Load Area 0 "Hands" — 8 holds at correct positions; player at row 0 col 3; reachable holds highlighted; unreachable dimmed.
3. **Move resolution:** Left hand + jug at 0° directly above → pump stays 0. Cross-body move → penalty applied. 2-row jump without Reach → +1 distance penalty. Pump hits 3 → fall triggered.
4. **Actions:** Shake at pump 0 → "Already fresh". Chalk with 3 remaining → grip resets, remaining = 2. Commit → button shows ACTIVE, next move -1 penalty, then 10-move cooldown.
5. **Skills:** Complete Area 0 route → Cross unlocked. 8 stars at Area 0 → Reach unlocked. Enter Area 1 → Weight section appears.
6. **World map:** Only (0,0) unlocked at start. 8+ stars at (0,0) → (1,0) and (0,1) unlock. Hover → location modifier tooltip.
7. **Overlays:** All 7 overlays open and close without losing climbing state. Help modal blocks all other input while open.
8. **Stars:** Completion always awarded. Speed requires holdsClimbed ≤ timeLimit. Pump/grip efficiency checks end state. Flash requires routeAttempts == 1. Stars never decrease on retry.

---

## Critical Files to Read Before Implementing Each Script

| Script to write | Must read first |
|---|---|
| `Constants.gd` + `RouteDB.gd` | `js/constants.js`, `js/routes-data.js` |
| `GameState.gd` | `js/state.js` (all 239 lines) |
| `ClimbingLogic.gd` | `js/climbing.js` lines 2–256 (full `moveToHold`) |
| `CampUI` + `ConditionsSystem` + `GuidebookUI` + `BetaUI` | `js/camp.js` (all 776 lines) |
| `EquipmentUI` + `EquipmentLogic` | `js/equipment.js` (all 442 lines) |
