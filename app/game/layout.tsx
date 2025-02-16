import Header from "@/components/ui/Header";
import { ReactNode } from "react";
import { Character } from "@/models/characters";
import { auth } from "@/auth";
import {
  getCurrentCharacter,
  getUserCharacters,
} from "@/server/actions/character";
import { redirect } from "next/navigation";
import { NEW_CHARACTER_ROUTE, SELECT_CHARACTER_ROUTE } from "@/utils/routes";

export default async function GameLayout({
  children,
}: {
  children: ReactNode;
}) {
  let characters: Character[] = [];
  let character;
  const session = await auth();
  if (session) {
    characters = await getUserCharacters();
    if (characters.length === 0) {
      // no characters, go to create new character
      return redirect(NEW_CHARACTER_ROUTE);
    } else {
      // if user has an active session with the selected character, render the game
      // else, go to character selection
      const sessionWithCharacter = await getCurrentCharacter();
      if (sessionWithCharacter.selectedCharacterId) {
        character = characters.find(
          (char) => char.id === sessionWithCharacter.selectedCharacterId,
        );
      } else {
        redirect(SELECT_CHARACTER_ROUTE);
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
