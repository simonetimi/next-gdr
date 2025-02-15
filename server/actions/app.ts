"use server";

import { auth } from "@/auth";
import { sessions } from "@/database/schema/auth";
import { db } from "@/database/db";
import { and, eq, gt } from "drizzle-orm";

export async function getCurrentCharacter() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  const now = new Date();

  const results = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, userId), gt(sessions.expires, now)));

  return results[0];
}
