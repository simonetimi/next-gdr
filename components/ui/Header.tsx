import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-[8vh] w-screen items-center border-b-1 border-gray-200 bg-white/20 p-6 backdrop-blur-md dark:border-white/10 dark:bg-gray-900/40 dark:backdrop-blur-sm">
      <h1>Next GdR</h1>
      <ThemeSwitcher className="ml-auto mt-1" />
    </header>
  );
}
