"use server";

import { postSystemMessage } from "@/server/actions/locationMessages";
import { getTranslations } from "next-intl/server";
import { weatherForecasts } from "@/database/schema/weather";
import { db } from "@/database/db";
import { desc } from "drizzle-orm";
import { weatherSelectSchemaMinimal } from "@/zod/schemas/weather";

export async function rollDice(
  dice: number,
  locationId: string,
  characterId: string,
) {
  const tErrors = await getTranslations("errors.game.chat");

  if (dice < 2) throw new Error(tErrors("rollAtLeastTwoDice"));
  if (dice > 100) throw new Error("rollAtMostOneHundredDice");
  const diceRoll = Math.floor(Math.random() * dice) + 1;

  const tDice = await getTranslations("game.dice");

  const content = tDice("rolled", { dice, diceRoll });

  return await postSystemMessage(locationId, content, "dice", characterId);
}

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
