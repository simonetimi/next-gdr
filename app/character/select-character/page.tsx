import { Character } from "@/models/characters";
import { getUserCharacters } from "@/server/actions/character";
import { redirect } from "next/navigation";
import { GAME_ROUTE } from "@/utils/routes";
import CharacterSelection from "@/components/forms/CharacterSelection";

export default async function SelectCharacterPage() {
  const MAX_CHARACTERS_ALLOWED =
    parseInt(process.env.MAX_CHARACTERS_ALLOWED ?? "") || 1;
  let characters: Character[] = [];
  try {
    characters = await getUserCharacters();
  } catch (error) {
    // handle error
    redirect(GAME_ROUTE);
  }

  return (
    <CharacterSelection
      characters={characters}
      maxCharactersAllowed={MAX_CHARACTERS_ALLOWED}
    />
  );
}
