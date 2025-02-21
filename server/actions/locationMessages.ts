"use server";

import { db } from "@/database/db";
import {
  locationActionMessages,
  locationMessages,
  locationSystemMessages,
  locationWhispers,
} from "@/database/schema/locationMessages";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { characters } from "@/database/schema/character";
import { sessions } from "@/database/schema/auth";
import { increaseCharacterExperience } from "@/server/actions/character";
import { getTranslations } from "next-intl/server";
import { isMaster } from "@/server/role";

export async function postActionMessage(
  locationId: string,
  characterId: string,
  content: string,
  tag: string,
) {
  const session = await auth();
  const userId = session?.user?.id;
  const t = await getTranslations("errors");
  if (!session || !userId) throw new Error(t("auth.unauthenticated"));

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

  const experiencePerAction = parseInt(
    process.env.EXPERIENCE_PER_ACTION ?? "1",
  );
  await increaseCharacterExperience(experiencePerAction, characterId);

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
  const t = await getTranslations("errors");
  if (!session || !userId) throw new Error(t("auth.unauthenticated"));

  const [recipientCharacter] = await db
    .select({ id: characters.id })
    .from(characters)
    .where(eq(characters.firstName, recipientCharacterName));

  if (!recipientCharacter) throw new Error(t("game.characters.notFound"));

  if (recipientCharacter.id === characterId)
    throw new Error(t("game.chat.whisperSelf"));

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
    throw new Error(t("game.character.notFoundInLocation"));

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
  const t = await getTranslations("errors");
  if (!session || !userId) throw new Error(t("auth.unauthenticated"));

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
  const t = await getTranslations("errors");
  if (!session || !userId) throw new Error(t("auth.unauthenticated"));

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

export async function postSystemMessage(
  locationId: string,
  content: string,
  systemType: string,
  characterId?: string,
  recipientCharacterId?: string,
  additionalData?: string,
) {
  const session = await auth();
  const userId = session?.user?.id;
  const t = await getTranslations("errors");
  if (!session || !userId) throw new Error(t("auth.unauthenticated"));

  const [message] = await db
    .insert(locationMessages)
    .values({
      locationId,
      characterId,
      content,
      type: "system",
    })
    .returning({
      id: locationMessages.id,
    });

  try {
    await db.insert(locationSystemMessages).values({
      messageId: message.id,
      recipientCharacterId,
      additionalData,
      systemType,
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

// TODO method to fetch them all (single location) regardless of time (for the admins)

// TODO method to fetch them all for one specific character, regardless of time (for the admins)
