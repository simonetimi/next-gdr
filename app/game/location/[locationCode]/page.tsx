import { getLocation, setCurrentLocation } from "@/server/actions/location";
import { GAME_ROUTE } from "@/utils/routes";
import { redirect } from "next/navigation";
import { isInvisible } from "@/server/actions/game";

export default async function LocationPage({
  params,
}: {
  params: Promise<{ locationCode: string }>;
}) {
  const locationCode = (await params).locationCode;
  let location;
  try {
    location = await getLocation(locationCode);
  } catch (error) {
    console.log(error);
  }
  if (!location) redirect(GAME_ROUTE);

  const isUserInvisible = await isInvisible();
  if (!isUserInvisible) {
    await setCurrentLocation(location.id);
  }

  return (
    <div className="flex h-full w-full flex-grow flex-row border">
      <aside className="hidden w-[320px] flex-col border-r p-6 md:flex">
        Weather, chat description, location image
      </aside>
      <div className="align-center flex w-full flex-col justify-center p-4">
        <h2 className="text-2xl">{location.name}</h2>
        <p>{location.description}</p>
      </div>
    </div>
  );
}
