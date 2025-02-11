"use server";

import { db } from "@/db/db";
import { races } from "@/db/schema/character";

export async function getRaces() {
  const fetchedRaces = await db.select({ name: races.name }).from(races);

  return fetchedRaces ?? null;
}
