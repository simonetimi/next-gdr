"use client";

import { ReactNode } from "react";
import { GameProvider } from "@/contexts/GameContext";

export function Providers({ children }: { children: ReactNode }) {
  return <GameProvider> {children}</GameProvider>;
}
