import { auth } from "@/auth";
import Login from "@/components/auth/Login";
import Header from "@/components/ui/Header";
import { GAME_ROUTE } from "@/utils/routes";
import { Button } from "@heroui/button";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import LoginErrorToast from "@/components/ui/IndexErrorToast";
import { Card, CardBody } from "@heroui/card";

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
      <main className="flex min-h-[85dvh] flex-1 flex-col items-center justify-center gap-6">
        <Card
          className="px-20 py-12 dark:border dark:border-default/90"
          isBlurred
          shadow="sm"
        >
          <CardBody className="flex w-full flex-col items-center justify-center gap-8">
            {session ? (
              <>
                <p>
                  {t("welcome")}, {session.user?.name}!
                </p>
                <Button
                  as={Link}
                  color="primary"
                  href={GAME_ROUTE}
                  variant="solid"
                  className="w-full"
                >
                  {t("enter")}
                </Button>
              </>
            ) : (
              <Login />
            )}
          </CardBody>
        </Card>
      </main>
    </>
  );
}
