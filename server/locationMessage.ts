import "server-only";

import { getTranslations } from "next-intl/server";
import { isMaster } from "@/server/role";
import { db } from "@/database/db";
import { characters } from "@/database/schema/character";
import { and, desc, eq, gte, isNull, or, sql } from "drizzle-orm";
import {
  locationActionMessages,
  locationMessage,
  locationSystemMessages,
  locationWhispers,
  savedLocationMessages,
} from "@/database/schema/locationMessage";
import { fullLocationMessagesSchema } from "@/zod/schemas/locationMessages";
import { Logger } from "@/utils/logger";
import { GameConfig } from "@/utils/config/GameConfig";
import { getCurrentCharacterIdOnlyFromUserId } from "@/server/character";
import { getCurrentUser, getCurrentUserId } from "@/server/user";

export async function fetchAllLocationMessages(locationId: string) {
  const userId = await getCurrentUserId();
  const t = await getTranslations("errors");

  const isUsermaster = await isMaster(userId);

  const character = await db
    .select({ id: characters.id })
    .from(characters)
    .where(eq(characters.userId, userId))
    .limit(1);
  const userCharacterId = character[0].id;

  const fetchLocationMessagesLastHours =
    GameConfig.getLocationSettings().fetchLastHours;

  const fetchMessagesLastHours = new Date();
  fetchMessagesLastHours.setHours(
    fetchMessagesLastHours.getHours() - fetchLocationMessagesLastHours,
  );

  // only recent messages with that location id
  let conditions = and(
    gte(locationMessage.createdAt, fetchMessagesLastHours),
    eq(locationMessage.locationId, locationId),
  );

  // apply filtering only if the user is NOT a master
  if (!isUsermaster) {
    conditions = and(
      conditions,
      or(
        isNull(locationWhispers.messageId), // allow non-whisper messages
        eq(locationWhispers.recipientCharacterId, userCharacterId), // allow whispers directed to the user
        eq(locationMessage.characterId, userCharacterId), // allow the user's own messages
      ),
    );

    // ensure system messages are included when recipientCharacterId is NULL (for everyone) or matches userCharacterId
    conditions = or(
      conditions, // keep previous conditions
      and(
        eq(locationMessage.id, locationSystemMessages.messageId), // ensure it's a system message
        or(
          isNull(locationSystemMessages.recipientCharacterId), // allow system messages with no recipient
          eq(locationSystemMessages.recipientCharacterId, userCharacterId), // allow system messages for the user
        ),
      ),
    );
  }

  const result = await db
    .select({
      message: {
        // main message data
        id: locationMessage.id,
        content: locationMessage.content,
        characterId: locationMessage.characterId,
        locationId: locationMessage.locationId,
        createdAt: locationMessage.createdAt,
        type: locationMessage.type,
      },
      // grouped by message type
      action: {
        tag: locationActionMessages.tag,
      },
      whisper: {
        recipientCharacterId: locationWhispers.recipientCharacterId,
      },
      system: {
        systemType: locationSystemMessages.systemType,
        recipientCharacterId: locationSystemMessages.recipientCharacterId,
      },
    })
    .from(locationMessage)
    .where(conditions)
    .leftJoin(
      locationActionMessages,
      eq(locationMessage.id, locationActionMessages.messageId),
    )
    .leftJoin(
      locationWhispers,
      eq(locationMessage.id, locationWhispers.messageId),
    )
    .leftJoin(
      locationSystemMessages,
      eq(locationMessage.id, locationSystemMessages.messageId),
    )
    .orderBy(locationMessage.createdAt);

  try {
    return fullLocationMessagesSchema.parse(result);
  } catch (error) {
    Logger.error(error);
    throw new Error(t("chat.retrievingMessages"));
  }
}

