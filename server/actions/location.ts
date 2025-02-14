"use server";

import { db } from "@/database/db";
import { locations } from "@/database/schema/location";
import { eq } from "drizzle-orm";

export async function getLocation(locationCode: string) {
  const result = await db
    .select()
    .from(locations)
    .where(eq(locations.code, locationCode));

  return result[0];
}
