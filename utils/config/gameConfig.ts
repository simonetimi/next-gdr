export class GameConfig {
  public static isMultipleCharactersAllowed() {
    return process.env.ALLOW_MULTIPLE_CHARACTERS?.toLowerCase() === "true";
  }

  public static getMaxCharacters() {
    return parseInt(process.env.MAX_CHARACTERS_ALLOWED ?? "2");
  }

  public static getCharsLimitsPerAction() {
    return {
      min: parseInt(process.env.MIN_CHARS_PER_ACTION ?? "200"),
      max: parseInt(process.env.MAX_CHARS_PER_ACTION ?? "4000"),
    };
  }

  public static getSoftCharsLimitsPerAction() {
    return {
      min: parseInt(process.env.MIN_CHARS_PER_ACTION_SOFT ?? "500"),
      max: parseInt(process.env.MAX_CHARS_PER_ACTION_SOFT ?? "2000"),
    };
  }

  public static getLocationSettings() {
    return {
      fetchLastHours: parseInt(
        process.env.FETCH_LOCATION_MESSAGES_LAST_HOURS ?? "5",
      ),
      logInterval: parseInt(
        process.env.LOCATION_ACCESS_LOG_INTERVAL_MINUTES ?? "30",
      ),
    };
  }

  public static getExperiencePerAction() {
    return parseInt(process.env.EXPERIENCE_PER_ACTION ?? "1");
  }

  public static getLocale(): string {
    return process.env.NEXT_PUBLIC_LOCALE ?? "it-IT";
  }

  public static getTemperatureUnit() {
    return process.env.TEMPERATURE_UNIT ?? "C";
  }

  public static getSeasonTemperatures() {
    return {
      winter: {
        min: parseInt(process.env.WINTER_MIN_TEMP ?? "-15"),
        max: parseInt(process.env.WINTER_MAX_TEMP ?? "5"),
      },
      spring: {
        min: parseInt(process.env.SPRING_MIN_TEMP ?? "10"),
        max: parseInt(process.env.SPRING_MAX_TEMP ?? "20"),
      },
      summer: {
        min: parseInt(process.env.SUMMER_MIN_TEMP ?? "20"),
        max: parseInt(process.env.SUMMER_MAX_TEMP ?? "30"),
      },
      fall: {
        min: parseInt(process.env.FALL_MIN_TEMP ?? "5"),
        max: parseInt(process.env.FALL_MAX_TEMP ?? "15"),
      },
    };
  }

  public static getExtremeWeatherSettings() {
    return {
      allowed: process.env.ALLOW_EXTREME_WEATHER === "true",
      chance: parseInt(process.env.EXTREME_WEATHER_CHANCE ?? "10"),
    };
  }
}
