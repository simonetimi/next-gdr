"use server";

import { db } from "@/database/db";
import { locations } from "@/database/schema/location";
import { eq } from "drizzle-orm";
import { locationsSelectSchema } from "@/zod/schemas/location";
import { auth } from "@/auth";
import { sessions } from "@/database/schema/auth";

export async function getLocation(locationCode: string) {
  const result = await db
    .select()
    .from(locations)
    .where(eq(locations.code, locationCode));

  return result[0];
}

export async function getAllLocations() {
  return db
    .select({
      name: locations.name,
      description: locations.description,
      code: locations.code,
    })
    .from(locations);
}

export async function setCurrentLocation(locationId?: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) throw new Error("User not authenticated");

  await db
    .update(sessions)
    .set({ currentLocationId: locationId ?? null })
    .where(eq(sessions.userId, userId));
}
