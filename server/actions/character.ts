"use server";

import { auth } from "@/auth";
import { db } from "@/database/db";
import { characters, characterSheets } from "@/database/schema/character";
import {
  characterInsertSchema,
  characterSelectSchema,
  characterSheetSchemaWithCharacter,
  charactersSelectSchema,
  newCharacterFormSchema,
} from "@/zod/schemas/character";

import { eq } from "drizzle-orm";
import { races } from "@/database/schema/race";
import { z } from "zod";

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

export async function getCharacterSheet(characterId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const hasFullPermission =
    session.user.role === "admin" || session.user.role === "master";

  const character = await db
    .select({ userId: characters.userId })
    .from(characters)
    .where(eq(characters.userId, userId));

  // handles possible multiple characters
  const isUserOwner = character.some((char) => char.userId === userId);

  const result = await db
    .select({
      id: characterSheets.id,
      avatarUrl: characterSheets.avatarUrl,
      musicUrl: characterSheets.musicUrl,
      birthDate: characterSheets.birthDate,
      eyeColor: characterSheets.eyeColor,
      hairColor: characterSheets.hairColor,
      height: characterSheets.height,
      weight: characterSheets.weight,
      customHTML: characterSheets.customHTML,
      character: {
        id: characters.id,
        firstName: characters.firstName,
        middleName: characters.firstName,
        lastName: characters.lastName,
        miniAvatarUrl: characters.miniAvatarUrl,
        createdAt: characters.createdAt,
        // only fetch experience if user is admin, master or is owner of the character
        ...(isUserOwner || hasFullPermission
          ? {
              totalExperience: characters.totalExperience,
              currentExperience: characters.currentExperience,
            }
          : {}),
      },
      race: {
        name: races.name,
      },
      // only fetch full object (master notes and background) if the user is admin or master
      ...(hasFullPermission
        ? { masterNotes: characterSheets.masterNotes }
        : {}),
      // only fetch "background" if the user is the owner of the character or if the role is admin or master
      ...(hasFullPermission || isUserOwner
        ? { background: characterSheets.background }
        : {}),
    })
    .from(characterSheets)
    .where(eq(characterSheets.characterId, characterId))
    .innerJoin(characters, eq(characterSheets.characterId, characterId))
    .innerJoin(races, eq(characters.raceId, races.id));

  const fetchedChar = result[0].character as z.infer<
    typeof characterSelectSchema
  >;

  // if not fetched, adds those fields as null for a correct parsing
  if (!hasFullPermission) {
    if (!isUserOwner) {
      result[0].background = null;
      fetchedChar.totalExperience = null;
      fetchedChar.currentExperience = null;
    }
    result[0].masterNotes = null;
  }

  return characterSheetSchemaWithCharacter.parse(result[0]);
}

// TODO make granular functions for specific things (eg. recover all the mini avatars for the "online" list)
