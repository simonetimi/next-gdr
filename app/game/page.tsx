import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { NEW_CHARACTER_ROUTE } from "@/utils/routes";
import { getCharacters } from "@/server/actions/character";
import Map from "@/components/game/Map";
import { getAllLocations } from "@/server/actions/location";
import CharacterSheet from "@/components/game/CharacterSheet";

// * Keep the client components as down as possible to the tree!
// * Manage the state of the windows (messaging, character page, etc) in a navbar client component (with the buttons to open and close them)

export default async function GamePage() {
  const session = await auth();
  if (!session) return null;

  // logic to only allow one character per user. it can be extended easily as needed
  const characters = await getCharacters();
  if (characters.length === 0) redirect(NEW_CHARACTER_ROUTE);

  const locations = await getAllLocations();

  return (
    <div className="m-8 flex w-screen flex-col items-center gap-4">
      <p>
        Main page of the game (protected). If you can see this, you have a
        character
      </p>
      <h4>
        Character name: {characters[0].firstName + " " + characters[0].lastName}
      </h4>
      <Map locations={locations} />
      <CharacterSheet characterId={characters[0].id} />
    </div>
  );
}
