import { db } from "@/database/db";
import {
  locationAccesses,
  locationGroups,
  locations,
  secretLocations,
} from "@/database/schema/location";
import { and, eq, gt, sql } from "drizzle-orm";
import { groupedLocationsSelectSchema } from "@/zod/schemas/location";
import { getCurrentCharacterIdOnly } from "@/server/character";
import { getTranslations } from "next-intl/server";
import { GameConfig } from "@/utils/config/gameConfig";

export async function getLocation(locationCode: string) {
  const result = await db
    .select()
    .from(locations)
    .where(eq(locations.code, locationCode));

  return result[0];
}

export async function accessLocation(locationCode: string) {
  const t = await getTranslations("errors");

  const location = await db
    .select()
    .from(locations)
    .where(eq(locations.code, locationCode));

  const characterId = await getCurrentCharacterIdOnly();

  if (!characterId.id) throw new Error(t("game.characters.notFound"));

  const logIntervalMinutes = GameConfig.getLocationSettings().logInterval;

  const logInterval = new Date(Date.now() - logIntervalMinutes * 60 * 1000);

  const recentAccess = await db
    .select()
    .from(locationAccesses)
    .where(
      and(
        eq(locationAccesses.locationId, location[0].id),
        eq(locationAccesses.characterId, characterId.id),
        gt(locationAccesses.accessTime, logInterval),
      ),
    );

  if (recentAccess.length === 0) {
    // register access
    await db.insert(locationAccesses).values({
      locationId: location[0].id,
      characterId: characterId.id,
      accessTime: new Date(),
    });
  }

  return location[0];
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

export async function accessSecretLocation(secretCode: string) {
  const t = await getTranslations("errors");

  const secretLocation = await db
    .select({ id: secretLocations.id, code: secretLocations.code })
    .from(secretLocations)
    .where(eq(secretLocations.code, secretCode));

  const characterId = await getCurrentCharacterIdOnly();

  if (!characterId.id) throw new Error(t("game.characters.notFound"));

  const logIntervalMinutes = GameConfig.getLocationSettings().logInterval;

  const logInterval = new Date(Date.now() - logIntervalMinutes * 60 * 1000);

  const recentAccess = await db
    .select()
    .from(locationAccesses)
    .where(
      and(
        eq(locationAccesses.secretLocationId, secretLocation[0].id),
        eq(locationAccesses.characterId, characterId.id),
        gt(locationAccesses.accessTime, logInterval),
      ),
    );

  if (recentAccess.length === 0) {
    // register access
    await db.insert(locationAccesses).values({
      secretLocationId: secretLocation[0].id,
      characterId: characterId.id,
      accessTime: new Date(),
    });
  }

  return secretLocation[0];
}
