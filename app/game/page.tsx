import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { NEW_CHARACTER_ROUTE } from "@/utils/routes";

// * Keep the client components as down as possible to the tree!
// * Manage the state of the windows (messaging, character page, etc) in a navbar client component (with the buttons to open and close them)

export default async function GamePage() {
  const session = await auth();
  if (!session) return null;

  if (!session.user.hasCharacter) return redirect(NEW_CHARACTER_ROUTE);

  return (
    <div>
      <h3>
        Main page of the game (protected). If you can see this, you have a
        character
      </h3>
    </div>
  );
}
