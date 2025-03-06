import { getAllRaces } from "@/server/race";
import NewCharacterForm from "@/components/forms/NewCharacter";

import { GAME_ROUTE } from "@/utils/routes";
import { redirect } from "next/navigation";
import { getUserActiveCharacters } from "@/server/character";
import { GameConfig } from "@/utils/config/GameConfig";
import { getCurrentUserId } from "@/server/user";

export default async function NewChacterPage() {
  const userId = await getCurrentUserId();
  if (userId) {
    const characters = await getUserActiveCharacters(userId);
    const maxCharactersAllowed = GameConfig.getMaxCharacters() || 1;
    if (characters.length >= maxCharactersAllowed) {
      redirect(GAME_ROUTE);
    }
  }

  const races = await getAllRaces();

  return <NewCharacterForm races={races} />;
}
