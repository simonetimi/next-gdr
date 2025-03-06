import "server-only";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";

export async function getCurrentUser() {
  const session = await auth();
  const t = await getTranslations("errors");
  if (!session || !session.user || !session.user.id)
    throw new Error(t("auth.unauthenticated"));
  return session.user;
}

export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user.id!;
}
