import { Logout } from "@/components/auth/Logout";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ControlNavbar from "@/components/game/ControlNavbar";
import { Character } from "@/models/characters";

export default async function Header({
  showControls = false,
  character,
  allowMultipleCharacters,
  isAdmin,
  isMaster,
}: {
  showControls?: boolean;
  character?: Character;
  allowMultipleCharacters?: boolean;
  isAdmin?: boolean;
  isMaster?: boolean;
}) {
  // controls are rendered only if the user is logged it, has at least a character and renderControls is true
  // multiple characters can be handled
  return (
    <header className="sticky top-0 z-0 flex h-[15vh] w-screen items-center justify-between bg-white/20 p-6 shadow-sm dark:bg-gray-900/40 dark:shadow-gray-800">
      <h1 className="absolute inset-0 flex items-center justify-center sm:static sm:flex sm:items-center sm:justify-start">
        Next GdR
      </h1>
      {character && showControls && (
        <ControlNavbar
          character={character!}
          allowMultipleCharacters={allowMultipleCharacters}
          isAdmin={isAdmin}
          isMaster={isMaster}
        />
      )}
      <div className="flex flex-shrink-0 items-center gap-4">
        <ThemeSwitcher className="mt-1" />
        {character && <Logout />}
      </div>
    </header>
  );
}
