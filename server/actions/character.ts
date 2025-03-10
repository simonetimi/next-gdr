"use server";

import { db } from "@/database/db";
import { characters, characterSheets } from "@/database/schema/character";
import {
  characterInsertSchema,
  characterSelectSchema,
  newCharacterFormSchema,
} from "@/zod/schemas/character";

import { and, eq, gt } from "drizzle-orm";
import { sessions } from "@/database/schema/auth";
import { CHARACTER_ROUTE, GAME_ROUTE } from "@/utils/routes";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { getCurrentUser, getCurrentUserId } from "@/server/user";

export async function createCharacter(formData: FormData) {
  const userId = await getCurrentUserId();

  const validatedForm = newCharacterFormSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    raceId: formData.get("race"),
  });

  const parsedCharacterData = characterInsertSchema.parse({
    userId,
    ...validatedForm,
  });

  const characterList = await db
    .insert(characters)
    .values(parsedCharacterData)
    .returning();

  const parsedCharacter = characterSelectSchema.parse(characterList[0]);

  // creates an empty character sheet connected to the character just created
  await db.insert(characterSheets).values({ characterId: parsedCharacter.id });

  return parsedCharacter;
}

export async function setCurrentCharacter(characterId: string) {
  const userId = await getCurrentUserId();

  const now = new Date();

  // updates non expired-sessions
  const result = await db
    .update(sessions)
    .set({ selectedCharacterId: characterId })
    .where(and(eq(sessions.userId, userId), gt(sessions.expires, now)));

  // set last seen at
  await db
    .update(characters)
    .set({ lastSeenAt: now })
    .where(eq(characters.id, characterId));

  revalidatePath(GAME_ROUTE);
  revalidatePath(CHARACTER_ROUTE);

  // returns a boolean (true if success)
  return result?.rowCount > 0;
}

export async function resetCurrentCharacter() {
  const userId = await getCurrentUserId();

  const now = new Date();

  // updates non expired-sessions
  const result = await db
    .update(sessions)
    .set({ selectedCharacterId: null })
    .where(and(eq(sessions.userId, userId), gt(sessions.expires, now)));

  // returns a boolean (true if success)
  return result?.rowCount > 0;
}

export async function increaseCharacterExperience(
  amount: number,
  characterId: string,
) {
  await getCurrentUser();
  const t = await getTranslations("errors");

  const character = await db
    .select({
      currentExperience: characters.currentExperience,
      totalExperience: characters.totalExperience,
    })
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1);

  if (!character.length) throw new Error(t("game.characters.notFound"));

  const newCurrentExperience = (character[0].currentExperience || 0) + amount;
  const newTotalExperience = (character[0].totalExperience || 0) + amount;

  await db
    .update(characters)
    .set({
      currentExperience: newCurrentExperience,
      totalExperience: newTotalExperience,
    })
    .where(eq(characters.id, characterId));

  return {
    currentExperience: newCurrentExperience,
    totalExperience: newTotalExperience,
  };
}
