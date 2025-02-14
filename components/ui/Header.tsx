import { auth } from "@/auth";
import { Logout } from "@/components/auth/Logout";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ControlNavbar from "@/components/ui/ControlNavbar";
import { getCharacters } from "@/server/actions/character";

export default async function Header({
  showControls = false,
}: {
  showControls?: boolean;
}) {
  let characters = [];
  const session = await auth();
  if (session) {
    characters = await getCharacters();
  }

  // controls are rendered only if the user is logged it, has at least a character and renderControls is true

  return (
    <header className="sticky top-0 z-40 flex h-[15vh] w-screen items-center justify-between border-b-1 border-gray-200 bg-white/20 p-6 dark:border-white/10 dark:bg-gray-900/40">
      <h1 className="absolute inset-0 flex items-center justify-center sm:static sm:flex sm:items-center sm:justify-start">
        Next GdR
      </h1>
      <div className="flex flex-grow justify-start sm:justify-center">
        {characters.length > 0 && showControls && <ControlNavbar />}
      </div>
      <div className="flex flex-shrink-0 items-center gap-4">
        <ThemeSwitcher className="mt-1" />
        {characters.length > 0 && <Logout />}
      </div>
    </header>
  );
}
