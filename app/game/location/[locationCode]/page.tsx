import { getLocation, setCurrentLocation } from "@/server/actions/location";
import { GAME_ROUTE } from "@/utils/routes";
import { redirect } from "next/navigation";
import { isInvisible } from "@/server/actions/app";
import LocationChat from "@/components/game/LocationChat";
import { getMinimalCurrentCharacter } from "@/server/actions/character";
import { isMaster } from "@/server/actions/roles";
import { auth } from "@/auth";
import LocationChatSidebar from "@/components/game/LocationChatSidebar";
import { fetchWeather } from "@/server/actions/game";

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
  let weather;
  let isUserMaster = false;
  try {
    location = await getLocation(locationCode);
    character = await getMinimalCurrentCharacter();
    isUserMaster = await isMaster(userId ?? "");
    weather = await fetchWeather();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.log(error);
    redirect(GAME_ROUTE);
  }
  if (!location || !character || !character?.id) redirect(GAME_ROUTE);

  const isUserInvisible = await isInvisible();
  if (!isUserInvisible) {
    await setCurrentLocation(location.id);
  }

  // TODO sidebar with weather and location description
  // TODO finish the menu for char actions on mobile and fix the movables not taking full page

  return (
    <div className="flex h-full w-full flex-grow flex-row">
      <LocationChatSidebar location={location} />
      <LocationChat
        locationId={location.id}
        character={character}
        isUserMaster={isUserMaster}
        locationCode={locationCode}
      />
    </div>
  );
}
