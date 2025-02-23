import { setCurrentLocation } from "@/server/actions/location";
import { GAME_ROUTE } from "@/utils/routes";
import { redirect } from "next/navigation";
import { isInvisible } from "@/server/character";
import LocationChat from "@/components/game/LocationChat";
import { getMinimalCurrentCharacter } from "@/server/character";
import { isMaster } from "@/server/role";
import { auth } from "@/auth";
import LocationChatSidebar from "@/components/game/LocationChatSidebar";
import { fetchWeather } from "@/server/weather";
import { accessLocation } from "@/server/location";

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
    [location, character, isUserMaster, weather] = await Promise.all([
      accessLocation(locationCode),
      getMinimalCurrentCharacter(),
      isMaster(userId ?? ""),
      fetchWeather(),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    redirect(GAME_ROUTE);
  }
  if (!location || !weather || !character || !character?.id)
    redirect(GAME_ROUTE);

  const isUserInvisible = await isInvisible();
  if (!isUserInvisible) {
    await setCurrentLocation(location.id);
  }

  return (
    <div className="flex h-full w-full flex-grow flex-row">
      <LocationChatSidebar location={location} weather={weather} />
      <LocationChat
        locationId={location.id}
        character={character}
        isUserMaster={isUserMaster}
        locationCode={locationCode}
        isSecretLocation={false}
      />
    </div>
  );
}
