"use client";

import { Button } from "@heroui/button";
import { useState } from "react";
import GitHub from "@/components/ui/icons/logos/GitHub";
import { login } from "@/server/actions/auth";
import Google from "@/components/ui/icons/logos/Google";
import { useTranslations } from "next-intl";

export default function Login() {
  const t = useTranslations();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleLogin = async (provider: string) => {
    setLoadingProvider(provider);
    await login(provider);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-1">
        <h2>
          {t("components.login.title", { appName: t("general.appName") })}
        </h2>
        <p className="text-sm text-foreground-400">
          {t("components.login.subheading")}
        </p>
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-3">
        <Button
          isLoading={loadingProvider === "github"}
          disabled={!!loadingProvider}
          color="primary"
          variant="light"
          className="w-2/3 bg-default/60 text-foreground"
          startContent={
            loadingProvider !== "github" && (
              <GitHub className="h-5 w-5 dark:fill-white" />
            )
          }
          onPress={() => handleLogin("github")}
        >
          GitHub
        </Button>
        <Button
          isLoading={loadingProvider === "google"}
          disabled={!!loadingProvider}
          color="primary"
          variant="light"
          className="w-2/3 bg-default/60 text-foreground"
          startContent={
            loadingProvider !== "google" && (
              <Google className="h-5 w-5 rounded-full" />
            )
          }
          onPress={() => handleLogin("google")}
        >
          Google
        </Button>
      </div>
    </>
  );
}
