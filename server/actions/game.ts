"use server";

import { db } from "@/database/db";
import { races } from "@/database/schema/race";
import { racesSelectSchema } from "@/zod/schemas/race";
import { auth } from "@/auth";
import { eq, desc, and, sql } from "drizzle-orm";
import { sessions } from "@/database/schema/auth";

export async function toggleInvisible(isInvisibleActive: boolean) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

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
  if (!session || !userId) throw new Error("User not authenticated");

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
