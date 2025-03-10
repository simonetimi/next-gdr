"use server";

import { db } from "@/database/db";
import {
  locationActionMessages,
  locationMessage,
  locationSystemMessages,
  locationWhispers,
  savedLocationMessages,
} from "@/database/schema/locationMessage";
import { and, desc, eq } from "drizzle-orm";
import { characters } from "@/database/schema/character";
import { sessions } from "@/database/schema/auth";
import { increaseCharacterExperience } from "@/server/actions/character";
import { getTranslations } from "next-intl/server";
import { isMaster } from "@/server/role";
import { Logger } from "@/utils/logger";
import { GameConfig } from "@/utils/config/GameConfig";
import { AppConfig } from "@/utils/config/AppConfig";
import { getCurrentUser, getCurrentUserId } from "@/server/user";

export async function postActionMessage(
  locationId: string,
  characterId: string,
  content: string,
  tag: string,
  isSecretLocation?: boolean,
) {
  await getCurrentUser();
  const t = await getTranslations("errors");

  // hard limits for characters
  const hardCharsLimits = GameConfig.getCharsLimitsPerAction();

  if (content.length > hardCharsLimits.max)
    throw new Error(
      t("validation.maxCharsLimit", { maxChars: hardCharsLimits.max }),
    );
  if (content.length < hardCharsLimits.min)
    throw new Error(
      t("validation.minCharsLimit", { minChars: hardCharsLimits.min }),
    );

  const [message] = await db
    .insert(locationMessage)
    .values({
      // adds locationId or secretLocationId depending on the type of location
      ...(isSecretLocation ? { secretLocationId: locationId } : { locationId }),
      characterId,
      content,
      type: "action",
    })
    .returning({
      id: locationMessage.id,
    });

  try {
    await db.insert(locationActionMessages).values({
      messageId: message.id,
      tag,
    });
  } catch (error) {
    // if the second one fails, delete the first entry
    await db.delete(locationMessage).where(eq(locationMessage.id, message.id));
    throw error;
  }

  // increase experience if it's inside the soft limits
  const experiencePerAction = GameConfig.getExperiencePerAction();
  const softCharsLimits = GameConfig.getSoftCharsLimitsPerAction();
  if (
    content.length >= softCharsLimits.min &&
    content.length <= softCharsLimits.max
  ) {
    await increaseCharacterExperience(experiencePerAction, characterId);
  }

  return !!message.id;
}

export async function postWhisper(
  locationId: string,
  characterId: string,
  recipientCharacterName: string,
  content: string,
  isSecretLocation?: boolean,
) {
  const t = await getTranslations("errors");

  const hardCharsLimitPerWhisper = GameConfig.getCharsLimitsPerAction().whisper;
  if (content.length > hardCharsLimitPerWhisper)
    throw new Error(
      t("validation.maxCharsLimitWhisper", {
        maxChars: hardCharsLimitPerWhisper,
      }),
    );

  await getCurrentUser();

  const [recipientCharacter] = await db
    .select({ id: characters.id })
    .from(characters)
    .where(eq(characters.firstName, recipientCharacterName));

  if (!recipientCharacter) throw new Error(t("game.characters.notFound"));

  if (recipientCharacter.id === characterId)
    throw new Error(t("locationChat.whisperSelf"));

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
    throw new Error(t("game.characters.notFoundInLocation"));

  const [message] = await db
    .insert(locationMessage)
    .values({
      ...(isSecretLocation ? { secretLocationId: locationId } : { locationId }),
      characterId,
      content,
      type: "whisper",
    })
    .returning({
      id: locationMessage.id,
    });

  try {
    await db.insert(locationWhispers).values({
      messageId: message.id,
      recipientCharacterId: recipientCharacter.id,
    });
  } catch (error) {
    // if the second one fails, delete the first entry
    await db.delete(locationMessage).where(eq(locationMessage.id, message.id));
    throw error;
  }
  return !!message.id;
}

export async function postWhisperForAll(
  locationId: string,
  characterId: string,
  content: string,
  isSecretLocation?: boolean,
) {
  const t = await getTranslations("errors");

  const hardCharsLimitPerWhisper = GameConfig.getCharsLimitsPerAction().whisper;
  if (content.length > hardCharsLimitPerWhisper)
    throw new Error(
      t("validation.maxCharsLimitWhisper", {
        maxChars: hardCharsLimitPerWhisper,
      }),
    );

  await getCurrentUser();

  const [message] = await db
    .insert(locationMessage)
    .values({
      ...(isSecretLocation ? { secretLocationId: locationId } : { locationId }),
      characterId,
      content,
      type: "whisperAll",
    })
    .returning({
      id: locationMessage.id,
    });

  return !!message.id;
}

export async function postMasterScreen(
  locationId: string,
  characterId: string,
  content: string,
  isSecretLocation?: boolean,
) {
  const t = await getTranslations("errors");

  const hardCharsLimitPerMasterAction =
    GameConfig.getCharsLimitsPerAction().master;
  if (content.length > hardCharsLimitPerMasterAction)
    throw new Error(
      t("validation.maxCharsLimit", {
        maxChars: hardCharsLimitPerMasterAction,
      }),
    );

  const userId = await getCurrentUserId();

  const isUserMaster = isMaster(userId);

  if (!isUserMaster) throw new Error("User is not a master");

  const result = await db.insert(locationMessage).values({
    ...(isSecretLocation ? { secretLocationId: locationId } : { locationId }),
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
  isSecretLocation?: boolean,
) {
  await getCurrentUser();

  const [message] = await db
    .insert(locationMessage)
    .values({
      ...(isSecretLocation ? { secretLocationId: locationId } : { locationId }),
      characterId,
      content,
      type: "system",
    })
    .returning({
      id: locationMessage.id,
    });

  try {
    await db.insert(locationSystemMessages).values({
      messageId: message.id,
      recipientCharacterId,
      additionalData,
      systemType,
    });
  } catch (error) {
    Logger.error(error);
    // if the second one fails, delete the first entry
    await db.delete(locationMessage).where(eq(locationMessage.id, message.id));
    throw error;
  }
  return !!message.id;
}

export async function saveLocationChat(htmlContent: string) {
  await getCurrentUser();

  const [savedChat] = await db
    .insert(savedLocationMessages)
    .values({ htmlContent })
    .returning({ id: savedLocationMessages.id });

  const domain = AppConfig.getAppUrl();

  return domain + "/api/game/saved-chat/" + savedChat.id;
}

// TODO method to fetch them all (from a single location) regardless of time (for the admins)

// TODO method to fetch them all for one specific character, regardless of time (for the admins)
