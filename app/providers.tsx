"use client";

import { ReactNode } from "react";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { GameProvider } from "@/contexts/GameContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <HeroUIProvider>
      <ToastProvider
        placement="top-center"
        toastOffset={10}
        toastProps={{ timeout: 3000 }}
      />
      <NextThemesProvider attribute="class">
        <GameProvider>{children}</GameProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
