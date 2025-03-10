"use server";

import { db } from "@/database/db";
import { eq, and, sql } from "drizzle-orm";
import { sessions } from "@/database/schema/auth";
import { getTranslations } from "next-intl/server";
import { isMaster } from "@/server/role";
import { revalidatePath } from "next/cache";
import { LOCATION_ROUTE } from "@/utils/routes";
import { getCurrentUserId } from "@/server/user";

export async function toggleInvisible(isInvisibleActive: boolean) {
  const userId = await getCurrentUserId();

  const t = await getTranslations("errors.auth");

  const isUsermaster = await isMaster(userId);
  if (!isUsermaster) throw new Error(t("unauthorized"));

  // logic to turn it on (also removes current location)
  if (!isInvisibleActive) {
    await db
      .update(sessions)
      .set({ invisibleMode: !isInvisibleActive, currentLocationId: null })
      .where(
        and(
          eq(sessions.userId, userId),
          eq(
            sessions.expires,
            sql`(SELECT MAX(expires) FROM ${sessions} WHERE user_id = ${userId})`,
          ),
        ),
      );
  }

  // logic to turn it off
  if (isInvisibleActive) {
    await db
      .update(sessions)
      .set({ invisibleMode: !isInvisibleActive })
      .where(
        and(
          eq(sessions.userId, userId),
          eq(
            sessions.expires,
            sql`(SELECT MAX(expires) FROM ${sessions} WHERE user_id = ${userId})`,
          ),
        ),
      );
  }

  await db
    .update(sessions)
    .set({ invisibleMode: !isInvisibleActive })
    .where(
      and(
        eq(sessions.userId, userId),
        eq(
          sessions.expires,
          sql`(SELECT MAX(expires) FROM ${sessions} WHERE user_id = ${userId})`,
        ),
      ),
    );

  revalidatePath(LOCATION_ROUTE);

  return !isInvisibleActive;
}
