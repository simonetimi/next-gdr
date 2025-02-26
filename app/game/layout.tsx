import Header from "@/components/ui/Header";
import { ReactNode } from "react";
import { Character } from "@/models/characters";
import { auth } from "@/auth";
import {
  getCurrentCharacterIdOnly,
  getUserCharacters,
} from "@/server/character";
import { redirect } from "next/navigation";
import { NEW_CHARACTER_ROUTE, SELECT_CHARACTER_ROUTE } from "@/utils/routes";
import { isAdmin, isMaster } from "@/server/role";
import { GameConfig } from "@/utils/config/GameConfig";
import { Providers } from "@/app/game/providers";

export default async function GameLayout({
  children,
}: {
  children: ReactNode;
}) {
  const allowMultipleCharacters = GameConfig.isMultipleCharactersAllowed();
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

  const isUserAdmin = await isAdmin(session.user.id ?? "");
  const isUserMaster = await isMaster(session.user.id ?? "");

  return (
    <Providers>
      <Header
        showControls
        character={character!}
        allowMultipleCharacters={allowMultipleCharacters}
        isAdmin={isUserAdmin}
        isMaster={isUserMaster}
      />
      <main className="flex min-h-[85vh] flex-1 flex-col items-center justify-center gap-6">
        {children}
      </main>
    </Providers>
  );
}
