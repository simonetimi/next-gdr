"use server";

import { postSystemMessage } from "@/server/actions/locationMessages";

export async function rollDice(
  dice: number,
  locationId: string,
  characterId: string,
) {
  if (dice < 2) throw new Error("Must roll at least 2 dice");
  if (dice > 100) throw new Error("Cannot roll more than 100 dice");
  const diceRoll = Math.floor(Math.random() * dice) + 1;

  // TODO import translation
  const content = `rolled a ${diceRoll} on a d${dice}.`;

  return await postSystemMessage(locationId, content, "dice", characterId);
}
