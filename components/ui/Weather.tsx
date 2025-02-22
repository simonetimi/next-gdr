"use client";

import { ForecastMap } from "@/utils/weatherMapping";
import { MoonMap } from "@/utils/weatherMapping";
import { WeatherForecasts } from "@/models/weather";
import { Thermometer } from "lucide-react";
import { Tooltip } from "@heroui/tooltip";
import { capitalize, fromCamelCase } from "@/utils/strings";
import { cloneElement } from "react";
import { useTranslations } from "next-intl";

export default function Weather({ weather }: { weather: WeatherForecasts }) {
  const svgProps = { width: 20, height: 20 };
  const t = useTranslations("game");
  return (
    <div className="flex items-center justify-evenly text-sm">
      <Tooltip content={capitalize(t("weather." + weather.condition))}>
        {ForecastMap[weather.condition as keyof typeof ForecastMap]}
      </Tooltip>
      <span className="flex items-center">
        <Thermometer /> {weather.temperature}°C
      </span>
      <Tooltip content={fromCamelCase(t("moon." + weather.lunarPhase))}>
        {cloneElement(
          MoonMap[weather.lunarPhase as keyof typeof MoonMap],
          svgProps,
        )}
      </Tooltip>
    </div>
  );
}
