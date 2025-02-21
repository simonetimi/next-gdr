"use server";

import { postSystemMessage } from "@/server/actions/locationMessages";
import { getTranslations } from "next-intl/server";

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