export async function fetchAllLocationMessagesWithCharacters(
  locationId: string,
  lastMessageTimestamp?: Date | null,
  isSecretLocation: boolean = false,
) {
  const userId = await getCurrentUserId();

  const isUserMaster = await isMaster(userId);

  const character = await getCurrentCharacterIdOnlyFromUserId(userId);

  const userCharacterId = character.id ?? "";

  const fetchLocationMessagesLastHours =
    GameConfig.getLocationSettings().fetchLastHours;

  const fetchMessagesLastHours = new Date();
  fetchMessagesLastHours.setHours(
    fetchMessagesLastHours.getHours() - fetchLocationMessagesLastHours,
  );

  // only recent messages with provided location id (secret if secretLocation is true)
  let conditions = and(
    gte(locationMessage.createdAt, fetchMessagesLastHours),
    eq(
      isSecretLocation
        ? locationMessage.secretLocationId
        : locationMessage.locationId,
      locationId,
    ),
  );

  // if timestamp is provided, add it to base conditions. used to fetch only the newest
  if (lastMessageTimestamp) {
    // convert both timestamps to UTC for comparison (otherwise gets timezone mismatch)
    lastMessageTimestamp.setMilliseconds(
      lastMessageTimestamp.getMilliseconds() + 1,
    );
    const utcTimestamp = new Date(lastMessageTimestamp).toISOString();
    conditions = and(
      conditions,
      sql`${locationMessage.createdAt} > ${utcTimestamp}::timestamp`,
    );
  }

  // apply filtering only if the user is NOT a master
  if (!isUserMaster) {
    conditions = and(
      conditions, // time and location conditions
      or(
        // regular messages conditions
        or(
          isNull(locationWhispers.messageId), // not a whisper
          eq(locationWhispers.recipientCharacterId, userCharacterId), // recipient is the user
          eq(locationMessage.characterId, userCharacterId), // sender is the user
        ),
        // system messages conditions (both sender and recipients are null)
        and(
          eq(locationMessage.id, locationSystemMessages.messageId), // it's a system message
          or(
            isNull(locationSystemMessages.recipientCharacterId), // not directed to a user specifically, it's for everyone
            eq(locationSystemMessages.recipientCharacterId, userCharacterId), // it's specifically directed to the user
          ),
        ),
      ),
    );
  }

  const result = await db
    .select({
      message: {
        // main message data
        id: locationMessage.id,
        content: locationMessage.content,
        locationId: isSecretLocation
          ? locationMessage.secretLocationId
          : locationMessage.locationId,
        createdAt: locationMessage.createdAt,
        type: locationMessage.type,
      },
      // grouped by message type
      action: {
        tag: locationActionMessages.tag,
      },
      whisper: {
        recipientCharacterId: locationWhispers.recipientCharacterId,
      },
      system: {
        systemType: locationSystemMessages.systemType,
        recipientCharacterId: locationSystemMessages.recipientCharacterId,
        additionalData: locationSystemMessages.additionalData,
      },
      character: {
        id: locationMessage.characterId,
        firstName: characters.firstName,
        middleName: characters.middleName,
        lastName: characters.lastName,
        miniAvatarUrl: characters.miniAvatarUrl,
        raceId: characters.raceId,
      },
      recipientCharacter: {
        id: locationWhispers.recipientCharacterId,
        firstName: sql`recipientCharacters.first_name`,
        middleName: sql`recipientCharacters.middle_name`,
        lastName: sql`recipientCharacters.last_name`,
        miniAvatarUrl: sql`recipientCharacters.mini_avatar_url`,
      },
    })
    .from(locationMessage)
    .where(conditions)
    .leftJoin(characters, eq(locationMessage.characterId, characters.id))
    .leftJoin(
      locationActionMessages,
      eq(locationMessage.id, locationActionMessages.messageId),
    )
    .leftJoin(
      locationWhispers,
      eq(locationMessage.id, locationWhispers.messageId),
    )
    .leftJoin(
      locationSystemMessages,
      eq(locationMessage.id, locationSystemMessages.messageId),
    )
    .leftJoin(
      sql`${characters} as recipientCharacters`,
      eq(locationWhispers.recipientCharacterId, sql`recipientCharacters.id`),
    )
    // desc, from the newest to the oldest
    .orderBy(desc(locationMessage.createdAt));

  return result;
}

export async function getSavedChat(id: string) {
  await getCurrentUser();
  const t = await getTranslations("errors");

  const [savedChat] = await db
    .select({ htmlContent: savedLocationMessages.htmlContent })
    .from(savedLocationMessages)
    .where(eq(savedLocationMessages.id, id));

  if (!savedChat || !savedChat.htmlContent) {
    throw new Error(t("locationChat.notFound"));
  }

  return savedChat;
}
