import { getLocation, setCurrentLocation } from "@/server/actions/location";
import { GAME_ROUTE } from "@/utils/routes";
import { redirect } from "next/navigation";
import { isInvisible } from "@/server/actions/game";
import LocationChat from "@/components/game/LocationChat";
import LocationControls from "@/components/game/LocationControls";
import { getCurrentCharacterIdOnly } from "@/server/actions/character";

export default async function LocationPage({
  params,
}: {
  params: Promise<{ locationCode: string }>;
}) {
  const locationCode = (await params).locationCode;
  let location;
  let character;
  try {
    location = await getLocation(locationCode);
    character = await getCurrentCharacterIdOnly();
  } catch (error) {
    console.log(error);
  }
  if (!location) redirect(GAME_ROUTE);
  if (!character || !character?.id)
    throw new Error("Could not find character!"); // toast or some other

  const isUserInvisible = await isInvisible();
  if (!isUserInvisible) {
    await setCurrentLocation(location.id);

    return (
      <div className="flex h-full w-full flex-grow flex-row">
        <aside className="hidden w-[320px] flex-col gap-8 p-6 md:flex">
          <h1>{location.name}</h1>
          <p>{location.description}</p>
          Weather, chat description, location image
        </aside>
        <section className="align-center flex w-full flex-col justify-center rounded-2xl shadow-xl dark:shadow dark:shadow-gray-700">
          <LocationChat locationId={location.id} characterId={character.id} />
          <LocationControls />
        </section>
      </div>
    );
  }
}
