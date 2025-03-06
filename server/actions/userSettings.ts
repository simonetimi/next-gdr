"use server";

import { db } from "@/database/db";
import { userSettings } from "@/database/schema/userSettings";
import { eq } from "drizzle-orm";
import { UserSettingsMinimal } from "@/models/userSettings";
import { getCurrentUserId } from "@/server/user";

export async function createUserSettings(settings: UserSettingsMinimal) {
  const userId = await getCurrentUserId();

  return db.insert(userSettings).values({
    userId,
    ...settings,
  });
}

export async function updateUserSettings(settings: UserSettingsMinimal) {
  const userId = await getCurrentUserId();

  const result = await db
    .update(userSettings)
    .set({ userId, ...settings })
    .where(eq(userSettings.userId, userId))
    .returning();

  // if user has no settings saved, create them
  if (result.length === 0) {
    return db.insert(userSettings).values({
      userId,
      ...settings,
    });
  }

  return result;
}
