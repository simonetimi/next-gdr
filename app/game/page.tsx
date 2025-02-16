import { auth } from "@/auth";
import Map from "@/components/game/Map";
import {
  getAllLocationGroupedByLocationGroup,
  setCurrentLocation,
} from "@/server/actions/location";

// * Keep the client components as down as possible to the tree!
// * Manage the state of the windows (messaging, character page, etc) in a navbar client component (with the buttons to open and close them)

export default async function GamePage() {
  const session = await auth();
  if (!session) return null;

  const locations = await getAllLocationGroupedByLocationGroup();

  await setCurrentLocation();

  return (
    <div className="m-8 flex w-screen flex-col items-center gap-4">
      <p>
        Main page of the game (protected). If you can see this, you have a
        character
      </p>
      <Map locations={locations} />
    </div>
  );
}
