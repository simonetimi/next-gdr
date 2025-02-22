import { auth } from "@/auth";
import Map from "@/components/game/Map";
import { setCurrentLocation } from "@/server/actions/location";
import { getAllLocationGroupedByLocationGroup } from "@/server/location";
import { SecretLocationAccess } from "@/components/forms/SecretLocationAccess";

export default async function GamePage() {
  const session = await auth();
  if (!session) return null;

  const locations = await getAllLocationGroupedByLocationGroup();

  await setCurrentLocation(null);

  return (
    <div className="m-8 flex w-screen flex-col items-center gap-4">
      <Map locations={locations} />
      <SecretLocationAccess />
    </div>
  );
}
