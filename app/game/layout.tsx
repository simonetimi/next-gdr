import Header from "@/components/ui/Header";
import { ReactNode } from "react";
import { Character } from "@/models/characters";
import { auth } from "@/auth";
import { getCharacters } from "@/server/actions/character";
import { redirect } from "next/navigation";
import { NEW_CHARACTER_ROUTE, SELECT_CHARACTER_ROUTE } from "@/utils/routes";
import { getCurrentCharacter } from "@/server/actions/app";

export default async function GameLayout({
  children,
}: {
  children: ReactNode;
}) {
  let characters: Character[] = [];
  let character;
  const session = await auth();
  if (session) {
    characters = await getCharacters();
    switch (characters.length) {
      case 0:
        // no characters, go to create new character
        return redirect(NEW_CHARACTER_ROUTE);
      case 1:
        // only one character, use that
        character = characters[0];
        break;
      default: {
        // if user has multiple characters:
        // retrieves session that is not expired, with the selected character
        // if the characterId in the session is null, go to the selection route
        const sessionWithCharacter = await getCurrentCharacter();
        if (sessionWithCharacter.selectedCharacterId) {
          character = characters.find(
            (char) => char.id === sessionWithCharacter.selectedCharacterId,
          );
        } else {
          redirect(SELECT_CHARACTER_ROUTE);
        }
        break;
      }
    }
  }
  return (
    <>
      <Header showControls character={character!} />
      <main className="flex min-h-[85vh] flex-1 flex-col items-center justify-center gap-6">
        {children}
      </main>
    </>
  );
}
