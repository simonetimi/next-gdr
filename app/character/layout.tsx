import Header from "@/components/ui/Header";
import { ReactNode } from "react";

export default function CharacterLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex min-h-[85vh] flex-1 flex-col items-center justify-center gap-6">
        {children}
      </main>
    </>
  );
}
