import { auth } from "@/auth";
import Login from "@/components/auth/Login";
import Header from "@/components/ui/Header";
import { GAME_ROUTE } from "@/utils/routes";
import { Button } from "@heroui/button";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const t = await getTranslations("pages.index");

  return (
    <>
      <Header />
      <main className="flex min-h-[85vh] flex-1 flex-col items-center justify-center gap-6">
        {session ? (
          <div className="flex flex-col gap-4">
            <p>Welcome, {session.user?.name}!</p>
            <Button as={Link} color="primary" href={GAME_ROUTE} variant="solid">
              {t("enter")}
            </Button>
          </div>
        ) : (
          <Login />
        )}
      </main>
    </>
  );
}
