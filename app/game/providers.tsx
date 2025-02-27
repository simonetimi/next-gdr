"use client";

import { ReactNode } from "react";
import { GameProvider } from "@/contexts/GameContext";
import { OffGameChatProvider } from "@/contexts/OffGameChatContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GameProvider>
      <OffGameChatProvider>{children}</OffGameChatProvider>
    </GameProvider>
  );
}
