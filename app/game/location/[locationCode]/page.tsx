import { getLocation, setCurrentLocation } from "@/server/actions/location";
import { GAME_ROUTE } from "@/utils/routes";
import { redirect } from "next/navigation";
import { isInvisible } from "@/server/actions/app";
import LocationChat from "@/components/game/LocationChat";
import { getCurrentCharacterIdOnly } from "@/server/actions/character";
import { isMaster } from "@/server/actions/roles";
import { auth } from "@/auth";

export default async function LocationPage({
  params,
}: {
  params: Promise<{ locationCode: string }>;
}) {
  const locationCode = (await params).locationCode;

  const session = await auth();
  const userId = session?.user.id;

  let location;
  let character;
  let isUserMaster = false;
  try {
    location = await getLocation(locationCode);
    character = await getCurrentCharacterIdOnly();
    isUserMaster = await isMaster(userId ?? "");
  } catch (error) {
    console.log(error);
  }
  if (!location) redirect(GAME_ROUTE);
  if (!character || !character?.id)
    throw new Error("Could not find character!"); // toast or some other form of error handling

  const isUserInvisible = await isInvisible();
  if (!isUserInvisible) {
    await setCurrentLocation(location.id);
  }

  return (
    <div className="flex h-full w-full flex-grow flex-row">
      <aside className="hidden w-[320px] flex-col gap-8 p-6 md:flex">
        <h1>{location.name}</h1>
        <p>{location.description}</p>
        Weather, chat description, location image
      </aside>
      <LocationChat
        locationId={location.id}
        characterId={character.id}
        isUserMaster={isUserMaster}
        locationCode={locationCode}
      />
    </div>
  );
}
