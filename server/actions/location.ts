"use server";

import { db } from "@/database/db";
import { eq } from "drizzle-orm";
import { sessions } from "@/database/schema/auth";
import { getTranslations } from "next-intl/server";
import { toKebabCase } from "@/utils/strings";
import { secretLocations } from "@/database/schema/location";
import { getCurrentCharacterIdOnly } from "@/server/character";
import { getCurrentUser, getCurrentUserId } from "@/server/user";

export async function setCurrentLocation(
  locationId: string | null,
  accessingSecretLocation: boolean = false,
) {
  const userId = await getCurrentUserId();

  if (accessingSecretLocation) {
    await db
      .update(sessions)
      .set({ currentLocationId: null, inSecretLocation: true })
      .where(eq(sessions.userId, userId));
  } else {
    await db
      .update(sessions)
      .set({ currentLocationId: locationId ?? null, inSecretLocation: false })
      .where(eq(sessions.userId, userId));
  }
}

export async function accessOrCreateSecretLocation(secretCode: string) {
  await getCurrentUser();
  const t = await getTranslations("errors");

  const kebabCaseSecretCode = toKebabCase(secretCode.trim());

  const [secretLocation] = await db
    .select({ code: secretLocations.code })
    .from(secretLocations)
    .where(eq(secretLocations.code, kebabCaseSecretCode))
    .limit(1);
  if (secretLocation && secretLocation.code) {
    return secretLocation.code;
  } else {
    const character = await getCurrentCharacterIdOnly();
    if (!character?.id) throw new Error(t("game.characters.notFound"));

    const [newSecretLocaton] = await db
      .insert(secretLocations)
      .values({
        code: kebabCaseSecretCode,
        createdBy: character.id,
      })
      .returning();

    return newSecretLocaton.code;
  }
}
