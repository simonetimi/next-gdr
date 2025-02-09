import { auth } from "@/auth";
import Login from "@/components/auth/Login";
import { Logout } from "@/components/auth/Logout";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex items-center justify-center h-screen gap-6 flex-col">
      <h1>Next GdR</h1>
      {session ? (
        <div className="flex flex-col gap-4">
          Welcome, {session.user?.name}!
          <Logout />
        </div>
      ) : (
        <Login />
      )}
    </main>
  );
}
