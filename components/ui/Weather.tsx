"use client";

import { ForecastMap, MoonMap } from "@/utils/weather";
import { WeatherForecasts } from "@/models/weather";
import { Thermometer } from "lucide-react";
import { Tooltip } from "@heroui/tooltip";
import { capitalize, fromCamelCase } from "@/utils/strings";
import { cloneElement } from "react";
import { useTranslations } from "next-intl";

export default function Weather({
  weather,
  temperatureColor,
}: {
  weather: WeatherForecasts;
  temperatureColor: string;
}) {
  const svgProps = { width: 20, height: 20 };
  const t = useTranslations("game.weather");

  return (
    <div className="flex w-full items-center justify-evenly rounded-2xl border border-default-200 p-1 text-sm dark:border-default-100">
      <Tooltip content={capitalize(t("condition." + weather.condition))}>
        {ForecastMap[weather.condition as keyof typeof ForecastMap]}
      </Tooltip>
      <Tooltip content={weather.temperature + t("temperatureUnit")}>
        <Thermometer style={{ color: temperatureColor }} />
      </Tooltip>
      <Tooltip content={fromCamelCase(t("moon." + weather.lunarPhase))}>
        {cloneElement(MoonMap[weather.lunarPhase as keyof typeof MoonMap], {
          ...svgProps,
          className: `stroke-neutral-800 dark:stroke-neutral-200 ${weather.lunarPhase === "new" ? "fill-none" : "fill-neutral-800  dark:fill-neutral-200"}`,
        })}
      </Tooltip>
    </div>
  );
}
