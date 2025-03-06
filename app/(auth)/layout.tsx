import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex max-h-dvh items-center justify-center">
      {children}
    </main>
  );
}
