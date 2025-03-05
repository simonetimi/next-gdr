"use server";

import { signIn } from "@/auth";
import { INDEX_ROUTE } from "@/utils/routes";

export async function login(provider: string) {
  await signIn(provider, { redirectTo: INDEX_ROUTE });
}
