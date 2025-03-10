import "server-only";

import { getTranslations } from "next-intl/server";
import { db } from "@/database/db";
import { sessions, users } from "@/database/schema/auth";
import { characters, characterSheets } from "@/database/schema/character";
import { and, desc, eq, gt, isNotNull, sql } from "drizzle-orm";
import {
  characterSelectSchema,
  characterSheetSchemaWithCharacter,
  charactersSelectSchema,
  minimalCharacterSchema,
  minimalCharactersSchema,
} from "@/zod/schemas/character";
import { locationGroups, locations } from "@/database/schema/location";
import { isAdmin, isMaster } from "@/server/role";
import { races } from "@/database/schema/race";
import { z } from "zod";
import { onlineUsersSchema } from "@/zod/schemas/session";
import { getCurrentUser, getCurrentUserId } from "@/server/user";

export async function getMinimalCurrentCharacter() {
  const userId = await getCurrentUserId();

  const now = new Date();

  // retrieves the last non-expired session and joins with characters table
  const [character] = await db
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

  return minimalCharacterSchema.parse(character);
}

export async function getCurrentCharacterIdOnly() {
  const userId = await getCurrentUserId();

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

export async function getCurrentCharacterIdOnlyFromUserId(userId: string) {
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

export async function getCharacterSheet(characterId: string) {
  const userId = await getCurrentUserId();

  const t = await getTranslations("errors");

  const hasFullPermission = (await isAdmin(userId)) || (await isMaster(userId));

  const character = await db
    .select({ userId: characters.userId })
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1);

  if (!character.length) throw new Error(t("game.characters.notFound"));

  // handles possible multiple characters
  const isUserOwner = character[0].userId === userId;

  const [characterSheet] = await db
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
        lastSeenAt: characters.lastSeenAt,
        isActive: characters.isActive,
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
    .innerJoin(races, eq(characters.raceId, races.id))
    .limit(1);

  const fetchedChar = characterSheet.character as z.infer<
    typeof characterSelectSchema
  >;

  // if not fetched, adds those fields as null for a correct parsing
  if (!hasFullPermission) {
    if (!isUserOwner) {
      characterSheet.background = null;
      fetchedChar.totalExperience = null;
      fetchedChar.currentExperience = null;
    }
    characterSheet.masterNotes = null;
  }

  return characterSheetSchemaWithCharacter.parse(characterSheet);
}

export async function getOnlineCharacters() {
  await getCurrentUser();

  const now = new Date();

  // get latest session for user
  const latestSessions = db
    .selectDistinct({
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
        id: characters.id,
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
      inSecretLocation: sessions.inSecretLocation,
    })
    .from(sessions)
    .innerJoin(latestSessions, eq(sessions.userId, latestSessions.userId))
    .innerJoin(characters, eq(characters.id, sessions.selectedCharacterId))
    .innerJoin(races, eq(races.id, characters.raceId))
    .leftJoin(locations, eq(locations.id, sessions.currentLocationId))
    .leftJoin(locationGroups, eq(locationGroups.id, locations.locationGroupId))
    .where(
      and(
        eq(sessions.expires, latestSessions.maxExpires),
        eq(characters.isActive, true),
      ),
    );

  return onlineUsersSchema.parse(results);
}

export async function getUserActiveCharacters(userId: string) {
  const t = await getTranslations("errors");
  if (!userId) throw new Error(t("auth.unauthenticated"));

  const charactersList = await db
    .select()
    .from(characters)
    .where(and(eq(characters.userId, userId), eq(characters.isActive, true)));

  return charactersSelectSchema.parse(charactersList);
}

export async function isInvisible() {
  const userId = await getCurrentUserId();

  const results = await db
    .select({ invisibleMode: sessions.invisibleMode })
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.expires))
    .limit(1);

  return results[0].invisibleMode;
}

export async function getAllActiveCharacters() {
  await getCurrentUser();

  const charactersList = await db
    .select({
      id: characters.id,
      firstName: characters.firstName,
      middleName: characters.middleName,
      lastName: characters.lastName,
      miniAvatarUrl: characters.miniAvatarUrl,
    })
    .from(characters)
    .innerJoin(users, eq(characters.userId, users.id))
    .where(and(eq(users.isBanned, false), eq(characters.isActive, true)));

  return minimalCharactersSchema.parse(charactersList);
}
