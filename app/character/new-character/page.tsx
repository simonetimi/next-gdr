import { getAllRaces } from "@/server/race";
import NewCharacterForm from "@/components/forms/NewCharacter";
import { auth } from "@/auth";

import { GAME_ROUTE } from "@/utils/routes";
import { redirect } from "next/navigation";
import { getUserCharacters } from "@/server/character";
import { GameConfig } from "@/utils/config/GameConfig";

export default async function NewChacterPage() {
  const session = await auth();
  if (session?.user) {
    const characters = await getUserCharacters();
    const maxCharactersAllowed = GameConfig.getMaxCharacters() || 1;
    if (characters.length >= maxCharactersAllowed) {
      redirect(GAME_ROUTE);
    }
  }

  const races = await getAllRaces();

  return <NewCharacterForm races={races} />;
}
