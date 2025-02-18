import Header from "@/components/ui/Header";
import { ReactNode } from "react";
import { Character } from "@/models/characters";
import { auth } from "@/auth";
import {
  getCurrentCharacterIdOnly,
  getUserCharacters,
} from "@/server/actions/character";
import { redirect } from "next/navigation";
import { NEW_CHARACTER_ROUTE, SELECT_CHARACTER_ROUTE } from "@/utils/routes";
import { isAdmin, isMaster } from "@/server/actions/roles";

export default async function GameLayout({
  children,
}: {
  children: ReactNode;
}) {
  const allowMultipleCharacters =
    process.env.ALLOW_MULTIPLE_CHARACTERS?.toLowerCase() === "true";
  let characters: Character[] = [];
  let character;
  const session = await auth();

  if (session) {
    characters = await getUserCharacters();
    if (characters.length === 0) {
      // no characters, go to create new character
      return redirect(NEW_CHARACTER_ROUTE);
    } else if (!allowMultipleCharacters) {
      character = characters[0];
    } else {
      // if user has an active session with the selected character, render the game
      // else, go to character selection
      const sessionWithCharacter = await getCurrentCharacterIdOnly();
      if (sessionWithCharacter.id) {
        character = characters.find(
          (char) => char.id === sessionWithCharacter.id,
        );
      } else {
        redirect(SELECT_CHARACTER_ROUTE);
      }
    }
  } else return;

  return (
    <>
      <Header
        showControls
        character={character!}
        allowMultipleCharacters={allowMultipleCharacters}
        isAdmin={await isAdmin(session.user.id ?? "")}
        isMaster={await isMaster(session.user.id ?? "")}
      />
      <main className="flex min-h-[85vh] flex-1 flex-col items-center justify-center gap-6">
        {children}
      </main>
    </>
  );
}
