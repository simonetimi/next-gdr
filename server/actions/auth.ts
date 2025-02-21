"use server";

import { signIn } from "@/auth";

export async function login(provider: string) {
  await signIn(provider);
}
