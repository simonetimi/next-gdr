"use server";

import { auth } from "@/auth";
import { db } from "@/database/db";
import { characters, characterSheets } from "@/database/schema/character";
import {
  characterInsertSchema,
  characterSelectSchema,
  characterSheetSchemaWithCharacter,
  charactersSelectSchema,
  minimalCharacterSchema,
  newCharacterFormSchema,
} from "@/zod/schemas/character";

import { and, desc, eq, gt, isNotNull, sql } from "drizzle-orm";
import { races } from "@/database/schema/race";
import { z } from "zod";
import { sessions } from "@/database/schema/auth";
import { CHARACTER_ROUTE, GAME_ROUTE } from "@/utils/routes";
import { revalidatePath } from "next/cache";
import { locationGroups, locations } from "@/database/schema/location";
import { onlineUsersSchema } from "@/zod/schemas/session";
import { isAdmin, isMaster } from "@/server/actions/roles";

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

  // creates an empty character sheet connected to the character just created
  await db.insert(characterSheets).values({ characterId: parsedCharacter.id });

  return parsedCharacter;
}

export async function getUserCharacters() {
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

  const hasFullPermission = (await isAdmin(userId)) || (await isMaster(userId));

  const character = await db
    .select({ userId: characters.userId })
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1);

  if (!character.length) throw new Error("Character not found");

  // handles possible multiple characters
  const isUserOwner = character[0].userId === userId;

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
    .innerJoin(characters, eq(characters.id, characterSheets.characterId))
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

export async function getCurrentCharacterIdOnly() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const now = new Date();

  // retrieves the last non-expired session
  const results = await db
    .select({ id: sessions.selectedCharacterId })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), gt(sessions.expires, now)))
    .orderBy(desc(sessions.expires))
    .limit(1);

  return results[0];
}

export async function getMinimalCurrentCharacter() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const now = new Date();

  // retrieves the last non-expired session and joins with characters table
  const results = await db
    .select({
      id: sessions.selectedCharacterId,
      firstName: characters.firstName,
      middleName: characters.middleName,
      lastName: characters.lastName,
      miniAvatarUrl: characters.miniAvatarUrl,
    })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), gt(sessions.expires, now)))
    .innerJoin(characters, eq(sessions.selectedCharacterId, characters.id))
    .orderBy(desc(sessions.expires))
    .limit(1);

  return minimalCharacterSchema.parse(results[0]);
}

export async function setCurrentCharacter(characterId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const now = new Date();

  // updates non expired-sessions
  const result = await db
    .update(sessions)
    .set({ selectedCharacterId: characterId })
    .where(and(eq(sessions.userId, userId), gt(sessions.expires, now)));

  revalidatePath(GAME_ROUTE);
  revalidatePath(CHARACTER_ROUTE);

  // returns a boolean (true if success)
  return result?.rowCount > 0;
}

export async function resetCurrentCharacter() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const now = new Date();

  // updates non expired-sessions
  const result = await db
    .update(sessions)
    .set({ selectedCharacterId: null })
    .where(and(eq(sessions.userId, userId), gt(sessions.expires, now)));

  revalidatePath(GAME_ROUTE);
  revalidatePath(CHARACTER_ROUTE);

  // returns a boolean (true if success)
  return result?.rowCount > 0;
}

export async function getOnlineCharacters() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const now = new Date();

  // subquery to get the latest session for each user
  const latestSessions = db
    .select({
      userId: sessions.userId,
      maxExpires: sql`MAX(${sessions.expires})`.as("maxExpires"),
    })
    .from(sessions)
    .where(
      and(gt(sessions.expires, now), isNotNull(sessions.selectedCharacterId)),
    )
    .groupBy(sessions.userId)
    .as("latestSessions");
  const results = await db
    .select({
      character: {
        firstName: characters.firstName,
        middleName: characters.middleName,
        lastName: characters.lastName,
        miniAvatarUrl: characters.miniAvatarUrl,
      },
      location: {
        name: locations.name,
        code: locations.code,
      },
      locationGroup: {
        name: locationGroups.name,
      },
      race: {
        name: races.name,
        id: races.id,
      },
    })
    .from(sessions)
    .innerJoin(latestSessions, eq(sessions.userId, latestSessions.userId))
    .innerJoin(characters, eq(characters.id, sessions.selectedCharacterId))
    .innerJoin(races, eq(races.id, characters.raceId))
    .leftJoin(locations, eq(locations.id, sessions.currentLocationId))
    .leftJoin(locationGroups, eq(locationGroups.id, locations.locationGroupId))
    .where(eq(sessions.expires, latestSessions.maxExpires));
  return onlineUsersSchema.parse(results);
}

export async function increaseCharacterExperience(
  amount: number,
  characterId: string,
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const character = await db
    .select({
      currentExperience: characters.currentExperience,
      totalExperience: characters.totalExperience,
    })
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1);

  if (!character.length) throw new Error("Character not found");

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
