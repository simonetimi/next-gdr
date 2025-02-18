"use server";

import { db } from "@/database/db";
import {
  locationActionMessages,
  locationMessages,
  locationSystemMessages,
  locationWhispers,
} from "@/database/schema/locationMessages";
import { and, desc, eq, gt, gte, isNull, or, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { isMaster } from "@/server/actions/roles";
import { characters } from "@/database/schema/character";
import {
  fullLocationMessagesSchema,
  fullLocationMessagesWithCharactersSchema,
} from "@/zod/schemas/locationMessages";

export async function fetchAllLocationMessages(locationId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const isUsermaster = await isMaster(userId);

  const character = await db
    .select({ id: characters.id })
    .from(characters)
    .where(eq(characters.userId, userId))
    .limit(1);
  const userCharacterId = character[0].id;

  const fetchLocationMessagesLastHours = parseInt(
    process.env.FETCH_LOCATION_MESSAGES_LAST_HOURS!,
  );

  const fetchMessagesLastHours = new Date();
  fetchMessagesLastHours.setHours(
    fetchMessagesLastHours.getHours() - fetchLocationMessagesLastHours,
  );

  // only recent messages with that location id
  let conditions = and(
    gte(locationMessages.createdAt, fetchMessagesLastHours),
    eq(locationMessages.locationId, locationId),
  );

  // apply filtering only if the user is NOT a master
  if (!isUsermaster) {
    conditions = and(
      conditions,
      or(
        isNull(locationWhispers.messageId), // allow non-whisper messages
        eq(locationWhispers.recipientCharacterId, userCharacterId), // allow whispers directed to the user
        eq(locationMessages.characterId, userCharacterId), // allow the user's own messages
      ),
    );

    // ensure system messages are included when recipientCharacterId is NULL (for everyone) or matches userCharacterId
    conditions = or(
      conditions, // keep previous conditions
      and(
        eq(locationMessages.id, locationSystemMessages.messageId), // ensure it's a system message
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
        id: locationMessages.id,
        content: locationMessages.content,
        characterId: locationMessages.characterId,
        locationId: locationMessages.locationId,
        createdAt: locationMessages.createdAt,
        type: locationMessages.type,
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
    .from(locationMessages)
    .where(conditions)
    .leftJoin(
      locationActionMessages,
      eq(locationMessages.id, locationActionMessages.messageId),
    )
    .leftJoin(
      locationWhispers,
      eq(locationMessages.id, locationWhispers.messageId),
    )
    .leftJoin(
      locationSystemMessages,
      eq(locationMessages.id, locationSystemMessages.messageId),
    )
    .orderBy(locationMessages.createdAt);

  return fullLocationMessagesSchema.parse(result);
}

export async function fetchAllLocationMessagesWithCharacters(
  locationId: string,
  lastMessageTimestamp?: Date,
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const isUsermaster = await isMaster(userId);

  const character = await db
    .select({ id: characters.id })
    .from(characters)
    .where(eq(characters.userId, userId))
    .limit(1);
  const userCharacterId = character[0].id;

  const fetchLocationMessagesLastHours = parseInt(
    process.env.FETCH_LOCATION_MESSAGES_LAST_HOURS!,
  );

  const fetchMessagesLastHours = new Date();
  fetchMessagesLastHours.setHours(
    fetchMessagesLastHours.getHours() - fetchLocationMessagesLastHours,
  );

  // only recent messages with provided location id
  let conditions = and(
    gte(locationMessages.createdAt, fetchMessagesLastHours),
    eq(locationMessages.locationId, locationId),
  );

  // if timestamp is provided, add it to base conditions. used to fetch only the newest
  if (lastMessageTimestamp) {
    conditions = and(
      conditions,
      sql`${locationMessages.createdAt} > ${lastMessageTimestamp}`,
    );
  }

  // apply filtering only if the user is NOT a master
  if (!isUsermaster) {
    conditions = and(
      conditions, // time and location conditions
      or(
        // regular messages conditions
        or(
          isNull(locationWhispers.messageId), // not a whisper
          eq(locationWhispers.recipientCharacterId, userCharacterId), // recipient is the user
          eq(locationMessages.characterId, userCharacterId), // sender is the user
        ),
        // system messages conditions (both sender and recipients are null)
        and(
          eq(locationMessages.id, locationSystemMessages.messageId), // it's a system message
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
        id: locationMessages.id,
        content: locationMessages.content,
        locationId: locationMessages.locationId,
        createdAt: locationMessages.createdAt,
        type: locationMessages.type,
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
      character: {
        id: locationMessages.characterId,
        firstName: characters.firstName,
        middleName: characters.middleName,
        lastName: characters.lastName,
        miniAvatarUrl: characters.miniAvatarUrl,
        raceId: characters.raceId,
      },
    })
    .from(locationMessages)
    .where(conditions)
    .leftJoin(characters, eq(locationMessages.characterId, characters.id))
    .leftJoin(
      locationActionMessages,
      eq(locationMessages.id, locationActionMessages.messageId),
    )
    .leftJoin(
      locationWhispers,
      eq(locationMessages.id, locationWhispers.messageId),
    )
    .leftJoin(
      locationSystemMessages,
      eq(locationMessages.id, locationSystemMessages.messageId),
    )
    // desc, from the newest to the oldest
    .orderBy(desc(locationMessages.createdAt));

  return fullLocationMessagesWithCharactersSchema.parse(result);
}

// TODO action to fetch them all regardless of time

// TODO action to fetch them all for one specific character, regardless of time

// TODO other actions (to post actions depending on the type)
