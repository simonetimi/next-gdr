import { auth } from "@/auth";
import { Logout } from "@/components/auth/Logout";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ControlNavbar from "@/components/game/ControlNavbar";
import { getCharacters } from "@/server/actions/character";
import { redirect } from "next/navigation";
import { NEW_CHARACTER_ROUTE, SELECT_CHARACTER_ROUTE } from "@/utils/routes";
import { Character } from "@/models/characters";
import { getCurrentCharacter } from "@/server/actions/app";
import { Avatar } from "@heroui/avatar";

export default async function Header({
  showControls = false,
}: {
  showControls?: boolean;
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

    // TODO fix mini avatar position

    // controls are rendered only if the user is logged it, has at least a character and renderControls is true
    // multiple characters can be handled
    return (
      <header className="sticky top-0 z-0 flex h-[15vh] w-screen items-center justify-between border-b-1 border-gray-200 bg-white/20 p-6 dark:border-white/10 dark:bg-gray-900/40">
        <h1 className="absolute inset-0 flex items-center justify-center sm:static sm:flex sm:items-center sm:justify-start">
          Next GdR
        </h1>
        <div className="flex flex-grow justify-start sm:justify-center">
          {characters.length > 0 && showControls && (
            <ControlNavbar character={character!} />
          )}
        </div>
        {character &&
          (character.miniAvatarUrl ? (
            <Avatar src={character.miniAvatarUrl} className="mr-4" />
          ) : (
            <Avatar name={character.firstName} className="mr-4" />
          ))}
        <div className="flex flex-shrink-0 items-center gap-4">
          <ThemeSwitcher className="mt-1" />
          {characters.length > 0 && <Logout />}
        </div>
      </header>
    );
  }
}
