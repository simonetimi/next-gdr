import { Location } from "@/models/location";
import { WeatherForecasts } from "@/models/weather";
import Weather from "@/components/ui/Weather";
import { temperatureToColor } from "@/utils/weather";
import { getTranslations } from "next-intl/server";
import { Image } from "@heroui/image";

export default async function LocationChatSidebar({
  location,
  weather,
}: {
  location?: Location;
  weather: WeatherForecasts;
}) {
  const temperatureColor = temperatureToColor(weather.temperature);

  const t = await getTranslations("game.locations.secret");

  return (
    <aside className="hidden w-[20vw] flex-col items-center gap-6 p-6 lg:flex">
      <Weather weather={weather} temperatureColor={temperatureColor} />
      <h1>{location ? location.name : t("name")}</h1>
      <Image
        src={location ? location.imageUrl : "/assets/images/secret-chat.png"}
        alt={location ? location.name : t("name")}
        className="h-[150px] w-[150px]"
        isZoomed
      />
      <p>{location ? location.description : t("description")}</p>
    </aside>
  );
}
