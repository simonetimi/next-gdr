"use server";

import { db } from "@/database/db";
import { locationGroups, locations } from "@/database/schema/location";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { sessions } from "@/database/schema/auth";
import { groupedLocationsSelectSchema } from "@/zod/schemas/location";

export async function getLocation(locationCode: string) {
  const result = await db
    .select()
    .from(locations)
    .where(eq(locations.code, locationCode));

  return result[0];
}

export async function getAllLocationGroupedByLocationGroup() {
  const result = await db
    .select({
      locationGroupId: locationGroups.id,
      locationGroupName: locationGroups.name,
      locations: sql<Location[]>`array_agg(json_build_object(
        'code', ${locations.code},
        'name', ${locations.name},
        'description', ${locations.description}
      ))`,
    })
    .from(locationGroups)
    .leftJoin(locations, eq(locations.locationGroupId, locationGroups.id))
    .where(eq(locations.hidden, false))
    .groupBy(locationGroups.id, locationGroups.name);

  return groupedLocationsSelectSchema.parse(result);
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
