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
import { revalidatePath } from "next/cache";
import { LOCATION_ROUTE } from "@/utils/routes";
import { sessions } from "@/database/schema/auth";

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
  lastMessageTimestamp?: Date | null,
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
    // convert both timestamps to UTC for comparison (otherwise gets timezone mismatch)
    lastMessageTimestamp.setMilliseconds(
      lastMessageTimestamp.getMilliseconds() + 1,
    );
    const utcTimestamp = new Date(lastMessageTimestamp).toISOString();
    conditions = and(
      conditions,
      sql`${locationMessages.createdAt} > ${utcTimestamp}::timestamp`,
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
        additionalData: locationSystemMessages.additionalData,
      },
      character: {
        id: locationMessages.characterId,
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
    .leftJoin(
      sql`${characters} as recipientCharacters`,
      eq(locationWhispers.recipientCharacterId, characters.id),
    )
    // desc, from the newest to the oldest
    .orderBy(desc(locationMessages.createdAt));

  return fullLocationMessagesWithCharactersSchema.parse(result);
}

export async function postActionMessage(
  locationId: string,
  characterId: string,
  content: string,
  tag: string,
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const [message] = await db
    .insert(locationMessages)
    .values({
      locationId,
      characterId,
      content,
      type: "action",
    })
    .returning({
      id: locationMessages.id,
    });

  try {
    await db.insert(locationActionMessages).values({
      messageId: message.id,
      tag,
    });
  } catch (error) {
    // if the second one fails, delete the first entry
    await db
      .delete(locationMessages)
      .where(eq(locationMessages.id, message.id));
    throw error;
  }
  return !!message.id;
}

export async function postWhisper(
  locationId: string,
  characterId: string,
  recipientCharacterName: string,
  content: string,
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const [recipientCharacter] = await db
    .select({ id: characters.id })
    .from(characters)
    .where(eq(characters.firstName, recipientCharacterName));

  if (!recipientCharacter) throw new Error("Character not found");

  if (recipientCharacter.id === characterId)
    throw new Error("You can't send a whisper to yourself.");

  const recipientInSession = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.selectedCharacterId, recipientCharacter.id),
        eq(sessions.currentLocationId, locationId),
      ),
    )
    .orderBy(desc(sessions.expires))
    .limit(1);

  if (recipientInSession.length === 0)
    throw new Error("Recipient is not present");

  const [message] = await db
    .insert(locationMessages)
    .values({
      locationId,
      characterId,
      content,
      type: "whisper",
    })
    .returning({
      id: locationMessages.id,
    });

  try {
    await db.insert(locationWhispers).values({
      messageId: message.id,
      recipientCharacterId: recipientCharacter.id,
    });
  } catch (error) {
    // if the second one fails, delete the first entry
    await db
      .delete(locationMessages)
      .where(eq(locationMessages.id, message.id));
    throw error;
  }
  return !!message.id;
}

export async function postWhisperForAll(
  locationId: string,
  characterId: string,
  content: string,
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const [message] = await db
    .insert(locationMessages)
    .values({
      locationId,
      characterId,
      content,
      type: "whisperAll",
    })
    .returning({
      id: locationMessages.id,
    });

  return !!message.id;
}

export async function postMasterScreen(
  locationId: string,
  characterId: string,
  content: string,
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const isUserMaster = isMaster(userId);

  if (!isUserMaster) throw new Error("User is not a master");

  const result = await db.insert(locationMessages).values({
    locationId,
    characterId,
    content,
    type: "master",
  });

  return !!result;
}

// TODO action to fetch them all (single location) regardless of time (for the admins)

// TODO action to fetch them all for one specific character, regardless of time (for the admins)

// TODO system messages (start aftering finishing abilities, dices, etc.)
