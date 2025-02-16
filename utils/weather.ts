import { Moon } from "lunarphase-js";
import { toCamelCase } from "@/utils/strings";

type WeatherCondition =
  | "sunny"
  | "mostlySunny"
  | "partlyCloudy"
  | "mostlyCloudy"
  | "cloudy"
  | "rainy"
  | "showers"
  | "thunderstorm"
  | "snowy"
  | "windy"
  | "foggy"
  | "stormy";

type ExtremeWeatherCondition =
  | "hurricane"
  | "tornado"
  | "blizzard"
  | "heatWave"
  | "coldWave"
  | "sandstorm"
  | "flashFlood";

export default function getWeather(): {
  temperature: number;
  condition: string;
  windSpeed: number;
  lunarPhase: string;
} {
  const isExtremeWeatherAllowed =
    process.env.ALLOW_EXTREME_WEATHER?.toLowerCase() === "true";
  const month = new Date().getMonth();
  const season = getSeason(month);
  let maxTemp;
  let minTemp;
  if (season === "winter") {
    maxTemp = parseInt(process.env.WINTER_MAX_TEMP!);
    minTemp = parseInt(process.env.WINTER_MIN_TEMP!);
  } else if (season === "spring") {
    maxTemp = parseInt(process.env.SPRING_MAX_TEMP!);
    minTemp = parseInt(process.env.SPRING_MIN_TEMP!);
  } else if (season === "summer") {
    maxTemp = parseInt(process.env.SUMMER_MAX_TEMP!);
    minTemp = parseInt(process.env.SUMMER_MIN_TEMP!);
  } else {
    maxTemp = parseInt(process.env.FALL_MAX_TEMP!);
    minTemp = parseInt(process.env.FALL_MIN_TEMP!);
  }
  const condition = getWeatherCondition(season, isExtremeWeatherAllowed);

  const windSpeed = getWindSpeed(condition);

  const phase = Moon.lunarPhase();

  return {
    temperature: Math.floor(Math.random() * (maxTemp - minTemp + 1)) + minTemp,
    condition: toCamelCase(condition),
    windSpeed,
    lunarPhase: toCamelCase(phase),
  };
}

function getWeatherCondition(
  season: string,
  isExtremeWeatherAllowed: boolean,
): WeatherCondition | ExtremeWeatherCondition {
  const random = Math.random() * 100;

  if (isExtremeWeatherAllowed) {
    const extremeWeatherChance = parseInt(process.env.EXTREME_WEATHER_CHANCE!);
    const extremeWeightsForSeason =
      extremeWeatherWeights[season as keyof typeof extremeWeatherWeights];
    if (random <= extremeWeatherChance) {
      let extremeSum = 0;
      const totalExtremeWeight = Object.values(extremeWeightsForSeason).reduce(
        (a, b) => a + b,
        0,
      );
      const normalizedRandom =
        (random / extremeWeatherChance) * totalExtremeWeight;

      for (const [condition, weight] of Object.entries(
        extremeWeightsForSeason,
      )) {
        extremeSum += weight;
        if (normalizedRandom <= extremeSum) {
          return condition as ExtremeWeatherCondition;
        }
      }
    }
  }

  const seasonWeights = weatherWeights[season as keyof typeof weatherWeights];
  let sum = 0;
  for (const [condition, weight] of Object.entries(seasonWeights)) {
    sum += weight;
    if (random <= sum) {
      return condition as WeatherCondition;
    }
  }
  // fallback
  return "sunny";
}

function getSeason(month: number) {
  if (month >= 0 && month < 3) return "winter";
  if (month >= 3 && month < 6) return "spring";
  if (month >= 6 && month < 9) return "summer";
  return "fall";
}

const weatherWeights = {
  winter: {
    sunny: 10,
    mostlySunny: 5,
    partlyCloudy: 10,
    mostlyCloudy: 15,
    cloudy: 30,
    rainy: 15,
    showers: 10,
    thunderstorm: 5,
    snowy: 20,
    windy: 10,
    foggy: 10,
    stormy: 10,
  },
  spring: {
    sunny: 25,
    mostlySunny: 10,
    partlyCloudy: 15,
    mostlyCloudy: 15,
    cloudy: 20,
    rainy: 15,
    showers: 10,
    thunderstorm: 5,
    snowy: 5,
    windy: 10,
    foggy: 10,
    stormy: 5,
  },
  summer: {
    sunny: 50,
    mostlySunny: 10,
    partlyCloudy: 15,
    mostlyCloudy: 10,
    cloudy: 10,
    rainy: 10,
    showers: 10,
    thunderstorm: 10,
    snowy: 0,
    windy: 5,
    foggy: 5,
    stormy: 5,
  },
  fall: {
    sunny: 20,
    mostlySunny: 5,
    partlyCloudy: 15,
    mostlyCloudy: 20,
    cloudy: 25,
    rainy: 15,
    showers: 10,
    thunderstorm: 5,
    snowy: 10,
    windy: 15,
    foggy: 10,
    stormy: 10,
  },
};

const extremeWeatherWeights = {
  winter: {
    blizzard: 5,
    coldWave: 15,
    flashFlood: 5,
  },
  spring: {
    tornado: 5,
    flashFlood: 5,
  },
  summer: {
    hurricane: 0,
    heatWave: 20,
    sandstorm: 5,
    flashFlood: 10,
  },
  fall: {
    hurricane: 5,
    tornado: 5,
    flashFlood: 5,
  },
};

const windSpeedRanges = {
  default: { min: 0, max: 15 },
  windy: { min: 20, max: 80 },
  stormy: { min: 20, max: 80 },
  thunderstorm: { min: 20, max: 80 },
  hurricane: { min: 120, max: 250 },
  tornado: { min: 100, max: 300 },
  blizzard: { min: 50, max: 100 },
  hail: { min: 0, max: 15 },
  sandstorm: { min: 20, max: 80 },
};

function getWindSpeed(condition: WeatherCondition | ExtremeWeatherCondition) {
  let range;

  switch (condition) {
    case "hurricane":
    case "tornado":
    case "blizzard":
    case "sandstorm":
    case "windy":
    case "stormy":
    case "thunderstorm":
      range = windSpeedRanges[condition];
      break;
    default:
      range = windSpeedRanges.default;
  }

  const speed =
    Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

  return speed;
}
