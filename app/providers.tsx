"use client";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ToastProvider
        placement="top-center"
        toastOffset={10}
        toastProps={{ timeout: 2500 }}
      />
      <NextThemesProvider attribute="class">{children}</NextThemesProvider>
    </HeroUIProvider>
  );
}
