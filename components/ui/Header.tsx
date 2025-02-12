import { auth } from "@/auth";
import { Logout } from "@/components/auth/Logout";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 flex h-[8vh] w-screen items-center border-b-1 border-gray-200 bg-white/20 p-6 backdrop-blur-md dark:border-white/10 dark:bg-gray-900/40 dark:backdrop-blur-sm">
      <h1>Next GdR</h1>
      <div className="ml-auto flex items-center gap-4">
        <ThemeSwitcher className="mt-1" />
        {session && <Logout />}
      </div>
    </header>
  );
}
