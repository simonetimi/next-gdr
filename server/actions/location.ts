"use server";

import { db } from "@/database/db";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { sessions } from "@/database/schema/auth";
import { getTranslations } from "next-intl/server";
import { toKebabCase } from "@/utils/strings";
import { secretLocations } from "@/database/schema/location";
import { redirect } from "next/navigation";
import { LOCATION_ROUTE, SECRET_LOCATION_ROUTE } from "@/utils/routes";
import { getCurrentCharacterIdOnly } from "@/server/character";

export async function setCurrentLocation(
  locationId: string | null,
  accessingSecretLocation: boolean = false,
) {
  const session = await auth();
  const userId = session?.user?.id;
  const t = await getTranslations("errors");
  if (!session || !userId) throw new Error(t("auth.unauthenticated"));

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
  const session = await auth();
  const userId = session?.user?.id;
  const t = await getTranslations("errors");
  if (!session || !userId) throw new Error(t("auth.unauthenticated"));

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
