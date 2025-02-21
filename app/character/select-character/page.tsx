import { Character } from "@/models/characters";
import { getUserCharacters } from "@/server/character";
import { redirect } from "next/navigation";
import { GAME_ROUTE } from "@/utils/routes";
import CharacterSelection from "@/components/forms/CharacterSelection";

export default async function SelectCharacterPage() {
  const allowMultipleCharacters =
    process.env.ALLOW_MULTIPLE_CHARACTERS?.toLowerCase() === "true";
  if (!allowMultipleCharacters) redirect(GAME_ROUTE);

  const maxCharactersAllowed =
    parseInt(process.env.MAX_CHARACTERS_ALLOWED ?? "") || 1;
  let characters: Character[] = [];
  try {
    characters = await getUserCharacters();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    redirect(GAME_ROUTE);
  }

  return (
    <CharacterSelection
      characters={characters}
      maxCharactersAllowed={maxCharactersAllowed}
    />
  );
}
