"use server";

import { auth } from "@/auth";
import { db } from "@/db/db";
import { users } from "@/db/schema/auth";
import {
  characterInsertSchema,
  characters,
  characterSelectSchema,
  races,
} from "@/db/schema/character";

export async function getRaces() {
  const fetchedRaces = await db
    .select({ name: races.name, id: races.id })
    .from(races);

  return fetchedRaces ?? null;
}

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

  const character = await db
    .insert(characters)
    .values(parsedCharacterData)
    .returning();

  const parsedCharacter = characterSelectSchema.parse(character[0]);

  await db.update(users).set({ hasCharacter: true });

  return parsedCharacter;
}
