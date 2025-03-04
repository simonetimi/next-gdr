import "server-only";

import { db } from "@/database/db";
import { weatherForecasts } from "@/database/schema/weather";
import { desc } from "drizzle-orm";
import { weatherSelectSchemaMinimal } from "@/zod/schemas/weather";

export async function fetchWeather() {
  const [weather] = await db
    .select({
      temperature: weatherForecasts.temperature,
      condition: weatherForecasts.condition,
      windSpeed: weatherForecasts.windSpeed,
      lunarPhase: weatherForecasts.lunarPhase,
    })
    .from(weatherForecasts)
    .orderBy(desc(weatherForecasts.createdAt))
    .limit(1);

  return weatherSelectSchemaMinimal.parse(weather);
}
