import { auth } from "@/auth";
import Login from "@/components/auth/Login";
import { Logout } from "@/components/auth/Logout";
import { GAME_ROUTE } from "@/utils/routes";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const session = await auth();
  const t = await getTranslations("pages.index");

  return (
    <main className="flex items-center justify-center h-screen gap-6 flex-col">
      <h1>Next GdR</h1>
      {session ? (
        <div className="flex flex-col gap-4">
          <p>Welcome, {session.user?.name}!</p>
          <p> Role: {session.user?.role}</p>
          <Button as={Link} color="primary" href={GAME_ROUTE} variant="solid">
            {t("enter")}
          </Button>
          <Logout />
        </div>
      ) : (
        <Login />
      )}
    </main>
  );
}
