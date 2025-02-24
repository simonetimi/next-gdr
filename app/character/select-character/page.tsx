import { Character } from "@/models/characters";
import { getUserCharacters } from "@/server/character";
import { redirect } from "next/navigation";
import { GAME_ROUTE } from "@/utils/routes";
import CharacterSelection from "@/components/forms/CharacterSelection";
import { Logger } from "@/utils/logger";
import { GameConfig } from "@/utils/config/gameConfig";

export default async function SelectCharacterPage() {
  const allowMultipleCharacters = GameConfig.isMultipleCharactersAllowed();
  if (!allowMultipleCharacters) redirect(GAME_ROUTE);

  const maxCharactersAllowed = GameConfig.getMaxCharacters() || 1;
  let characters: Character[] = [];
  try {
    characters = await getUserCharacters();
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
