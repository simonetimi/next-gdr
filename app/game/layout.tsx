export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-[92vh] flex-1 flex-col items-center justify-center gap-6">
      {children}
    </main>
  );
}
