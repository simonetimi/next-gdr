import "server-only";

import { db } from "@/database/db";
import { userSettings } from "@/database/schema/userSettings";
import { eq, getTableColumns } from "drizzle-orm";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";

export async function getUserSettings() {
  const session = await auth();
  const currentUserId = session?.user?.id;
  const t = await getTranslations("errors");
  if (!session || !currentUserId) throw new Error(t("unauthenticated"));

  const { id, userId, ...userSettingsColumns } = getTableColumns(userSettings);
  const [settings] = await db
    .select({ ...userSettingsColumns })
    .from(userSettings)
    .where(eq(userSettings.userId, currentUserId))
    .limit(1);

  return settings;
}
