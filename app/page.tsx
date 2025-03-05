import { auth } from "@/auth";
import Login from "@/components/auth/Login";
import Header from "@/components/ui/Header";
import { GAME_ROUTE } from "@/utils/routes";
import { Button } from "@heroui/button";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import LoginErrorToast from "@/components/ui/LoginErrorToast";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const t = await getTranslations("pages.index");

  const error = (await searchParams).error;

  return (
    <>
      {error && (
        <LoginErrorToast error={typeof error === "string" ? error : error[0]} />
      )}
      <Header />
      <main className="flex min-h-[85vh] flex-1 flex-col items-center justify-center gap-6">
        {session ? (
          <div className="flex flex-col gap-4">
            <p>
              {t("welcome")}, {session.user?.name}!
            </p>
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
