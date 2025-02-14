"use server";

import { db } from "@/database/db";
import { races } from "@/database/schema/race";
import { racesSelectSchema } from "@/zod/schemas/race";

export async function getRaces() {
  const fetchedRaces = await db
    .select({ name: races.name, id: races.id })
    .from(races);

  racesSelectSchema.parse(fetchedRaces);

  return fetchedRaces;
}
