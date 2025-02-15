import { Logout } from "@/components/auth/Logout";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ControlNavbar from "@/components/game/ControlNavbar";
import { Avatar } from "@heroui/avatar";
import { Character } from "@/models/characters";

export default async function Header({
  showControls = false,
  character,
}: {
  showControls?: boolean;
  character: Character;
}) {
  // TODO fix mini avatar position
  // controls are rendered only if the user is logged it, has at least a character and renderControls is true
  // multiple characters can be handled
  return (
    <header className="sticky top-0 z-0 flex h-[15vh] w-screen items-center justify-between border-b-1 border-gray-200 bg-white/20 p-6 dark:border-white/10 dark:bg-gray-900/40">
      <h1 className="absolute inset-0 flex items-center justify-center sm:static sm:flex sm:items-center sm:justify-start">
        Next GdR
      </h1>
      <div className="flex flex-grow items-center justify-start gap-3 sm:justify-center">
        {character && showControls && <ControlNavbar character={character!} />}
        {character &&
          (character.miniAvatarUrl ? (
            <Avatar src={character.miniAvatarUrl} className="mr-4" />
          ) : (
            <Avatar name={character.firstName} className="mr-4" />
          ))}
      </div>
      <div className="flex flex-shrink-0 items-center gap-4">
        <ThemeSwitcher className="mt-1" />
        {character && <Logout />}
      </div>
    </header>
  );
}
