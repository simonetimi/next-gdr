import { auth } from "@/auth";
import Login from "@/components/auth/Login";
import { Logout } from "@/components/auth/Logout";

export default async function Home() {
  const session = await auth();

  if (session) console.log(session.user);

  return (
    <main className="flex items-center justify-center h-screen gap-6 flex-col">
      <h1>Next GdR</h1>
      {session ? (
        <div className="flex flex-col gap-4">
          <p>Welcome, {session.user?.name}!</p>
          <p> Role: {session.user?.role}</p>
          <Logout />
        </div>
      ) : (
        <Login />
      )}
    </main>
  );
}
