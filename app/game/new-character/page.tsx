import { getRaces } from "@/server/actions/game";
import NewCharacterForm from "@/components/forms/NewCharacter";
import { auth } from "@/auth";

import { GAME_ROUTE } from "@/utils/routes";
import { redirect } from "next/navigation";

export default async function NewChacterPage() {
  const session = await auth();

  if (session && session.user?.hasCharacter) redirect(GAME_ROUTE);

  const races = await getRaces();

  return <NewCharacterForm races={races} />;
}
