export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col h-screen w-screen items-center justify-center">
      {children}
    </main>
  );
}
