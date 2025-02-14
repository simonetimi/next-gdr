import { getLocation } from "@/server/actions/location";
import { GAME_ROUTE } from "@/utils/routes";
import { redirect } from "next/navigation";

export default async function page({
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

  return (
    <div>
      <h2 className="text-2xl">{location.name}</h2>
      <p>{location.description}</p>
    </div>
  );
}
