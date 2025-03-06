import "server-only";

import { db } from "@/database/db";
import { userSettings } from "@/database/schema/userSettings";
import { eq, getTableColumns } from "drizzle-orm";

import { getCurrentUserId } from "@/server/user";

export async function getUserSettings() {
  const currentUserId = await getCurrentUserId();

  const {
    id: _id,
    userId: _userId,
    ...userSettingsColumns
  } = getTableColumns(userSettings);
  const [settings] = await db
    .select({ ...userSettingsColumns })
    .from(userSettings)
    .where(eq(userSettings.userId, currentUserId))
    .limit(1);

  return settings;
}
