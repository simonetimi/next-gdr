"use server";

import { db } from "@/db/db";
import { characters } from "@/db/schema/character";
import { eq } from "drizzle-orm";

export async function getCharacter(userId: string | undefined) {
  if (!userId) return null;

  const character = await db
    .select()
    .from(characters)
    .where(eq(characters.userId, userId));

  return character[0] ?? null;
}
