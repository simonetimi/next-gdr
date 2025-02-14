"use server";

import { auth } from "@/auth";
import { db } from "@/database/db";
import { characters } from "@/database/schema/character";
import {
  characterInsertSchema,
  characterSelectSchema,
  charactersSelectSchema,
} from "@/zod/schemas/character";
import { newCharacterFormSchema } from "@/zod/schemas/new-character-form";
import { eq } from "drizzle-orm";

export async function createCharacter(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

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

  return parsedCharacter;
}

export async function getCharacters() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const charactersList = await db
    .select()
    .from(characters)
    .where(eq(characters.userId, userId));

  return charactersSelectSchema.parse(charactersList);
}
