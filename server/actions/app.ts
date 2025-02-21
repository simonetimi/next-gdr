"use server";

import { db } from "@/database/db";
import { races } from "@/database/schema/race";
import { racesSelectSchema } from "@/zod/schemas/race";
import { auth } from "@/auth";
import { eq, desc, and, sql } from "drizzle-orm";
import { sessions } from "@/database/schema/auth";
import { isMaster } from "@/server/actions/roles";
import { getTranslations } from "next-intl/server";

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

export async function isInvisible() {
  const session = await auth();
  const userId = session?.user?.id;
  const t = await getTranslations("errors");
  if (!session || !userId) throw new Error(t("auth.unauthenticated"));

  const results = await db
    .select({ invisibleMode: sessions.invisibleMode })
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.expires))
    .limit(1);

  return results[0].invisibleMode;
}

export async function getAllRaces() {
  const fetchedRaces = await db
    .select({ name: races.name, id: races.id })
    .from(races);

  racesSelectSchema.parse(fetchedRaces);

  return fetchedRaces;
}
