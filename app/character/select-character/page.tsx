import { Character } from "@/models/characters";
import { getUserActiveCharacters } from "@/server/character";
import { redirect } from "next/navigation";
import { GAME_ROUTE } from "@/utils/routes";
import CharacterSelection from "@/components/forms/CharacterSelection";
import { Logger } from "@/utils/logger";
import { GameConfig } from "@/utils/config/GameConfig";
import { getCurrentUserId } from "@/server/user";

export default async function SelectCharacterPage() {
  const allowMultipleCharacters = GameConfig.isMultipleCharactersAllowed();
  if (!allowMultipleCharacters) redirect(GAME_ROUTE);

  const maxCharactersAllowed = GameConfig.getMaxCharacters();
  let characters: Character[] = [];
  try {
    const userId = await getCurrentUserId();
    characters = await getUserActiveCharacters(userId);
  } catch (error) {
    Logger.error(error);
    redirect(GAME_ROUTE);
  }

  return (
    <CharacterSelection
      characters={characters}
      maxCharactersAllowed={maxCharactersAllowed}
    />
  );
}
