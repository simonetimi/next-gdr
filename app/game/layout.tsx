import Header from "@/components/ui/Header";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header showControls />
      <main className="flex min-h-[85vh] flex-1 flex-col items-center justify-center gap-6">
        {children}
      </main>
    </>
  );
}
