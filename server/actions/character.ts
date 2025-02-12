"use server";

import { auth } from "@/auth";
import { db } from "@/db/db";
import { users } from "@/db/schema/auth";
import {
  characterInsertSchema,
  characters,
  characterSelectSchema,
} from "@/db/schema/character";
import { eq } from "drizzle-orm";

export async function createCharacter(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) return null;

  const characterData = {
    userId: userId,
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    raceId: formData.get("race"),
  };

  const parsedCharacterData = characterInsertSchema.parse(characterData);

  const characterList = await db
    .insert(characters)
    .values(parsedCharacterData)
    .returning();

  const parsedCharacter = characterSelectSchema.parse(characterList[0]);

  await db.update(users).set({ hasCharacter: true });

  return parsedCharacter;
}

export async function getCharacter() {
  const session = await auth();

  if (!session || !session.user.id) throw new Error("User not authorized");

  const characterList = await db
    .select()
    .from(characters)
    .where(eq(characters.userId, session.user.id));

  return characterSelectSchema.parse(characterList[0]);
}
