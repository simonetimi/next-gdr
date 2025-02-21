"use server";

import { db } from "@/database/db";
import { auth } from "@/auth";
import { eq, desc, and, sql } from "drizzle-orm";
import { sessions } from "@/database/schema/auth";
import { getTranslations } from "next-intl/server";
import { isMaster } from "@/server/role";

export async function toggleInvisible(isInvisibleActive: boolean) {
  const session = await auth();
  const userId = session?.user?.id;
  const t = await getTranslations("errors");
  if (!session || !userId) throw new Error(t("auth.unauthenticated"));

  const isUsermaster = await isMaster(userId);

  if (!isUsermaster) throw new Error("auth.unauthorized");

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
}
