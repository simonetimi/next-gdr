import {
  CloudSun,
  Sun,
  Cloudy,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  Snowflake,
  Wind,
  CloudFog,
  Tornado,
  CloudSnow,
  ThermometerSun,
  ThermometerSnowflake,
  CloudRainWind,
} from "lucide-react";
import {
  FirstQuarter,
  FullMoon,
  LastQuarter,
  NewMoon,
  WaningCrescent,
  WaningGibbous,
  WaxingCrescent,
  WaxingGibbous,
} from "@/components/ui/icons/MoonPhases";

export const ForecastMap = {
  sunny: <Sun />,
  partlyCloudy: <CloudSun />,
  cloudy: <Cloudy />,
  rainy: <CloudDrizzle />,
  showers: <CloudRain />,
  thunderstorm: <CloudLightning />,
  snowy: <Snowflake />,
  windy: <Wind />,
  foggy: <CloudFog />,
  sunShower: <CloudSun />,
  hurricane: <Tornado />,
  tornado: <Tornado />,
  blizzard: <CloudSnow />,
  heatWave: <ThermometerSun />,
  coldWave: <ThermometerSnowflake />,
  flashFlood: <CloudRainWind />,
};

export const MoonMap = {
  full: <FullMoon />,
  new: <NewMoon />,
  waxingCrescent: <WaxingCrescent />,
  waningCrescent: <WaningCrescent />,
  waxingGibbous: <WaxingGibbous />,
  waningGibbous: <WaningGibbous />,
  firstQuarter: <FirstQuarter />,
  lastQuarter: <LastQuarter />,
};

export function temperatureToColor(temperature: number): string {
  const minTemp = parseInt(process.env.WINTER_MIN_TEMP!);
  const maxTemp = parseInt(process.env.SUMMER_MAX_TEMP!);

  const clampedTemp = Math.max(minTemp, Math.min(maxTemp, temperature));

  const normalizedTemp = (clampedTemp - minTemp) / (maxTemp - minTemp);

  const colors = [
    "#3b82f6", // blue-500
    "#60a5fa", // blue-400
    "#93c5fd", // blue-300
    "#bfdbfe", // blue-200
    "#fef3c7", // yellow-100
    "#fde68a", // yellow-200
    "#fcd34d", // yellow-300
    "#f87171", // red-400
    "#ef4444", // red-500
  ];

  const colorIndex = Math.round(normalizedTemp * (colors.length - 1));

  return colors[colorIndex];
}
