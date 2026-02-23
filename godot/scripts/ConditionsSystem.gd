extends Node

# Manages weather conditions and time-of-day system.
# Mirrors the conditions/time functions in js/camp.js.

signal conditions_changed
signal time_advanced(new_time_of_day: String)


func generate_conditions_for_time() -> void:
	var time_of_day: String = GameState.time_of_day

	# Temperature probabilities by time of day
	var temp_roll := randf()
	var temperature: String
	if time_of_day == "morning":
		if temp_roll < 0.70:   temperature = "cool"
		elif temp_roll < 0.90: temperature = "mild"
		else:                  temperature = "hot"
	elif time_of_day == "noon":
		if temp_roll < 0.10:   temperature = "cool"
		elif temp_roll < 0.40: temperature = "mild"
		else:                  temperature = "hot"
	else: # evening
		if temp_roll < 0.50:   temperature = "cool"
		elif temp_roll < 0.85: temperature = "mild"
		else:                  temperature = "hot"

	# Humidity probabilities by time of day
	var humid_roll := randf()
	var humidity: String
	if time_of_day == "morning":
		if humid_roll < 0.60:   humidity = "humid"
		elif humid_roll < 0.85: humidity = "moderate"
		else:                   humidity = "dry"
	elif time_of_day == "noon":
		if humid_roll < 0.15:   humidity = "humid"
		elif humid_roll < 0.40: humidity = "moderate"
		else:                   humidity = "dry"
	else: # evening
		if humid_roll < 0.33:   humidity = "humid"
		elif humid_roll < 0.67: humidity = "moderate"
		else:                   humidity = "dry"

	# Wind is independent of time
	var wind_roll := randf()
	var wind: String
	if wind_roll < 0.50:   wind = "calm"
	elif wind_roll < 0.85: wind = "moderate"
	else:                  wind = "heavy"

	GameState.current_conditions = {"temperature": temperature, "humidity": humidity, "wind": wind}
	emit_signal("conditions_changed")


func generate_daily_conditions() -> void:
	generate_conditions_for_time()


func get_conditions_modifiers() -> Dictionary:
	var mods := {"gripMult": 1.0, "pumpMult": 1.0}
	var temperature: String = GameState.current_conditions.get("temperature", "mild")
	var humidity: String = GameState.current_conditions.get("humidity", "moderate")
	var wind: String = GameState.current_conditions.get("wind", "calm")

	# Temperature affects pump
	if temperature == "cool":
		mods["pumpMult"] *= 0.85
	elif temperature == "hot":
		mods["pumpMult"] *= 1.15

	# Humidity affects grip
	if humidity == "dry":
		mods["gripMult"] *= 0.85
	elif humidity == "humid":
		mods["gripMult"] *= 1.15

	# Wind affects pump
	if wind == "moderate":
		mods["pumpMult"] *= 1.05
	elif wind == "heavy":
		mods["pumpMult"] *= 1.15

	return mods


func get_conditions_description() -> String:
	var temperature: String = GameState.current_conditions.get("temperature", "mild")
	var humidity: String = GameState.current_conditions.get("humidity", "moderate")
	var wind: String = GameState.current_conditions.get("wind", "calm")
	var temp_text := temperature.capitalize()
	var humid_text := humidity.capitalize()
	var wind_text: String
	match wind:
		"calm": wind_text = "Calm"
		"moderate": wind_text = "Moderate Wind"
		_: wind_text = "Heavy Wind"
	return "%s, %s, %s" % [temp_text, humid_text, wind_text]


func get_time_icon() -> String:
	match GameState.time_of_day:
		"morning": return "🌅"
		"noon":    return "☀️"
		"evening": return "🌙"
	return "☀️"


func advance_time() -> void:
	GameState.climbs_this_period += 1

	if GameState.climbs_this_period >= 3:
		GameState.climbs_this_period = 0

		if GameState.time_of_day == "morning":
			GameState.time_of_day = "noon"
			generate_conditions_for_time()
			emit_signal("time_advanced", "noon")
		elif GameState.time_of_day == "noon":
			GameState.time_of_day = "evening"
			generate_conditions_for_time()
			emit_signal("time_advanced", "evening")
		else: # evening
			emit_signal("time_advanced", "night")
