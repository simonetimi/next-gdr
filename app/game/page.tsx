import { auth } from "@/auth";
import { NEW_CHARACTER_ROUTE } from "@/utils/routes";
import { redirect } from "next/navigation";
import React from "react";

export default async function GamePage() {
  const session = await auth();
  if (!session) return null;

  if (!session.user.hasCharacter) return redirect(NEW_CHARACTER_ROUTE);

  return <div>Main page of the game (protected!)</div>;
}
