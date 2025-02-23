"use server";

import { postSystemMessage } from "@/server/actions/locationMessage";
import { getTranslations } from "next-intl/server";

export async function rollDice(
  dice: number,
  locationId: string,
  characterId: string,
) {
  const tErrors = await getTranslations("errors.chat");

  if (dice < 2) throw new Error(tErrors("rollAtLeastTwoDice"));
  if (dice > 100) throw new Error(tErrors("rollAtMostOneHundredDice"));
  const diceRoll = Math.floor(Math.random() * dice) + 1;

  const tDice = await getTranslations("game.dices");

  const content = tDice("rolled", { dice, diceRoll });

  return await postSystemMessage(locationId, content, "dice", characterId);
}
