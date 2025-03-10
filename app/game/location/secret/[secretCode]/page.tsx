import { setCurrentLocation } from "@/server/actions/location";
import { GAME_ROUTE } from "@/utils/routes";
import { redirect } from "next/navigation";
import { isInvisible } from "@/server/character";
import LocationChat from "@/components/game/LocationChat";
import { getMinimalCurrentCharacter } from "@/server/character";
import { isMaster } from "@/server/role";
import LocationChatSidebar from "@/components/game/LocationChatSidebar";
import { fetchWeather } from "@/server/weather";
import { accessSecretLocation } from "@/server/location";
import { Logger } from "@/utils/logger";
import { getCurrentUserId } from "@/server/user";

export default async function LocationPage({
  params,
}: {
  params: Promise<{ secretCode: string }>;
}) {
  const secretCode = (await params).secretCode;

  const userId = await getCurrentUserId();

  let secretLocation;
  let character;
  let weather;
  let isUserMaster = false;
  try {
    [secretLocation, character, isUserMaster, weather] = await Promise.all([
      accessSecretLocation(secretCode),
      getMinimalCurrentCharacter(),
      isMaster(userId ?? ""),
      fetchWeather(),
    ]);
  } catch (error) {
    Logger.error(error);
    redirect(GAME_ROUTE);
  }
  if (!secretLocation || !weather || !character || !character?.id)
    redirect(GAME_ROUTE);

  const isUserInvisible = await isInvisible();
  if (!isUserInvisible) {
    // sets curent location as secret
    await setCurrentLocation(null, true);
  }

  return (
    <div className="flex h-full w-full flex-grow flex-row">
      <LocationChatSidebar weather={weather} />
      <LocationChat
        locationId={secretLocation.id}
        character={character}
        isUserMaster={isUserMaster}
        locationCode={secretLocation.code}
        isSecretLocation
      />
    </div>
  );
}
