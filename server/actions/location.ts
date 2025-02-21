"use server";

import { db } from "@/database/db";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { sessions } from "@/database/schema/auth";
import { getTranslations } from "next-intl/server";

export async function setCurrentLocation(locationId?: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const t = await getTranslations("errors");
  if (!session || !userId) throw new Error(t("auth.unauthenticated"));

  await db
    .update(sessions)
    .set({ currentLocationId: locationId ?? null })
    .where(eq(sessions.userId, userId));
}
