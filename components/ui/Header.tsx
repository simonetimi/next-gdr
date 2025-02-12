import { auth } from "@/auth";
import { Logout } from "@/components/auth/Logout";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ControlNavbar from "@/components/ui/ControlNavbar";

export default async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 flex h-[15vh] w-screen items-center justify-between border-b-1 border-gray-200 bg-white/20 p-6 backdrop-blur-md dark:border-white/10 dark:bg-gray-900/40 dark:backdrop-blur-sm">
      <h1 className="flex-shrink-0">Next GdR</h1>
      <div className="flex flex-grow justify-center">
        {session && <ControlNavbar />}
      </div>
      <div className="flex flex-shrink-0 items-center gap-4">
        <ThemeSwitcher className="mt-1" />
        {session && <Logout />}
      </div>
    </header>
  );
}
