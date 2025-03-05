"use client";

import { Button } from "@heroui/button";
import { useState } from "react";
import GitHub from "@/components/ui/icons/logos/GitHub";
import { login } from "@/server/actions/auth";
import Google from "@/components/ui/icons/logos/Google";

export default function Login() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleLogin = async (provider: string) => {
    setLoadingProvider(provider);
    await login(provider);
  };

  return (
    <div className="flex w-44 flex-col gap-3">
      <Button
        isLoading={loadingProvider === "github"}
        disabled={!!loadingProvider}
        color="primary"
        variant="light"
        className="bg-default/60 text-foreground"
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
        className="bg-default/60 text-foreground"
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
  );
}
